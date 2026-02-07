import uuid
from django.db import models
from django.contrib.auth.hashers import make_password, check_password


class User(models.Model):
    """
    Custom User model that maps to the existing PostgreSQL 'users' table.
    """
    user_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    company = models.CharField(max_length=100, blank=True, null=True)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    email = models.EmailField(max_length=100, unique=True)
    role = models.CharField(max_length=50)
    password = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'users'  # Maps to existing PostgreSQL table
        managed = False  # Django won't try to create/modify this table

    def __str__(self):
        return f"{self.name} ({self.email})"

    def set_password(self, raw_password):
        """Hash and set the password."""
        self.password = make_password(raw_password)

    def check_password(self, raw_password):
        """Check if the provided password matches the stored hash."""
        return check_password(raw_password, self.password)
