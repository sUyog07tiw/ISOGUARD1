import logging
import re
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.http import HttpResponse


def sanitize_text(text: str) -> str:
    """
    Remove invalid Unicode characters (surrogates) from text.
    This prevents encoding errors when processing text from database.
    """
    if not text:
        return ""
    
    # Remove surrogate characters (U+D800 to U+DFFF)
    sanitized = text.encode('utf-8', errors='surrogatepass').decode('utf-8', errors='replace')
    sanitized = re.sub(r'[\ud800-\udfff]', '', sanitized)
    sanitized = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]', '', sanitized)
    
    return sanitized

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
from .utils.pdf_report import generate_audit_report_pdf

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
    permission_classes = [permissions.IsAuthenticated]
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
        # Filter documents by the authenticated user
        queryset = Document.objects.filter(uploaded_by=self.request.user)
        
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
            
            # Create document record (user is guaranteed authenticated)
            document = Document.objects.create(
                name=uploaded_file.name,
                file_type=file_type,
                file_size=len(file_content),
                uploaded_by=request.user,
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
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == "list":
            return DocumentChunkListSerializer
        return DocumentChunkSerializer
    
    def get_queryset(self):
        # Filter chunks by documents owned by the authenticated user
        queryset = DocumentChunk.objects.filter(document__uploaded_by=self.request.user)
        
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
    
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [JSONParser]
    
    def post(self, request):
        """Analyze uploaded documents against a specific checklist."""
        print("\n[ANALYZE] Request received")
        
        serializer = AnalyzeRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        checklist_id = serializer.validated_data["checklist_id"]
        checklist_title = serializer.validated_data["checklist_title"]
        file_names = serializer.validated_data["files"]
        
        print(f"[ANALYZE] Checklist ID: {checklist_id}")
        print(f"[ANALYZE] Checklist Title: {checklist_title}")
        print(f"[ANALYZE] Files: {file_names}")
        
        try:
            # Find documents by name (only user's own documents)
            documents = Document.objects.filter(
                name__in=file_names,
                status=Document.Status.COMPLETED,
                uploaded_by=request.user
            )
            
            print(f"[ANALYZE] Found {documents.count()} processed document(s)")
            
            if not documents.exists():
                print("[ANALYZE] ERROR: No processed documents found")
                return Response(
                    {"error": "No processed documents found with the given file names"},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Get all chunks from the documents
            document_chunks = []
            for doc in documents:
                chunks = doc.chunks.all()
                for chunk in chunks:
                    # Sanitize content to remove any invalid Unicode chars
                    content = sanitize_text(chunk.content)
                    heading = sanitize_text(chunk.heading) if chunk.heading else None
                    document_chunks.append({
                        "content": content,
                        "heading": heading,
                        "document_name": doc.name,
                    })
            
            if not document_chunks:
                return Response(
                    {"error": "No document chunks found to analyze"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Create analysis result (user is guaranteed authenticated)
            analysis_result = AnalysisResult.objects.create(
                checklist_id=checklist_id,
                checklist_title=checklist_title,
                status=AnalysisResult.Status.PENDING,
                analyzed_by=request.user
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
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == "list":
            return AnalysisResultListSerializer
        return AnalysisResultSerializer
    
    def get_queryset(self):
        # Filter analysis results by the authenticated user
        queryset = AnalysisResult.objects.filter(analyzed_by=self.request.user)
        
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


class ExportAuditReportView(APIView):
    """
    API endpoint for exporting audit reports as PDF.
    
    GET /documents/export-report/
    Query params:
        - checklist_ids: Comma-separated list of checklist IDs (optional, defaults to all)
        - organization: Organization name (optional)
        - regenerate: If "true", force regenerate PDF even if cached (optional)
    """
    
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """Generate and download a PDF audit report."""
        from django.core.files.base import ContentFile
        
        print("\n[EXPORT] PDF Report generation requested")
        
        # Get query parameters
        checklist_ids_param = request.query_params.get("checklist_ids", "")
        organization_name = request.query_params.get("organization", "Organization")
        regenerate = request.query_params.get("regenerate", "").lower() == "true"
        
        try:
            # Parse checklist IDs
            if checklist_ids_param:
                checklist_ids = [int(x.strip()) for x in checklist_ids_param.split(",") if x.strip()]
            else:
                checklist_ids = None  # Get all
            
            # Fetch analysis results (only user's own results)
            queryset = AnalysisResult.objects.filter(
                status=AnalysisResult.Status.COMPLETED,
                analyzed_by=request.user
            )
            
            if checklist_ids:
                queryset = queryset.filter(checklist_id__in=checklist_ids)
            
            # Order by checklist_id
            queryset = queryset.order_by("checklist_id")
            
            # Get the latest result for each checklist
            latest_results = {}
            for result in queryset:
                cid = result.checklist_id
                if cid not in latest_results or result.created_at > latest_results[cid].created_at:
                    latest_results[cid] = result
            
            if not latest_results:
                return Response(
                    {"error": "No completed analysis results found. Please analyze documents first."},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # For single checklist, try to return stored PDF
            if checklist_ids and len(checklist_ids) == 1 and not regenerate:
                result = latest_results.get(checklist_ids[0])
                if result and result.pdf_report:
                    print(f"[EXPORT] Serving stored PDF for checklist {checklist_ids[0]}")
                    response = HttpResponse(result.pdf_report.read(), content_type='application/pdf')
                    filename = f"ISOGUARD_{result.checklist_title.replace(' ', '_')}.pdf"
                    response['Content-Disposition'] = f'attachment; filename="{filename}"'
                    return response
            
            # Convert to list of dicts for PDF generator
            analysis_data = []
            for cid in sorted(latest_results.keys()):
                result = latest_results[cid]
                analysis_data.append({
                    "checklist_id": result.checklist_id,
                    "checklist_title": result.checklist_title,
                    "status": result.status,
                    "compliance_status": result.compliance_status,
                    "compliance_score": result.compliance_score,
                    "summary": result.summary or "",
                    "findings": result.findings or [],
                    "recommendations": result.recommendations or [],
                    "gaps": result.gaps or [],
                    "comments": result.comments or [],
                    "control_scores": result.control_scores or {},
                })
            
            print(f"[EXPORT] Generating PDF for {len(analysis_data)} checklist(s)")
            
            # Generate PDF
            pdf_bytes = generate_audit_report_pdf(analysis_data, organization_name)
            
            print(f"[EXPORT] PDF generated successfully ({len(pdf_bytes)} bytes)")
            
            # Save PDF to AnalysisResult for single checklist
            if checklist_ids and len(checklist_ids) == 1:
                result = latest_results.get(checklist_ids[0])
                if result:
                    # Use short filename to avoid max_length issues
                    short_id = str(result.id)[:8]
                    filename = f"report_{result.checklist_id}_{short_id}.pdf"
                    result.pdf_report.save(filename, ContentFile(pdf_bytes), save=True)
                    print(f"[EXPORT] PDF saved to AnalysisResult {result.id}")
            
            # Create HTTP response with PDF
            response = HttpResponse(pdf_bytes, content_type='application/pdf')
            filename = f"ISOGUARD_Audit_Report_{organization_name.replace(' ', '_')}.pdf"
            response['Content-Disposition'] = f'attachment; filename="{filename}"'
            response['Content-Length'] = len(pdf_bytes)
            
            return response
            
        except ValueError as e:
            logger.error(f"Invalid checklist_ids parameter: {e}")
            return Response(
                {"error": "Invalid checklist_ids parameter. Use comma-separated integers."},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(f"PDF generation failed: {e}")
            import traceback
            traceback.print_exc()
            return Response(
                {"error": f"Failed to generate PDF report: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
