from rest_framework import serializers
from .models import Category, QuickLink, UserProfile
from django.contrib.auth.models import User
from django.db.models import Q

from rest_framework import serializers

class CategorySerializer(serializers.ModelSerializer):

    class Meta:
        model = Category
        fields = "__all__"
        read_only_fields = ["user"]

    def validate_name(self, value):

        if Category.objects.filter(
            Q(user__isnull=True) | Q(user=self.context["request"].user),
            name__iexact=value,
        ).exists():
            raise serializers.ValidationError(
                "Category already exists."
            )

        return value   

class QuickLinkSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)

    class Meta:
        model = QuickLink
        fields = "__all__"

class QuickLinkCreateSerializer(serializers.ModelSerializer):

    class Meta:
        model = QuickLink
        fields = "__all__"


class RegisterSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = ["username", "email", "password"]

        extra_kwargs = {
            "password": {
                "write_only": True,
                "min_length": 6,
            },
            "email": {
                "required": True,
            },
        }

    def validate_username(self, value):

        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError(
                "Username already exists."
            )

        return value

    def validate_email(self, value):

        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError(
                "Email already exists."
            )

        return value

    def create(self, validated_data):

        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"],
        )

        user.is_active = False
        user.save()

        return user
    
class UserProfileSerializer(serializers.ModelSerializer):

    username = serializers.CharField(
        source="user.username",
        read_only=True
    )

    class Meta:
        model = UserProfile
        fields = [
            "id",
            "username",
            "display_name",
            "profile_image",
        ]