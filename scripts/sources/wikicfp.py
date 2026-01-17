"""
Fetch AI/ML conference data from WikiCFP

WikiCFP is a semantic wiki for Call for Papers in science and technology.
URL: http://www.wikicfp.com

This module fetches AI/ML related conferences from category pages.
"""

import requests
from bs4 import BeautifulSoup
from typing import List, Dict
import re

# WikiCFP category pages for AI/ML
CATEGORIES = [
    "machine learning",
    "artificial intelligence", 
    "deep learning",
    "computer vision",
    "natural language processing",
]

BASE_URL = "http://www.wikicfp.com"


def fetch() -> List[Dict]:
    """Fetch AI/ML conferences from WikiCFP category pages."""
    conferences: List[Dict] = []
    seen_urls: set = set()
    
    for category in CATEGORIES:
        try:
            category_confs = _fetch_category(category)
            for conf in category_confs:
                # Deduplicate by URL
                if conf["url"] not in seen_urls:
                    seen_urls.add(conf["url"])
                    conferences.append(conf)
        except Exception as e:
            print(f"[wikicfp] Error fetching {category}: {e}")
            continue
    
    print(f"[wikicfp] Fetched {len(conferences)} conferences")
    return conferences


def _fetch_category(category: str) -> List[Dict]:
    """Fetch conferences from a specific category page."""
    conferences: List[Dict] = []
    
    # Category page URL
    url = f"{BASE_URL}/cfp/call?conference={category.replace(' ', '%20')}"
    
    try:
        response = requests.get(url, timeout=15, headers={
            "User-Agent": "Mozilla/5.0 (compatible; ConfabBot/1.0)"
        })
        response.raise_for_status()
    except Exception as e:
        print(f"[wikicfp] Request failed for {category}: {e}")
        return []
    
    soup = BeautifulSoup(response.text, "html.parser")
    
    # Find conference links - they're in format /cfp/servlet/event.showcfp?eventid=XXX
    links = soup.find_all("a", href=re.compile(r"event\.showcfp\?eventid="))
    
    for link in links:
        name = link.get_text(strip=True)
        href = link.get("href", "")
        
        if not name or not href:
            continue
        
        # Build full URL
        conf_url = href if href.startswith("http") else f"{BASE_URL}{href}"
        
        # Extract year from name (e.g., "ICML 2026" -> 2026)
        year_match = re.search(r"20\d{2}", name)
        year = int(year_match.group(0)) if year_match else 2026
        
        # Skip past conferences
        if year < 2025:
            continue
        
        conference = {
            "name": name,
            "url": conf_url,
            "startDate": None,  # Would need to scrape individual page for dates
            "endDate": None,
            "location": {
                "city": "",
                "country": "",
                "raw": "",
            },
            "online": False,
            "cfp": {
                "url": conf_url,
                "endDate": None,
            },
            "domain": "ai",
            "tags": ["ai", "ml", category.replace(" ", "-")],
            "source": "wikicfp",
        }
        
        conferences.append(conference)
    
    return conferences


if __name__ == "__main__":
    confs = fetch()
    print(f"Total: {len(confs)}")
    for c in confs[:10]:
        print(f"  - {c['name']}")
