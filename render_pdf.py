from langchain.tools import tool
from reportlab.lib.pagesizes import LETTER
from reportlab.pdfgen import canvas
from pathlib import Path
import uuid

OUTPUT_DIR = Path("media/files")
OUTPUT_DIR.mkdir(exist_ok=True)

@tool
def render_contract_pdf(contract_text: str) -> str:
    """
    Renders a contract string as a PDF and saves it.

    Args:
        contract_text (str): The final filled contract text.

    Returns:
        str: Path to the generated PDF file.
    """
    try:
        filename = f"contract_{uuid.uuid4().hex[:8]}.pdf"
        pdf_path = OUTPUT_DIR / filename

        c = canvas.Canvas(str(pdf_path), pagesize=LETTER)
        width, height = LETTER
        x_margin = 50
        y = height - 50

        for line in contract_text.split("\n"):
            if y < 50:
                c.showPage()
                y = height - 50
            c.drawString(x_margin, y, line.strip())
            y -= 15

        c.save()
        return {'file_url':pdf_path}

    except Exception as e:
        return f"Error rendering PDF: {str(e)}"
