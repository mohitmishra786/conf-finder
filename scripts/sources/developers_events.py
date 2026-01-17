"""
Fetch CFPs from developers.events API

This is the PRIMARY source with 1000+ CFPs, well-structured JSON.
URL: https://developers.events/all-cfps.json
"""

import requests
from datetime import datetime
from typing import Optional


def fetch() -> list[dict]:
    """Fetch all CFPs from developers.events API."""
    url = "https://developers.events/all-cfps.json"
    
    try:
        response = requests.get(url, timeout=30)
        response.raise_for_status()
        data = response.json()
    except Exception as e:
        print(f"[developers_events] Error fetching: {e}")
        return []
    
    conferences = []
    for item in data:
        conf = item.get("conf", {})
        if not conf.get("name"):
            continue
        
        # Parse dates
        dates = conf.get("date", [])
        start_date = _timestamp_to_date(dates[0]) if dates else None
        end_date = _timestamp_to_date(dates[-1]) if len(dates) > 1 else start_date
        
        # Parse CFP deadline
        cfp_end_date = _timestamp_to_date(item.get("untilDate"))
        cfp_url = item.get("link", "")
        
        # Determine if online
        location = conf.get("location", "")
        is_online = "online" in location.lower()
        
        # Extract country from location
        city, country = _parse_location(location)
        
        conference = {
            "name": conf.get("name", "").strip(),
            "url": conf.get("hyperlink", ""),
            "startDate": start_date,
            "endDate": end_date,
            "location": {
                "city": city,
                "country": country,
                "raw": location,
            },
            "online": is_online,
            "cfp": {
                "url": cfp_url,
                "endDate": cfp_end_date,
            } if cfp_url else None,
            "source": "developers.events",
        }
        
        conferences.append(conference)
    
    print(f"[developers_events] Fetched {len(conferences)} conferences")
    return conferences


def _timestamp_to_date(ts: Optional[int]) -> Optional[str]:
    """Convert Unix timestamp (ms) to ISO date string."""
    if not ts:
        return None
    try:
        dt = datetime.utcfromtimestamp(ts / 1000)
        return dt.strftime("%Y-%m-%d")
    except:
        return None


def _parse_location(raw: str) -> tuple[str, str]:
    """Extract city and country from location string like 'Paris (France)'."""
    if not raw:
        return "", ""
    
    # Handle "Online" case
    if raw.lower().strip() == "online":
        return "Online", ""
    
    # Try to parse "City (Country)" format
    import re
    match = re.match(r"^(.+?)\s*\(([^)]+)\)\s*$", raw)
    if match:
        city = match.group(1).strip()
        country = match.group(2).strip()
        return city, country
    
    # Try "City, Country" format
    parts = raw.rsplit(",", 1)
    if len(parts) == 2:
        return parts[0].strip(), parts[1].strip()
    
    return raw.strip(), ""


if __name__ == "__main__":
    confs = fetch()
    print(f"Total: {len(confs)}")
    if confs:
        print(f"Sample: {confs[0]}")
