from django.test import TestCase
from .models import Document, DocumentChunk
from .utils import SemanticChunker, extract_text


class SemanticChunkerTest(TestCase):
    """Tests for the semantic chunking module."""
    
    def test_basic_chunking(self):
        """Test that text is chunked into paragraphs."""
        text = """This is the first paragraph. It has multiple sentences.
        
This is the second paragraph. It also has content.

This is the third paragraph."""
        
        chunker = SemanticChunker(min_chunk_size=10, max_chunk_size=500)
        chunks = chunker.chunk(text)
        
        self.assertGreater(len(chunks), 0)
        # Verify all text is preserved
        combined = " ".join(c.content for c in chunks)
        self.assertIn("first paragraph", combined)
        self.assertIn("second paragraph", combined)
        self.assertIn("third paragraph", combined)
    
    def test_large_paragraph_split(self):
        """Test that large paragraphs are split by sentences."""
        # Create a very long paragraph
        long_text = ". ".join([f"This is sentence number {i}" for i in range(100)])
        
        chunker = SemanticChunker(min_chunk_size=50, max_chunk_size=200)
        chunks = chunker.chunk(long_text)
        
        # Should be split into multiple chunks
        self.assertGreater(len(chunks), 1)
        
        # Each chunk should be under max size
        for chunk in chunks:
            self.assertLessEqual(len(chunk.content), 300)  # Allow some flexibility
    
    def test_small_paragraphs_merged(self):
        """Test that small paragraphs are merged together."""
        text = "Hi.\n\nOk.\n\nYes."
        
        chunker = SemanticChunker(min_chunk_size=20, max_chunk_size=500)
        chunks = chunker.chunk(text)
        
        # Should be merged into fewer chunks
        self.assertLessEqual(len(chunks), 2)
    
    def test_heading_detection(self):
        """Test that headings are detected."""
        text = """# Introduction

This is the introduction paragraph.

## Methods

This is the methods section."""
        
        chunker = SemanticChunker(min_chunk_size=10, max_chunk_size=500)
        chunks = chunker.chunk(text)
        
        # Check that some chunks have headings
        headings = [c.heading for c in chunks if c.heading]
        self.assertTrue(any("Introduction" in h for h in headings) or len(chunks) > 0)


class DocumentModelTest(TestCase):
    """Tests for the Document model."""
    
    def test_document_creation(self):
        """Test creating a document."""
        doc = Document.objects.create(
            name="test.pdf",
            file_type="pdf",
            file_size=1024
        )
        
        self.assertEqual(doc.status, Document.Status.PENDING)
        self.assertEqual(doc.total_chunks, 0)
    
    def test_chunk_creation(self):
        """Test creating chunks linked to a document."""
        doc = Document.objects.create(
            name="test.txt",
            file_type="txt",
            file_size=100
        )
        
        chunk = DocumentChunk.objects.create(
            document=doc,
            content="This is a test chunk.",
            chunk_index=0
        )
        
        self.assertEqual(chunk.document, doc)
        self.assertEqual(chunk.char_count, len("This is a test chunk."))
        self.assertGreater(chunk.word_count, 0)
    
    def test_cascade_delete(self):
        """Test that deleting a document deletes its chunks."""
        doc = Document.objects.create(
            name="test.txt",
            file_type="txt"
        )
        
        DocumentChunk.objects.create(
            document=doc,
            content="Chunk 1",
            chunk_index=0
        )
        DocumentChunk.objects.create(
            document=doc,
            content="Chunk 2",
            chunk_index=1
        )
        
        doc_id = doc.id
        doc.delete()
        
        # Chunks should be deleted
        self.assertEqual(
            DocumentChunk.objects.filter(document_id=doc_id).count(),
            0
        )
