"""
IEEE Conference Calendar

Fetch conference data from IEEE's calendar. IEEE hosts thousands of conferences
across electrical engineering, computer science, and related fields.

Major conferences include:
- CVPR, ICCV (Computer Vision)
- ICRA, IROS (Robotics)
- S&P, NDSS (Security)
- DAC, ICCAD (Hardware)
- VIS, ISMAR (Visualization/AR)
"""

import requests
from typing import List, Dict

# IEEE doesn't have a simple public API, so we use a curated list of major CS conferences
IEEE_CONFERENCES = [
    # Computer Vision
    {
        "name": "IEEE/CVF Conference on Computer Vision and Pattern Recognition",
        "series": "CVPR",
        "typical_month": 6,
        "domain": "ai",
        "url": "https://cvpr.thecvf.com",
    },
    {
        "name": "IEEE/CVF International Conference on Computer Vision",
        "series": "ICCV",
        "typical_month": 10,
        "biennial": True,
        "domain": "ai",
        "url": "https://iccv.thecvf.com",
    },
    {
        "name": "IEEE/CVF Winter Conference on Applications of Computer Vision",
        "series": "WACV",
        "typical_month": 1,
        "domain": "ai",
        "url": "https://wacv.thecvf.com",
    },
    # Robotics
    {
        "name": "IEEE International Conference on Robotics and Automation",
        "series": "ICRA",
        "typical_month": 5,
        "domain": "ai",
        "url": "https://www.ieee-ras.org/conferences-workshops",
    },
    {
        "name": "IEEE/RSJ International Conference on Intelligent Robots and Systems",
        "series": "IROS",
        "typical_month": 10,
        "domain": "ai",
        "url": "https://www.ieee-ras.org/conferences-workshops",
    },
    # Security
    {
        "name": "IEEE Symposium on Security and Privacy",
        "series": "S&P",
        "typical_month": 5,
        "domain": "security",
        "url": "https://www.ieee-security.org/TC/SP/",
    },
    # Hardware
    {
        "name": "IEEE/ACM Design Automation Conference",
        "series": "DAC",
        "typical_month": 6,
        "domain": "software",
        "url": "https://www.dac.com",
    },
    # NLP/Speech
    {
        "name": "IEEE International Conference on Acoustics, Speech and Signal Processing",
        "series": "ICASSP",
        "typical_month": 4,
        "domain": "ai",
        "url": "https://2025.ieeeicassp.org",
    },
    # Networks
    {
        "name": "IEEE Conference on Computer Communications",
        "series": "INFOCOM",
        "typical_month": 5,
        "domain": "cloud",
        "url": "https://infocom.info",
    },
    # Software Engineering
    {
        "name": "IEEE/ACM International Conference on Software Engineering",
        "series": "ICSE",
        "typical_month": 5,
        "domain": "software",
        "url": "https://conf.researchr.org/series/icse",
    },
    # Visualization
    {
        "name": "IEEE VIS Conference",
        "series": "VIS",
        "typical_month": 10,
        "domain": "data",
        "url": "https://ieeevis.org",
    },
    # Pervasive Computing
    {
        "name": "IEEE International Conference on Pervasive Computing and Communications",
        "series": "PerCom",
        "typical_month": 3,
        "domain": "mobile",
        "url": "https://www.percom.org",
    },
    # AR/VR
    {
        "name": "IEEE International Symposium on Mixed and Augmented Reality",
        "series": "ISMAR",
        "typical_month": 10,
        "domain": "ai",
        "url": "https://ismar.net",
    },
    # Parallel Computing
    {
        "name": "IEEE International Parallel and Distributed Processing Symposium",
        "series": "IPDPS",
        "typical_month": 5,
        "domain": "cloud",
        "url": "https://www.ipdps.org",
    },
    # Cloud
    {
        "name": "IEEE International Conference on Cloud Computing",
        "series": "CLOUD",
        "typical_month": 7,
        "domain": "cloud",
        "url": "https://conferences.computer.org/cloud",
    },
]


def fetch() -> List[Dict]:
    """Return curated list of major IEEE CS conferences."""
    conferences: List[Dict] = []
    
    years = [2025, 2026]
    
    for conf_template in IEEE_CONFERENCES:
        for year in years:
            # Skip biennial conferences in even/odd years as appropriate
            if conf_template.get("biennial"):
                # ICCV is odd years only
                if conf_template["series"] == "ICCV" and year % 2 == 0:
                    continue
            
            month = conf_template["typical_month"]
            start_date = f"{year}-{month:02d}-15"  # Approximate date
            
            conf = {
                "name": f"{conf_template['name']} {year} ({conf_template['series']})",
                "url": conf_template["url"],
                "startDate": start_date,
                "endDate": None,
                "location": {
                    "city": "",
                    "country": "",
                    "raw": "TBD",
                },
                "online": False,
                "cfp": {
                    "url": conf_template["url"],
                    "endDate": None,
                },
                "domain": conf_template["domain"],
                "tags": ["ieee", conf_template["series"].lower(), "academic"],
                "source": "ieee",
            }
            
            conferences.append(conf)
    
    print(f"[ieee] Fetched {len(conferences)} conferences")
    return conferences


if __name__ == "__main__":
    confs = fetch()
    for c in confs:
        print(f"  - {c['name']}")
