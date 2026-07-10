from rest_framework import generics
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



class CategoryListAPIView(generics.ListAPIView):

    queryset = Category.objects.all()
    serializer_class = CategorySerializer


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