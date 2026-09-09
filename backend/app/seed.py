"""
Seed script — populates the database with sample data for development.
Run: python -m app.seed
"""

import sys
import asyncio
import random

if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

from app.database import async_session, init_db
from app.models.user import User, UserRole
from app.models.artisan import Artisan
from app.models.product import Product, ProductStatus
from app.models.buyer import Buyer
from app.utils.security import hash_password
from app.utils.slug import generate_slug
from app.services.embedding_service import embedding_service
from app.services.maps_service import INDIAN_CRAFT_REGIONS

SAMPLE_PRODUCTS = [
    {
        "title": "Hand-Thrown Terracotta Bowl with Indigo Glaze",
        "description": "A stunning terracotta bowl hand-thrown on a traditional potter's wheel in Jaipur. The rich indigo glaze creates a mesmerizing depth that shifts in different lighting. Each piece bears the subtle marks of the potter's hands, making it truly one-of-a-kind. Perfect for serving, display, or as a thoughtful gift.",
        "short_description": "Handcrafted terracotta bowl with deep indigo glaze. Made by master potters in Jaipur.",
        "category": "pottery",
        "subcategory": "bowls",
        "tags": ["terracotta", "indigo", "handmade", "pottery", "bowl", "Jaipur", "artisan"],
        "price": 1250.0,
        "images": [
            {"url": "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80", "thumbnail": "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=300&q=80"}
        ],
    },
    {
        "title": "Handwoven Silk Banarasi Scarf — Saffron Gold",
        "description": "This exquisite Banarasi silk scarf is handwoven on traditional wooden looms in Varanasi, a craft perfected over centuries. The saffron gold threads shimmer against the fine silk base, creating a fabric that is both luxurious and lightweight. Each scarf takes approximately 3 days to weave.",
        "short_description": "Luxurious handwoven Banarasi silk scarf in saffron gold. Woven on traditional looms.",
        "category": "textiles",
        "subcategory": "scarves",
        "tags": ["silk", "Banarasi", "handwoven", "scarf", "saffron", "Varanasi", "traditional"],
        "price": 3500.0,
        "images": [
            {"url": "https://images.unsplash.com/photo-1606744837616-56c9a5c6a6eb?auto=format&fit=crop&w=800&q=80", "thumbnail": "https://images.unsplash.com/photo-1606744837616-56c9a5c6a6eb?auto=format&fit=crop&w=300&q=80"}
        ],
    },
    {
        "title": "Silver Filigree Jhumka Earrings — Tribal Motif",
        "description": "Intricate silver filigree jhumka earrings handcrafted by tribal artisans. The delicate wirework creates a stunning lace-like pattern inspired by traditional Rajasthani motifs. Lightweight yet eye-catching, these earrings are perfect for both everyday elegance and special occasions.",
        "short_description": "Handcrafted silver filigree jhumka earrings with tribal motifs. Lightweight and elegant.",
        "category": "jewelry",
        "subcategory": "earrings",
        "tags": ["silver", "filigree", "jhumka", "earrings", "tribal", "Rajasthani", "handcrafted"],
        "price": 2800.0,
        "images": [
            {"url": "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80", "thumbnail": "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=300&q=80"}
        ],
    },
    {
        "title": "Hand-Carved Sandalwood Elephant — Mysore Heritage",
        "description": "This magnificent sandalwood elephant is hand-carved by master woodworkers of Mysore, carrying forward a tradition that dates back to the Vijayanagara Empire. The naturally fragrant sandalwood is sourced sustainably and carved with extraordinary precision. The intricate details of the elephant's howdah and ornamental caparison showcase exceptional craftsmanship.",
        "short_description": "Hand-carved Mysore sandalwood elephant with intricate traditional detailing.",
        "category": "woodwork",
        "subcategory": "sculptures",
        "tags": ["sandalwood", "elephant", "Mysore", "hand-carved", "woodwork", "heritage", "sculpture"],
        "price": 8500.0,
        "images": [
            {"url": "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=80", "thumbnail": "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=300&q=80"}
        ],
    },
    {
        "title": "Brass Diya Lamp — Moradabad Artisan Collection",
        "description": "A beautiful brass diya lamp handcrafted in Moradabad, the 'Brass City' of India. This traditional oil lamp features hand-engraved floral patterns and a warm golden finish. Perfect for festivals, prayer rooms, or as a decorative accent piece. Each lamp is individually crafted and polished to a brilliant sheen.",
        "short_description": "Handcrafted brass diya lamp from Moradabad with engraved floral patterns.",
        "category": "metalwork",
        "subcategory": "lamps",
        "tags": ["brass", "diya", "lamp", "Moradabad", "handcrafted", "metalwork", "traditional"],
        "price": 1800.0,
        "images": [
            {"url": "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=800&q=80", "thumbnail": "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=300&q=80"}
        ],
    },
    {
        "title": "Kutchi Embroidered Leather Tote Bag",
        "description": "A stunning leather tote bag featuring traditional Kutchi mirror-work embroidery. Crafted from vegetable-tanned goat leather, this bag combines the rich textile heritage of Gujarat's Kutch region with practical, everyday functionality. The vibrant embroidery and tiny mirrors catch the light beautifully.",
        "short_description": "Vegetable-tanned leather tote with traditional Kutchi mirror-work embroidery.",
        "category": "leather",
        "subcategory": "bags",
        "tags": ["leather", "Kutch", "embroidered", "tote", "mirror-work", "Gujarat", "handmade"],
        "price": 4500.0,
        "images": [
            {"url": "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80", "thumbnail": "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=300&q=80"}
        ],
    },
    {
        "title": "Tanjore Painting — Lord Ganesha with Gold Foil",
        "description": "An authentic Tanjore painting of Lord Ganesha, created using traditional techniques passed down through generations in Thanjavur. Adorned with 22-karat gold foil, semi-precious stones, and natural dyes on a teakwood panel. The rich colors and golden embellishments create a piece of living heritage art.",
        "short_description": "Authentic Tanjore painting of Ganesha with 22K gold foil on teakwood panel.",
        "category": "painting",
        "subcategory": "wall art",
        "tags": ["Tanjore", "painting", "gold foil", "Ganesha", "Thanjavur", "traditional art", "heritage"],
        "price": 15000.0,
        "images": [
            {"url": "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80", "thumbnail": "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=300&q=80"}
        ],
    },
    {
        "title": "Hand-Blown Glass Vase — Firozabad Azure",
        "description": "A stunning hand-blown glass vase from Firozabad, India's glass capital. The azure blue swirls within the clear glass create a mesmerizing ocean-like effect. Each vase is individually blown and shaped, making every piece unique. The organic form and vibrant color make it a perfect centerpiece.",
        "short_description": "Hand-blown glass vase from Firozabad with swirling azure blue patterns.",
        "category": "glass",
        "subcategory": "vases",
        "tags": ["glass", "hand-blown", "Firozabad", "vase", "azure", "artisan", "centerpiece"],
        "price": 2200.0,
        "images": [
            {"url": "https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?auto=format&fit=crop&w=800&q=80", "thumbnail": "https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?auto=format&fit=crop&w=300&q=80"}
        ],
    },
    {
        "title": "Marble Inlay Coaster Set — Agra Pietra Dura",
        "description": "A set of four marble coasters featuring pietra dura inlay work, the same technique used in the Taj Mahal. Semi-precious stones — malachite, lapis lazuli, and cornelian — are precisely cut and inlaid into white Makrana marble. Each coaster is a miniature work of art that protects your surfaces in style.",
        "short_description": "Set of 4 Makrana marble coasters with semi-precious stone pietra dura inlay.",
        "category": "stone_carving",
        "subcategory": "tableware",
        "tags": ["marble", "pietra dura", "Agra", "coasters", "inlay", "semi-precious", "Taj Mahal"],
        "price": 3200.0,
        "images": [
            {"url": "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80", "thumbnail": "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=300&q=80"}
        ],
    },
    {
        "title": "Bamboo Weave Table Lamp — Manipur Craft",
        "description": "An elegant bamboo table lamp handwoven by artisans in Manipur's Imphal valley. The intricate weave pattern filters light into a warm, atmospheric glow. Made from sustainably harvested bamboo, this lamp represents the Northeast's rich tradition of bamboo craftsmanship. Includes LED-compatible fitting.",
        "short_description": "Handwoven bamboo table lamp from Manipur with intricate weave light patterns.",
        "category": "bamboo_craft",
        "subcategory": "lamps",
        "tags": ["bamboo", "lamp", "Manipur", "handwoven", "sustainable", "table lamp", "Northeast"],
        "price": 1600.0,
        "images": [
            {"url": "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80", "thumbnail": "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=300&q=80"}
        ],
    },
    {
        "title": "Block-Printed Cotton Cushion Covers — Indigo Set of 4",
        "description": "A set of four cotton cushion covers featuring traditional Rajasthani block printing in indigo. Each cover is hand-stamped using carved wooden blocks and dyed with natural indigo. The geometric and floral patterns complement both modern and traditional interiors.",
        "short_description": "Set of 4 hand block-printed cotton cushion covers in natural indigo dye.",
        "category": "textiles",
        "subcategory": "cushion covers",
        "tags": ["block print", "cotton", "indigo", "cushion covers", "Rajasthani", "natural dye", "set"],
        "price": 1800.0,
        "images": [
            {"url": "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=800&q=80", "thumbnail": "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=300&q=80"}
        ],
    },
    {
        "title": "Copper Hammered Water Bottle — Ayurvedic Health",
        "description": "A beautifully hammered copper water bottle crafted in Moradabad. The traditional hammered finish not only looks stunning but also increases the surface area for copper's natural purifying properties, valued in Ayurvedic tradition. Leak-proof design holds 1 litre.",
        "short_description": "Hammered copper water bottle from Moradabad. 1L capacity, leak-proof design.",
        "category": "metalwork",
        "subcategory": "utensils",
        "tags": ["copper", "water bottle", "hammered", "Ayurvedic", "Moradabad", "health", "handmade"],
        "price": 950.0,
        "images": [
            {"url": "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80", "thumbnail": "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=300&q=80"}
        ],
    },
    {
        "title": "Handmade Ceramic Mug — Minimalist Earthen",
        "description": "A minimalist ceramic mug hand-thrown and glazed in earthy tones. The organic form fits naturally in the hand, while the matte finish provides a contemporary aesthetic. Food-safe glaze, microwave and dishwasher friendly. Each mug has subtle variations that make it unique.",
        "short_description": "Hand-thrown ceramic mug with minimalist earthen glaze. Microwave and dishwasher safe.",
        "category": "pottery",
        "subcategory": "mugs",
        "tags": ["ceramic", "mug", "minimalist", "earthen", "handmade", "pottery", "contemporary"],
        "price": 650.0,
        "images": [
            {"url": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80", "thumbnail": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=300&q=80"}
        ],
    },
    {
        "title": "Tribal Brass Necklace — Dhokra Cire Perdue",
        "description": "A statement necklace created using the ancient Dhokra technique — cire perdue (lost wax) casting practiced by tribal artisans for over 4,000 years. The raw, organic aesthetic of Dhokra brass jewelry is both primal and sophisticated, making each piece a wearable artifact of human artistic heritage.",
        "short_description": "Tribal brass necklace made using ancient 4000-year-old Dhokra lost-wax casting.",
        "category": "jewelry",
        "subcategory": "necklaces",
        "tags": ["Dhokra", "brass", "necklace", "tribal", "lost wax", "ancient", "statement"],
        "price": 3200.0,
        "images": [
            {"url": "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80", "thumbnail": "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=300&q=80"}
        ],
    },
    {
        "title": "Rosewood Carved Jewelry Box — Floral Jali",
        "description": "An exquisite rosewood jewelry box featuring hand-carved jali (lattice) work in a floral pattern. The warm tones of Indian rosewood deepen with age, developing a rich patina. Velvet-lined interior with multiple compartments keeps precious jewelry organized and protected.",
        "short_description": "Hand-carved rosewood jewelry box with floral jali lattice work. Velvet-lined interior.",
        "category": "woodwork",
        "subcategory": "boxes",
        "tags": ["rosewood", "jewelry box", "jali", "hand-carved", "floral", "lattice", "woodcraft"],
        "price": 4800.0,
        "images": [
            {"url": "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=800&q=80", "thumbnail": "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=300&q=80"}
        ],
    },
]


