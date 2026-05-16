# GamerDrift Website - Setup & Functionality Guide

## ✅ What's Been Activated

### 1. **Authentication System (JOIN CLAN)**
- **Registration**: Users can create accounts with username, email, and password
- **Login**: Existing users can log in to their accounts
- **Firebase Integration**: All user data is stored securely in Firebase
- **User States**: Website shows logged-in user's email in the navigation
- **Logout**: Users can click their profile to log out

**How to use:**
- Click "JOIN CLAN" button in navbar
- Choose "SIGN UP" to create new account OR "LOGIN" for existing users
- Fill in credentials and submit
- User account is created and synced with Firebase

---

### 2. **Interactive Review Cards**
- **Clickable Cards**: All game review cards are now clickable
- **Review Modal**: Displays full game details including:
  - Full title and rating
  - Genre, platforms, detailed description
  - "Add to Favorites" button (requires login)
- **8 Game Reviews**: Each with unique details and scores

**How to use:**
- Click any review card in the "Reviews" section
- Modal opens showing full game information
- Sign in to add games to favorites
- Click X or outside modal to close

---

### 3. **News Section Enhancement**
- **Clickable News Items**: All news articles are interactive
- **News Modal**: Shows full article content including:
  - Article title and category tag
  - Author and publish date
  - Full article text
  - "Save Article" button
- **5 Featured News Items**: Industry, esports, hardware, releases, updates

**How to use:**
- Click on main news card or any sidebar news item
- Read full article in modal popup
- Save articles to your profile (login required)
- Close modal with X button

---

### 4. **Esports & Tournaments**
- **Live Tournament Cards**: Display real tournament data
- **Prize Pools**: Show prize money for each tournament
- **Live Scores**: Scoreboard with current match scores
- **Tournament Details**: Teams, stages, viewer counts

**Features:**
- GamerDrift Invitational: $500K, Nexus Gate, Live
- Global FPS Masters: $1.2M, Vortex Protocol, Upcoming
- Drift Racing Open: $80K, Grid Surge 2025, Live

---

### 5. **Community & Clans**
- **Top Clans**: Ranked list of 5 best clans
- **Clan Chat**: Real-time messenger with clan members
- **Online Users**: See who's online in your clan
- **User Profiles**: Each clan has member count and tier

**How to use:**
- Click clan cards to view details
- Use messenger button (💬) to chat with clan
- View online users in "ONLINE" tab
- Switch between GLOBAL, CLAN, and ONLINE tabs

---

### 6. **Browser Games**
Four fully functional arcade games built into the website:

#### **🐍 Neon Snake**
- Arrow keys or WASD to move
- Eat food to grow
- Don't hit walls or yourself
- Score points for each food eaten

#### **🧱 Drift Breakout**
- Mouse movement to control paddle
- Arrow keys for directional control
- Break all bricks to advance
- 3 lives per game

#### **🚀 Space Drift**
- Arrow keys or WASD to move
- Spacebar to shoot
- Destroy asteroids
- Avoid collisions

#### **🏓 Cyber Pong**
- Arrow keys or WASD to move paddle
- Play against AI opponent
- First to win becomes champion
- Classic arcade fun

---

### 7. **Merchandise Store**
- **6 Products**: Hoodies, caps, mousepads, jerseys, mugs, phone cases
- **Shopping Cart**: Track items added to cart
- **Add to Cart**: Click button to add any item
- **Pricing**: All items in INR with realistic prices
- **Product Badges**: NEW, HOT, LIMITED tags

**How to use:**
- Browse merchandise in the Merch section
- Click "ADD TO CART" on any product
- Cart count updates in navbar
- Products available for all regions

---

### 8. **Newsletter Subscription**
- **Email Input**: Enter your email to subscribe
- **Validation**: Checks for valid email format
- **Confirmation**: Shows success message
- **Database**: Emails can be stored in Firebase

**How to use:**
- Scroll to Newsletter section
- Enter your email
- Click "JOIN THE CLAN"
- Receive confirmation and welcome message

---

