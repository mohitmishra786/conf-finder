"""
ACM (Association for Computing Machinery) Conference Calendar

Fetches conference data from ACM's calendar which includes:
- SIGCHI, SIGGRAPH, SIGMOD, SIGKDD, SIGIR, etc.
- ACM flagship conferences

Data source: ACM digital library calendar
"""

import requests
from typing import List, Dict


# Major ACM conferences with their typical schedules
# This is a curated list since ACM doesn't have a public API
ACM_CONFERENCES = [
    # CHI - Human Computer Interaction
    {
        "name": "ACM CHI Conference on Human Factors",
        "series": "CHI",
        "typical_month": 4,
        "domain": "web",
        "cfp_url": "https://chi.acm.org",
    },
    # SIGGRAPH - Graphics
    {
        "name": "ACM SIGGRAPH",
        "series": "SIGGRAPH",
        "typical_month": 8,
        "domain": "ai",
        "cfp_url": "https://s.acm.org/siggraph",
    },
    # SIGMOD - Databases
    {
        "name": "ACM SIGMOD Conference on Management of Data",
        "series": "SIGMOD",
        "typical_month": 6,
        "domain": "data",
        "cfp_url": "https://sigmod.org",
    },
    # KDD - Data Mining
    {
        "name": "ACM SIGKDD Conference on Knowledge Discovery and Data Mining",
        "series": "KDD",
        "typical_month": 8,
        "domain": "ai",
        "cfp_url": "https://www.kdd.org",
    },
    # SIGIR - Information Retrieval
    {
        "name": "ACM SIGIR Conference on Research and Development in Information Retrieval",
        "series": "SIGIR",
        "typical_month": 7,
        "domain": "ai",
        "cfp_url": "https://sigir.org",
    },
    # CSCW - Collaborative Work
    {
        "name": "ACM Conference on Computer-Supported Cooperative Work",
        "series": "CSCW",
        "typical_month": 10,
        "domain": "software",
        "cfp_url": "https://cscw.acm.org",
    },
    # PLDI - Programming Languages
    {
        "name": "ACM SIGPLAN Conference on Programming Language Design and Implementation",
        "series": "PLDI",
        "typical_month": 6,
        "domain": "software",
        "cfp_url": "https://pldi.acm.org",
    },
    # ISCA - Computer Architecture  
    {
        "name": "ACM/IEEE International Symposium on Computer Architecture",
        "series": "ISCA",
        "typical_month": 6,
        "domain": "software",
        "cfp_url": "https://iscaconf.org",
    },
    # SOSP - Operating Systems
    {
        "name": "ACM Symposium on Operating Systems Principles",
        "series": "SOSP",
        "typical_month": 10,
        "domain": "software",
        "cfp_url": "https://sosp.org",
    },
    # CCS - Computer Security
    {
        "name": "ACM Conference on Computer and Communications Security",
        "series": "CCS",
        "typical_month": 11,
        "domain": "security",
        "cfp_url": "https://www.sigsac.org/ccs",
    },
    # MobiCom - Mobile Computing
    {
        "name": "ACM MobiCom - Mobile Computing and Networking",
        "series": "MobiCom",
        "typical_month": 9,
        "domain": "mobile",
        "cfp_url": "https://sigmobile.org/mobicom",
    },
    # ASPLOS - Architecture
    {
        "name": "ACM ASPLOS - Architectural Support for Programming Languages and Operating Systems",
        "series": "ASPLOS",
        "typical_month": 3,
        "domain": "software",
        "cfp_url": "https://asplos-conference.org",
    },
    # OSDI (co-sponsored)
    {
        "name": "USENIX Symposium on Operating Systems Design and Implementation",
        "series": "OSDI",
        "typical_month": 7,
        "domain": "software",
        "cfp_url": "https://www.usenix.org/conferences",
    },
    # NSDI
    {
        "name": "USENIX Symposium on Networked Systems Design and Implementation",
        "series": "NSDI",
        "typical_month": 4,
        "domain": "cloud",
        "cfp_url": "https://www.usenix.org/conferences",
    },
]


def fetch() -> List[Dict]:
    """Return static list of major ACM conferences for next years."""
    conferences: List[Dict] = []
    
    years = [2025, 2026]
    
    for conf_template in ACM_CONFERENCES:
        for year in years:
            # Create conference entry
            month = conf_template["typical_month"]
            start_date = f"{year}-{month:02d}-15"  # Approximate
            
            conf = {
                "name": f"{conf_template['name']} {year}",
                "url": conf_template["cfp_url"],
                "startDate": start_date,
                "endDate": None,
                "location": {
                    "city": "",
                    "country": "",
                    "raw": "TBD",
                },
                "online": False,
                "cfp": {
                    "url": conf_template["cfp_url"],
                    "endDate": None,
                },
                "domain": conf_template["domain"],
                "tags": ["acm", conf_template["series"].lower(), "academic"],
                "source": "acm",
            }
            
            conferences.append(conf)
    
    print(f"[acm] Fetched {len(conferences)} conferences")
    return conferences


if __name__ == "__main__":
    confs = fetch()
    for c in confs:
        print(f"  - {c['name']}")
