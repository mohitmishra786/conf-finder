"""
Confab Conference Aggregator - Main Orchestrator

Fetches conferences from all sources, deduplicates, classifies, 
geocodes, and outputs to conferences.json grouped by month.
"""

import json
import os
import sys
from datetime import datetime
from pathlib import Path

# Add scripts directory to path for imports
sys.path.insert(0, str(Path(__file__).parent))

from sources import developers_events, tech_conferences, dblp, papercall
from sources import ieee, acm, ml_conferences
# Note: wikicfp requires beautifulsoup4, included optionally
try:
    from sources import wikicfp
    HAS_WIKICFP = True
except ImportError:
    HAS_WIKICFP = False

from utils.deduplication import deduplicate
from utils.domain_classifier import classify, extract_tags
from utils.geocoder import geocode
from utils.discord_notifier import send_new_cfps, send_closing_soon


OUTPUT_PATH = Path(__file__).parent.parent / "public" / "data" / "conferences.json"
PREVIOUS_DATA_PATH = OUTPUT_PATH


def main():
    print("=" * 60)
    print("Confab Conference Aggregator")
    print("=" * 60)
    
    # 1. Fetch from all sources
    print("\n[1/6] Fetching from sources...")
    all_conferences = []
    
    sources = [
        # Primary sources (APIs and structured data)
        ("Developers Events", developers_events.fetch),
        ("Tech Conferences", tech_conferences.fetch),
        ("DBLP", dblp.fetch),
        ("Papercall", papercall.fetch),
        # Academic sources (curated lists)
        ("IEEE", ieee.fetch),
        ("ACM", acm.fetch),
        ("ML Conferences", ml_conferences.fetch),
    ]
    
    # Add WikiCFP if beautifulsoup4 is available
    if HAS_WIKICFP:
        sources.append(("WikiCFP", wikicfp.fetch))
    
    for name, fetch_fn in sources:
        try:
            confs = fetch_fn()
            all_conferences.extend(confs)
            print(f"  ✓ {name}: {len(confs)} conferences")
        except Exception as e:
            print(f"  ✗ {name}: Error - {e}")
    
    print(f"\nTotal raw conferences: {len(all_conferences)}")
    
    # 2. Deduplicate
    print("\n[2/6] Deduplicating...")
    conferences = deduplicate(all_conferences)
    print(f"After deduplication: {len(conferences)}")
    
    # 3. Classify and enrich
    print("\n[3/6] Classifying and enriching...")
    for conf in conferences:
        # Domain classification
        domain, sub_domains = classify(conf.get("name", ""))
        conf["domain"] = domain
        conf["subDomains"] = sub_domains
        
        # Extract tags
        conf["tags"] = extract_tags(conf.get("name", ""))
        
        # Geocode location
        loc = conf.get("location", {})
        coords = geocode(loc.get("city", ""), loc.get("country", ""))
        if coords:
            loc["lat"] = coords[0]
            loc["lng"] = coords[1]
        
        # Calculate CFP status
        cfp = conf.get("cfp")
        if cfp and cfp.get("endDate"):
            days_remaining = _days_remaining(cfp["endDate"])
            cfp["daysRemaining"] = days_remaining
            cfp["status"] = "open" if days_remaining and days_remaining > 0 else "closed"
        
        # Generate unique ID
        conf["id"] = _generate_id(conf)
    
    # 4. Group by month
    print("\n[4/6] Grouping by month...")
    grouped = _group_by_month(conferences)
    
    # 5. Calculate stats
    print("\n[5/6] Calculating stats...")
    stats = {
        "total": len(conferences),
        "withOpenCFP": sum(1 for c in conferences if (c.get("cfp") or {}).get("status") == "open"),
        "withLocation": sum(1 for c in conferences if (c.get("location") or {}).get("lat")),
        "byDomain": _count_by_domain(conferences),
    }
    
    # 6. Output
    print("\n[6/6] Writing output...")
    output = {
        "lastUpdated": datetime.utcnow().isoformat() + "Z",
        "stats": stats,
        "months": grouped,
    }
    
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_PATH, "w") as f:
        json.dump(output, f, indent=2, default=str)
    
    print(f"\n✓ Written to {OUTPUT_PATH}")
    print(f"  Total conferences: {stats['total']}")
    print(f"  With open CFP: {stats['withOpenCFP']}")
    print(f"  With location: {stats['withLocation']}")
    
    # 7. Discord notifications (if enabled)
    if os.environ.get("DISCORD_WEBHOOK_URL"):
        print("\n[Extra] Sending Discord notifications...")
        _send_notifications(conferences)
    
    print("\n" + "=" * 60)
    print("Done!")


def _days_remaining(date_str: str):
    """Calculate days remaining until a date."""
    if not date_str:
        return None
    try:
        target = datetime.strptime(date_str, "%Y-%m-%d")
        delta = target - datetime.now()
        return delta.days
    except:
        return None


def _generate_id(conf: dict) -> str:
    """Generate a unique ID for a conference."""
    import hashlib
    data = f"{conf.get('name', '')}-{conf.get('startDate', '')}-{conf.get('url', '')}"
    return hashlib.md5(data.encode()).hexdigest()[:12]


def _group_by_month(conferences: list[dict]) -> dict:
    """Group conferences by "Month Year" format."""
    grouped = {}
    
    for conf in conferences:
        start_date = conf.get("startDate")
        if not start_date:
            month_key = "TBD"
        else:
            try:
                dt = datetime.strptime(start_date, "%Y-%m-%d")
                month_key = dt.strftime("%B %Y")  # e.g., "January 2026"
            except:
                month_key = "TBD"
        
        if month_key not in grouped:
            grouped[month_key] = []
        grouped[month_key].append(conf)
    
    # Sort conferences within each month by date
    for month, confs in grouped.items():
        confs.sort(key=lambda c: c.get("startDate") or "9999-12-31")
    
    # Sort months chronologically
    def month_sort_key(m):
        if m == "TBD":
            return "9999-12"
        try:
            dt = datetime.strptime(m, "%B %Y")
            return dt.strftime("%Y-%m")
        except:
            return "9999-12"
    
    return dict(sorted(grouped.items(), key=lambda x: month_sort_key(x[0])))


def _count_by_domain(conferences: list[dict]) -> dict:
    """Count conferences by domain."""
    counts = {}
    for conf in conferences:
        domain = conf.get("domain", "general")
        counts[domain] = counts.get(domain, 0) + 1
    return counts


def _send_notifications(conferences: list[dict]):
    """Send Discord notifications for new/closing CFPs."""
    # Load previous data to detect new CFPs
    previous_ids = set()
    if PREVIOUS_DATA_PATH.exists():
        try:
            with open(PREVIOUS_DATA_PATH) as f:
                prev = json.load(f)
            for month_confs in prev.get("months", {}).values():
                for c in month_confs:
                    previous_ids.add(c.get("id"))
        except:
            pass
    
    # Find new CFPs
    new_cfps = [
        c for c in conferences
        if c.get("id") not in previous_ids
        and c.get("cfp", {}).get("status") == "open"
    ]
    
    if new_cfps:
        print(f"  Found {len(new_cfps)} new CFPs")
        send_new_cfps(new_cfps)
    
    # Find CFPs closing within 7 days
    closing_soon = [
        c for c in conferences
        if c.get("cfp", {}).get("status") == "open"
        and 0 < (c.get("cfp", {}).get("daysRemaining") or 999) <= 7
    ]
    
    if closing_soon:
        print(f"  Found {len(closing_soon)} CFPs closing soon")
        send_closing_soon(closing_soon)


if __name__ == "__main__":
    main()
