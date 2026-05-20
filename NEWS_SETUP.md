# GamerDrift News Aggregation System - Documentation

## Overview

Your GamerDrift website now has an intelligent news aggregation system that automatically fetches gaming and tech news from multiple sources and publishes them to your site in real-time.

### What's New

✅ **News Ticker** - Slowed down 300x with neon white color and proper overflow handling  
✅ **JavaScript News Aggregator** - Fetches from multiple open sources  
✅ **Python Backend Agent** - AI-powered news publishing pipeline  
✅ **Automated Scheduling** - Runs every 5 minutes on Windows Task Scheduler  

---

## Files Added

```
news-aggregator.js          # Frontend JavaScript for fetching and displaying news
news-agent.py              # Python backend agent for news publishing
setup-news-agent.bat       # Windows batch setup script
Setup-NewsAgent.ps1        # PowerShell setup script
NEWS_SETUP.md              # This documentation
```

---

## Quick Start (Windows)

### Option 1: PowerShell (Recommended)

```powershell
# Run PowerShell as Administrator, then:
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope CurrentUser

# Navigate to your website directory
cd "c:\Users\Vidya\Desktop\gamerdrift.github.io\gamerdrift.github.io"

# Run the setup script
.\Setup-NewsAgent.ps1
```

### Option 2: Batch File

```cmd
# Run Command Prompt as Administrator, then:
cd c:\Users\Vidya\Desktop\gamerdrift.github.io\gamerdrift.github.io
setup-news-agent.bat
```

---

## What Gets Updated

### 1. **News Ticker (Navigation Bar)**
- **Location**: Top navigation bar
- **Updates**: Every 5 minutes (when Python agent runs)
- **Display**: Scrolling headlines with neon white color
- **Speed**: Slowed 300x from original (now 135,000 seconds per cycle)

### 2. **Featured News Section**
- **Location**: "Stay Informed" section below Esports
- **Shows**: Top headline with category tag, timestamp, and description
- **Updates**: Real-time with featured article

### 3. **News Sidebar**
- **Location**: Right side of News section
- **Shows**: 5 most recent articles by category
- **Categories**: ESPORTS, HARDWARE, RELEASE, UPDATE, INDUSTRY

---

## News Sources

The system fetches from multiple open sources:

1. **GNews API** - Tech and gaming news aggregation
2. **NewsData API** - Global news coverage
3. **Hacker News** - Technology trends
4. **Reddit** - Community gaming news from r/gaming, r/pcgaming, r/esports, r/IndieGaming
5. **RSS Feeds** - IGN and other gaming outlets

### Note on APIs

Most APIs are **free and rate-limited**:
- GNews: ~100 requests/day
- NewsData: Limited free tier
- Others: No authentication required

**Fallback**: If API limits are reached, the system shows mock data to maintain functionality.

---

## How It Works

### Frontend Flow (news-aggregator.js)

```
Page Load
  ↓
NewsAggregator initializes
  ↓
Fetch from APIs in parallel
  ↓
Normalize articles (remove duplicates)
  ↓
Update ticker + featured + sidebar
  ↓
Repeat every 5 minutes
```

### Backend Flow (news-agent.py)

```
Scheduled task triggers (every 5 minutes)
  ↓
Fetch from GNews, NewsData, HackerNews, Reddit
  ↓
Normalize & deduplicate
  ↓
Categorize articles
  ↓
Save to published_news.json
  ↓
Optional: Frontend can load published_news.json
```

---

## Customization

### Change Update Frequency

**In news-aggregator.js** (line 10):
```javascript
this.updateInterval = 300000; // Change from 300000ms (5 min)
```

**In news-agent.py**:
Run the Python script more/less frequently via Task Scheduler

### Change News Categories

Edit the categorization logic in **news-aggregator.js** (line 85-93):
```javascript
categorizeNews(title) {
    const titleLower = title.toLowerCase();
    if (titleLower.includes('custom-keyword'))
        return 'YOUR_CATEGORY';
    // ...
}
```

### Add More News Sources

Add new fetch methods in **news-aggregator.js**:
```javascript
async fetchCustomSource() {
    // Your API call here
}
```

Then add to the parallel fetch in `fetchAllNews()` method.

### Adjust Ticker Speed

In **index.html**, find the `.ticker-track` CSS:
```css
animation: ticker-scroll 135000s linear infinite; /* Change this number */
```

- Current: 135000s (very slow)
- Original: 450s (fast)
- Example: 50000s (medium)

### Change Ticker Color

