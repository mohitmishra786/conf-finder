"""
Discord Notifier Module

Send webhook messages to Discord for new CFPs.
"""

import os
import requests
from datetime import datetime
from typing import Optional


WEBHOOK_URL = os.environ.get("DISCORD_WEBHOOK_URL", "")


def send_new_cfps(cfps: list[dict]) -> bool:
    """
    Send notification about new CFPs to Discord.
    
    Args:
        cfps: List of conference dicts with open CFPs
    
    Returns:
        True if sent successfully
    """
    if not WEBHOOK_URL:
        print("[discord] No webhook URL configured")
        return False
    
    if not cfps:
        return True
    
    # Build embed message
    embeds = []
    
    for cfp in cfps[:10]:  # Max 10 per message
        name = cfp.get("name", "Unknown")
        url = cfp.get("url", "")
        cfp_info = cfp.get("cfp", {})
        cfp_url = cfp_info.get("url", url)
        cfp_end = cfp_info.get("endDate", "")
        location = cfp.get("location", {}).get("raw", "")
        domain = cfp.get("domain", "general")
        
        # Calculate days remaining
        days_left = _days_remaining(cfp_end) if cfp_end else None
        urgency = _get_urgency_color(days_left)
        
        embed = {
            "title": name,
            "url": cfp_url,
            "color": urgency,
            "fields": [
                {"name": "Location", "value": location or "TBD", "inline": True},
                {"name": "Domain", "value": domain.upper(), "inline": True},
            ],
        }
        
        if cfp_end:
            days_text = f"{days_left} days left" if days_left and days_left > 0 else "Deadline passed"
            embed["fields"].append({
                "name": "CFP Deadline",
                "value": f"{cfp_end} ({days_text})",
                "inline": False,
            })
        
        if cfp_url and cfp_url != url:
            embed["fields"].append({
                "name": "Apply",
                "value": f"[Submit Talk]({cfp_url})",
                "inline": False,
            })
        
        embeds.append(embed)
    
    payload = {
        "content": f"**New CFPs Detected ({len(cfps)} total)**",
        "embeds": embeds,
    }
    
    try:
        response = requests.post(
            WEBHOOK_URL,
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=10,
        )
        response.raise_for_status()
        print(f"[discord] Sent notification for {len(cfps)} CFPs")
        return True
    except Exception as e:
        print(f"[discord] Error sending webhook: {e}")
        return False


def send_closing_soon(cfps: list[dict]) -> bool:
    """Send reminder for CFPs closing within 7 days."""
    if not WEBHOOK_URL or not cfps:
        return False
    
    message_parts = ["**CFPs Closing Soon**\n"]
    
    for cfp in cfps[:5]:
        name = cfp.get("name", "")
        cfp_info = cfp.get("cfp", {})
        cfp_end = cfp_info.get("endDate", "")
        cfp_url = cfp_info.get("url", cfp.get("url", ""))
        days = _days_remaining(cfp_end)
        
        urgency = "[URGENT]" if days <= 3 else "[SOON]"
        message_parts.append(f"{urgency} **{name}** {days} days left: {cfp_url}")
    
    payload = {"content": "\n".join(message_parts)}
    
    try:
        response = requests.post(WEBHOOK_URL, json=payload, timeout=10)
        response.raise_for_status()
        return True
    except Exception as e:
        print(f"[discord] Error: {e}")
        return False


def _days_remaining(date_str: str) -> Optional[int]:
    """Calculate days remaining until a date."""
    if not date_str:
        return None
    try:
        target = datetime.strptime(date_str, "%Y-%m-%d")
        delta = target - datetime.now()
        return delta.days
    except:
        return None


def _get_urgency_color(days: Optional[int]) -> int:
    """Get Discord embed color based on urgency."""
    if days is None:
        return 0x808080  # Gray
    if days <= 7:
        return 0xFF0000  # Red
    if days <= 14:
        return 0xFFA500  # Orange
    if days <= 30:
        return 0xFFFF00  # Yellow
    return 0x00FF00  # Green


if __name__ == "__main__":
    # Test (requires DISCORD_WEBHOOK_URL env var)
    test_cfps = [
        {
            "name": "Test Conference 2026",
            "url": "https://example.com",
            "cfp": {"url": "https://example.com/cfp", "endDate": "2026-02-01"},
            "location": {"raw": "Paris, France"},
            "domain": "ai",
        }
    ]
    
    if WEBHOOK_URL:
        send_new_cfps(test_cfps)
    else:
        print("Set DISCORD_WEBHOOK_URL to test")
