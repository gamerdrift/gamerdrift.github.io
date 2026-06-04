const fs = require('fs');
const path = require('path');
const https = require('https');

// Feeds to aggregate
const FEEDS = {
  'Gaming News': 'https://www.gamespot.com/feeds/news/',
  'Technology News': 'https://techcrunch.com/feed/',
  'AI News': 'https://www.artificialintelligence-news.com/feed/'
};

// Stock placeholder visuals for our premium UI categories
const UNSPLASH_IMAGES = {
  'Gaming News': 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80',
  'Technology News': 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80',
  'AI News': 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=600&q=80',
  'Hardware Reviews': 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&w=600&q=80',
  'Esports': 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=600&q=80',
  'Game Updates': 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80',
  'Community Events': 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=600&q=80'
};

// Helper: Download a URL using HTTPS
function downloadUrl(url) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 GamerDrift News Agent/1.0'
      }
    };
    https.get(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => { resolve(data); });
    }).on('error', (err) => { reject(err); });
  });
}

// Helper: Strip HTML tags and clean whitespaces
function cleanHtml(raw) {
  if (!raw) return '';
  const text = raw.replace(/<[^>]*>/g, ' ');
  return text.replace(/\s+/g, ' ').trim().slice(0, 220) + '...';
}

// Regex helpers to extract XML tags
function extractTagContent(xml, tag) {
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i');
  const match = xml.match(regex);
  return match ? match[1].trim() : '';
}

function extractTagAttribute(xml, tag, attr) {
  const regex = new RegExp(`<${tag}[^>]*\\b${attr}=["']([^"']+)["']`, 'i');
  const match = xml.match(regex);
  return match ? match[1] : '';
}

// Match all <item> tags
function extractItems(xml) {
  const items = [];
  const regex = /<item[^>]*>([\s\S]*?)<\/item>/gi;
  let match;
  while ((match = regex.exec(xml)) !== null) {
    items.push(match[1]);
  }
  return items;
}

// Main operational collector logic
async function runCollector() {
  const now = new Date();
  const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
  
  const collectedArticles = [];

  for (const [feedCategory, url] of Object.entries(FEEDS)) {
    console.log(`📡 Fetching feed: ${feedCategory} from ${url}`);
    try {
      const xml = await downloadUrl(url);
      const items = extractItems(xml);
      
      console.log(`✓ Retrieved ${items.length} items from ${feedCategory}. Parsing...`);

      for (const itemXml of items) {
        let title = extractTagContent(itemXml, 'title');
        // Unescape CDATA and HTML entities
        title = title.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1');
        
        let desc = extractTagContent(itemXml, 'description');
        desc = desc.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1');

        const pubDateStr = extractTagContent(itemXml, 'pubDate');
        if (!title || !pubDateStr) continue;

        const pubDate = new Date(pubDateStr);
        if (isNaN(pubDate.getTime())) continue;

        // Filter: must be within the last 5 days
        if (pubDate < fiveDaysAgo) continue;

        const summary = cleanHtml(desc);
        
        // Dynamically evaluate category based on contents
        let category = feedCategory;
        const lowTitle = title.toLowerCase();
        if (lowTitle.includes('esports') || lowTitle.includes('tournament') || lowTitle.includes('championship')) {
          category = 'Esports';
        } else if (lowTitle.includes('rtx') || lowTitle.includes('gpu') || lowTitle.includes('processor') || lowTitle.includes('benchmark')) {
          category = 'Hardware Reviews';
        } else if (lowTitle.includes('patch') || lowTitle.includes('update') || lowTitle.includes('hotfix')) {
          category = 'Game Updates';
        }

        // Compute reading length
        const words = summary.split(' ').length;
        const readTime = `${Math.max(2, Math.round(words / 35))} min read`;

        // Check for media URL image
        let image = UNSPLASH_IMAGES[category] || UNSPLASH_IMAGES['Gaming News'];
        const mediaUrl = extractTagAttribute(itemXml, 'media:content', 'url') || extractTagAttribute(itemXml, 'enclosure', 'url');
        if (mediaUrl) {
          image = mediaUrl;
        }

        const hash = Math.abs(title.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a; }, 0));
        const articleId = `feed-${hash}-${pubDate.getTime().toString().slice(-4)}`;

        collectedArticles.push({
          id: articleId,
          title: title,
          category: category,
          date: pubDate.toISOString().split('T')[0],
          summary: summary,
          content: summary + " Full operational briefs are logged on direct transceiver channels.",
          imageUrl: image,
          readTime: readTime
        });
      }
    } catch (e) {
      console.warn(`▲ Warning: Failed to parse feed ${feedCategory}. Reason: ${e.message}`);
    }
  }

  const outputDir = path.join(__dirname, '..', 'data');
  const outputFile = path.join(outputDir, 'newsData.json');

  if (collectedArticles.length === 0) {
    console.log("Telemetry: No new articles within the 5-day window found. Fallback stays intact.");
    return;
  }

  // Sort: descending dates
  collectedArticles.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  try {
    fs.mkdirSync(outputDir, { recursive: true });
    // Write top 15 fresh posts
    fs.writeFileSync(outputFile, JSON.stringify(collectedArticles.slice(0, 15), null, 2), 'utf-8');
    console.log(`✓ Success: Aggregated and wrote ${collectedArticles.slice(0, 15).length} fresh articles to data/newsData.json.`);
  } catch (e) {
    console.error(`▲ Error: Failed to write news file: ${e.message}`);
  }
}

runCollector().catch(err => console.error("Operational Collector Failure:", err));
