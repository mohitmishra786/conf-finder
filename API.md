# API Documentation

This document provides comprehensive documentation for all API endpoints in the Tech Conferences Directory application.

## Base URL

All API endpoints are relative to your application's base URL:
- Development: `http://localhost:3000/api`
- Production: `https://your-domain.com/api`

## Authentication

Most endpoints do not require authentication. However, some endpoints may require specific environment variables to be configured:
- `APIFY_TOKEN` for Apify scraping operations
- `FIRECRAWL_KEY` for FireCrawl operations
- `SUPABASE_SERVICE_ROLE_KEY` for database operations

## Endpoints

### 1. Get All Conferences

**Endpoint:** `GET /api/conferences`

**Description:** Retrieves all conferences organized by domains from the database.

**Parameters:** None

**Request:**
```bash
curl -X GET http://localhost:3000/api/conferences
```

**Response:**
```json
[
  {
    "slug": "ai",
    "name": "Artificial Intelligence",
    "conferences": [
      {
        "id": "1",
        "name": "AI Conference 2025",
        "url": "https://example.com/ai-conf",
        "startDate": "2025-03-15",
        "endDate": "2025-03-17",
        "city": "San Francisco",
        "country": "USA",
        "cfpUrl": "https://example.com/cfp",
        "cfpEndDate": "2025-01-15",
        "twitter": "@aiconf",
        "isNew": false,
        "createdAt": "2024-12-01T10:00:00Z",
        "updatedAt": "2024-12-01T10:00:00Z"
      }
    ]
  }
]
```

**Error Response:**
```json
{
  "error": "Failed to fetch conferences"
}
```

**Status Codes:**
- `200`: Success
- `500`: Internal server error

---

### 2. Fetch GitHub Data

#### 2.1 Get Available Domains

**Endpoint:** `GET /api/fetch-github`

**Description:** Retrieves available domains and current year from the GitHub confs.tech repository.

**Parameters:** None

**Request:**
```bash
curl -X GET http://localhost:3000/api/fetch-github
```

**Response:**
```json
{
  "success": true,
  "data": {
    "availableDomains": ["ai", "web", "devops", "database"],
    "currentYear": 2025
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Failed to fetch available domains"
}
```

#### 2.2 Fetch and Store GitHub Data

**Endpoint:** `POST /api/fetch-github`

**Description:** Fetches conference data from the GitHub confs.tech repository and stores it in the database.

**Parameters:** None

**Request:**
```bash
curl -X POST http://localhost:3000/api/fetch-github
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalConferences": 150,
    "totalAdded": 25,
    "totalUpdated": 125,
    "domains": 8,
    "processingTime": 45000
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Failed to fetch GitHub data",
  "details": "GitHub API rate limit exceeded"
}
```

**Status Codes:**
- `200`: Success
- `500`: Internal server error

---

### 3. Scraping Operations

#### 3.1 Get Scraping Status

**Endpoint:** `GET /api/scrape`

**Description:** Retrieves current scraping status and statistics.

**Parameters:** None

**Request:**
```bash
curl -X GET http://localhost:3000/api/scrape
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalConferences": 1250,
    "newConferences": 45,
    "domains": 12,
    "latestScrapeLogs": [
      {
        "id": 1,
        "scrapeType": "apify",
        "status": "success",
        "conferencesFound": 150,
        "conferencesAdded": 25,
        "conferencesUpdated": 125,
        "startedAt": "2024-12-01T10:00:00Z",
        "completedAt": "2024-12-01T10:05:00Z",
        "metadata": {
          "targetsScraped": 1,
          "domainsProcessed": 8,
          "totalProcessingTime": 300000
        }
      }
    ]
  }
}
```

#### 3.2 Run Comprehensive Scraping

**Endpoint:** `POST /api/scrape`

**Description:** Runs comprehensive scraping from multiple sources (GitHub, Apify, FireCrawl) and stores results in the database.

**Parameters:** None

**Request:**
```bash
curl -X POST http://localhost:3000/api/scrape
```

