import logging
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404

from .models import Document, DocumentChunk, AnalysisResult
from .serializers import (
    DocumentSerializer,
    DocumentListSerializer,
    DocumentChunkSerializer,
    DocumentChunkListSerializer,
    DocumentUploadSerializer,
    DocumentReprocessSerializer,
    AnalyzeRequestSerializer,
    AnalysisResultSerializer,
    AnalysisResultListSerializer,
)
from .utils import DocumentProcessor, get_file_type, DocumentAnalyzer

logger = logging.getLogger(__name__)


class DocumentViewSet(viewsets.ModelViewSet):
    """
    API endpoints for managing documents.
    
    Supports:
    - Upload documents (POST /documents/)
    - List documents (GET /documents/)
    - Retrieve document with chunks (GET /documents/{id}/)
    - Delete document (DELETE /documents/{id}/)
    - Reprocess document (POST /documents/{id}/reprocess/)
    """
    
    queryset = Document.objects.all()
    permission_classes = [permissions.AllowAny]  # Change to IsAuthenticated in production
    parser_classes = [MultiPartParser, FormParser]
    
    def get_serializer_class(self):
        if self.action == "list":
            return DocumentListSerializer
        if self.action == "create":
            return DocumentUploadSerializer
        if self.action == "reprocess":
            return DocumentReprocessSerializer
        return DocumentSerializer
    
    def get_queryset(self):
        queryset = Document.objects.all()
        
        # Filter by status
        status_filter = self.request.query_params.get("status")
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filter by file type
        file_type = self.request.query_params.get("file_type")
        if file_type:
            queryset = queryset.filter(file_type=file_type)
        
        return queryset.prefetch_related("chunks")
    
    def create(self, request, *args, **kwargs):
        """Upload and process a new document."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        uploaded_file = serializer.validated_data["file"]
        
        try:
            # Get file content
            file_content = uploaded_file.read()
            file_type = get_file_type(uploaded_file.name)
            
            # Create document record
            document = Document.objects.create(
                name=uploaded_file.name,
                file_type=file_type,
                file_size=len(file_content),
                uploaded_by=request.user if request.user.is_authenticated else None,
                status=Document.Status.PENDING
            )
            
            # Save the file temporarily
            from django.core.files.base import ContentFile
            document.file.save(uploaded_file.name, ContentFile(file_content))
            
            # Process the document
            processor = DocumentProcessor()
            success = processor.process(document)
            
            # Optionally delete the original file after processing
            # Uncomment if you don't need to keep the original files:
            # if success and document.file:
            #     document.file.delete()
            #     document.save()
            
            # Refresh from database
            document.refresh_from_db()
            
            response_serializer = DocumentSerializer(document)
            
            if success:
                return Response(
                    response_serializer.data,
                    status=status.HTTP_201_CREATED
                )
            else:
                return Response(
                    response_serializer.data,
                    status=status.HTTP_422_UNPROCESSABLE_ENTITY
                )
                
        except Exception as e:
            logger.error(f"Upload failed: {e}")
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=["post"])
    def reprocess(self, request, pk=None):
        """Reprocess a document with custom chunking settings."""
        document = self.get_object()
        
        if not document.file:
            return Response(
                {"error": "Original file not available for reprocessing"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = DocumentReprocessSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        processor = DocumentProcessor(
            min_chunk_size=serializer.validated_data["min_chunk_size"],
            max_chunk_size=serializer.validated_data["max_chunk_size"]
        )
        
        success = processor.process(document)
        
        document.refresh_from_db()
        response_serializer = DocumentSerializer(document)
        
        if success:
            return Response(response_serializer.data)
        else:
            return Response(
                response_serializer.data,
                status=status.HTTP_422_UNPROCESSABLE_ENTITY
            )
    
    @action(detail=True, methods=["get"])
    def chunks(self, request, pk=None):
        """Get all chunks for a document with full content."""
        document = self.get_object()
        chunks = document.chunks.all()
        
        # Pagination
        page = self.paginate_queryset(chunks)
        if page is not None:
            serializer = DocumentChunkSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = DocumentChunkSerializer(chunks, many=True)
        return Response(serializer.data)
    
    def destroy(self, request, *args, **kwargs):
        """Delete a document and all its chunks."""
        document = self.get_object()
        
        # Delete the file if it exists
        if document.file:
            document.file.delete()
        
        # Chunks will be deleted via CASCADE
        return super().destroy(request, *args, **kwargs)


class DocumentChunkViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoints for viewing document chunks.
    
    Chunks are read-only and always linked to a document.
    """
    
    queryset = DocumentChunk.objects.all()
    permission_classes = [permissions.AllowAny]  # Change to IsAuthenticated in production
    
    def get_serializer_class(self):
        if self.action == "list":
            return DocumentChunkListSerializer
        return DocumentChunkSerializer
    
    def get_queryset(self):
        queryset = DocumentChunk.objects.all()
        
        # Filter by document
        document_id = self.request.query_params.get("document")
        if document_id:
            queryset = queryset.filter(document_id=document_id)
        
        # Search in content
        search = self.request.query_params.get("search")
        if search:
            queryset = queryset.filter(content__icontains=search)
        
        return queryset.select_related("document")