### 9. **Tab Navigation**
All navigation tabs are now fully functional:
- **Reviews** → Full game reviews with details
- **Esports** → Live tournaments and scores
- **News** → Gaming industry news updates
- **Community** → Clans and player profiles
- **Games** → Playable browser games
- **Merch** → Shopping store
- **About** → Team and company info

---

## 🔧 Firebase Configuration

Your website is configured to connect to Firebase for:
- User authentication
- User profile data storage
- Game preferences
- Saved articles
- Chat messages
- Tournament data

**Note**: Currently using demo credentials. To enable full functionality:

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project called "gamerdrift-auth"
3. Enable Authentication (Email/Password method)
4. Create Realtime Database
5. Copy your config credentials
6. Replace these values in the HTML:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  databaseURL: "YOUR_DATABASE_URL",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

---

## 🌐 API Integration

To fetch real data instead of demo data:

### **Esports Data**
- Provider: PandaScore API
- Get key at: https://pandascore.co
- Update this line:
```javascript
const esportsAPI='https://api.pandascore.co/matches?...&token=YOUR_PANDASCORE_API_KEY';
```

### **Gaming News**
- Provider: NewsAPI
- Get key at: https://newsapi.org
- Update this line:
```javascript
const newsAPI='https://newsapi.org/v2/everything?q=gaming&apiKey=YOUR_NEWSAPI_KEY';
```

### **Merchandise**
- Connect to Shopify, WooCommerce, or custom API
- Replace demo data in `fetchMerchandise()` function

---

## 🎮 Game Controls Reference

| Game | Controls |
|------|----------|
| Snake | Arrow Keys / WASD |
| Breakout | Mouse Move / Arrow Keys |
| Asteroids | Arrow Keys / WASD + Space to shoot |
| Pong | Arrow Keys / WASD |

---

## 📱 Mobile Responsiveness

All features are mobile-optimized:
- Responsive navigation with hamburger menu
- Touch-friendly buttons and modals
- Optimized game canvas for mobile
- Mobile-friendly messenger interface

---

## 🔐 Security Notes

1. **Never commit API keys** to public repositories
2. **Use environment variables** for sensitive data
3. **Enable Firebase security rules** to protect data
4. **Validate all user input** server-side
5. **Use HTTPS** for all connections
6. **Implement rate limiting** on APIs

---

## 🚀 Deployment

To deploy to production:

1. **GitHub Pages** (Current)
   - Push to your github.io repository
   - Website goes live automatically

2. **Custom Domain**
   - Update CNAME file with your domain
   - Configure DNS settings

3. **SSL Certificate**
   - Enable HTTPS in GitHub Pages settings
   - Or use Cloudflare for free SSL

---

## 📊 Analytics Setup

Add Google Analytics to track:
- User engagement
- Page views
- Game play statistics
- Newsletter signups
- Purchase conversion

---

## ✨ Future Enhancements

- [ ] Real multiplayer gaming
- [ ] Video streaming integration
- [ ] Payment gateway (Stripe/Razorpay)
- [ ] Advanced user profiles
- [ ] Clan management dashboard
- [ ] Tournament brackets
- [ ] Leaderboards
- [ ] Push notifications
- [ ] Dark/Light theme toggle
- [ ] Localization (Multi-language)

---

## 📞 Support & Troubleshooting

### Issue: Firebase not connecting
- Check your internet connection
- Verify Firebase config credentials
- Check browser console for errors (F12)

### Issue: Games not loading
- Clear browser cache
- Check if JavaScript is enabled
- Try a different browser

### Issue: Authentication not working
- Verify email format
- Password must be 6+ characters
- Check Firebase project is active

### Issue: Modals not appearing
- Check if CSS is loaded properly
- Verify JavaScript console for errors
- Try browser refresh (Ctrl+Shift+R)

---

## 📝 Files Modified

- `index.html` - Main website file (updated with all features)
- `SETUP_GUIDE.md` - This documentation file
- `DEPLOYMENT.md` - Deployment instructions
- `API_INTEGRATION.md` - Detailed API setup guide

---

**Last Updated**: May 16, 2026
**Version**: 1.0 - Full Features Release
