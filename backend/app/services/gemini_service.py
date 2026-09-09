"""
Gemini generative AI service — mock implementation.
In production, swap for real Gemini API calls via config flag.
"""

import random
from typing import Optional


TITLE_TEMPLATES = {
    "pottery": [
        "Hand-thrown {material} {subcategory} with {style} finish",
        "Artisan {material} {subcategory} - {color} glaze collection",
        "Traditional {style} {material} {subcategory} by master potter",
    ],
    "textiles": [
        "Handwoven {material} {subcategory} with {style} pattern",
        "Heritage {material} {subcategory} - {color} {style} design",
        "Artisan-crafted {material} {subcategory} in {color} hues",
    ],
    "jewelry": [
        "Hand-crafted {material} {subcategory} with {style} motifs",
        "Artisan {material} {subcategory} - {color} gemstone accent",
        "Traditional {style} {material} {subcategory}",
    ],
    "woodwork": [
        "Hand-carved {material} {subcategory} with {style} design",
        "Artisan {material} {subcategory} - natural {color} finish",
        "Heritage {style} {material} {subcategory}",
    ],
    "metalwork": [
        "Hand-forged {material} {subcategory} with {style} detailing",
        "Artisan {material} {subcategory} - antique {color} patina",
        "Traditional {style} {material} {subcategory}",
    ],
    "bamboo_craft": [
        "Handwoven {material} {subcategory} with {style} weave",
        "Artisan {material} {subcategory} - natural {color} tone",
        "Eco-friendly {style} {material} {subcategory}",
    ],
    "leather": [
        "Handcrafted {material} {subcategory} with {style} finish",
        "Artisan {material} {subcategory} - {color} leather collection",
        "Heritage {style} {material} {subcategory}",
    ],
    "painting": [
        "Authentic Hand-Painted {subcategory} with {style} motif",
        "Traditional {material} {subcategory} - {color} palette",
        "Heritage Masterpiece {subcategory} on {material}",
    ],
    "glass": [
        "Hand-Blown {material} {subcategory} with {style} patterns",
        "Artisan {material} {subcategory} - {color} glass collection",
        "Decorative {style} {material} {subcategory}",
    ],
    "stone_carving": [
        "Hand-Carved {material} {subcategory} with {style} inlay",
        "Artisan {material} {subcategory} - {color} stone finish",
        "Heritage {style} {material} {subcategory}",
    ],
}

DESCRIPTION_FRAGMENTS = [
    "Crafted with generations of expertise, this piece showcases the meticulous artistry of Indian handcraft traditions.",
    "Each piece is individually made by skilled artisans, ensuring no two items are exactly alike.",
    "This exquisite creation brings together time-honored techniques with contemporary aesthetic sensibilities.",
    "Sourced from sustainable materials and shaped by experienced hands, this piece tells a story of cultural heritage.",
    "The attention to detail in every curve and texture reflects hours of patient, skilled craftsmanship.",
    "A stunning fusion of traditional methods and modern design, perfect for the discerning collector.",
    "This piece celebrates the rich heritage of Indian artisanship, carrying forward techniques perfected over centuries.",
]


