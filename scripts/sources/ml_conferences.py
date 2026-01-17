"""
Top-tier ML/AI Conference Calendar

Curated list of the most prestigious machine learning and AI conferences:
- NeurIPS, ICML, ICLR (Core ML)
- AAAI, IJCAI (AI)
- ACL, EMNLP, NAACL (NLP)
- UAI, AISTATS (Uncertainty/Stats)

These are the "Big 5" and tier-1 conferences every ML researcher tracks.
"""

from typing import List, Dict

# Top ML/AI conferences with approximate schedules
ML_CONFERENCES = [
    # === Core ML ===
    {
        "name": "Conference on Neural Information Processing Systems",
        "series": "NeurIPS",
        "typical_month": 12,
        "location": "Various - North America",
        "domain": "ai",
        "url": "https://neurips.cc",
        "cfp_months_before": 5,  # CFP typically 5 months before
    },
    {
        "name": "International Conference on Machine Learning",
        "series": "ICML",
        "typical_month": 7,
        "location": "Various",
        "domain": "ai",
        "url": "https://icml.cc",
        "cfp_months_before": 4,
    },
    {
        "name": "International Conference on Learning Representations",
        "series": "ICLR",
        "typical_month": 5,
        "location": "Various",
        "domain": "ai",
        "url": "https://iclr.cc",
        "cfp_months_before": 5,
    },
    
    # === AI General ===
    {
        "name": "AAAI Conference on Artificial Intelligence",
        "series": "AAAI",
        "typical_month": 2,
        "location": "Various - North America",
        "domain": "ai",
        "url": "https://aaai.org/conference/aaai/",
        "cfp_months_before": 4,
    },
    {
        "name": "International Joint Conference on Artificial Intelligence",
        "series": "IJCAI",
        "typical_month": 8,
        "location": "Various",
        "domain": "ai",
        "url": "https://ijcai.org",
        "cfp_months_before": 4,
    },
    
    # === NLP ===
    {
        "name": "Annual Meeting of the Association for Computational Linguistics",
        "series": "ACL",
        "typical_month": 7,
        "location": "Various",
        "domain": "ai",
        "url": "https://aclanthology.org",
        "cfp_months_before": 4,
    },
    {
        "name": "Conference on Empirical Methods in Natural Language Processing",
        "series": "EMNLP",
        "typical_month": 11,
        "location": "Various",
        "domain": "ai",
        "url": "https://aclanthology.org",
        "cfp_months_before": 4,
    },
    {
        "name": "Annual Conference of the North American Chapter of the ACL",
        "series": "NAACL",
        "typical_month": 6,
        "location": "North America",
        "domain": "ai",
        "url": "https://naacl.org",
        "cfp_months_before": 3,
    },
    {
        "name": "COLING - International Conference on Computational Linguistics",
        "series": "COLING",
        "typical_month": 10,
        "biennial": True,
        "location": "Various",
        "domain": "ai",
        "url": "https://coling.org",
        "cfp_months_before": 4,
    },
    
    # === Uncertainty/Stats ===
    {
        "name": "Conference on Uncertainty in Artificial Intelligence",
        "series": "UAI",
        "typical_month": 8,
        "location": "Various",
        "domain": "ai",
        "url": "https://www.auai.org",
        "cfp_months_before": 3,
    },
    {
        "name": "International Conference on Artificial Intelligence and Statistics",
        "series": "AISTATS",
        "typical_month": 4,
        "location": "Various",
        "domain": "ai",
        "url": "https://aistats.org",
        "cfp_months_before": 4,
    },
    
    # === Reinforcement Learning ===
    {
        "name": "Conference on Robot Learning",
        "series": "CoRL",
        "typical_month": 11,
        "location": "Various",
        "domain": "ai",
        "url": "https://corl.org",
        "cfp_months_before": 3,
    },
    
    # === AutoML ===
    {
        "name": "AutoML Conference",
        "series": "AutoML",
        "typical_month": 9,
        "location": "Various",
        "domain": "ai",
        "url": "https://automl.cc",
        "cfp_months_before": 3,
    },
]


def fetch() -> List[Dict]:
    """Return curated list of top ML/AI conferences."""
    conferences: List[Dict] = []
    
    years = [2025, 2026]
    
    for conf_template in ML_CONFERENCES:
        for year in years:
            # Skip biennial conferences
            if conf_template.get("biennial") and year % 2 == 1:
                continue
            
            month = conf_template["typical_month"]
            start_date = f"{year}-{month:02d}-10"
            
            # Calculate CFP deadline
            cfp_month = month - conf_template.get("cfp_months_before", 4)
            cfp_year = year
            if cfp_month <= 0:
                cfp_month += 12
                cfp_year -= 1
            cfp_deadline = f"{cfp_year}-{cfp_month:02d}-01"
            
            conf = {
                "name": f"{conf_template['name']} {year} ({conf_template['series']})",
                "url": conf_template["url"],
                "startDate": start_date,
                "endDate": None,
                "location": {
                    "city": "",
                    "country": "",
                    "raw": conf_template.get("location", "TBD"),
                },
                "online": False,
                "cfp": {
                    "url": conf_template["url"],
                    "endDate": cfp_deadline,
                },
                "domain": "ai",
                "tags": ["ml", conf_template["series"].lower(), "academic", "tier-1"],
                "source": "ml-conferences",
            }
            
            conferences.append(conf)
    
    print(f"[ml_conferences] Fetched {len(conferences)} conferences")
    return conferences


if __name__ == "__main__":
    confs = fetch()
    for c in confs:
        print(f"  - {c['name']}: CFP {c['cfp']['endDate']}")
