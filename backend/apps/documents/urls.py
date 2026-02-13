from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DocumentViewSet, DocumentChunkViewSet, AnalyzeView, AnalysisResultViewSet

router = DefaultRouter()
router.register(r"documents", DocumentViewSet, basename="document")
router.register(r"chunks", DocumentChunkViewSet, basename="chunk")
router.register(r"analyses", AnalysisResultViewSet, basename="analysis")

urlpatterns = [
    path("", include(router.urls)),
    path("documents/analyze/", AnalyzeView.as_view(), name="analyze"),
]