async def seed_database():
    """Seed the database with sample data."""
    await init_db()

    async with async_session() as db:
        try:
            # Check if already seeded
            from sqlalchemy import select, func
            user_count = await db.execute(select(func.count()).select_from(User))
            if user_count.scalar() > 0:
                print("⚠️  Database already seeded. Skipping.")
                return

            print("🌱 Seeding database...")

            # Create admin
            admin = User(
                email="admin@kalasetu.com",
                password_hash=hash_password("admin123456"),
                full_name="KalaSetu Admin",
                role=UserRole.ADMIN,
            )
            db.add(admin)
            await db.flush()
            print("  ✅ Admin created: admin@kalasetu.com / admin123456")

            # Create artisans
            artisan_users = []
            artisan_profiles = []
            artisan_data = [
                ("Priya Sharma", "priya@kalasetu.com", "pottery", "Master potter from Jaipur with 15 years of experience in traditional Rajasthani pottery."),
                ("Ravi Kumar", "ravi@kalasetu.com", "textiles", "Third-generation weaver from Varanasi specializing in Banarasi silk."),
                ("Lakshmi Devi", "lakshmi@kalasetu.com", "jewelry", "Tribal jewelry artisan from Kutch, preserving ancient metalworking traditions."),
                ("Arun Nair", "arun@kalasetu.com", "woodwork", "Sandalwood carver from Mysore, trained in the Vijayanagara tradition."),
                ("Fatima Begum", "fatima@kalasetu.com", "metalwork", "Brass artisan from Moradabad carrying forward the city's 400-year legacy."),
            ]

            for i, (name, email, specialty, bio) in enumerate(artisan_data):
                region = INDIAN_CRAFT_REGIONS[i % len(INDIAN_CRAFT_REGIONS)]
                user = User(
                    email=email,
                    password_hash=hash_password("artisan123456"),
                    full_name=name,
                    role=UserRole.ARTISAN,
                )
                db.add(user)
                await db.flush()

                artisan = Artisan(
                    user_id=user.id,
                    bio=bio,
                    craft_specialty=specialty,
                    latitude=region["lat"],
                    longitude=region["lng"],
                    address=region["name"],
                    rating=round(random.uniform(4.0, 5.0), 1),
                    is_verified=True,
                )
                db.add(artisan)
                await db.flush()

                artisan_users.append(user)
                artisan_profiles.append(artisan)

            print(f"  ✅ {len(artisan_users)} artisans created (password: artisan123456)")

            # Create buyers
            buyer_data = [
                ("Amit Patel", "amit@buyer.com"),
                ("Sneha Reddy", "sneha@buyer.com"),
                ("Rahul Gupta", "rahul@buyer.com"),
            ]
            for name, email in buyer_data:
                user = User(
                    email=email,
                    password_hash=hash_password("buyer123456"),
                    full_name=name,
                    role=UserRole.BUYER,
                )
                db.add(user)
                await db.flush()

                buyer = Buyer(user_id=user.id)
                db.add(buyer)

            await db.flush()
            print(f"  ✅ {len(buyer_data)} buyers created (password: buyer123456)")

            # Create products
            for i, pdata in enumerate(SAMPLE_PRODUCTS):
                artisan = artisan_profiles[i % len(artisan_profiles)]
                slug = generate_slug(pdata["title"])

                product = Product(
                    artisan_id=artisan.id,
                    title=pdata["title"],
                    description=pdata["description"],
                    short_description=pdata["short_description"],
                    category=pdata["category"],
                    subcategory=pdata.get("subcategory"),
                    tags=pdata["tags"],
                    price=pdata["price"],
                    images=pdata["images"],
                    slug=slug,
                    status=ProductStatus.PUBLISHED,
                    seo_meta={
                        "title": pdata["title"],
                        "description": pdata["short_description"],
                    },
                    ai_generated_fields={
                        "title": True, "description": True,
                        "short_description": True, "tags": True,
                    },
                    ai_suggested_price_min=pdata["price"] * 0.8,
                    ai_suggested_price_max=pdata["price"] * 1.3,
                    view_count=random.randint(10, 500),
                    enquiry_count=random.randint(0, 20),
                )
                db.add(product)
                await db.flush()

                # Add to embedding index
                embed_text = f"{pdata['title']} {pdata['description']} {pdata['category']} {' '.join(pdata['tags'])}"
                embedding_service.add_to_index(product.id, embed_text)

            print(f"  ✅ {len(SAMPLE_PRODUCTS)} products seeded with embeddings")

            await db.commit()
            print("\n🎉 Database seeding complete!")
            print("   Admin: admin@kalasetu.com / admin123456")
            print("   Artisan: priya@kalasetu.com / artisan123456")
            print("   Buyer: amit@buyer.com / buyer123456")

        except Exception as e:
            await db.rollback()
            print(f"❌ Seeding failed: {e}")
            raise


if __name__ == "__main__":
    asyncio.run(seed_database())
