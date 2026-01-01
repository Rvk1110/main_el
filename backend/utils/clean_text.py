import re

def clean_contract_text(text: str) -> str:
    """
    Clean and normalize raw contract text.
    Removes extra spaces, weird characters, line breaks, etc.
    """
    if not text:
        return ""

    # Normalize line breaks
    text = text.replace("\r", "\n")

    # Remove multiple newlines
    text = re.sub(r"\n+", "\n", text)

    # Remove multiple spaces
    text = re.sub(r"[ ]{2,}", " ", text)

    # Fix weird hyphens / unicode dashes
    text = text.replace("–", "-").replace("—", "-")

    # Remove leading/trailing whitespace
    text = text.strip()

    return text
