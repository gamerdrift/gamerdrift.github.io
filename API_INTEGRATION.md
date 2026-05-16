# GamerDrift - Complete API Integration Guide

## 🎯 Overview

This document provides detailed instructions for integrating real data sources into your GamerDrift website. All integrations work with the existing Firebase backend.

---

## 1️⃣ FIREBASE SETUP (Priority: CRITICAL)

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add Project"
3. Name it: `gamerdrift-auth`
4. Enable Google Analytics (optional)
5. Click "Create Project"

### Step 2: Enable Authentication

1. In Firebase Console, go to **Authentication**
2. Click **"Get Started"**
3. Enable **Email/Password** sign-in method
4. Save changes

### Step 3: Create Realtime Database

1. Go to **Realtime Database**
2. Click **"Create Database"**
3. Start in **Test Mode** (for development)
4. Choose region: **asia-southeast1** (For India)
5. Click **Enable**

### Step 4: Get Configuration Keys

1. Go to **Project Settings** (⚙️ icon)
2. Under "Your apps", click **"Web"** (</> icon)
3. Register app name: `GamerDrift`
4. Copy the firebaseConfig object
5. Replace the config in index.html

**Your config will look like:**
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyD1KQg6w7rGJlkH_N3o9Px8Q0Qz1V2X3Y4",
  authDomain: "gamerdrift-auth.firebaseapp.com",
  databaseURL: "https://gamerdrift-auth-default-rtdb.firebaseio.com",
  projectId: "gamerdrift-auth",
  storageBucket: "gamerdrift-auth.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};
```

### Step 5: Set Database Rules

In Firebase Realtime Database, go to **Rules** tab and set:

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    },
    "tournaments": {
      ".read": true,
      ".write": false
    },
    "news": {
      ".read": true,
      ".write": false
    }
  }
}
```

---

## 2️⃣ ESPORTS DATA - PandaScore API

### Setup Instructions

