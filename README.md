# Confab

A modern, open-source directory for technical conferences.

## Overview

Confab helps developers discover conferences, track Call for Papers (CFP) deadlines, and find speaking opportunities. It aggregates data from multiple sources to provide a comprehensive and up-to-date view of the global tech conference landscape.

## Features

### Data Aggregation
- **Modular Scraper Engine**: Fetches data from 8+ sources including developers.events, WikiCFP, DBLP, IEEE, and ACM.
- **Automated Updates**: GitHub Actions workflows run daily to keep the data fresh.
- **Smart Deduplication**: Merges duplicate entries from different sources.
- **Date Filtering**: Automatically removes past conferences to keep the list relevant.

### User Interface
- **Timeline View**: Chronological display of conferences with sticky month headers.
- **World Map**: Interactive map visualization to find events by location.
- **Speaker Mode**: Toggle to highlight open CFPs and sort by upcoming deadlines.
- **Advanced Filtering**: Filter by domain (AI, Web, DevOps, etc.), financial aid availability, and location.
- **Dark Mode**: Optimized for developer ergonomics.

### Integration
- **Calendar Support**: Export individual conferences to ICS format for Google Calendar, Outlook, and Apple Calendar.
- **Discord Notifications**: Automated webhooks for new CFPs and closing deadlines.
- **Analytics**: Integrated Vercel Analytics for usage tracking.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Maps**: React Leaflet
- **Backend/Scripts**: Python 3.11 (Scrapers, Data Processing)
- **Infrastructure**: Vercel (Hosting), GitHub Actions (Automation)

## Future Enhancements

- **Email Subscriptions**: Weekly digests of new conferences and closing CFPs.
- **RSS Feeds**: Standard RSS/Atom feeds for integration with aggregators.
- **User Accounts**: Ability to save favorite conferences and track submissions.
- **Personalized Dashboard**: Recommendations based on improved domain matching.
- **Travel Integration**: Estimated flight and hotel costs for in-person events.
- **Mobile Application**: Native mobile experience using React Native.
- **API Access**: Public REST API for developers to consume conference data.

## Contributing

Contributions are welcome. Please read the [contribution guidelines](CONTRIBUTING.md) for details on how to add new data sources or features.

## License

[MIT](LICENSE)
