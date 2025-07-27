# Tech Conferences Directory

A comprehensive Next.js application that dynamically lists upcoming tech conferences categorized by domains/fields (e.g., Databases, AI, Cloud Computing). The site fetches data automatically from the [confs.tech](https://github.com/tech-conferences/conference-data) open-source repository on GitHub.

## Features

- **Dynamic Data Fetching**: Automatically fetches conference data from GitHub
- **Real-time Search**: Fuzzy search across conferences, domains, and locations
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Dark Mode Support**: Automatic dark/light mode switching
- **Pagination**: Efficient pagination for large datasets
- **ISR Updates**: Incremental Static Regeneration for fresh data
- **TypeScript**: Full type safety throughout the application

## Tech Stack

- **Framework**: Next.js 15+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Search**: Fuse.js for fuzzy searching
- **Date Handling**: date-fns
- **Data Sources**: 
  - GitHub API (confs.tech repository)
  - Apify web scraping (Eventbrite, Meetup, Conference Index, etc.)
- **Database**: Supabase (PostgreSQL)
- **Scraping**: Apify SDK
- **Scheduling**: Vercel Cron Jobs

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd conf-finder
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Data Sources

The application fetches conference data from multiple sources:

### Primary Sources
1. **GitHub Repository**: [tech-conferences/conference-data](https://github.com/tech-conferences/conference-data)
   - Data is organized by year and domain
   - `conferences/2025/ai.json` - AI conferences
   - `conferences/2025/devops.json` - DevOps conferences
   - `conferences/2025/web.json` - Web development conferences

2. **Web Scraping via Apify**: Automatically discovers new conferences from:
   - Eventbrite (tech events)
   - Meetup (tech conferences)
   - Conference Index
   - All Conferences
   - Dev Events

### Data Processing
- Conferences are automatically classified into domains using keyword matching
- Duplicate detection and removal
- Automatic filtering for upcoming events only
- Real-time updates via scheduled scraping (twice daily)

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── about/             # About page
│   ├── domains/[slug]/    # Individual domain pages
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Homepage
├── components/            # React components
│   ├── ConferenceCard.tsx
│   ├── DomainSection.tsx
│   ├── Footer.tsx
│   ├── Header.tsx
│   └── LoadingSpinner.tsx
├── constants/             # Application constants
│   └── domains.ts
├── data/                  # Static data files
│   └── custom-domains.json
├── lib/                   # Utility functions
│   ├── conferences.ts
│   └── search.ts
└── types/                 # TypeScript type definitions
    └── conference.ts
```

## Key Features

### Data Fetching & Scraping
- **GitHub Integration**: Fetches data from confs.tech repository
- **Apify Web Scraping**: Automatically discovers new conferences from multiple sources
- **Domain Classification**: Uses keyword matching to categorize conferences
- **Duplicate Detection**: Prevents duplicate entries across sources
- **Scheduled Updates**: Runs twice daily via Vercel Cron Jobs
- **Error Handling**: Graceful fallbacks and comprehensive logging

### Search Functionality
- Real-time fuzzy search using Fuse.js
- Searches across conference names, cities, and countries
- Highlights search terms in results
- Collapsible domain sections

### UI/UX
- Clean, modern design with blue/gray color scheme
- Conference cards with hover effects
- Responsive grid layout (1 column on mobile, 3 on desktop)
- Loading states and error handling
- Breadcrumb navigation

### Performance & Database
- **Supabase Integration**: PostgreSQL database for data persistence
- **Incremental Static Regeneration (ISR)**: 1-hour revalidation for fresh data
- **Optimized Queries**: Efficient database queries with proper indexing
- **Real-time Updates**: Database-driven updates with automatic refresh
- **Caching**: Intelligent caching for improved performance

## Deployment

The application is optimized for deployment on Vercel:

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy automatically

The application will automatically:
- Fetch fresh data every 12 hours
- Handle GitHub API rate limits gracefully
- Provide fallback data if needed

## Contributing

Contributions are welcome! Here are some ways you can contribute:

1. **Add Domain Mappings**: Update `src/constants/domains.ts` with new domain mappings
2. **Improve Search**: Enhance the search functionality in `src/lib/search.ts`
3. **UI Enhancements**: Improve the design and user experience
4. **New Features**: Add features like conference reminders, calendar integration, etc.
5. **Bug Fixes**: Report and fix bugs

## New Features Added

- ✅ **Apify Web Scraping**: Automatic conference discovery from multiple sources
- ✅ **Supabase Database**: Persistent storage with real-time capabilities
- ✅ **Admin Dashboard**: Manual scraping and monitoring at `/admin`
- ✅ **Scheduled Updates**: Automated scraping twice daily
- ✅ **Enhanced UI**: "New" badges for recently added conferences
- ✅ **Comprehensive Logging**: Detailed scrape logs and statistics

## Future Enhancements

- [ ] Conference reminders and calendar integration
- [ ] Email notifications for new conferences
- [ ] Advanced filtering options
- [ ] Conference submission form
- [ ] Analytics and usage statistics
- [ ] Real-time notifications via Supabase subscriptions

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

- [confs.tech](https://github.com/tech-conferences/conference-data) for providing the conference data
- [Next.js](https://nextjs.org/) for the amazing framework
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
