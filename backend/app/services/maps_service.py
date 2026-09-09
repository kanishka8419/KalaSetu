"""
Maps / Geolocation service — mock implementation.
Uses static coordinates for Indian craft regions in mock mode.
"""

import math
import random
from typing import Optional

INDIAN_CRAFT_REGIONS = [
    {"name": "Jaipur, Rajasthan", "lat": 26.9124, "lng": 75.7873, "specialties": ["pottery", "textiles", "jewelry"]},
    {"name": "Varanasi, Uttar Pradesh", "lat": 25.3176, "lng": 82.9739, "specialties": ["textiles", "metalwork"]},
    {"name": "Moradabad, Uttar Pradesh", "lat": 28.8386, "lng": 78.7733, "specialties": ["metalwork", "brass"]},
    {"name": "Jodhpur, Rajasthan", "lat": 26.2389, "lng": 73.0243, "specialties": ["woodwork", "textiles", "leather"]},
    {"name": "Mysore, Karnataka", "lat": 12.2958, "lng": 76.6394, "specialties": ["painting", "woodwork", "silk"]},
    {"name": "Kutch, Gujarat", "lat": 23.7337, "lng": 69.8597, "specialties": ["textiles", "leather", "jewelry"]},
    {"name": "Kolkata, West Bengal", "lat": 22.5726, "lng": 88.3639, "specialties": ["pottery", "textiles", "metalwork"]},
    {"name": "Agra, Uttar Pradesh", "lat": 27.1767, "lng": 78.0081, "specialties": ["stone_carving", "leather", "jewelry"]},
    {"name": "Imphal, Manipur", "lat": 24.8170, "lng": 93.9368, "specialties": ["bamboo_craft", "textiles"]},
    {"name": "Thanjavur, Tamil Nadu", "lat": 10.7870, "lng": 79.1378, "specialties": ["painting", "metalwork", "jewelry"]},
]


class MapsService:
    """
    Geolocation service for artisan location and proximity search.
    """

    async def geocode(self, address: str) -> Optional[dict]:
        """Convert address to lat/lng. Mock returns a random Indian craft region."""
        region = random.choice(INDIAN_CRAFT_REGIONS)
        return {
            "lat": region["lat"] + random.uniform(-0.1, 0.1),
            "lng": region["lng"] + random.uniform(-0.1, 0.1),
            "formatted_address": region["name"],
        }

    def calculate_distance(self, lat1: float, lng1: float, lat2: float, lng2: float) -> float:
        """Calculate distance between two points in km (Haversine formula)."""
        R = 6371  # Earth's radius in km
        dlat = math.radians(lat2 - lat1)
        dlng = math.radians(lng2 - lng1)
        a = (
            math.sin(dlat / 2) ** 2 +
            math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
            math.sin(dlng / 2) ** 2
        )
        c = 2 * math.asin(math.sqrt(a))
        return R * c

    async def find_nearby_regions(
        self, lat: float, lng: float, radius_km: float = 100
    ) -> list[dict]:
        """Find craft regions within radius of given coordinates."""
        nearby = []
        for region in INDIAN_CRAFT_REGIONS:
            dist = self.calculate_distance(lat, lng, region["lat"], region["lng"])
            if dist <= radius_km:
                nearby.append({**region, "distance_km": round(dist, 1)})
        nearby.sort(key=lambda x: x["distance_km"])
        return nearby


maps_service = MapsService()
