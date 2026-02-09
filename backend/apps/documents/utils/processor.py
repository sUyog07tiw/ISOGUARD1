"""
Document processing service that orchestrates extraction and chunking.
"""

import logging
from typing import List, Optional
from django.utils import timezone
from django.db import transaction

from ..models import Document, DocumentChunk
from .extraction import extract_text, TextExtractionError, get_file_type
from .chunking import SemanticChunker, Chunk

logger = logging.getLogger(__name__)


class DocumentProcessor:
    """
    Processes uploaded documents: extracts text and creates semantic chunks.
    """
    
    def __init__(
        self,
        min_chunk_size: int = 100,
        max_chunk_size: int = 2000
    ):
        self.chunker = SemanticChunker(
            min_chunk_size=min_chunk_size,
            max_chunk_size=max_chunk_size
        )
    
    @transaction.atomic
    def process(self, document: Document) -> bool:
        """
        Process a document: extract text and create chunks.
        
        Args:
            document: Document model instance to process
            
        Returns:
            True if successful, False otherwise
        """
        try:
            document.status = Document.Status.PROCESSING
            document.save()
            
            # Read file content
            if not document.file:
                raise ValueError("Document has no file attached")
            
            document.file.seek(0)
            file_content = document.file.read()
            
            # Extract text
            logger.info(f"Extracting text from {document.name}")
            extracted_text = extract_text(file_content, document.file_type)
            
            if not extracted_text.strip():
                raise ValueError("No text could be extracted from the document")
            
            # Perform semantic chunking
            logger.info(f"Chunking document {document.name}")
            chunks = self.chunker.chunk(extracted_text)
            
            if not chunks:
                raise ValueError("No chunks could be created from the extracted text")
            
            # Delete any existing chunks for this document
            DocumentChunk.objects.filter(document=document).delete()
            
            # Create chunk records
            chunk_objects = []
            for index, chunk in enumerate(chunks):
                chunk_objects.append(
                    DocumentChunk(
                        document=document,
                        content=chunk.content,
                        chunk_index=index,
                        start_char=chunk.start_char,
                        end_char=chunk.end_char,
                        heading=chunk.heading,
                        char_count=chunk.char_count,
                        word_count=chunk.word_count
                    )
                )
            
            # Bulk create for efficiency
            DocumentChunk.objects.bulk_create(chunk_objects)
            
            # Update document metadata
            document.total_chunks = len(chunks)
            document.total_characters = len(extracted_text)
            document.status = Document.Status.COMPLETED
            document.processed_at = timezone.now()
            document.error_message = None
            document.save()
            
            logger.info(
                f"Successfully processed {document.name}: "
                f"{len(chunks)} chunks, {len(extracted_text)} characters"
            )
            
            return True
            
        except TextExtractionError as e:
            logger.error(f"Extraction failed for {document.name}: {e}")
            document.status = Document.Status.FAILED
            document.error_message = str(e)
            document.save()
            return False
            
        except Exception as e:
            logger.error(f"Processing failed for {document.name}: {e}")
            document.status = Document.Status.FAILED
            document.error_message = str(e)
            document.save()
            return False
    
    def process_file(
        self,
        file_content: bytes,
        filename: str,
        uploaded_by=None
    ) -> Document:
        """
        Create a document from file content and process it.
        
        Args:
            file_content: Raw bytes of the file
            filename: Original filename
            uploaded_by: User who uploaded (optional)
            
        Returns:
            Document instance
        """
        from django.core.files.base import ContentFile
        
        # Determine file type
        file_type = get_file_type(filename)
        if not file_type:
            raise ValueError(f"Unsupported file type for: {filename}")
        
        # Create document record
        document = Document.objects.create(
            name=filename,
            file_type=file_type,
            file_size=len(file_content),
            uploaded_by=uploaded_by,
            status=Document.Status.PENDING
        )
        
        # Save the file
        document.file.save(filename, ContentFile(file_content))
        
        # Process the document
        self.process(document)
        
        return document


def process_document(document: Document) -> bool:
    """
    Convenience function to process a document.
    
    Args:
        document: Document to process
        
    Returns:
        True if successful
    """
    processor = DocumentProcessor()
    return processor.process(document)
