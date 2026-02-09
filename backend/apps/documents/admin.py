from django.contrib import admin
from .models import Document, DocumentChunk


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
