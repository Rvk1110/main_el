from pypdf import PdfReader

def extract_text_from_pdf(pdf_path):
    """
    Extract raw text from a PDF contract.
    Returns a single cleaned string.
    """
    try:
        reader = PdfReader(pdf_path)
        text = ""

        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"

        return text.strip()

    except Exception as e:
        print(f"[ERROR] Could not extract PDF text: {e}")
        return ""
