import logging


from django.conf import settings
from .email_utils import send_resend_email
from django.contrib.auth.models import User
from django.db.models import Q
from django.utils.encoding import force_bytes
from django.utils.http import (
    urlsafe_base64_encode,
    urlsafe_base64_decode,
)

from rest_framework import generics, permissions, status
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Category, QuickLink, UserProfile
from .serializers import (
    CategorySerializer,
    QuickLinkSerializer,
    QuickLinkCreateSerializer,
    RegisterSerializer,
    UserProfileSerializer,
)
from .tokens import email_verification_token, password_reset_token


logger = logging.getLogger(__name__)

FRONTEND_URL = getattr(
    settings,
    "FRONTEND_URL",
    "https://personal-hub-dash-board.vercel.app",
).rstrip("/")




class CategoryListAPIView(generics.ListCreateAPIView):
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Category.objects.filter(
            Q(user__isnull=True) |
            Q(user=self.request.user)
        )

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class CategoryDetailAPIView(generics.DestroyAPIView):
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Category.objects.filter(
            user=self.request.user
        )




class QuickLinkListAPIView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return QuickLink.objects.filter(
            user=self.request.user
        ).order_by("order")

    def get_serializer_class(self):
        if self.request.method == "POST":
            return QuickLinkCreateSerializer

        return QuickLinkSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class QuickLinkDetailAPIView(
    generics.RetrieveUpdateDestroyAPIView
):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return QuickLink.objects.filter(
            user=self.request.user
        )

    def get_serializer_class(self):
        if self.request.method in ["PUT", "PATCH"]:
            return QuickLinkCreateSerializer

        return QuickLinkSerializer




