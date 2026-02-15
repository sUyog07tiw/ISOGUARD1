from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DocumentViewSet, DocumentChunkViewSet, AnalyzeView, AnalysisResultViewSet

router = DefaultRouter()
router.register(r"files", DocumentViewSet, basename="document")
router.register(r"chunks", DocumentChunkViewSet, basename="chunk")
router.register(r"analyses", AnalysisResultViewSet, basename="analysis")

urlpatterns = [
    path("analyze/", AnalyzeView.as_view(), name="analyze"),
    path("", include(router.urls)),
]
