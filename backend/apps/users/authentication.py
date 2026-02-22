from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, AuthenticationFailed
from django.conf import settings

from .models import User


class CustomJWTAuthentication(JWTAuthentication):
    """
    Custom JWT authentication that uses our custom User model with UUID primary key.
    """
    
    def get_user(self, validated_token):
        """
        Override to use our custom User model instead of AUTH_USER_MODEL.
        """
        try:
            user_id = validated_token.get('user_id')
            if user_id is None:
                raise InvalidToken('Token contained no recognizable user identification')
            
            user = User.objects.get(user_id=user_id)
            
            if not user.is_active:
                raise AuthenticationFailed('User is inactive')
            
            return user
            
        except User.DoesNotExist:
            raise AuthenticationFailed('User not found')
