import google.generativeai as genai

genai.configure(api_key="AIzaSyA45PO22NOCDIgd4U02rEYAyrNARzYu-DE")  # <-- your key here

print("\nAvailable Gemini Models:\n")
for m in genai.list_models():
    print(" -", m.name)
