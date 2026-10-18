from django.db import migrations


def create_builtin_categories(apps, schema_editor):
    Category = apps.get_model("hub", "Category")

    builtin_categories = [
        "Gaming",
        "Study",
        "Productivity",
    ]

    for category_name in builtin_categories:
        Category.objects.get_or_create(
            name=category_name,
            user=None,
        )


def reverse_builtin_categories(apps, schema_editor):
    
    pass


class Migration(migrations.Migration):

    dependencies = [
        ("hub", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(
            create_builtin_categories,
            reverse_builtin_categories,
        ),
    ]