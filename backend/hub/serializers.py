from rest_framework import serializers
from .models import Category, QuickLink, UserProfile
from django.contrib.auth.models import User


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = "__all__"


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
        fields = ["username", "password"]

        extra_kwargs = {
            "password": {
                "write_only": True,
                "min_length": 6,
            }
        }

    def validate_username(self, value):

        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError(
                "Username already exists."
            )

        return value

    def create(self, validated_data):

        return User.objects.create_user(
            username=validated_data["username"],
            password=validated_data["password"],
        )
    
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