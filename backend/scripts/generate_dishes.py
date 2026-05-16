"""Generate hyper-realistic food assets for Lakshmi Venkateswara Fast Foods menu.
Saves PNG files to /app/frontend/public/dishes/.
"""

import asyncio
import base64
import os
import sys
import uuid
from pathlib import Path
from dotenv import load_dotenv
from emergentintegrations.llm.chat import LlmChat, UserMessage

load_dotenv("/app/backend/.env")
API_KEY = os.getenv("EMERGENT_LLM_KEY")
OUT_DIR = Path("/app/frontend/public/dishes")
OUT_DIR.mkdir(parents=True, exist_ok=True)

# Shared style preamble — luxury hotel food photography aesthetic
STYLE = (
    "Hyper-realistic photographic 3D render, fine-dining 5-star hotel food photography. "
    "Dramatic warm evening lantern lighting on a polished dark mahogany surface with shallow depth of field. "
    "Brushed gold accents, deep charcoal background, soft volumetric studio lighting with subtle rim light. "
    "Square 1:1 composition, centered hero subject, glossy steam where appropriate, "
    "no text, no watermarks, no human hands, photorealistic textures. Cinematic, editorial quality."
)

DISHES = [
    (
        "vada",
        "A perfect golden-brown crispy medu vada (Indian lentil donut) — a toroid (donut shape) with a clearly visible hole in the centre. "
        "Aerated cracked crust, fine micro-texture, visible flecks of black peppercorn, finely chopped green chilli, fresh curry leaves. "
        "Plated on a dark slate stone next to a tiny polished brushed-gold bowl filled with vibrant white textured coconut chutney garnished with red chilli oil. ",
    ),
    (
        "filter_coffee",
        "Traditional South Indian filter coffee in a polished brushed-brass tumbler set inside a brushed-brass dabarah (saucer). "
        "The tumbler holds dark coffee crowned with a thick rich pale-brown micro-foam (froth) with tiny popping air bubbles. "
        "A faint volumetric warm steam rises. Highly detailed metallic reflections on the brass, condensation droplets, ",
    ),
    (
        "gobi_manchurian",
        "Gourmet Indo-Chinese Gobi Manchurian — a stylised mound of crispy golden cauliflower florets tossed in a dark glossy translucent soy-chilli glaze with high specularity catching golden lantern light. "
        "Garnished with vibrant freshly sliced green spring onion (scallion) scattered dynamically across the top, a few red chilli flakes, sesame seeds. "
        "Served on a matte black ceramic plate. ",
    ),
    (
        "gobi_fried_rice",
        "Premium Indo-Chinese Gobi fried rice — a beautifully ring-moulded cylindrical presentation of long-grain aromatic basmati rice with light golden-brown wok-tossed hue. "
        "Each grain distinct. Interspersed with micro-diced orange carrots, bright green peas, and deeply sauced crispy pieces of dark glazed Gobi Manchurian embedded throughout. "
        "Garnish of spring onion. Served on a brushed-gold rimmed dark plate. ",
    ),
    (
        "egg_fried_rice",
        "Minimalist premium egg fried rice — wok-fried long-grain basmati rice with beautiful colour contrast. "
        "Ribbons of soft moist bright yellow scrambled egg folded elegantly throughout the rice grains. "
        "A delicate sheen of sesame oil, micro-flecks of white pepper and finely chopped spring onion green. "
        "Plated as a clean dome on a matte charcoal plate. ",
    ),
    (
        "egg_gobi_fried_rice",
        "Luxurious Indo-Chinese egg-and-gobi fried rice — dual texture, blending soft fluffy yellow scrambled egg ribbons with deeply caramelised crispy dark-glazed Gobi Manchurian florets distributed evenly through long-grain wok-tossed rice. "
        "Plated as an architectural pyramid on a black slate with subtle brushed-gold accents. Garnish of fresh spring onion. ",
    ),
    (
        "egg_noodles",
        "Hakka-style egg noodles — long slender perfectly separated noodles with a subtle moist sheen, twisting in a dynamic fluid 3D geometry. "
        "Tossed with elongated matchstick-cut purple cabbage, orange carrots, green bell peppers, and beautiful shreds of seasoned yellow scrambled egg. "
        "Plated in a deep matte black bowl, chopsticks resting on a brushed-gold rest. ",
    ),
    (
        "gobi_noodles",
        "Premium gobi noodles — long slender Hakka-style noodles intricately woven around deeply glazed savoury Gobi Manchurian florets in dark-crimson glossy sauce. "
        "Striking visual contrast between pale moist noodles and rich dark sauce of the cauliflower. "
        "Garnish of spring onion green and red chilli. Plated in a charcoal stone bowl with brushed-gold cutlery. ",
    ),
]


async def generate_one(name: str, body_prompt: str):
    prompt = f"{body_prompt}{STYLE}"
    chat = (
        LlmChat(api_key=API_KEY, session_id=f"lvff-{name}-{uuid.uuid4().hex[:6]}", system_message="You are a luxury food photographer.")
        .with_model("gemini", "gemini-3.1-flash-image-preview")
        .with_params(modalities=["image", "text"])
    )
    msg = UserMessage(text=prompt)
    try:
        _text, images = await chat.send_message_multimodal_response(msg)
    except Exception as e:
        print(f"[FAIL] {name}: {e}")
        return False
    if not images:
        print(f"[FAIL] {name}: no images returned")
        return False
    image_bytes = base64.b64decode(images[0]["data"])
    out = OUT_DIR / f"{name}.png"
    out.write_bytes(image_bytes)
    print(f"[OK]   {name} -> {out} ({len(image_bytes)} bytes)")
    return True


async def main():
    requested = set(sys.argv[1:]) if len(sys.argv) > 1 else None
    tasks = []
    for name, prompt in DISHES:
        if requested and name not in requested:
            continue
        tasks.append(generate_one(name, prompt))
    results = await asyncio.gather(*tasks)
    print(f"\nDone: {sum(results)}/{len(results)} succeeded.")


if __name__ == "__main__":
    asyncio.run(main())
