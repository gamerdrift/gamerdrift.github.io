#!/usr/bin/env python3
"""
GamerDrift News Publishing Agent
Automatically fetches gaming and tech news from multiple sources and publishes to the website
Run this as a scheduled task or cron job for automated updates
"""

import os
import json
import requests
from datetime import datetime, timedelta
from typing import List, Dict, Optional
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('news_agent.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)


class NewsPublishingAgent:
    """AI Agent for fetching and publishing gaming/tech news"""
    
    def __init__(self):
        self.news_file = 'published_news.json'
        self.cache_time = 300  # 5 minutes
        self.max_articles = 50
        self.keywords = [
            'gaming', 'esports', 'video games', 'technology',
            'AI gaming', 'GPU', 'game development', 'speedrun'
        ]
        
    def fetch_gnews(self) -> List[Dict]:
        """Fetch from GNews API (free tier)"""
        try:
            logger.info("Fetching from GNews API...")
            query = ' OR '.join(self.keywords)
            url = f"https://gnews.io/api/v4/search?q={requests.utils.quote(query)}&lang=en&sortby=publishedAt"
            
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            
            articles = response.json().get('articles', [])
            logger.info(f"GNews returned {len(articles)} articles")
            return articles
        except Exception as e:
            logger.warning(f"GNews fetch failed: {e}")
            return []

    def fetch_newsdata(self) -> List[Dict]:
        """Fetch from NewsData.io API"""
        try:
            logger.info("Fetching from NewsData API...")
            query = '%20OR%20'.join(self.keywords[:5])  # Use first 5 keywords
            url = f"https://newsdata.io/api/1/news?q={query}&language=en&sortby=publishedAt"
            
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            
            articles = response.json().get('results', [])
            logger.info(f"NewsData returned {len(articles)} articles")
            return articles
        except Exception as e:
            logger.warning(f"NewsData fetch failed: {e}")
            return []

    def fetch_hackernews(self) -> List[Dict]:
        """Fetch from Hacker News API for tech news"""
        try:
            logger.info("Fetching from Hacker News...")
            # Get top 30 story IDs
            url = "https://hacker-news.firebaseio.com/v0/topstories.json"
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            
            story_ids = response.json()[:30]
            articles = []
            
            for story_id in story_ids[:15]:  # Get details for first 15
                story_url = f"https://hacker-news.firebaseio.com/v0/item/{story_id}.json"
                story = requests.get(story_url, timeout=5).json()
                
                if story.get('title'):
                    articles.append({
                        'title': story.get('title'),
                        'description': '',
                        'url': story.get('url', f"https://news.ycombinator.com/item?id={story_id}"),
                        'source': {'name': 'Hacker News'},
                        'publishedAt': datetime.utcfromtimestamp(story.get('time', 0)).isoformat(),
                        'urlToImage': None
                    })
            
            logger.info(f"Hacker News returned {len(articles)} articles")
            return articles
        except Exception as e:
            logger.warning(f"Hacker News fetch failed: {e}")
            return []

    def fetch_reddit(self) -> List[Dict]:
        """Fetch from Reddit gaming communities"""
        try:
            logger.info("Fetching from Reddit...")
            subreddits = ['gaming', 'pcgaming', 'esports', 'IndieGaming']
            articles = []
            
            headers = {'User-Agent': 'GamerDrift-Agent/1.0'}
            
            for sub in subreddits:
                url = f"https://www.reddit.com/r/{sub}/top.json?t=day&limit=5"
                response = requests.get(url, headers=headers, timeout=10)
                response.raise_for_status()
                
                posts = response.json().get('data', {}).get('children', [])
                for post in posts:
                    data = post.get('data', {})
                    articles.append({
                        'title': data.get('title'),
                        'description': data.get('selftext', '')[:200],
                        'url': f"https://reddit.com{data.get('permalink')}",
                        'source': {'name': f'Reddit r/{sub}'},
                        'publishedAt': datetime.utcfromtimestamp(data.get('created', 0)).isoformat(),
                        'urlToImage': data.get('thumbnail')
                    })
            
            logger.info(f"Reddit returned {len(articles)} articles")
            return articles
        except Exception as e:
            logger.warning(f"Reddit fetch failed: {e}")
            return []

    def normalize_articles(self, raw_articles: List[Dict]) -> List[Dict]:
        """Normalize articles from different sources to common format"""
        normalized = []
        
        for article in raw_articles:
            try:
                normalized_article = {
                    'title': article.get('title') or article.get('headline') or 'No Title',
                    'description': article.get('description') or article.get('summary') or '',
                    'url': article.get('url') or article.get('link') or '#',
                    'source': (article.get('source', {}).get('name') if isinstance(article.get('source'), dict) 
                              else article.get('source')) or 'Gaming News',
                    'publishedAt': article.get('publishedAt') or article.get('pubDate') or datetime.utcnow().isoformat(),
                    'image': article.get('image') or article.get('urlToImage') or None,
                    'category': self.categorize(article.get('title', ''))
                }
                normalized.append(normalized_article)
            except Exception as e:
                logger.warning(f"Error normalizing article: {e}")
        
        return normalized

    def categorize(self, title: str) -> str:
        """Categorize news article"""
        title_lower = title.lower()
        if any(word in title_lower for word in ['esports', 'tournament', 'championship', 'pro player']):
            return 'ESPORTS'
        if any(word in title_lower for word in ['gpu', 'cpu', 'hardware', 'rtx', 'graphics']):
            return 'HARDWARE'
        if any(word in title_lower for word in ['release', 'launch', 'coming', 'available']):
            return 'RELEASE'
        if any(word in title_lower for word in ['update', 'patch', 'hotfix', 'balance']):
            return 'UPDATE'
        return 'INDUSTRY'

    def deduplicate(self, articles: List[Dict]) -> List[Dict]:
        """Remove duplicate articles by title"""
        seen = set()
        unique = []
        
        for article in articles:
            title_hash = article['title'].lower().strip()
            if title_hash not in seen:
                seen.add(title_hash)
                unique.append(article)
        
        return unique

    def publish_news(self, articles: List[Dict]) -> None:
        """Save news to JSON file for website consumption"""
        try:
            # Save to JSON file
            with open(self.news_file, 'w') as f:
                json.dump({
                    'timestamp': datetime.utcnow().isoformat(),
                    'count': len(articles),
                    'articles': articles[:self.max_articles]
                }, f, indent=2)
            
            logger.info(f"Published {len(articles)} articles to {self.news_file}")
            
            # Log summary
            categories = {}
            for article in articles:
                cat = article['category']
                categories[cat] = categories.get(cat, 0) + 1
            
            logger.info(f"Category breakdown: {categories}")
            
        except Exception as e:
            logger.error(f"Failed to publish news: {e}")

    def run(self) -> None:
        """Execute the full news fetching and publishing pipeline"""
        logger.info("Starting GamerDrift News Publishing Agent...")
        
        try:
            # Fetch from all sources
            all_articles = []
            all_articles.extend(self.fetch_gnews())
            all_articles.extend(self.fetch_newsdata())
            all_articles.extend(self.fetch_hackernews())
            all_articles.extend(self.fetch_reddit())
            
            logger.info(f"Total articles fetched: {len(all_articles)}")
            
            # Normalize and deduplicate
            normalized = self.normalize_articles(all_articles)
            unique = self.deduplicate(normalized)
            
            # Sort by publish date (newest first)
            unique.sort(key=lambda x: x['publishedAt'], reverse=True)
            
            logger.info(f"After normalization and deduplication: {len(unique)} articles")
            
            # Publish
            self.publish_news(unique)
            
            logger.info("News Publishing Agent completed successfully!")
            
        except Exception as e:
            logger.error(f"Fatal error in news agent: {e}")


def main():
    """Main entry point"""
    agent = NewsPublishingAgent()
    agent.run()


if __name__ == '__main__':
    main()