class GeminiService:
    """
    Generative AI service for product catalogue generation.
    Mock implementation generates realistic craft product descriptions.
    """

    async def generate_catalogue(
        self,
        cv_analysis: dict,
        artisan_keywords: Optional[str] = None,
    ) -> dict:
        """
        Generate a full product catalogue entry from CV analysis and artisan input.
        Returns: title, descriptions, tags, SEO meta, price reasoning.
        """
        category = cv_analysis.get("category", "pottery")
        subcategory = cv_analysis.get("subcategory", "item")
        materials = cv_analysis.get("materials", ["handcrafted material"])
        colors = cv_analysis.get("colors", ["natural"])
        styles = cv_analysis.get("style_tags", ["artisanal"])

        kw_text = (artisan_keywords or "").strip()

        # Generate custom title matching keywords if provided, else use template
        if kw_text and len(kw_text) > 2:
            kw_clean = kw_text.title()
            if any(s.lower() in kw_clean.lower() for s in [subcategory, category, materials[0]]):
                title = f"Handcrafted {kw_clean}"
            else:
                title = f"Handcrafted {materials[0].title()} {subcategory.title()} - {kw_clean}"
        else:
            templates = TITLE_TEMPLATES.get(category, TITLE_TEMPLATES["pottery"])
            title = random.choice(templates).format(
                material=materials[0],
                subcategory=subcategory,
                style=styles[0],
                color=colors[0],
            ).title()

        # Generate long description
        intro = random.choice(DESCRIPTION_FRAGMENTS)
        materials_text = ", ".join(materials[:-1]) + f" and {materials[-1]}" if len(materials) > 1 else materials[0]
        colors_text = ", ".join(colors)
        
        # Format singular subcategory for description prose
        sub_sing = subcategory[:-1] if (subcategory.endswith("s") and not subcategory.endswith("ss") and subcategory not in ["wall art", "tableware"]) else subcategory

        description_parts = [
            intro,
            f"This authentic {sub_sing} is handcrafted from premium {materials_text}, showcasing a distinct {styles[0]} design accented by {colors_text} tones. "
            f"Rooted in traditional Indian {category} craftsmanship, each piece undergoes an intricate creation process.",
        ]

        if kw_text:
            description_parts.append(f"Artisan Specialization & Details: {kw_text}")

        description_parts.append(
            f"Perfect as a statement piece for your collection or home decor, while directly supporting indigenous artisans and sustainable craft traditions."
        )

        description = "\n\n".join(description_parts)

        # Short description
        short_desc = (
            f"Authentic handcrafted {materials[0]} {subcategory} featuring a {styles[0]} design in {colors_text} tones. "
            f"Made by skilled artisans using traditional {category} techniques."
        )

        # SEO meta description
        seo_meta = (
            f"Buy authentic handcrafted {materials[0]} {subcategory} online. "
            f"Traditional {category} craft with {styles[0]} design. "
            f"Supports verified Indian artisans."
        )

        # Tags
        kw_tags = [w.strip() for w in kw_text.split() if len(w.strip()) > 2] if kw_text else []
        tags = list(dict.fromkeys(
            materials + styles + colors + kw_tags +
            [category, subcategory, "handmade", "artisan", "handcrafted", "Indian craft", "eco-friendly"]
        ))

        # Price estimation (based on category and material)
        base_prices = {
            "pottery": (400, 3000), "textiles": (500, 8000),
            "jewelry": (300, 15000), "woodwork": (800, 12000),
            "metalwork": (600, 10000), "leather": (500, 6000),
            "painting": (1000, 20000), "glass": (400, 5000),
            "stone_carving": (500, 15000), "bamboo_craft": (200, 3000),
        }
        price_range = base_prices.get(category, (500, 5000))
        suggested_min = round(random.uniform(price_range[0], price_range[0] * 1.8), -1)
        suggested_max = round(random.uniform(suggested_min * 1.4, price_range[1]), -1)
        suggested_price = round((suggested_min + suggested_max) / 2, -1)

        price_rationale = (
            f"Based on similar {styles[0]} {materials[0]} {subcategory} in the marketplace, "
            f"considering material cost ({materials[0]}), craftsmanship complexity, "
            f"and regional artisan pricing."
        )

        return {
            "title": title,
            "description": description,
            "short_description": short_desc,
            "seo_meta_description": seo_meta,
            "tags": tags,
            "category": category,
            "subcategory": subcategory,
            "suggested_price_min": suggested_min,
            "suggested_price_max": suggested_max,
            "suggested_price": suggested_price,
            "price_rationale": price_rationale,
        }

    async def regenerate_field(
        self,
        field: str,
        current_data: dict,
        context: Optional[str] = None,
    ) -> str:
        """Regenerate a specific field with fresh AI content."""
        if field == "title":
            category = current_data.get("category", "pottery")
            templates = TITLE_TEMPLATES.get(category, TITLE_TEMPLATES["pottery"])
            return random.choice(templates).format(
                material=current_data.get("materials", ["artisan"])[0] if isinstance(current_data.get("materials"), list) else "artisan",
                subcategory=current_data.get("subcategory", "creation"),
                style=current_data.get("styles", ["handcrafted"])[0] if isinstance(current_data.get("styles"), list) else "handcrafted",
                color=current_data.get("colors", ["natural"])[0] if isinstance(current_data.get("colors"), list) else "natural",
            ).title()
        elif field == "description":
            return random.choice(DESCRIPTION_FRAGMENTS) + f"\n\n{current_data.get('description', '')[:200]}"
        elif field == "tags":
            return str(current_data.get("tags", []) + ["premium", "exclusive", "limited-edition"])
        else:
            return f"Regenerated {field} content"


gemini_service = GeminiService()
