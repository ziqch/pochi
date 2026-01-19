# PDF Form Processing Reference

This document provides examples and templates for processing PDF forms.

## Interactive Form Fields

Common PDF form field types:
- Text fields
- Checkboxes
- Radio buttons
- Dropdown menus
- Signatures

## Form Data Format

Use JSON format for form data:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "subscribe": true,
  "country": "US"
}
```

## Example Scripts

### Fill Form Fields
```python
from PyPDF2 import PdfReader, PdfWriter

def fill_form(input_pdf, output_pdf, field_data):
    reader = PdfReader(input_pdf)
    writer = PdfWriter()

    for page in reader.pages:
        writer.add_page(page)

    writer.update_page_form_field_values(
        writer.pages[0], field_data
    )

    with open(output_pdf, 'wb') as output_file:
        writer.write(output_file)
```

### Extract Form Fields
```python
def get_form_fields(pdf_path):
    reader = PdfReader(pdf_path)
    fields = {}

    if "/AcroForm" in reader.trailer["/Root"]:
        for field in reader.get_form_text_fields():
            fields[field] = reader.get_form_text_fields()[field]

    return fields
```

## Common Form Templates

### Contact Information
- First Name
- Last Name
- Email Address
- Phone Number
- Address Fields

### Survey Forms
- Multiple choice questions
- Rating scales
- Text feedback areas
- Demographic information