class AnalyzeView(APIView):
    """
    API endpoint for analyzing documents against ISO 27001 checklists.
    
    POST /documents/analyze/
    """
    
    permission_classes = [permissions.AllowAny]  # Change to IsAuthenticated in production
    parser_classes = [JSONParser]
    
    def post(self, request):
        """Analyze uploaded documents against a specific checklist."""
        serializer = AnalyzeRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        checklist_id = serializer.validated_data["checklist_id"]
        checklist_title = serializer.validated_data["checklist_title"]
        file_names = serializer.validated_data["files"]
        
        try:
            # Find documents by name
            documents = Document.objects.filter(
                name__in=file_names,
                status=Document.Status.COMPLETED
            )
            
            if not documents.exists():
                return Response(
                    {"error": "No processed documents found with the given file names"},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Get all chunks from the documents
            document_chunks = []
            for doc in documents:
                chunks = doc.chunks.all()
                for chunk in chunks:
                    document_chunks.append({
                        "content": chunk.content,
                        "heading": chunk.heading,
                        "document_name": doc.name,
                    })
            
            if not document_chunks:
                return Response(
                    {"error": "No document chunks found to analyze"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Create analysis result
            analysis_result = AnalysisResult.objects.create(
                checklist_id=checklist_id,
                checklist_title=checklist_title,
                status=AnalysisResult.Status.PENDING,
                analyzed_by=request.user if request.user.is_authenticated else None
            )
            analysis_result.documents.set(documents)
            
            # Perform the analysis
            analyzer = DocumentAnalyzer()
            success = analyzer.analyze(analysis_result, document_chunks)
            
            # Refresh and return result
            analysis_result.refresh_from_db()
            response_serializer = AnalysisResultSerializer(analysis_result)
            
            if success:
                return Response(
                    response_serializer.data,
                    status=status.HTTP_200_OK
                )
            else:
                return Response(
                    response_serializer.data,
                    status=status.HTTP_422_UNPROCESSABLE_ENTITY
                )
                
        except Exception as e:
            logger.error(f"Analysis failed: {e}")
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class AnalysisResultViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoints for viewing analysis results.
    
    Supports:
    - List analysis results (GET /analyses/)
    - Retrieve analysis result (GET /analyses/{id}/)
    """
    
    queryset = AnalysisResult.objects.all()
    permission_classes = [permissions.AllowAny]  # Change to IsAuthenticated in production
    
    def get_serializer_class(self):
        if self.action == "list":
            return AnalysisResultListSerializer
        return AnalysisResultSerializer
    
    def get_queryset(self):
        queryset = AnalysisResult.objects.all()
        
        # Filter by checklist
        checklist_id = self.request.query_params.get("checklist_id")
        if checklist_id:
            queryset = queryset.filter(checklist_id=checklist_id)
        
        # Filter by status
        status_filter = self.request.query_params.get("status")
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filter by compliance status
        compliance_status = self.request.query_params.get("compliance_status")
        if compliance_status:
            queryset = queryset.filter(compliance_status=compliance_status)
        
        return queryset.prefetch_related("documents")
