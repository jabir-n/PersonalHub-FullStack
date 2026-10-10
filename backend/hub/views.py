from rest_framework import generics, permissions
from .models import Category, QuickLink, UserProfile
from .serializers import (
    CategorySerializer,
    QuickLinkSerializer,
    QuickLinkCreateSerializer,
    RegisterSerializer,
    UserProfileSerializer,
)
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
from django.db.models import Q

from django.core.mail import send_mail
from django.conf import settings
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.contrib.auth.models import User
from .tokens import email_verification_token
from django.utils.http import urlsafe_base64_decode
from django.shortcuts import get_object_or_404


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

       serializer.save(
        user=self.request.user
    )

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
    

class RegisterAPIView(generics.CreateAPIView):
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):

        print("🔥 REGISTER API CALLED")
        response = super().create(request, *args, **kwargs)

        user = User.objects.get(username=request.data["username"])

        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = email_verification_token.make_token(user)

        verification_link = (
            f"http://localhost:5173/verify-email/{uid}/{token}/"
        )

        send_mail(
            subject="Verify your PersonalHub account",
            message=(
                f"Welcome to PersonalHub!\n\n"
                f"Click the link below to verify your email:\n\n"
                f"{verification_link}\n\n"
                f"If you did not create this account, ignore this email."
            ),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
        )
        print("\n🔥 VERIFICATION LINK:")
        print(verification_link)
        print()

        return response

class UpdateLinkOrderAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        links = request.data.get("links", [])

        for item in links:

            try:

                link = QuickLink.objects.get(
                    id=item["id"],
                    user=request.user
                )

                link.order = item["order"]
                link.save()

            except QuickLink.DoesNotExist:
                pass

        return Response(
            {"message": "Order updated"},
            status=status.HTTP_200_OK
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
                "display_name": self.request.user.username
            }
        )

        return profile

class CategoryDetailAPIView(
    generics.DestroyAPIView
):
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Category.objects.filter(
            user=self.request.user
        )

class VerifyEmailAPIView(APIView):

    permission_classes = []

    def get(self, request, uid, token):

        # Step 1: Decode the user ID
        try:
            uid = urlsafe_base64_decode(uid).decode()
            user = User.objects.get(pk=uid)

        except (
            TypeError,
            ValueError,
            OverflowError,
            User.DoesNotExist,
        ):
            return Response(
                {"detail": "Invalid verification link."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Step 2: Check whether the account is already verified
        if user.is_active:
            return Response(
                {
                    "status": "already_verified",
                    "detail": (
                        "Your email is already verified. "
                        "Please log in."
                    )
                },
                status=status.HTTP_200_OK
            )

        # Step 3: Validate the token for an inactive account
        if email_verification_token.check_token(user, token):

            user.is_active = True
            user.save()

            return Response(
                {
                    "status": "success",
                    "detail": (
                        "Email verified successfully. "
                        "You can now log in."
                    )
                },
                status=status.HTTP_200_OK
            )

        # Step 4: Reject an invalid or expired token
        return Response(
            {
                "status": "invalid",
                "detail": "Invalid or expired verification link."
            },
            status=status.HTTP_400_BAD_REQUEST
        )