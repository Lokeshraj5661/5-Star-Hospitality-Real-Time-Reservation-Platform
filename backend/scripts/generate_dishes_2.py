"""Generate additional hyper-realistic food assets — biryanis, desserts, curries, salads, ice creams, drinks."""
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

STYLE = (
    "Hyper-realistic photographic 3D render, fine-dining 5-star hotel food photography. "
    "Dramatic warm evening lantern lighting on a polished dark mahogany surface, shallow depth of field. "
    "Brushed gold accents, deep charcoal background, soft volumetric studio lighting with subtle rim light. "
    "Square 1:1 composition, centered hero subject, glossy steam where appropriate, "
    "no text, no watermarks, no hands, photorealistic textures. Cinematic, editorial quality."
)

DISHES = [
    ("veg_biryani",
     "Premium Hyderabadi vegetable dum biryani — intricately layered long-grain basmati rice with rich saffron-yellow streaks, "
     "scattered with deep-caramelised crispy fried onions (birista), green peas, carrot dice, paneer cubes, mint leaves and whole spices "
     "(cinnamon stick, cardamom pods, star anise). Served in a polished brushed-gold copper handi vessel with a soft volumetric steam rising. "),
    ("egg_biryani",
     "Luxurious egg dum biryani — fluffy long-grain basmati layered with saffron and dark caramelised onions, "
     "topped with two glistening halved boiled eggs showing creamy yolks and golden masala coating, mint and coriander garnish. "
     "Plated in a brushed brass handi on a dark mahogany surface with soft steam. "),
    ("gulab_jamun",
     "Three rich dark-amber gulab jamun spheres soaking in glossy high-specularity sugar syrup, "
     "garnished with slivered pistachios, saffron threads and edible silver leaf. Served in a small brushed-gold bowl on a dark slate. "),
    ("rasgulla",
     "Spongy snow-white chhena rasgulla spheres in clear glossy sugar syrup, subsurface scattering visible through the cheese, "
     "garnished with crushed pistachios and a single rose petal. Served in a brushed-gold rim white porcelain bowl on dark slate. "),
    ("paneer_butter_masala",
     "Rich creamy paneer butter masala with deep red-orange tomato gravy glistening in warm light, "
     "soft cubes of paneer floating, swirl of cream on top, scattered fenugreek leaves and a knob of butter melting. "
     "Served in a polished brushed-brass karahi bowl with naan triangles to the side. "),
    ("veg_kurma",
     "Mixed vegetable kurma in pale-golden creamy coconut gravy, soft chunks of carrot, beans, peas, cauliflower and potato visible, "
     "garnished with coriander and a curry-leaf tempering. Served in a brushed-brass katori on a dark mahogany surface. "),
    ("green_salad",
     "Fresh crisp green salad — cucumber discs with moisture beads, vibrant red tomato slices, julienne carrot, "
     "rings of red onion, lemon wedge and mint sprig. Arranged architecturally on a brushed-gold rim dark plate. "
     "Glistening surface, condensation droplets, garden-fresh aesthetic. "),
    ("fruit_salad",
     "Premium mixed fruit salad — cubed mango, pineapple, watermelon, kiwi, pomegranate seeds and seedless grapes, "
     "glistening with light syrup and mint chiffonade, served in a frosted crystal goblet on a brushed-gold coaster. "
     "Subsurface scattering through fruit flesh, condensation on glass. "),
    ("vanilla_ice_cream",
     "Two pristine scoops of premium vanilla bean ice cream with visible vanilla bean specks, served in a frosted crystal cup, "
     "subtle melting droplets tracking down the sides, drizzle of caramel and a tuile cookie garnish. "
     "Cold mist around the cup, brushed-gold spoon beside. "),
    ("mango_ice_cream",
     "Two vibrant orange-yellow mango ice cream scoops with visible fruit-flesh micro-texture, in a frosted crystal cup "
     "with mango chunks, mint sprig and a drizzle of mango coulis. Subtle melt droplets, cold mist, brushed-gold spoon. "),
    ("soft_drink",
     "Premium chilled cola soft drink in a faceted crystal glass with crystal-clear ice cubes, glossy condensation droplets on glass, "
     "vibrant amber liquid with rising effervescent bubbles, lime wedge on rim and an elegant brushed-gold stirrer. "
     "On a polished mahogany surface with warm bokeh background. "),
    ("badam_milk",
     "Traditional saffron badam milk in a tall brushed-gold tumbler — creamy pale-yellow with visible flecks of saffron strands, "
     "slivered almonds and crushed pistachios floating on top, gentle steam rising. Served on a brushed-brass coaster on dark mahogany. "),
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
        print(f"[FAIL] {name}: no images")
        return False
    image_bytes = base64.b64decode(images[0]["data"])
    out = OUT_DIR / f"{name}.png"
    out.write_bytes(image_bytes)
    print(f"[OK]   {name} -> {out} ({len(image_bytes)} bytes)")
    return True


async def main():
    requested = set(sys.argv[1:]) if len(sys.argv) > 1 else None
    # Run sequentially to avoid per-session budget caps
    ok = 0
    total = 0
    for name, prompt in DISHES:
        if requested and name not in requested:
            continue
        total += 1
        result = await generate_one(name, prompt)
        if result:
            ok += 1
    print(f"\nDone: {ok}/{total} succeeded.")


if __name__ == "__main__":
    asyncio.run(main())
