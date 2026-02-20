from rest_framework import serializers
from .models import Document, DocumentChunk


class DocumentChunkSerializer(serializers.ModelSerializer):
    """Serializer for document chunks."""
    
    class Meta:
        model = DocumentChunk
        fields = [
            "id",
            "chunk_index",
            "content",
            "heading",
            "char_count",
            "word_count",
            "start_char",
            "end_char",
            "created_at",
        ]
        read_only_fields = fields


class DocumentChunkListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing chunks (without full content)."""
    
    preview = serializers.SerializerMethodField()
    
    class Meta:
        model = DocumentChunk
        fields = [
            "id",
            "chunk_index",
            "heading",
            "char_count",
            "word_count",
            "preview",
        ]
        read_only_fields = fields
    
    def get_preview(self, obj):
        """Return first 100 characters of content."""
        if len(obj.content) > 100:
            return obj.content[:100] + "..."
        return obj.content


class DocumentSerializer(serializers.ModelSerializer):
    """Serializer for document details."""
    
    chunks = DocumentChunkListSerializer(many=True, read_only=True)
    uploaded_by_email = serializers.EmailField(
        source="uploaded_by.email",
        read_only=True,
        allow_null=True
    )
    
    class Meta:
        model = Document
        fields = [
            "id",
            "name",
            "file_type",
            "file_size",
            "status",
            "error_message",
            "total_chunks",
            "total_characters",
            "uploaded_at",
            "processed_at",
            "uploaded_by_email",
            "chunks",
        ]
        read_only_fields = fields


class DocumentListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing documents."""
    
    class Meta:
        model = Document
        fields = [
            "id",
            "name",
            "file_type",
            "file_size",
            "status",
            "total_chunks",
            "uploaded_at",
            "processed_at",
        ]
        read_only_fields = fields


class DocumentUploadSerializer(serializers.Serializer):
    """Serializer for document upload."""
    
    file = serializers.FileField(
        help_text="The document file (PDF only)"
    )
    
    def validate_file(self, value):
        """Validate the uploaded file."""
        from .utils.extraction import get_file_type
        
        # Check file type - only PDF allowed
        file_type = get_file_type(value.name)
        if file_type != "pdf":
            raise serializers.ValidationError(
                "Unsupported file type. Only PDF files are allowed."
            )
        
        # Check file size (max 50MB)
        max_size = 50 * 1024 * 1024
        if value.size > max_size:
            raise serializers.ValidationError(
                f"File too large. Maximum size is 50MB."
            )
        
        return value


class DocumentReprocessSerializer(serializers.Serializer):
    """Serializer for reprocessing a document with custom chunking settings."""
    
    min_chunk_size = serializers.IntegerField(
        default=100,
        min_value=50,
        max_value=500,
        help_text="Minimum chunk size in characters"
    )
    max_chunk_size = serializers.IntegerField(
        default=2000,
        min_value=200,
        max_value=10000,
        help_text="Maximum chunk size in characters"
    )


class AnalyzeRequestSerializer(serializers.Serializer):
    """Serializer for analysis request."""
    
    checklist_id = serializers.IntegerField(
        help_text="ID of the ISO 27001 checklist item"
    )
    checklist_title = serializers.CharField(
        max_length=500,
        help_text="Title of the checklist item"
    )
    files = serializers.ListField(
        child=serializers.CharField(),
        help_text="List of uploaded file names"
    )
    checklist_prompt = serializers.CharField(
        required=False,
        allow_blank=True,
        default="",
        help_text="Optional custom AI prompt with detailed requirements"
    )
    key_controls = serializers.ListField(
        child=serializers.CharField(),
        required=False,
        default=list,
        help_text="Optional list of key controls to evaluate"
    )
    
    def validate_checklist_id(self, value):
        """Validate that the checklist ID is valid."""
        if value < 1 or value > 10:  # Support 10 checklists
            raise serializers.ValidationError(
                "Invalid checklist ID. Must be between 1 and 10."
            )
        return value


class AnalysisResultSerializer(serializers.ModelSerializer):
    """Serializer for analysis results."""
    
    documents = DocumentListSerializer(many=True, read_only=True)
    pdf_report_url = serializers.SerializerMethodField()
    
    class Meta:
        from .models import AnalysisResult
        model = AnalysisResult
        fields = [
            "id",
            "checklist_id",
            "checklist_title",
            "status",
            "compliance_status",
            "compliance_score",
            "summary",
            "findings",
            "recommendations",
            "gaps",
            "comments",
            "control_scores",
            "error_message",
            "created_at",
            "completed_at",
            "documents",
            "pdf_report_url",
        ]
        read_only_fields = fields
    
    def get_pdf_report_url(self, obj):
        """Return URL for the stored PDF report if available."""
        if obj.pdf_report:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.pdf_report.url)
            return obj.pdf_report.url
        return None


class AnalysisResultListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing analysis results."""
    
    pdf_report_url = serializers.SerializerMethodField()
    
    class Meta:
        from .models import AnalysisResult
        model = AnalysisResult
        fields = [
            "id",
            "checklist_id",
            "checklist_title",
            "status",
            "compliance_status",
            "compliance_score",
            "created_at",
            "completed_at",
            "pdf_report_url",
        ]
        read_only_fields = fields
    
    def get_pdf_report_url(self, obj):
        """Return URL for the stored PDF report if available."""
        if obj.pdf_report:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.pdf_report.url)
            return obj.pdf_report.url
        return None
        