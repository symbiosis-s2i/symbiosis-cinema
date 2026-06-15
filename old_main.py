from openai import OpenAI

client = OpenAI()

SYSTEM_PROMPT = """
You are a senior direct-response creative strategist and short-form ad scriptwriter.

Your job is to write premium, high-conviction short-form video scripts for Antal AI, a private-money and fix-and-flip lending brand.

Brand rules:
- Tone: premium, calm, intelligent, modern, investor-focused
- Avoid hype, spam, cringe, bro-marketing, and exaggerated claims
- Write like a sharp founder-operator or elite creative strategist
- Keep language simple, direct, and persuasive
- Optimize for short-form video retention

When writing:
- Start with a strong hook
- Make the script easy to speak on camera
- Use clean line breaks
- Keep pacing tight
- If requested, produce multiple hook options first
- If requested, rewrite for stronger elegance, clarity, and rhythm
"""

USER_PROMPT = """
Write 3 short-form ad script options for Antal AI.

Offer:
Antal helps real estate investors get private money / fix-and-flip funding faster.

Audience:
Real estate investors, flippers, and borrowers who want speed, clarity, and confidence.

Goal:
Get them interested in trying the platform or learning more.

Style:
Luxury, editorial, fintech-adjacent, not loud, not cheesy.

Deliver:
- 5 hook options first
- then 3 full scripts
- each script should be 20-35 seconds
- include on-screen text suggestions
- include B-roll suggestions
"""

response = client.responses.create(
    model="gpt-5.5",
    input=[
        {
            "role": "system",
            "content": SYSTEM_PROMPT
        },
        {
            "role": "user",
            "content": USER_PROMPT
        }
    ]
)

print(response.output_text)