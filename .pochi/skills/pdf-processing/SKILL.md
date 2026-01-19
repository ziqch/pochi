---
name: pdf-processing
description: Extract text and tables from PDF files, fill PDF forms, and merge multiple PDFs. Use when working with PDF documents or when the user mentions PDFs, forms, or document extraction.
license: Apache-2.0
compatibility: Requires Python 3.8+ with PyPDF2, pdfplumber packages
metadata:
  author: pochi-team
  version: "2.1"
  category: document-processing
allowed-tools: Bash(python:*) Read Write
---

# PDF Processing Skill

This skill provides comprehensive PDF document processing capabilities including text extraction, table parsing, form filling, and document merging.

## Capabilities

- **Text Extraction**: Extract plain text from PDF documents
- **Table Parsing**: Extract structured table data from PDFs
- **Form Filling**: Fill interactive PDF forms with data
- **Document Merging**: Combine multiple PDF files
- **Metadata Reading**: Extract PDF metadata and properties

## Usage

Call this skill when you need to:
- Extract information from PDF files
- Process PDF forms
- Combine or split PDF documents
- Convert PDF content to structured data

## Quick Start

1. Use `scripts/extract_text.py` for basic text extraction
2. Use `scripts/extract_tables.py` for structured table data
3. See `references/FORMS.md` for form processing examples

## Dependencies

This skill requires Python packages:
```bash
pip install PyPDF2 pdfplumber pandas
```

See [references/SETUP.md](references/SETUP.md) for detailed installation instructions.