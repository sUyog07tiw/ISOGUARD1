from django.contrib import admin
from django.utils.html import format_html, mark_safe, escape
import json
from .models import Document, DocumentChunk, AnalysisResult


class DocumentChunkInline(admin.TabularInline):
    model = DocumentChunk
    extra = 0
    readonly_fields = ["id", "chunk_index", "char_count", "word_count", "heading", "created_at"]
    fields = ["chunk_index", "heading", "char_count", "word_count"]
    can_delete = False
    show_change_link = True
    
    def has_add_permission(self, request, obj=None):
        return False


@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = [
        "name",
        "file_type",
        "status",
        "total_chunks",
        "total_characters",
        "uploaded_at",
        "processed_at",
    ]
    list_filter = ["status", "file_type", "uploaded_at"]
    search_fields = ["name", "id"]
    readonly_fields = [
        "id",
        "file_size",
        "total_chunks",
        "total_characters",
        "uploaded_at",
        "processed_at",
    ]
    inlines = [DocumentChunkInline]
    
    fieldsets = (
        (None, {
            "fields": ("id", "name", "file_type", "file", "file_size")
        }),
        ("Status", {
            "fields": ("status", "error_message")
        }),
        ("Statistics", {
            "fields": ("total_chunks", "total_characters")
        }),
        ("Timestamps", {
            "fields": ("uploaded_at", "processed_at")
        }),
        ("User", {
            "fields": ("uploaded_by",)
        }),
    )


@admin.register(DocumentChunk)
class DocumentChunkAdmin(admin.ModelAdmin):
    list_display = [
        "id",
        "document",
        "chunk_index",
        "heading",
        "char_count",
        "word_count",
    ]
    list_filter = ["document__file_type", "created_at"]
    search_fields = ["content", "heading", "document__name"]
    readonly_fields = [
        "id",
        "document",
        "chunk_index",
        "start_char",
        "end_char",
        "char_count",
        "word_count",
        "created_at",
    ]
    
    fieldsets = (
        (None, {
            "fields": ("id", "document", "chunk_index", "heading")
        }),
        ("Content", {
            "fields": ("content",),
            "classes": ("wide",)
        }),
        ("Position", {
            "fields": ("start_char", "end_char")
        }),
        ("Statistics", {
            "fields": ("char_count", "word_count", "created_at")
        }),
    )


