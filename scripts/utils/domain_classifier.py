"""
Domain Classifier Module

Classifies conferences into domains and sub-domains.
"""

import re


DOMAIN_KEYWORDS = {
    "ai": [
        "artificial intelligence", "machine learning", "deep learning", 
        "neural", "nlp", "natural language", "computer vision", "ml", 
        "data science", "llm", "generative ai", "gpt", "transformer"
    ],
    "software": [
        "software engineering", "devops", "agile", "testing", "qa",
        "architecture", "microservices", "api", "backend", "developer"
    ],
    "security": [
        "security", "cybersecurity", "hacking", "crypto", "privacy",
        "infosec", "penetration", "vulnerability", "bsides"
    ],
    "web": [
        "javascript", "typescript", "react", "vue", "angular", "frontend",
        "web", "node", "css", "html", "browser"
    ],
    "mobile": [
        "ios", "android", "swift", "kotlin", "mobile", "flutter", "react native",
        "droidcon"
    ],
    "cloud": [
        "cloud", "kubernetes", "k8s", "docker", "container", "serverless",
        "aws", "azure", "gcp", "infrastructure", "platform engineering"
    ],
    "data": [
        "database", "sql", "nosql", "postgres", "mysql", "mongodb",
        "data engineering", "analytics", "etl", "warehouse"
    ],
    "devops": [
        "devops", "sre", "reliability", "monitoring", "observability",
        "ci/cd", "deployment", "gitops"
    ],
    "opensource": [
        "open source", "oss", "linux", "foss", "apache", "cncf"
    ],
    "academic": [
        "ieee", "acm", "symposium", "workshop", "icse", "issta",
        "conference on", "international conference"
    ],
}


def classify(name: str, tags: list[str] = None) -> tuple[str, list[str]]:
    """
    Classify a conference by domain and sub-domains.
    
    Returns:
        (primary_domain, list_of_sub_domains)
    """
    text = (name + " " + " ".join(tags or [])).lower()
    
    matches = []
    
    for domain, keywords in DOMAIN_KEYWORDS.items():
        score = sum(1 for kw in keywords if kw in text)
        if score > 0:
            matches.append((domain, score))
    
    if not matches:
        return "general", []
    
    # Sort by score, primary is highest
    matches.sort(key=lambda x: x[1], reverse=True)
    
    primary = matches[0][0]
    sub_domains = [m[0] for m in matches[1:4]]  # Up to 3 sub-domains
    
    return primary, sub_domains


def extract_tags(name: str, description: str = "") -> list[str]:
    """Extract technology tags from conference name/description."""
    text = f"{name} {description}".lower()
    
    TECH_TAGS = [
        "python", "javascript", "typescript", "java", "kotlin", "swift",
        "rust", "go", "golang", "ruby", "php", "scala", "elixir",
        "react", "vue", "angular", "svelte", "next.js", "nuxt",
        "kubernetes", "docker", "terraform", "ansible",
        "aws", "azure", "gcp", "cloudflare",
        "postgres", "mysql", "mongodb", "redis", "elasticsearch",
        "graphql", "rest", "grpc",
        "agile", "scrum", "kanban",
    ]
    
    found = []
    for tag in TECH_TAGS:
        # Word boundary match
        if re.search(rf"\b{re.escape(tag)}\b", text):
            found.append(tag)
    
    return found[:5]  # Max 5 tags


if __name__ == "__main__":
    # Test classification
    tests = [
        "IEEE Conference on Artificial Intelligence 2026",
        "React Summit Amsterdam",
        "BSides Security Conference",
        "KubeCon Europe 2026",
        "DevOpsDays Chicago",
        "PyCon US 2026",
    ]
    
    for name in tests:
        domain, subs = classify(name)
        tags = extract_tags(name)
        print(f"{name}")
        print(f"  Domain: {domain}, Sub: {subs}, Tags: {tags}")
