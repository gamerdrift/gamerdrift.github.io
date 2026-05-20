/**
 * GamerDrift News Aggregator
 * Fetches gaming and tech news from multiple open sources
 * Updates the news ticker and news sections in real-time
 */

class NewsAggregator {
  constructor() {
    this.newsCache = [];
    this.updateInterval = 300000; // Update every 5 minutes
    this.tickerTrack = document.getElementById('ticker-track');
    this.newsMainSection = document.querySelector('.n-main');
    this.newsSidebar = document.querySelector('.n-sidebar');
    this.sources = [
      'gaming',
      'technology',
      'esports'
    ];
  }

  /**
   * Fetch news from GNews API (free tier, no key required for limited requests)
   */
  async fetchFromGNews() {
    try {
      const query = 'gaming OR technology OR esports OR video games';
      const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=en&sortby=publishedAt`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('GNews API failed');
      
      const data = await response.json();
      return data.articles || [];
    } catch (error) {
      console.log('GNews fetch error (expected on dev):', error.message);
      return [];
    }
  }

  /**
   * Fetch news from NewsData API (free tier)
   */
  async fetchFromNewsData() {
    try {
      const url = `https://newsdata.io/api/1/news?q=gaming%20OR%20esports%20OR%20technology&language=en&prioritydomain=techcrunch,polygon,ign,gamespot,pcgamer`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('NewsData API failed');
      
      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.log('NewsData fetch error (expected on dev):', error.message);
      return [];
    }
  }

