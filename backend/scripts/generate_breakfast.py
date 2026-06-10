"""Quick add: generate pongal + upma + idli images for completeness."""
import asyncio
import base64
import os
import uuid
from pathlib import Path
from dotenv import load_dotenv
from emergentintegrations.llm.chat import LlmChat, UserMessage

load_dotenv("/app/backend/.env")
API_KEY = os.getenv("EMERGENT_LLM_KEY")
OUT_DIR = Path("/app/frontend/public/dishes")

STYLE = (
    "Hyper-realistic photographic 3D render, fine-dining 5-star hotel food photography. "
    "Dramatic warm evening lantern lighting on a polished dark mahogany surface, shallow depth of field. "
    "Brushed gold accents, deep charcoal background, soft volumetric studio lighting. "
    "Square 1:1, centered hero subject, photorealistic textures. No text, no watermarks, no hands."
)

DISHES = [
    ("idli",
     "Three pristine fluffy white South Indian idli rice cakes stacked on a fresh green banana leaf, "
     "with three small brushed-gold bowls of chutneys (white coconut, red tomato-ginger, dark gunpowder podi) "
     "and a small brass dosakka of sambar with floating drumstick and curry leaf, soft steam rising. "),
    ("pongal",
     "Traditional South Indian ven pongal — golden creamy rice and moong dal porridge with visible whole black peppercorns, "
     "fried cashews, fresh ginger and curry leaves, glossy ghee pool on top, served in a small brushed-brass katori on dark slate, with sambar bowl alongside. "),
    ("upma",
     "Rava upma — fluffy roasted semolina mound flecked with mustard seed, urad dal, golden cashews, "
     "diced carrot, green peas, finely chopped onion and curry leaf, garnished with a wedge of lime and coriander. "
     "Served in a brushed-gold rim ceramic bowl on dark mahogany. "),
]

async def run_one(name, prompt):
    chat = (LlmChat(api_key=API_KEY, session_id=f"lvff-{name}-{uuid.uuid4().hex[:6]}",
                    system_message="You are a luxury food photographer.")
            .with_model("gemini", "gemini-3.1-flash-image-preview")
            .with_params(modalities=["image", "text"]))
    try:
        _t, images = await chat.send_message_multimodal_response(UserMessage(text=f"{prompt}{STYLE}"))
    except Exception as e:
        print(f"[FAIL] {name}: {e}")
        return
    if images:
        (OUT_DIR / f"{name}.png").write_bytes(base64.b64decode(images[0]["data"]))
        print(f"[OK] {name}")

async def main():
    for n, p in DISHES:
        await run_one(n, p)

if __name__ == "__main__":
    asyncio.run(main())
