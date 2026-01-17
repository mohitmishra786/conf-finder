"""
Geocoder Module

Convert location strings to lat/lng coordinates for world map.
Uses a static mapping for common cities to avoid API dependencies.
"""

from typing import Optional, Tuple

# Static city coordinates (expand as needed)
CITY_COORDS = {
    # Europe
    "paris": (48.8566, 2.3522),
    "london": (51.5074, -0.1278),
    "berlin": (52.5200, 13.4050),
    "amsterdam": (52.3676, 4.9041),
    "barcelona": (41.3851, 2.1734),
    "madrid": (40.4168, -3.7038),
    "lisbon": (38.7223, -9.1393),
    "vienna": (48.2082, 16.3738),
    "zurich": (47.3769, 8.5417),
    "geneva": (46.2044, 6.1432),
    "brussels": (50.8503, 4.3517),
    "copenhagen": (55.6761, 12.5683),
    "stockholm": (59.3293, 18.0686),
    "oslo": (59.9139, 10.7522),
    "helsinki": (60.1699, 24.9384),
    "prague": (50.0755, 14.4378),
    "warsaw": (52.2297, 21.0122),
    "dublin": (53.3498, -6.2603),
    "milan": (45.4642, 9.1900),
    "rome": (41.9028, 12.4964),
    "munich": (48.1351, 11.5820),
    "lyon": (45.7640, 4.8357),
    "toulouse": (43.6047, 1.4442),
    "grenoble": (45.1885, 5.7245),
    "nantes": (47.2184, -1.5536),
    "bordeaux": (44.8378, -0.5792),
    "sofia": (42.6977, 23.3219),
    "athens": (37.9838, 23.7275),
    "krakow": (50.0647, 19.9450),
    
    # North America
    "san francisco": (37.7749, -122.4194),
    "new york": (40.7128, -74.0060),
    "los angeles": (34.0522, -118.2437),
    "seattle": (47.6062, -122.3321),
    "austin": (30.2672, -97.7431),
    "chicago": (41.8781, -87.6298),
    "boston": (42.3601, -71.0589),
    "denver": (39.7392, -104.9903),
    "las vegas": (36.1699, -115.1398),
    "portland": (45.5051, -122.6750),
    "toronto": (43.6532, -79.3832),
    "montreal": (45.5017, -73.5673),
    "vancouver": (49.2827, -123.1207),
    
    # Asia Pacific
    "tokyo": (35.6762, 139.6503),
    "singapore": (1.3521, 103.8198),
    "bangalore": (12.9716, 77.5946),
    "mumbai": (19.0760, 72.8777),
    "delhi": (28.7041, 77.1025),
    "sydney": (33.8688, 151.2093),
    "melbourne": (-37.8136, 144.9631),
    "seoul": (37.5665, 126.9780),
    "shanghai": (31.2304, 121.4737),
    "hong kong": (22.3193, 114.1694),
    "bangkok": (13.7563, 100.5018),
    "jakarta": (-6.2088, 106.8456),
    
    # South America
    "sao paulo": (-23.5505, -46.6333),
    "buenos aires": (-34.6037, -58.3816),
    "santiago": (-33.4489, -70.6693),
    
    # Africa
    "cape town": (-33.9249, 18.4241),
    "lagos": (6.5244, 3.3792),
    "nairobi": (-1.2921, 36.8219),
    
    # Middle East
    "dubai": (25.2048, 55.2708),
    "tel aviv": (32.0853, 34.7818),
}

# Country center coordinates (fallback)
COUNTRY_COORDS = {
    "usa": (37.0902, -95.7129),
    "united states": (37.0902, -95.7129),
    "uk": (55.3781, -3.4360),
    "united kingdom": (55.3781, -3.4360),
    "germany": (51.1657, 10.4515),
    "france": (46.2276, 2.2137),
    "spain": (40.4637, -3.7492),
    "italy": (41.8719, 12.5674),
    "netherlands": (52.1326, 5.2913),
    "belgium": (50.5039, 4.4699),
    "switzerland": (46.8182, 8.2275),
    "austria": (47.5162, 14.5501),
    "poland": (51.9194, 19.1451),
    "sweden": (60.1282, 18.6435),
    "norway": (60.4720, 8.4689),
    "denmark": (56.2639, 9.5018),
    "finland": (61.9241, 25.7482),
    "canada": (56.1304, -106.3468),
    "australia": (-25.2744, 133.7751),
    "japan": (36.2048, 138.2529),
    "india": (20.5937, 78.9629),
    "singapore": (1.3521, 103.8198),
    "brazil": (-14.2350, -51.9253),
    "mexico": (23.6345, -102.5528),
}


def geocode(city: str, country: str) -> Optional[Tuple[float, float]]:
    """
    Get lat/lng coordinates for a location.
    
    Returns:
        (lat, lng) tuple or None if not found
    """
    city_lower = city.lower().strip() if city else ""
    country_lower = country.lower().strip() if country else ""
    
    # Try city first
    if city_lower in CITY_COORDS:
        return CITY_COORDS[city_lower]
    
    # Try partial city match
    for known_city, coords in CITY_COORDS.items():
        if known_city in city_lower or city_lower in known_city:
            return coords
    
    # Fall back to country
    if country_lower in COUNTRY_COORDS:
        return COUNTRY_COORDS[country_lower]
    
    # Try partial country match
    for known_country, coords in COUNTRY_COORDS.items():
        if known_country in country_lower:
            return coords
    
    return None


if __name__ == "__main__":
    # Test geocoding
    tests = [
        ("Paris", "France"),
        ("San Francisco, CA", "USA"),
        ("Grenoble", "France"),
        ("Unknown City", "Germany"),
        ("", "Japan"),
    ]
    
    for city, country in tests:
        coords = geocode(city, country)
        print(f"{city}, {country} -> {coords}")