**Response:**
```json
{
  "success": true,
  "message": "Scraping completed successfully",
  "data": {
    "github": {
      "found": 150,
      "added": 25,
      "updated": 125
    },
    "firecrawl": {
      "found": 75,
      "added": 15,
      "updated": 60
    },
    "apify": {
      "found": 200,
      "added": 30,
      "updated": 170
    },
    "totalProcessingTime": 180000
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Scraping failed",
  "error": "Apify API token not configured"
}
```

**Status Codes:**
- `200`: Success
- `500`: Internal server error

---

### 4. Test FireCrawl API

**Endpoint:** `GET /api/test-firecrawl`

**Description:** Tests the FireCrawl API connectivity and functionality.

**Parameters:** None

**Request:**
```bash
curl -X GET http://localhost:3000/api/test-firecrawl
```

**Response:**
```json
{
  "success": true,
  "apiKeyExists": true,
  "searchResult": {
    "results": [
      {
        "url": "https://example.com/ai-conference",
        "title": "AI Conference 2025",
        "content": "Join us for the biggest AI conference...",
        "metadata": {
          "publishedDate": "2024-11-15"
        }
      }
    ],
    "totalResults": 1
  }
}
```

**Error Response:**
```json
{
  "error": "FIRECRAWL_KEY not found",
  "success": false
}
```

**Status Codes:**
- `200`: Success
- `500`: Internal server error

---

## Data Models

### Conference Object

```json
{
  "id": "string",
  "name": "string",
  "url": "string",
  "startDate": "YYYY-MM-DD",
  "endDate": "YYYY-MM-DD",
  "city": "string",
  "country": "string",
  "cfpUrl": "string (optional)",
  "cfpEndDate": "YYYY-MM-DD (optional)",
  "twitter": "string (optional)",
  "isNew": "boolean",
  "createdAt": "ISO 8601 timestamp",
  "updatedAt": "ISO 8601 timestamp"
}
```

### Domain Object

```json
{
  "slug": "string",
  "name": "string",
  "conferences": "Conference[]"
}
```

### Scrape Log Object

```json
{
  "id": "number",
  "scrapeType": "string (github|apify|firecrawl)",
  "status": "string (partial|success|error)",
  "conferencesFound": "number",
  "conferencesAdded": "number",
  "conferencesUpdated": "number",
  "startedAt": "ISO 8601 timestamp",
  "completedAt": "ISO 8601 timestamp (optional)",
  "errorMessage": "string (optional)",
  "metadata": "object (optional)"
}
```

## Error Handling

All API endpoints follow a consistent error response format:

```json
{
  "success": false,
  "error": "Human-readable error message",
  "details": "Technical error details (optional)"
}
```

Common HTTP status codes:
- `200`: Success
- `400`: Bad Request
- `404`: Not Found
- `500`: Internal Server Error

## Rate Limiting

- GitHub API: Subject to GitHub's rate limits (60 requests/hour for unauthenticated requests)
- Apify API: Subject to your Apify plan limits
- FireCrawl API: Subject to your FireCrawl plan limits

## Environment Variables

The following environment variables are required for full API functionality:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Apify Configuration
APIFY_TOKEN=your_apify_api_token

# FireCrawl Configuration (optional)
FIRECRAWL_KEY=your_firecrawl_api_key
```

## Examples

### Complete Scraping Workflow

```bash
# 1. Check current status
curl -X GET http://localhost:3000/api/scrape

# 2. Run comprehensive scraping
curl -X POST http://localhost:3000/api/scrape

# 3. Fetch all conferences
curl -X GET http://localhost:3000/api/conferences
```

### GitHub Data Fetching

```bash
# 1. Get available domains
curl -X GET http://localhost:3000/api/fetch-github

# 2. Fetch and store GitHub data
curl -X POST http://localhost:3000/api/fetch-github
```

### Testing FireCrawl

```bash
# Test FireCrawl API connectivity
curl -X GET http://localhost:3000/api/test-firecrawl
```

## Notes

- All timestamps are in ISO 8601 format (UTC)
- Date fields use YYYY-MM-DD format
- The API is designed to be stateless and idempotent
- Scraping operations may take several minutes to complete
- Database operations are logged for debugging purposes 