class RegisterAPIView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        
        user = serializer.save()

        uid = urlsafe_base64_encode(
            force_bytes(user.pk)
        )

        token = email_verification_token.make_token(user)

        verification_link = (
            f"{FRONTEND_URL}/verify-email/{uid}/{token}/"
        )

        try:
            send_resend_email(
                subject="Verify your PersonalHub account",
                recipient=user.email,
                message=(
                    "Welcome to PersonalHub!\n\n"
                    "Verify your email by opening this link:\n\n"
                    f"{verification_link}\n\n"
                    "If you did not create this account, "
                    "please ignore this email."
                ),
            )

        except Exception:
            logger.exception(
                "Failed to send verification email for user ID %s",
                user.pk,
            )

            return Response(
                {
                    "detail": (
                        "Your account was created, but we could "
                        "not send the verification email. "
                        "Please try again later or contact support."
                    ),
                    "email_sent": False,
                },
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        return Response(
            {
                "detail": (
                    "Registration successful. "
                    "Please check your email to verify your account."
                ),
                "email_sent": True,
            },
            status=status.HTTP_201_CREATED,
        )




class VerifyEmailAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, uid, token):
        try:
            decoded_uid = urlsafe_base64_decode(uid).decode()
            user = User.objects.get(pk=decoded_uid)

        except (
            TypeError,
            ValueError,
            OverflowError,
            UnicodeDecodeError,
            User.DoesNotExist,
        ):
            return Response(
                {
                    "status": "invalid",
                    "detail": "Invalid verification link.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if user.is_active:
            return Response(
                {
                    "status": "already_verified",
                    "detail": (
                        "Your email is already verified. "
                        "Please log in."
                    ),
                },
                status=status.HTTP_200_OK,
            )

        if email_verification_token.check_token(user, token):
            user.is_active = True
            user.save(update_fields=["is_active"])

            return Response(
                {
                    "status": "success",
                    "detail": (
                        "Email verified successfully. "
                        "You can now log in."
                    ),
                },
                status=status.HTTP_200_OK,
            )

        return Response(
            {
                "status": "invalid",
                "detail": "Invalid or expired verification link.",
            },
            status=status.HTTP_400_BAD_REQUEST,
        )




class UpdateLinkOrderAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        links = request.data.get("links", [])

        if not isinstance(links, list):
            return Response(
                {"detail": "Links must be a list."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        for item in links:
            if not isinstance(item, dict):
                continue

            try:
                link = QuickLink.objects.get(
                    id=item["id"],
                    user=request.user,
                )

                link.order = int(item["order"])
                link.save(update_fields=["order"])

            except (
                QuickLink.DoesNotExist,
                KeyError,
                TypeError,
                ValueError,
            ):
                continue

        return Response(
            {"message": "Order updated"},
            status=status.HTTP_200_OK,
        )




class UserProfileAPIView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    parser_classes = [
        MultiPartParser,
        FormParser,
    ]

    def get_object(self):
        profile, created = UserProfile.objects.get_or_create(
            user=self.request.user,
            defaults={
                "display_name": self.request.user.username,
            },
        )

        return profile




class ForgotPasswordAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get("email", "")

        if not isinstance(email, str):
            return Response(
                {"detail": "Please provide a valid email address."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        email = email.strip()

        if not email:
            return Response(
                {"detail": "Please provide your email address."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = User.objects.filter(
            email__iexact=email,
            is_active=True,
        ).first()

        if user:
            uid = urlsafe_base64_encode(
                force_bytes(user.pk)
            )

            token = password_reset_token.make_token(user)

            encoded_token = urlsafe_base64_encode(
                force_bytes(token)
            )

            reset_link = (
                f"{FRONTEND_URL}/reset-password/"
                f"{uid}/{encoded_token}/"
            )

            try:
                send_resend_email(
                    subject="Reset your PersonalHub password",
                    recipient=user.email,
                    message=(
                        "We received a request to reset "
                        "your PersonalHub password.\n\n"
                        "Open this link to reset it:\n\n"
                        f"{reset_link}\n\n"
                        "If you did not request a password reset, "
                        "you can ignore this email."
                    ),
                )

            except Exception:
                logger.exception(
                    "Failed to send password reset email "
                    "for user ID %s",
                    user.pk,
                )

                return Response(
                    {
                        "detail": (
                            "We could not send the reset email "
                            "right now. Please try again later."
                        )
                    },
                    status=status.HTTP_503_SERVICE_UNAVAILABLE,
                )

        
        return Response(
            {
                "detail": (
                    "If an account exists with that email, "
                    "a password reset link will be sent."
                )
            },
            status=status.HTTP_200_OK,
        )




class ResetPasswordAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, uid, token):
        new_password = request.data.get("password", "")

        if not isinstance(new_password, str) or not new_password:
            return Response(
                {"detail": "Please provide a new password."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            decoded_uid = urlsafe_base64_decode(uid).decode()
            user = User.objects.get(pk=decoded_uid)

        except (
            TypeError,
            ValueError,
            OverflowError,
            UnicodeDecodeError,
            User.DoesNotExist,
        ):
            return Response(
                {"detail": "Invalid or expired reset link."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not user.is_active:
            return Response(
                {"detail": "This account is not active."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            decoded_token = urlsafe_base64_decode(
                token
            ).decode("utf-8")

        except (
            TypeError,
            ValueError,
            OverflowError,
            UnicodeDecodeError,
        ):
            return Response(
                {"detail": "Invalid or expired reset link."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not password_reset_token.check_token(
            user,
            decoded_token,
        ):
            return Response(
                {"detail": "Invalid or expired reset link."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        
        from django.contrib.auth.password_validation import (
            validate_password,
        )
        from django.core.exceptions import ValidationError

        try:
            validate_password(new_password, user=user)

        except ValidationError as error:
            return Response(
                {"detail": list(error.messages)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.set_password(new_password)
        user.save(update_fields=["password"])

        return Response(
            {
                "detail": (
                    "Password reset successfully. "
                    "You can now log in."
                )
            },
            status=status.HTTP_200_OK,
        )