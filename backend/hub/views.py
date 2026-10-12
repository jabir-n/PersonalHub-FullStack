from rest_framework import generics, permissions, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser

from django.db.models import Q
from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth.models import User
from django.utils.http import (
    urlsafe_base64_encode,
    urlsafe_base64_decode,
)
from django.utils.encoding import force_bytes

from .models import Category, QuickLink, UserProfile
from .serializers import (
    CategorySerializer,
    QuickLinkSerializer,
    QuickLinkCreateSerializer,
    RegisterSerializer,
    UserProfileSerializer,
)
from .tokens import email_verification_token, password_reset_token


# CATEGORY APIs

class CategoryListAPIView(generics.ListCreateAPIView):

    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]

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


# QUICK LINK APIs

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


class QuickLinkDetailAPIView(generics.RetrieveUpdateDestroyAPIView):

    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return QuickLink.objects.filter(
            user=self.request.user
        )

    def get_serializer_class(self):

        if self.request.method in ["PUT", "PATCH"]:
            return QuickLinkCreateSerializer

        return QuickLinkSerializer


# USER REGISTRATION AND EMAIL VERIFICATION

class RegisterAPIView(generics.CreateAPIView):

    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):

        response = super().create(request, *args, **kwargs)

        user = User.objects.get(
            username=request.data["username"]
        )

        uid = urlsafe_base64_encode(
            force_bytes(user.pk)
        )

        token = email_verification_token.make_token(user)

        verification_link = (
            f"http://localhost:5173/verify-email/{uid}/{token}/"
        )

        send_mail(
            subject="Verify your PersonalHub account",
            message=(
                "Welcome to PersonalHub!\n\n"
                "Click the link below to verify your email:\n\n"
                f"{verification_link}\n\n"
                "If you did not create this account, ignore this email."
            ),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
        )

        print("\n========== EMAIL VERIFICATION LINK ==========")
        print(verification_link)
        print("=============================================\n")

        return response


class VerifyEmailAPIView(APIView):

    permission_classes = []

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
                {"status": "invalid", "detail": "Invalid verification link."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if user.is_active:
            return Response(
                {
                    "status": "already_verified",
                    "detail": "Your email is already verified. Please log in.",
                },
                status=status.HTTP_200_OK,
            )

        if email_verification_token.check_token(user, token):

            user.is_active = True
            user.save()

            return Response(
                {
                    "status": "success",
                    "detail": "Email verified successfully. You can now log in.",
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


# UPDATE QUICK LINK ORDER

class UpdateLinkOrderAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        links = request.data.get("links", [])

        for item in links:

            try:
                link = QuickLink.objects.get(
                    id=item["id"],
                    user=request.user,
                )

                link.order = item["order"]
                link.save()

            except (QuickLink.DoesNotExist, KeyError):
                pass

        return Response(
            {"message": "Order updated"},
            status=status.HTTP_200_OK,
        )


# USER PROFILE

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


# FORGOT PASSWORD

class ForgotPasswordAPIView(APIView):

    permission_classes = []

    def post(self, request):

        email = request.data.get("email", "").strip()

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

            # Generate the original Django password-reset token.
            token = password_reset_token.make_token(user)

            # Encode the token to preserve it in the URL path.
            encoded_token = urlsafe_base64_encode(
                force_bytes(token)
            )

            # IMPORTANT: This must be a plain URL, not Markdown.
            reset_link = (
                f"http://localhost:5173/reset-password/"
                f"{uid}/{encoded_token}/"
            )

            send_mail(
                subject="Reset your PersonalHub password",
                message=(
                    "We received a request to reset your PersonalHub password.\n\n"
                    "Click the link below to reset it:\n\n"
                    f"{reset_link}\n\n"
                    "If you did not request a password reset, "
                    "you can safely ignore this email."
                ),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
            )

            # Print the complete URL separately in the Django terminal.
            print("\n========== PASSWORD RESET LINK ==========")
            print(reset_link)
            print("==========================================\n")

        # Do not reveal whether an email address has an account.
        return Response(
            {
                "detail": (
                    "If an account exists with that email, "
                    "a password reset link will be sent."
                )
            },
            status=status.HTTP_200_OK,
        )


# RESET PASSWORD

class ResetPasswordAPIView(APIView):

    permission_classes = []

    def post(self, request, uid, token):

        new_password = request.data.get("password", "")

        if not new_password:
            return Response(
                {"detail": "Please provide a new password."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if len(new_password) < 6:
            return Response(
                {"detail": "Password must contain at least 6 characters."},
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

        # Decode the URL-safe token back to the original Django token.
        try:
            decoded_token = urlsafe_base64_decode(token).decode("utf-8")

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

        # Validate the original Django token.
        if not password_reset_token.check_token(user, decoded_token):

            return Response(
                {"detail": "Invalid or expired reset link."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.set_password(new_password)
        user.save()

        return Response(
            {
                "detail": "Password reset successfully. You can now log in."
            },
            status=status.HTTP_200_OK,
        )