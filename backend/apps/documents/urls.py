from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DocumentViewSet, DocumentChunkViewSet

router = DefaultRouter()
router.register(r"documents", DocumentViewSet, basename="document")
router.register(r"chunks", DocumentChunkViewSet, basename="chunk")

urlpatterns = [
    path("", include(router.urls)),
]
