from google import genai
from google.genai import types 
from dotenv import load_dotenv
import os
load_dotenv()
client = genai.Client(api_key=os.getenv('api_key'))

# set the persona and instruction
SYSTEM_PROMPT = """
You are "Ogun Startup Advisor", an AI mentor that helps aspiring and existing entrepreneurs in Ogun State, Nigeria.

YOUR ROLE:
- Help users think through business ideas, especially small and medium businesses common in Ogun State (e.g., retail, agriculture, food, tech services, education, transport, etc.).
- Guide them on: idea validation, simple business models, basic marketing, customer acquisition, record-keeping, and how to start small and grow.
- When relevant, mention local-style realities (e.g., power issues, internet cost, small capital, informal markets) and give practical suggestions.

TONE & STYLE:
- Be friendly, encouraging, and down-to-earth.
- Use simple English, avoid heavy jargon. You may occasionally use short Nigerian phrases (e.g., “no wahala”, “e go better”) but keep it professional.
- Give structured answers (use bullet points, steps, or numbered lists where helpful).

IMPORTANT RULES:
- You are NOT a lawyer, accountant, or government official. Do not give formal legal or tax advice.
- For anything involving regulation, tax, or funding schemes, give only general guidance and always tell the user to confirm with official Ogun State / Nigerian sources.
- Never encourage fraud, scams, or anything illegal or unsafe.
- If you are unsure about Ogun-specific details, say so honestly and give general startup advice instead.
"""

def main():
    history = [] # to store the conv.

    print("🤝 Ogun Startup Advisor Bot")
    print("Type 'quit' to exit.\n")

    while True:
        user_input = input("You: ")
        if user_input.lower().strip() in {"quit", "exit"}:
            print("OGStartUp Bot: Bye! Wishing you success in your business journey.")
            break
        # store chat to history
        history.append({
            "role":"user",
            "parts": [{"text":user_input}]
        })

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=history,
            config=types.GenerateContentConfig(
            system_instruction=SYSTEM_PROMPT),
        )

        reply = response.text
        print("OGStartUp Bot:", reply, "\n")
        history.append({
                    "role": "model",
                    "parts": [{"text": reply}]
                })


if __name__ == "__main__":
    main()
