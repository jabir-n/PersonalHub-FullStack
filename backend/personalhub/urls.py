"""
URL configuration for personalhub project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path

from hub.views import (
    QuickLinkListAPIView,
    CategoryListAPIView,
    QuickLinkDetailAPIView,
    RegisterAPIView,
    UpdateLinkOrderAPIView,
    UserProfileAPIView,
    CategoryDetailAPIView,
    VerifyEmailAPIView,
)

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

from django.conf import settings
from django.conf.urls.static import static


urlpatterns = [

    path("admin/", admin.site.urls),

    path(
        "api/login/",
        TokenObtainPairView.as_view(),
    ),

    path(
        "api/refresh/",
        TokenRefreshView.as_view(),
    ),

    path(
        "api/register/",
        RegisterAPIView.as_view(),
    ),

    path(
        "api/categories/",
        CategoryListAPIView.as_view(),
    ),

    path(
        "api/links/",
        QuickLinkListAPIView.as_view(),
    ),

    path(
        "api/links/<int:pk>/",
        QuickLinkDetailAPIView.as_view(),
    ),

    path(
        "api/links/reorder/",
        UpdateLinkOrderAPIView.as_view(),
    ),

    path(
        "api/profile/",
        UserProfileAPIView.as_view(),
    ),

    path(
        "api/categories/<int:pk>/",
        CategoryDetailAPIView.as_view(),
    ),
    path(
        "api/verify-email/<uid>/<token>/",
         VerifyEmailAPIView.as_view(),
    ),

]

if settings.DEBUG:
    urlpatterns += static(
        settings.MEDIA_URL,
        document_root=settings.MEDIA_ROOT,
    )