@admin.register(AnalysisResult)
class AnalysisResultAdmin(admin.ModelAdmin):
    list_display = [
        "id",
        "checklist_title",
        "compliance_status_badge",
        "compliance_score_display",
        "status",
        "has_pdf",
        "created_at",
        "analyzed_by",
    ]
    list_filter = ["status", "compliance_status", "checklist_id", "created_at"]
    search_fields = ["checklist_title", "summary", "id"]
    readonly_fields = [
        "id",
        "compliance_score_display",
        "compliance_status_badge",
        "findings_display",
        "recommendations_display",
        "gaps_display",
        "comments_display",
        "control_scores_display",
        "created_at",
        "completed_at",
        "documents_list",
        "pdf_report_link",
    ]
    filter_horizontal = ["documents"]
    
    fieldsets = (
        (None, {
            "fields": ("id", "checklist_id", "checklist_title")
        }),
        ("Analyzed Documents", {
            "fields": ("documents_list", "documents"),
            "description": "Documents that were analyzed"
        }),
        ("Status", {
            "fields": ("status", "error_message")
        }),
        ("Compliance Result", {
            "fields": ("compliance_status_badge", "compliance_status", "compliance_score_display", "compliance_score"),
            "classes": ("wide",)
        }),
        ("AI Analysis - Summary", {
            "fields": ("summary",),
            "classes": ("wide",)
        }),
        ("AI Analysis - Comments", {
            "fields": ("comments_display",),
            "classes": ("wide", "collapse"),
            "description": "General comments and observations from AI analysis"
        }),
        ("AI Analysis - Findings", {
            "fields": ("findings_display",),
            "classes": ("wide", "collapse"),
        }),
        ("AI Analysis - Recommendations", {
            "fields": ("recommendations_display",),
            "classes": ("wide", "collapse"),
        }),
        ("AI Analysis - Gaps", {
            "fields": ("gaps_display",),
            "classes": ("wide", "collapse"),
        }),
        ("AI Analysis - Control Scores", {
            "fields": ("control_scores_display",),
            "classes": ("wide", "collapse"),
            "description": "Individual scores for each control area"
        }),
        ("Raw Data (JSON)", {
            "fields": ("findings", "recommendations", "gaps", "comments", "control_scores"),
            "classes": ("collapse",),
            "description": "Raw JSON data stored in database"
        }),
        ("PDF Report", {
            "fields": ("pdf_report", "pdf_report_link"),
            "description": "AI-generated PDF audit report"
        }),
        ("Timestamps", {
            "fields": ("created_at", "completed_at")
        }),
        ("User", {
            "fields": ("analyzed_by",)
        }),
    )
    
    def compliance_status_badge(self, obj):
        """Display compliance status as a colored badge."""
        if not obj.compliance_status:
            return mark_safe('<span style="color: gray;">Pending</span>')
        
        colors = {
            "compliant": "#28a745",       # Green
            "partial": "#ffc107",          # Yellow
            "non_compliant": "#dc3545",    # Red
            "not_applicable": "#6c757d",   # Gray
        }
        color = colors.get(obj.compliance_status, "#6c757d")
        label = obj.get_compliance_status_display()
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 8px; border-radius: 4px; font-weight: bold;">{}</span>',
            color, label
        )
    compliance_status_badge.short_description = "Compliance"
    compliance_status_badge.admin_order_field = "compliance_status"
    
    def compliance_score_display(self, obj):
        """Display compliance score as a percentage with color."""
        score = obj.compliance_score * 100 if obj.compliance_score else 0
        if score >= 80:
            color = "#28a745"
        elif score >= 50:
            color = "#ffc107"
        else:
            color = "#dc3545"
        score_text = f"{score:.1f}%"
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color, score_text
        )
    compliance_score_display.short_description = "Score"
    compliance_score_display.admin_order_field = "compliance_score"
    
    def documents_list(self, obj):
        """Display linked documents as a list."""
        docs = obj.documents.all()
        if not docs:
            return "No documents"
        items = "<br>".join([f"• {escape(doc.name)}" for doc in docs])
        return mark_safe(items)
    documents_list.short_description = "Analyzed Documents"
    
    def _format_json_list(self, data):
        """Format a JSON list as HTML."""
        if not data:
            return mark_safe('<span style="color: gray;">No data</span>')
        
        if isinstance(data, list):
            items = "".join([f"<li style='margin-bottom: 8px;'>{escape(str(item))}</li>" for item in data])
            return mark_safe(f"<ul style='margin: 0; padding-left: 20px;'>{items}</ul>")
        return format_html("<pre>{}</pre>", json.dumps(data, indent=2))
    
    def _format_json_dict(self, data):
        """Format a JSON dict as HTML table."""
        if not data:
            return mark_safe('<span style="color: gray;">No data</span>')
        
        if isinstance(data, dict):
            rows = ""
            for key, value in data.items():
                if isinstance(value, (int, float)):
                    score = float(value) * 100
                    if score >= 80:
                        color = "#28a745"
                    elif score >= 50:
                        color = "#ffc107"
                    else:
                        color = "#dc3545"
                    value_html = f'<span style="color: {color}; font-weight: bold;">{score:.1f}%</span>'
                else:
                    value_html = escape(str(value))
                rows += f"<tr><td style='padding: 4px 8px; border: 1px solid #ddd;'><strong>{escape(str(key))}</strong></td><td style='padding: 4px 8px; border: 1px solid #ddd;'>{value_html}</td></tr>"
            return mark_safe(f"<table style='border-collapse: collapse; width: 100%;'>{rows}</table>")
        return format_html("<pre>{}</pre>", json.dumps(data, indent=2))
    
    def findings_display(self, obj):
        return self._format_json_list(obj.findings)
    findings_display.short_description = "Findings"
    
    def recommendations_display(self, obj):
        return self._format_json_list(obj.recommendations)
    recommendations_display.short_description = "Recommendations"
    
    def gaps_display(self, obj):
        return self._format_json_list(obj.gaps)
    gaps_display.short_description = "Gaps"
    
    def comments_display(self, obj):
        return self._format_json_list(obj.comments)
    comments_display.short_description = "AI Comments"
    
    def control_scores_display(self, obj):
        return self._format_json_dict(obj.control_scores)
    control_scores_display.short_description = "Control Scores"
    
    def pdf_report_link(self, obj):
        """Display a link to download the PDF report."""
        if obj.pdf_report:
            return format_html(
                '<a href="{}" target="_blank" style="background-color: #dc3545; color: white; padding: 5px 15px; border-radius: 4px; text-decoration: none;">📄 Download PDF Report</a>',
                obj.pdf_report.url
            )
        return mark_safe('<span style="color: gray;">No PDF generated yet</span>')
    pdf_report_link.short_description = "PDF Report"
    
    def has_pdf(self, obj):
        """Display if PDF report is available."""
        if obj.pdf_report:
            return mark_safe('<span style="color: #28a745; font-weight: bold;">✓ PDF</span>')
        return mark_safe('<span style="color: #dc3545;">✗</span>')
    has_pdf.short_description = "PDF"
    has_pdf.admin_order_field = "pdf_report"
    
    def has_add_permission(self, request):
        """Disable adding analysis results manually - they should come from API."""
        return False