  /**
   * Fetch from RSS feeds via public CORS proxy (alternative method)
   */
  async fetchRSSFeed(feedUrl) {
    try {
      // Using RSS2JSON free service
      const rssUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}`;
      const response = await fetch(rssUrl);
      
      if (!response.ok) throw new Error('RSS feed fetch failed');
      const data = await response.json();
      
      return (data.items || []).map(item => ({
        title: item.title,
        description: item.description,
        link: item.link,
        source: item.source,
        pubDate: item.pubDate,
        image: item.thumbnail
      }));
    } catch (error) {
      console.log('RSS feed fetch error:', error.message);
      return [];
    }
  }

  /**
   * Generate mock data for development/fallback
   */
  generateMockNews() {
    const mockHeadlines = [
      { title: 'New GPU Architecture Unveiled with 300% Performance Boost', source: 'TechNews' },
      { title: 'Major Esports Tournament Breaks 20M Viewer Record', source: 'EsportsPro' },
      { title: 'Indie Game Achieves Cult Status with Viral TikTok Campaign', source: 'GameReleases' },
      { title: 'AI-Powered Game Design Tools Transform Industry Standards', source: 'DevNews' },
      { title: 'Cloud Gaming Platform Launches with Day-1 500 Game Library', source: 'GamingDaily' },
      { title: 'Ray Tracing Gets 10x Performance Improvement in Latest Driver', source: 'HardwareLab' },
      { title: 'Speedrunner Sets New World Record with 47-Minute Speedrun', source: 'SpeedRun' }
    ];
    
    return mockHeadlines.map((item, index) => ({
      title: item.title,
      description: `Breaking: ${item.title}`,
      source: item.source,
      pubDate: new Date(Date.now() - (index * 3600000)).toISOString(),
      image: null
    }));
  }

  /**
   * Parse and normalize news from all sources
   */
  normalizeNews(articles) {
    return articles
      .filter(article => article && article.title)
      .map(article => ({
        title: article.title || article.headline || '',
        description: article.description || article.summary || article.content || '',
        link: article.url || article.link || '#',
        source: article.source?.name || article.source || 'Gaming News',
        pubDate: article.publishedAt || article.pubDate || new Date().toISOString(),
        image: article.image || article.urlToImage || null,
        category: this.categorizeNews(article.title)
      }))
      .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
  }

  /**
   * Categorize news by keywords
   */
  categorizeNews(title) {
    const titleLower = title.toLowerCase();
    if (titleLower.includes('esports') || titleLower.includes('tournament') || titleLower.includes('championship'))
      return 'ESPORTS';
    if (titleLower.includes('gpu') || titleLower.includes('hardware') || titleLower.includes('rtx'))
      return 'HARDWARE';
    if (titleLower.includes('release') || titleLower.includes('launch') || titleLower.includes('coming'))
      return 'RELEASE';
    if (titleLower.includes('update') || titleLower.includes('patch'))
      return 'UPDATE';
    return 'INDUSTRY';
  }

  /**
   * Get tag class based on category
   */
  getTagClass(category) {
    const tagMap = {
      'ESPORTS': 'tag-esp',
      'HARDWARE': 'tag-hw',
      'RELEASE': 'tag-rel',
      'UPDATE': 'tag-upd',
      'INDUSTRY': 'tag-ind'
    };
    return tagMap[category] || 'tag-ind';
  }

  /**
   * Format time string (e.g., "2 HOURS AGO")
   */
  formatTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + ' YEARS AGO';
    
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + ' MONTHS AGO';
    
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + ' DAYS AGO';
    
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + ' HOURS AGO';
    
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + ' MINS AGO';
    
    return 'JUST NOW';
  }

  /**
   * Update the news ticker with headlines
   */
  updateTicker(news) {
    if (!this.tickerTrack || news.length === 0) return;

    // Create scrolling text with separator
    const headlines = news
      .slice(0, 20) // Use top 20 articles
      .map(article => `${article.title}`)
      .join(' • ');

    // Repeat for seamless scrolling
    this.tickerTrack.innerHTML = `${headlines} • ${headlines}`;
  }

  /**
   * Update main featured news
   */
  updateFeaturedNews(news) {
    if (!this.newsMainSection || news.length === 0) return;

    const featured = news[0];
    const tagClass = this.getTagClass(featured.category);
    
    this.newsMainSection.innerHTML = `
      <div class="n-img"><div class="n-crt"></div>📡</div>
      <div class="n-body">
        <span class="n-tag ${tagClass}">${featured.category}</span>
        <div class="n-time">◆ ${this.formatTime(featured.pubDate).toUpperCase()}</div>
        <h3 class="n-ttl">${featured.title}</h3>
        <p class="n-exc">${featured.description.substring(0, 150)}...</p>
      </div>
    `;
  }

  /**
   * Update sidebar news items
   */
  updateSidebarNews(news) {
    if (!this.newsSidebar || news.length < 2) return;

    // Show top 5 news items in sidebar (skip first since it's featured)
    const sidebarNews = news.slice(1, 6);

    this.newsSidebar.innerHTML = sidebarNews
      .map(article => {
        const tagClass = this.getTagClass(article.category);
        return `
          <div class="n-item">
            <span class="n-tag ${tagClass}">${article.category}</span>
            <div class="n-time">◆ ${this.formatTime(article.pubDate).toUpperCase()}</div>
            <div class="n-item-ttl">${article.title}</div>
          </div>
        `;
      })
      .join('');
  }

  /**
   * Fetch all news from available sources
   */
  async fetchAllNews() {
    console.log('Fetching latest gaming and tech news...');
    
    // Fetch from multiple sources in parallel
    const [gNewsArticles, newsDataArticles, rssArticles] = await Promise.all([
      this.fetchFromGNews().catch(() => []),
      this.fetchFromNewsData().catch(() => []),
      this.fetchRSSFeed('https://feeds.ign.com/ign/all').catch(() => [])
    ]);

    // Combine and normalize
    const allArticles = [
      ...gNewsArticles,
      ...newsDataArticles,
      ...rssArticles
    ];

    const normalized = this.normalizeNews(allArticles);
    
    // Fallback to mock data if no real news fetched
    if (normalized.length === 0) {
      console.log('Using mock news data as fallback...');
      this.newsCache = this.generateMockNews();
    } else {
      // Remove duplicates by title
      const seen = new Set();
      this.newsCache = normalized.filter(article => {
        if (seen.has(article.title)) return false;
        seen.add(article.title);
        return true;
      });
    }

    // Update UI
    this.updateTicker(this.newsCache);
    this.updateFeaturedNews(this.newsCache);
    this.updateSidebarNews(this.newsCache);
    
    console.log(`Updated with ${this.newsCache.length} articles`);
  }

  /**
   * Start automatic updates
   */
  start() {
    console.log('Starting GamerDrift News Aggregator...');
    
    // Initial fetch
    this.fetchAllNews();
    
    // Set up periodic updates
    setInterval(() => {
      this.fetchAllNews();
    }, this.updateInterval);
  }

  /**
   * Export news data (for external use)
   */
  getNews() {
    return this.newsCache;
  }

  /**
   * Export as JSON for external publishing
   */
  exportJSON() {
    return JSON.stringify(this.newsCache, null, 2);
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  const newsAggregator = new NewsAggregator();
  newsAggregator.start();
  
  // Make it globally accessible for debugging/external use
  window.newsAggregator = newsAggregator;
});
