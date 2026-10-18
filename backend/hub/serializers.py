from rest_framework import serializers
from django.contrib.auth.models import User
from django.db.models import Q
from django.contrib.auth.password_validation import validate_password

from .models import Category, QuickLink, UserProfile






class CategorySerializer(serializers.ModelSerializer):

    class Meta:
        model = Category
        fields = "__all__"
        read_only_fields = ["user"]

    def validate_name(self, value):

        request = self.context.get("request")

        if request and Category.objects.filter(
            Q(user__isnull=True) | Q(user=request.user),
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
        fields = [
            "id",
            "name",
            "url",
            "category",
            "favorite",
            "order",
            "created_at",
        ]

        read_only_fields = [
            "id",
            "created_at",
        ]

    def validate_category(self, value):

        request = self.context.get("request")

        if request is None or not request.user.is_authenticated:
            raise serializers.ValidationError(
                "Authentication is required."
            )

        
        if value.user is not None and value.user != request.user:
            raise serializers.ValidationError(
                "You cannot use another user's category."
            )

        return value






class RegisterSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = [
            "username",
            "email",
            "password",
        ]

        extra_kwargs = {
            "password": {
                "write_only": True,
            },
            "email": {
                "required": True,
            },
        }

    def validate_password(self, value):

        validate_password(value)

        return value

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
        read_only=True,
    )

    class Meta:
        model = UserProfile
        fields = [
            "id",
            "username",
            "display_name",
            "profile_image",
        ]
        