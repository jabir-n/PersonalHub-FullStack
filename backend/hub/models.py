from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver


class Category(models.Model):

    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name


class QuickLink(models.Model):


    user = models.ForeignKey(
      User,
      on_delete=models.CASCADE,
      null=True,
      blank=True,
    )

    name = models.CharField(max_length=150)

    url = models.URLField()

    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE
    )

    favorite = models.BooleanField(default=False)

    order = models.IntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name
    


class UserProfile(models.Model):

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE
    )

    profile_image = models.ImageField(
        upload_to="profiles/",
        blank=True,
        null=True,
    )

    display_name = models.CharField(
        max_length=100,
        blank=True,
    )

    def __str__(self):
        return self.user.username
    
@receiver(post_save, sender=User)
def create_profile(sender, instance, created, **kwargs):

    if created:

        UserProfile.objects.create(
            user=instance,
            display_name=instance.username,
        )