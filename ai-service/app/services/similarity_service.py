import math
import numpy as np


def cosine_similarity(vec_a: list[float], vec_b: list[float]) -> float:
    """Calculate cosine similarity between two vectors (returns 0.0 to 1.0)."""
    if not vec_a or not vec_b:
        return 0.0
    a = np.array(vec_a, dtype=np.float32)
    b = np.array(vec_b, dtype=np.float32)

    norm_a = np.linalg.norm(a)
    norm_b = np.linalg.norm(b)

    if norm_a == 0 or norm_b == 0:
        return 0.0

    sim = float(np.dot(a, b) / (norm_a * norm_b))
    return max(0.0, min(1.0, sim))


def haversine_distance_km(coord1: list[float], coord2: list[float]) -> float:
    """Calculate distance in kilometers between [lon1, lat1] and [lon2, lat2]."""
    if not coord1 or not coord2 or len(coord1) < 2 or len(coord2) < 2:
        return float("inf")

    lon1, lat1 = coord1[0], coord1[1]
    lon2, lat2 = coord2[0], coord2[1]

    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)

    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(dlon / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 2)


def calculate_location_score(
    coord1: list[float], coord2: list[float], radius_km: float = 10.0, is_online: bool = False
) -> float:
    """Returns location compatibility score between 0.0 and 100.0."""
    if is_online:
        return 100.0
    if not coord1 or not coord2:
        return 50.0

    dist = haversine_distance_km(coord1, coord2)
    if dist <= radius_km:
        return round(100.0 - (dist / radius_km) * 30.0, 1)
    elif dist <= radius_km * 2:
        return round(max(30.0, 70.0 - ((dist - radius_km) / radius_km) * 40.0), 1)
    else:
        return round(max(10.0, 30.0 - (dist / (radius_km * 5)) * 20.0), 1)
