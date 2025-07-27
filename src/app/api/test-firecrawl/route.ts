import { NextResponse } from 'next/server';
import FireCrawlApp from '@mendable/firecrawl-js';

export async function GET() {
  try {
    const apiKey = process.env.FIRECRAWL_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'FIRECRAWL_KEY not found' }, { status: 500 });
    }
    
    const app = new FireCrawlApp({ apiKey });
    
    console.log('Making test search...');
    const searchResult = await app.search('AI conference 2025', {
      limit: 3,
      scrapeOptions: {
        formats: ["markdown"]
      }
    });

    console.log('Test search result:', JSON.stringify(searchResult, null, 2));

    return NextResponse.json({
      success: true,
      apiKeyExists: !!apiKey,
      searchResult
    });
  } catch (error) {
    console.error('FireCrawl test error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false 
    }, { status: 500 });
  }
} 