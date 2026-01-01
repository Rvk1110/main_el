import google.generativeai as genai
import json
import os
from backend.utils.risk_prompt import MASTER_PROMPT

# Configure using your system environment variable
genai.configure(api_key=os.environ.get("AIzaSyA45PO22NOCDIgd4U02rEYAyrNARzYu-DE"))

# Use the model YOU ACTUALLY HAVE
model = genai.GenerativeModel("models/gemini-2.5-flash")



def validate_llm_output(data: dict) -> dict:
    REQUIRED_KEYS = {
        "risk_level",
        "issue",
        "explanation",
        "suggested_rewrite",
    }

    # 1. Must be dict
    if not isinstance(data, dict):
        raise ValueError("LLM output is not a JSON object")

    # 2. Keys must match exactly
    if set(data.keys()) != REQUIRED_KEYS:
        raise ValueError(f"Invalid keys: {data.keys()}")

    # 3. risk_level validation
    risk = data.get("risk_level")
    if not isinstance(risk, str) or risk not in {"LOW", "MEDIUM", "HIGH"}:
        raise ValueError(f"Invalid risk_level: {risk}")

    # 4. All other fields must be non-empty strings
    for field in ["issue", "explanation", "suggested_rewrite"]:
        value = data.get(field)
        if not isinstance(value, str) or not value.strip():
            raise ValueError(f"Invalid field: {field}")

    return data

def safe_fallback(clause_text: str) -> dict:
    return {
        "risk_level": "MEDIUM",
        "issue": "Risk could not be reliably determined.",
        "explanation": "The clause analysis could not be completed due to formatting inconsistencies.",
        "suggested_rewrite": clause_text.strip()
    }

def analyze_clause_risk(text):
    prompt = MASTER_PROMPT + "\n\nClause:\n" + text

    try:
        response = model.generate_content(prompt)
        raw = response.text.strip()
        cleaned = raw.replace("```json", "").replace("```", "").strip()

        data = json.loads(cleaned)
        return validate_llm_output(data)

    except Exception:
        # 🔁 REPAIR ATTEMPT
        try:
            repair_prompt = REPAIR_PROMPT + "\n" + raw
            repair_response = model.generate_content(repair_prompt)
            repaired_raw = repair_response.text.strip()
            repaired_clean = repaired_raw.replace("```json", "").replace("```", "").strip()

            repaired_data = json.loads(repaired_clean)
            return validate_llm_output(repaired_data)

        except Exception:
            # 🛟 FINAL GUARANTEED SAFE OUTPUT
            return safe_fallback(text)
