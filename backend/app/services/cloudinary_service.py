import os
import uuid
import re
from typing import Optional
from PIL import Image
import io
from app.config import settings

UPLOADS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "uploads")
os.makedirs(UPLOADS_DIR, exist_ok=True)


class CloudinaryService:
    """
    Image upload and CDN service.
    Saves locally to uploads/ when Cloudinary is not configured. Real integrates with Cloudinary SDK.
    """

    async def upload_image(
        self,
        file_data: bytes,
        filename: str,
        folder: str = "products",
    ) -> dict:
        """Upload an image and return CDN or local static URLs."""
        if not settings.USE_MOCK_CLOUDINARY and settings.CLOUDINARY_CLOUD_NAME:
            return await self._real_upload(file_data, filename, folder)
        return self._local_save(file_data, filename, folder)

    def _local_save(self, file_data: bytes, filename: str, folder: str) -> dict:
        """Save actual uploaded image file to local uploads directory."""
        ext = os.path.splitext(filename)[1].lower()
        if not ext or ext not in [".jpg", ".jpeg", ".png", ".webp", ".gif"]:
            ext = ".jpg"

        safe_name = re.sub(r'[^a-zA-Z0-9_\-]', '_', os.path.splitext(filename)[0])
        unique_name = f"{folder}_{safe_name}_{uuid.uuid4().hex[:8]}{ext}"
        filepath = os.path.join(UPLOADS_DIR, unique_name)

        with open(filepath, "wb") as f:
            f.write(file_data)

        # Inspect dimensions with PIL
        width, height = 800, 800
        try:
            with Image.open(io.BytesIO(file_data)) as img:
                width, height = img.size
        except Exception:
            pass

        # Return local static URL
        url_path = f"http://localhost:8000/uploads/{unique_name}"

        return {
            "public_id": f"{folder}/{unique_name}",
            "url": url_path,
            "secure_url": url_path,
            "thumbnail_url": url_path,
            "width": width,
            "height": height,
            "format": ext.replace(".", ""),
            "original_filename": filename,
        }

    async def _real_upload(self, file_data: bytes, filename: str, folder: str) -> dict:
        """Real Cloudinary upload — requires SDK configuration."""
        try:
            import cloudinary
            import cloudinary.uploader

            cloudinary.config(
                cloud_name=settings.CLOUDINARY_CLOUD_NAME,
                api_key=settings.CLOUDINARY_API_KEY,
                api_secret=settings.CLOUDINARY_API_SECRET,
            )

            result = cloudinary.uploader.upload(
                file_data,
                folder=folder,
                resource_type="image",
                transformation=[
                    {"quality": "auto", "fetch_format": "auto"},
                ],
            )

            return {
                "public_id": result["public_id"],
                "url": result["url"],
                "secure_url": result["secure_url"],
                "thumbnail_url": result["secure_url"].replace("/upload/", "/upload/c_thumb,w_300,h_300/"),
                "width": result.get("width", 800),
                "height": result.get("height", 800),
                "format": result.get("format", "jpg"),
                "original_filename": filename,
            }
        except Exception:
            # Fallback to local file save on error
            return self._local_save(file_data, filename, folder)


cloudinary_service = CloudinaryService()

