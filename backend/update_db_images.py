import asyncio
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

from app.database import async_session
from app.models.product import Product
from app.seed import SAMPLE_PRODUCTS
from sqlalchemy import select

async def update_images():
    async with async_session() as db:
        res = await db.execute(select(Product))
        products = res.scalars().all()
        print(f"Found {len(products)} products in database.")
        for i, p in enumerate(products):
            sample = SAMPLE_PRODUCTS[i % len(SAMPLE_PRODUCTS)]
            p.images = sample["images"]
            print(f"Updated product [{p.title[:30]}] -> {sample['images'][0]['url']}")
        await db.commit()
        print("Database product images successfully updated!")

if __name__ == "__main__":
    asyncio.run(update_images())
