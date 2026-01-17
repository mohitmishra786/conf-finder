"""
Fetch conferences from tech-conferences/conference-data GitHub repo

URL: https://github.com/tech-conferences/conference-data
Structure: /conferences/{year}/{topic}.json (e.g., javascript.json, python.json)
"""

import requests
from typing import List, Dict, Optional

# Base URL for raw GitHub content
GITHUB_BASE = "https://raw.githubusercontent.com/tech-conferences/conference-data/main/conferences"
GITHUB_API = "https://api.github.com/repos/tech-conferences/conference-data/contents/conferences"

YEARS = [2025, 2026]

# Map confs.tech topics to our domains
TOPIC_TO_DOMAIN: Dict[str, str] = {
    "javascript": "web",
    "typescript": "web",
    "css": "web",
    "php": "web",
    "ruby": "web",
    "python": "software",
    "java": "software",
    "dotnet": "software",
    "kotlin": "mobile",
    "ios": "mobile",
    "android": "mobile",
    "devops": "devops",
    "sre": "devops",
    "data": "data",
    "security": "security",
    "networking": "cloud",
    "iot": "cloud",
    "rust": "software",
    "cpp": "software",
    "golang": "software",
    "scala": "software",
    "cfml": "software",
    "performance": "software",
    "testing": "software",
    "api": "software",
    "accessibility": "web",
    "ux": "web",
    "product": "general",
    "leadership": "general",
    "tech-comm": "general",
    "opensource": "opensource",
    "general": "general",
    "identity": "security",
}


def fetch() -> List[Dict]:
    """Fetch all conferences from GitHub repo."""
    conferences: List[Dict] = []
    
    for year in YEARS:
        # Get list of files for this year
        api_url = f"{GITHUB_API}/{year}"
        try:
            resp = requests.get(api_url, timeout=10)
            if resp.status_code == 404:
                continue
            resp.raise_for_status()
            files = resp.json()
        except Exception as e:
            print(f"[tech_conferences] Error listing {year}: {e}")
            continue
        
        # Fetch each topic file
        for file_info in files:
            if not file_info.get("name", "").endswith(".json"):
                continue
            
            topic = file_info["name"].replace(".json", "")
            domain = TOPIC_TO_DOMAIN.get(topic, "general")
            
            try:
                data_url = file_info.get("download_url")
                if not data_url:
                    data_url = f"{GITHUB_BASE}/{year}/{file_info['name']}"
                
                data_resp = requests.get(data_url, timeout=10)
                data_resp.raise_for_status()
                items = data_resp.json()
            except Exception as e:
                print(f"[tech_conferences] Error fetching {year}/{topic}: {e}")
                continue
            
            for item in items:
                if not item.get("name"):
                    continue
                
                city = item.get("city", "")
                country = item.get("country", "")
                
                conf = {
                    "name": item.get("name", "").strip(),
                    "url": item.get("url", ""),
                    "startDate": item.get("startDate"),
                    "endDate": item.get("endDate") or item.get("startDate"),
                    "location": {
                        "city": city,
                        "country": country,
                        "raw": f"{city}, {country}" if city and country else (city or country or ""),
                    },
                    "online": item.get("online", False),
                    "cfp": _parse_cfp(item.get("cfpUrl"), item.get("cfpEndDate")),
                    "twitter": item.get("twitter"),
                    "domain": domain,
                    "tags": [topic],
                    "source": "tech-conferences",
                }
                
                conferences.append(conf)
    
    print(f"[tech_conferences] Fetched {len(conferences)} conferences")
    return conferences


def _parse_cfp(url: Optional[str], end_date: Optional[str]) -> Optional[Dict]:
    """Parse CFP info."""
    if not url:
        return None
    return {
        "url": url,
        "endDate": end_date,
    }


if __name__ == "__main__":
    confs = fetch()
    print(f"Total: {len(confs)}")
    if confs:
        print(f"Sample: {confs[0]}")
