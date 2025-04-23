import os
from io import BytesIO
from PIL import Image
import pytesseract
import docx2txt
import PyPDF2
import textract  # For .doc and fallback for .docx

def extract_text(file):
    filename = file.filename
    ext = os.path.splitext(filename)[1].lower()

    try:
        if ext in ['.jpg', '.jpeg', '.png']:
            image = Image.open(file.stream)
            text = pytesseract.image_to_string(image)
            return text.strip()

        elif ext == '.pdf':
            reader = PyPDF2.PdfReader(file.stream)
            text = ""
            for page in reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text
            return text.strip()

        elif ext == '.docx':
            return docx2txt.process(file).strip()

        elif ext == '.doc':
            # Use textract which supports .doc
            text = textract.process(file.stream).decode('utf-8')
            return text.strip()

        else:
            return f"Unsupported file type: {ext}"

    except Exception as e:
        return f"Error reading file: {str(e)}"