In **index.html**, find `.ticker-track`:
```css
color: #ffffff;  /* Change to any hex color */
text-shadow: 0 0 8px rgba(255,255,255,0.6);  /* Adjust glow */
```

---

## Troubleshooting

### Task Not Running

```powershell
# Check if task exists
Get-ScheduledTask -TaskName "GamerDrift News Agent"

# Run task manually
Start-ScheduledTask -TaskName "GamerDrift News Agent"

# View task details
Get-ScheduledTask -TaskName "GamerDrift News Agent" | Select-Object -ExpandProperty Triggers
```

### News Not Updating

1. Check **news_agent.log** for errors:
   ```powershell
   Get-Content news_agent.log -Tail 20
   ```

2. Verify Python is installed:
   ```powershell
   python --version
   ```

3. Check if requests package is installed:
   ```powershell
   python -m pip list | grep requests
   ```

### API Rate Limits

If you see no news updates:
- The system has fallback mock data
- Wait 24 hours for API limits to reset
- Or add your own API keys to the configuration

### CORS Errors in Browser Console

- Expected on local testing
- Will work fine when deployed to GitHub Pages
- Some APIs may require server-side proxy for local testing

---

## Advanced: Custom API Integration

### Add Your Own News API

Edit **news-aggregator.js**:

```javascript
async fetchCustomAPI() {
    try {
        const response = await fetch('your-api-endpoint');
        const data = await response.json();
        
        return data.articles.map(article => ({
            title: article.title,
            description: article.description,
            link: article.link,
            source: article.source,
            pubDate: article.date,
            image: article.image
        }));
    } catch (error) {
        console.log('Custom API error:', error.message);
        return [];
    }
}
```

Then add to `fetchAllNews()`:
```javascript
const [gNewsArticles, newsDataArticles, customArticles] = await Promise.all([
    this.fetchFromGNews(),
    this.fetchFromNewsData(),
    this.fetchCustomAPI()  // Add this
]);
```

---

## Performance Notes

- **Frontend**: Fetches from APIs directly (CORS may limit some sources)
- **Backend**: Python script can access all APIs without CORS restrictions
- **Caching**: Articles are cached to avoid duplicate fetches
- **Deduplication**: System automatically removes duplicate headlines

---

## Security Considerations

✅ No credentials required (free APIs only)  
✅ No external data stored on your server  
✅ HTTPS recommended for production deployment  
✅ Rate limiting handled by individual APIs  

---

## File Locations

```
Your Website Root
├── index.html                    (modified - added script reference)
├── news-aggregator.js            (new - frontend fetcher)
├── news-agent.py                 (new - backend agent)
├── setup-news-agent.bat          (new - batch setup)
├── Setup-NewsAgent.ps1           (new - PowerShell setup)
├── published_news.json           (generated - news cache)
└── news_agent.log                (generated - logs)
```

---

## Schedule Changes

### To Run Every 1 Hour
```powershell
$trigger = New-ScheduledTaskTrigger -Once -At (Get-Date) `
    -RepetitionInterval (New-TimeSpan -Hours 1) `
    -RepetitionDuration (New-TimeSpan -Days 10950)
```

### To Run Every 30 Minutes
```powershell
$trigger = New-ScheduledTaskTrigger -Once -At (Get-Date) `
    -RepetitionInterval (New-TimeSpan -Minutes 30) `
    -RepetitionDuration (New-TimeSpan -Days 10950)
```

---

## Future Enhancements

- [ ] Add database for persistent news storage
- [ ] Create admin panel for news management
- [ ] Add filters by gaming genre/platform
- [ ] Implement full-text search for news archive
- [ ] Add social sharing for articles
- [ ] Email digest notifications
- [ ] Mobile app integration

---

## Support & Debugging

### Enable Debug Logging

Add to **news-aggregator.js** (line 3):
```javascript
window.DEBUG_NEWS = true;
```

Then check browser console for detailed logs.

### View Python Logs

```cmd
type news_agent.log
# Or for last 20 lines
powershell "Get-Content news_agent.log -Tail 20"
```

### Manual Test

```cmd
# Run Python agent manually
python news-agent.py

# Should create/update published_news.json
type published_news.json
```

---

## Version Info

- **Created**: May 17, 2026
- **Python**: 3.8+
- **Node/JS**: ES6+
- **Browser Support**: Chrome 90+, Firefox 88+, Safari 14+

---

For questions or issues, check the logs and ensure all dependencies are installed correctly.

Happy news aggregating! 🎮📰