1. Go to [PandaScore](https://pandascore.co)
2. Click **"Get API Key"**
3. Sign up for free account
4. Go to **API Keys** section
5. Copy your API key

### Update Your Code

Replace this line in index.html:

```javascript
const esportsAPI='https://api.pandascore.co/matches?filter[status]=live&sort=-scheduled_at&per_page=5&token=YOUR_PANDASCORE_API_KEY';
```

With your actual API key:

```javascript
const esportsAPI='https://api.pandascore.co/matches?filter[status]=live&sort=-scheduled_at&per_page=5&token=abc123def456xyz789';
```

### Endpoint Details

**Get Live Tournaments:**
```
GET https://api.pandascore.co/matches?filter[status]=live&token=YOUR_KEY
```

**Response Example:**
```json
[
  {
    "id": 123,
    "name": "Worlds 2025 Finals",
    "game_id": 1,
    "prize_pool": 1000000,
    "status": "live",
    "scheduled_at": "2025-05-16T18:00:00Z"
  }
]
```

### Alternative: TheScore API

Free alternative with esports data:

```javascript
const esportsAPI = 'https://api.thescore.com/v1/esports/matches?status=live';
```

---

## 3️⃣ GAMING NEWS - NewsAPI

### Setup Instructions

1. Go to [NewsAPI.org](https://newsapi.org)
2. Click **"Get API Key"**
3. Sign up (free tier available)
4. Copy your API key from dashboard

### Update Your Code

Replace this line:

```javascript
const newsAPI='https://newsapi.org/v2/everything?q=gaming&sortBy=publishedAt&apiKey=YOUR_NEWSAPI_KEY';
```

With:

```javascript
const newsAPI='https://newsapi.org/v2/everything?q=gaming&sortBy=publishedAt&apiKey=abc123def456xyz789';
```

### Endpoint Details

**Get Gaming News:**
```
GET https://newsapi.org/v2/everything?q=gaming&sortBy=publishedAt&language=en&apiKey=YOUR_KEY
```

**Response Example:**
```json
{
  "articles": [
    {
      "title": "New Game Released",
      "description": "...",
      "url": "...",
      "urlToImage": "...",
      "publishedAt": "2025-05-16T12:00:00Z",
      "source": {
        "name": "GameNews"
      }
    }
  ]
}
```

### Alternative: IGDB API

For comprehensive gaming news and reviews:

```javascript
const igdbAPI = 'https://api.igdb.com/v4/games';
```

Requires Twitch OAuth. More complex setup but more detailed data.

---

## 4️⃣ MERCHANDISE - Shopify Integration

### Option A: Shopify Store

1. Go to [Shopify.com](https://shopify.com)
2. Create store for your merchandise
3. Add products
4. Get API credentials
5. Integrate with your site

**Add to your code:**

```javascript
async function fetchMerchandise() {
  try {
    const response = await fetch('https://your-store.myshopify.com/admin/api/2024-01/products.json', {
      headers: { 'X-Shopify-Access-Token': 'YOUR_TOKEN' }
    });
    const data = await response.json();
    return data.products.map(p => ({
      name: p.title,
      price: p.variants[0].price,
      image: p.image.src,
      id: p.id
    }));
  } catch(e) {
    console.error('Merch fetch failed', e);
    return [];
  }
}
```

### Option B: WooCommerce

1. Set up WordPress with WooCommerce
2. Add products
3. Enable REST API
4. Update code:

```javascript
async function fetchMerchandise() {
  try {
    const response = await fetch('https://your-site.com/wp-json/wc/v3/products', {
      headers: {
        'Authorization': 'Basic ' + btoa('consumer_key:consumer_secret')
      }
    });
    const products = await response.json();
    return products.map(p => ({
      name: p.name,
      price: p.price,
      image: p.images[0].src,
      id: p.id
    }));
  } catch(e) {
    console.error('Merch fetch failed', e);
    return [];
  }
}
```

### Option C: Etsy API

For printed merchandise from print-on-demand services:

```javascript
async function fetchMerchandise() {
  try {
    const response = await fetch('https://api.etsy.com/v3/application/listings/search?keywords=gamerdrift', {
      headers: { 'x-api-key': 'YOUR_ETSY_API_KEY' }
    });
    const data = await response.json();
    return data.results.map(item => ({
      name: item.title,
      price: item.price.amount / 100,
      image: item.listing_image.url_fullxfull,
      id: item.listing_id
    }));
  } catch(e) {
    console.error('Merch fetch failed', e);
    return [];
  }
}
```

---

## 5️⃣ TWITCH INTEGRATION - Live Streams

Add real GamerDrift Twitch streams:

```javascript
async function fetchLiveStreams() {
  try {
    const response = await fetch(
      'https://api.twitch.tv/helix/streams?game_id=509658',
      {
        headers: {
          'Client-ID': 'YOUR_TWITCH_CLIENT_ID',
          'Authorization': 'Bearer YOUR_OAUTH_TOKEN'
        }
      }
    );
    const data = await response.json();
    return data.data.slice(0, 5);
  } catch(e) {
    return [];
  }
}
```

---

## 6️⃣ PAYMENT INTEGRATION - Razorpay

For Indian market purchases:

```html
<!-- Add to your HTML -->
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>

<script>
function handlePayment(amount) {
  const options = {
    key: "YOUR_RAZORPAY_KEY_ID",
    amount: amount * 100, // in paise
    currency: "INR",
    description: "GamerDrift Merchandise",
    handler: function(response) {
      console.log("Payment successful:", response.razorpay_payment_id);
      showToast("✓ Payment successful!");
    },
    prefill: {
      email: currentUser?.email || "",
      contact: ""
    }
  };
  const rzp1 = new Razorpay(options);
  rzp1.open();
}
</script>
```

---

## 7️⃣ YOUTUBE INTEGRATION - Gaming Videos

Embed YouTube videos in your site:

```javascript
function getYouTubeVideos() {
  return [
    'https://www.youtube.com/embed/dQw4w9WgXcQ',
    'https://www.youtube.com/embed/9bZkp7q19f0',
    // Add more video IDs
  ];
}

// In your HTML
<iframe width="100%" height="400" src="https://www.youtube.com/embed/VIDEO_ID" 
  frameborder="0" allowfullscreen></iframe>
```

---

## 8️⃣ EMAIL SERVICE - SendGrid

For sending welcome emails and newsletters:

```javascript
async function sendWelcomeEmail(email, username) {
  try {
    await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer YOUR_SENDGRID_API_KEY',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: email }],
          subject: 'Welcome to GamerDrift!'
        }],
        from: { email: 'noreply@gamerdrift.com' },
        content: [{
          type: 'text/html',
          value: `<h1>Welcome ${username}!</h1><p>You're now part of the GamerDrift clan!</p>`
        }]
      })
    });
  } catch(e) {
    console.error('Email send failed', e);
  }
}
```

---

## 🔄 CORS & Backend Proxy

If APIs block your frontend requests (CORS issues), use a backend proxy:

**Example Node.js/Express:**

```javascript
app.get('/api/news', async (req, res) => {
  const response = await fetch('https://newsapi.org/v2/everything?q=gaming&apiKey=KEY');
  const data = await response.json();
  res.json(data);
});
```

Then update your frontend:

```javascript
const newsAPI = '/api/news'; // Instead of direct API call
```

---

## 📊 Data Structures

### User Profile
```json
{
  "uid": "user123",
  "username": "GamerTag",
  "email": "user@example.com",
  "avatar": "🎮",
  "joinDate": "2025-05-16",
  "stats": {
    "level": 1,
    "xp": 0,
    "wins": 0
  },
  "favorites": ["game1", "game2"],
  "cart": [
    { "id": "merch1", "quantity": 1 }
  ]
}
```

### Tournament
```json
{
  "id": "tournament123",
  "name": "GamerDrift Invitational",
  "game": "Nexus Gate",
  "prizePool": 500000,
  "teams": 16,
  "status": "live",
  "viewers": 2300000,
  "matches": [...]
}
```

---

## 🚀 Testing Your Integrations

1. **Test Firebase**: Create account and check if data saves
2. **Test APIs**: Check browser console for errors
3. **Test Payments**: Use test mode in Razorpay/Stripe
4. **Test Emails**: Send test emails before going live

---

## 🔒 Security Checklist

- [ ] Use environment variables for API keys
- [ ] Never commit keys to GitHub
- [ ] Enable HTTPS on all requests
- [ ] Validate all user input
- [ ] Set up rate limiting
- [ ] Use Firebase security rules
- [ ] Enable CORS restrictions
- [ ] Regular security audits

---

## 📞 API Support Links

- Firebase: https://firebase.google.com/docs
- NewsAPI: https://newsapi.org/docs
- PandaScore: https://pandascore.co/docs
- Shopify: https://shopify.dev/api
- Razorpay: https://razorpay.com/docs/
- SendGrid: https://docs.sendgrid.com/

---

**Last Updated**: May 16, 2026
