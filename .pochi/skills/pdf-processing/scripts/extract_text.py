#!/usr/bin/env python3
"""
Extract text from PDF files.
Usage: python extract_text.py <pdf_file> [--output <output_file>]
"""

import sys
import argparse
from pathlib import Path

try:
    import PyPDF2
    import pdfplumber
except ImportError:
    print("Error: Required packages not installed. Run: pip install PyPDF2 pdfplumber")
    sys.exit(1)

def extract_text_pypdf2(pdf_path):
    """Extract text using PyPDF2 (faster, basic extraction)."""
    text = ""
    with open(pdf_path, 'rb') as file:
        reader = PyPDF2.PdfReader(file)
        for page in reader.pages:
            text += page.extract_text() + "\n"
    return text

def extract_text_pdfplumber(pdf_path):
    """Extract text using pdfplumber (slower, better quality)."""
    text = ""
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
    return text

def main():
    parser = argparse.ArgumentParser(description="Extract text from PDF files")
    parser.add_argument("pdf_file", help="Path to PDF file")
    parser.add_argument("--output", "-o", help="Output text file (default: stdout)")
    parser.add_argument("--method", choices=["fast", "quality"], default="quality",
                       help="Extraction method: fast (PyPDF2) or quality (pdfplumber)")

    args = parser.parse_args()

    pdf_path = Path(args.pdf_file)
    if not pdf_path.exists():
        print(f"Error: File {pdf_path} not found")
        sys.exit(1)

    try:
        if args.method == "fast":
            text = extract_text_pypdf2(pdf_path)
        else:
            text = extract_text_pdfplumber(pdf_path)

        if args.output:
            with open(args.output, 'w', encoding='utf-8') as f:
                f.write(text)
            print(f"Text extracted to {args.output}")
        else:
            print(text)

    except Exception as e:
        print(f"Error processing PDF: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()