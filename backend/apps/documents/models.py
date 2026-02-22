import uuid
from django.db import models
from apps.users.models import User


class Document(models.Model):
    """
    Represents an uploaded document (PDF, DOCX, or TXT).
    The actual file may be deleted after processing; only metadata and chunks are retained.
    """
    
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        PROCESSING = "processing", "Processing"
        COMPLETED = "completed", "Completed"
        FAILED = "failed", "Failed"
    
    class FileType(models.TextChoices):
        PDF = "pdf", "PDF"
        DOCX = "docx", "DOCX"
        TXT = "txt", "TXT"
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=500, help_text="Original filename")
    file_type = models.CharField(max_length=10, choices=FileType.choices)
    file = models.FileField(
        upload_to="documents/%Y/%m/%d/",
        blank=True,
        null=True,
        help_text="Original file (may be deleted after processing)"
    )
    file_size = models.PositiveIntegerField(default=0, help_text="File size in bytes")
    
    # Processing status
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING
    )
    error_message = models.TextField(blank=True, null=True)
    
    # Metadata
    total_chunks = models.PositiveIntegerField(default=0)
    total_characters = models.PositiveIntegerField(default=0)
    
    # Timestamps
    uploaded_at = models.DateTimeField(auto_now_add=True)
    processed_at = models.DateTimeField(blank=True, null=True)
    
    # Optional: Link to user who uploaded
    uploaded_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="uploaded_documents",
        db_column="uploaded_by_id",
        to_field="user_id"
    )
    
    class Meta:
        ordering = ["-uploaded_at"]
        indexes = [
            models.Index(fields=["status"]),
            models.Index(fields=["file_type"]),
            models.Index(fields=["uploaded_at"]),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.file_type})"


class DocumentChunk(models.Model):
    """
    Represents a semantic chunk extracted from a document.
    Each chunk is a meaningful segment of text (paragraph, section, etc.)
    """
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    document = models.ForeignKey(
        Document,
        on_delete=models.CASCADE,
        related_name="chunks"
    )
    
    # Chunk content
    content = models.TextField(help_text="The actual text content of the chunk")
    
    # Position and metadata
    chunk_index = models.PositiveIntegerField(help_text="Order of this chunk in the document")
    start_char = models.PositiveIntegerField(
        default=0,
        help_text="Starting character position in original document"
    )
    end_char = models.PositiveIntegerField(
        default=0,
        help_text="Ending character position in original document"
    )
    
    # Chunk metadata
    char_count = models.PositiveIntegerField(default=0)
    word_count = models.PositiveIntegerField(default=0)
    
    # Optional: heading or section title if detected
    heading = models.CharField(max_length=500, blank=True, null=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ["document", "chunk_index"]
        unique_together = ["document", "chunk_index"]
        indexes = [
            models.Index(fields=["document", "chunk_index"]),
        ]
    
    def __str__(self):
        preview = self.content[:50] + "..." if len(self.content) > 50 else self.content
        return f"Chunk {self.chunk_index} of {self.document.name}: {preview}"
    
    def save(self, *args, **kwargs):
        # Auto-calculate counts
        self.char_count = len(self.content)
        self.word_count = len(self.content.split())
        super().save(*args, **kwargs)


class AnalysisResult(models.Model):
    """
    Stores AI analysis results for compliance checking against ISO 27001 checklists.
    """
    
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        PROCESSING = "processing", "Processing"
        COMPLETED = "completed", "Completed"
        FAILED = "failed", "Failed"
    
    class ComplianceStatus(models.TextChoices):
        COMPLIANT = "compliant", "Compliant"
        PARTIAL = "partial", "Partially Compliant"
        NON_COMPLIANT = "non_compliant", "Non-Compliant"
        NOT_APPLICABLE = "not_applicable", "Not Applicable"
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Link to document(s) analyzed
    documents = models.ManyToManyField(
        Document,
        related_name="analysis_results",
        blank=True
    )
    
    # Checklist info
    checklist_id = models.IntegerField(help_text="ID of the ISO 27001 checklist item")
    checklist_title = models.CharField(max_length=500, help_text="Title of the checklist item")
    
    # Analysis status
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING
    )
    
    # Compliance result
    compliance_status = models.CharField(
        max_length=20,
        choices=ComplianceStatus.choices,
        blank=True,
        null=True
    )
    compliance_score = models.FloatField(
        default=0.0,
        help_text="Compliance score from 0.0 to 1.0"
    )
    
    # AI analysis output
    summary = models.TextField(
        blank=True,
        help_text="AI-generated summary of the analysis"
    )
    findings = models.JSONField(
        default=list,
        help_text="List of specific findings"
    )
    recommendations = models.JSONField(
        default=list,
        help_text="List of recommendations for improvement"
    )
    gaps = models.JSONField(
        default=list,
        help_text="List of compliance gaps identified"
    )
    comments = models.JSONField(
        default=list,
        help_text="General comments and observations about the audit report"
    )
    control_scores = models.JSONField(
        default=dict,
        help_text="Individual scores for each control (control_name: score)"
    )
    
    # Error handling
    error_message = models.TextField(blank=True, null=True)
    
    # AI Generated PDF Report
    pdf_report = models.FileField(
        upload_to="reports/%Y/%m/%d/",
        max_length=255,
        blank=True,
        null=True,
        help_text="AI-generated PDF audit report"
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(blank=True, null=True)
    
    # User who initiated analysis
    analyzed_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="analyses",
        db_column="analyzed_by_id",
        to_field="user_id"
    )
    
    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["checklist_id"]),
            models.Index(fields=["status"]),
            models.Index(fields=["compliance_status"]),
            models.Index(fields=["created_at"]),
        ]
    
    def __str__(self):
        return f"Analysis for {self.checklist_title} - {self.compliance_status or 'Pending'}"
