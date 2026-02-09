"""
Simple semantic chunking utilities for splitting text into meaningful segments.

This module implements paragraph-based chunking (non-AI).
It groups paragraphs together until they reach max size, then starts a new chunk.
Perfect for phase 1 - can be upgraded to embedding-based chunking later.
"""

from dataclasses import dataclass
from typing import List, Optional


@dataclass
class Chunk:
    """Represents a semantic chunk of text."""
    content: str
    start_char: int
    end_char: int
    heading: Optional[str] = None
    
    @property
    def char_count(self) -> int:
        return len(self.content)
    
    @property
    def word_count(self) -> int:
        return len(self.content.split())


def semantic_chunk(text: str, min_len: int = 300, max_len: int = 1200) -> List[str]:
    """
    Simple paragraph-based semantic chunking (non-AI).
    
    Groups paragraphs together until they reach max_len,
    then starts a new chunk if current meets min_len.
    
    Args:
        text: The text to chunk
        min_len: Minimum chunk length in characters (default 300)
        max_len: Maximum chunk length in characters (default 1200)
        
    Returns:
        List of chunk strings
    """
    paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]
    chunks = []
    current = ""

    for p in paragraphs:
        if len(current) + len(p) <= max_len:
            current += " " + p
        else:
            if len(current) >= min_len:
                chunks.append(current.strip())
                current = p
            else:
                current += " " + p

    if current:
        chunks.append(current.strip())

    return chunks


class SemanticChunker:
    """
    Simple paragraph-based chunker that returns Chunk objects with metadata.
    
    Groups paragraphs together until they reach max size.
    """
    
    def __init__(
        self,
        min_chunk_size: int = 300,
        max_chunk_size: int = 1200
    ):
        """
        Initialize the semantic chunker.
        
        Args:
            min_chunk_size: Minimum characters per chunk (default 300)
            max_chunk_size: Maximum characters per chunk (default 1200)
        """
        self.min_chunk_size = min_chunk_size
        self.max_chunk_size = max_chunk_size
    
    def chunk(self, text: str) -> List[Chunk]:
        """
        Split text into semantic chunks.
        
        Args:
            text: The full text to chunk
            
        Returns:
            List of Chunk objects
        """
        if not text or not text.strip():
            return []
        
        # Normalize text
        text = text.replace("\r\n", "\n").replace("\r", "\n").strip()
        
        # Use simple chunking logic
        chunk_strings = semantic_chunk(
            text, 
            min_len=self.min_chunk_size, 
            max_len=self.max_chunk_size
        )
        
        # Convert to Chunk objects with position tracking
        chunks = []
        current_pos = 0
        
        for chunk_text in chunk_strings:
            # Find position in original text
            start_pos = text.find(chunk_text[:50], current_pos)
            if start_pos == -1:
                start_pos = current_pos
            
            end_pos = start_pos + len(chunk_text)
            
            chunks.append(Chunk(
                content=chunk_text,
                start_char=start_pos,
                end_char=end_pos,
                heading=None
            ))
            
            current_pos = end_pos
        
        return chunks
