# GhostDaddy_Casino Integration Plan

Provide a high-quality, fully compliant, and scalable module for **GhostDaddy_Casino** on GamerDrift.com.

---

## 1. Open Source Repository & License Discovery

We researched the web and GitHub for suitable open-source code templates to guide our implementations:

| Project Name | Repository URL | License | Language & Framework | Commercial Use Permitted? |
| :--- | :--- | :--- | :--- | :--- |
| **html5-slot-machine** | [johakr/html5-slot-machine](https://github.com/johakr/html5-slot-machine) | MIT | Vanilla JS / CSS | Yes, with attribution (keep copyright notice). |
| **javascript-roulette** | [milsaware/javascript-roulette](https://github.com/milsaware/javascript-roulette) | MIT | Vanilla JS / HTML Canvas | Yes, with attribution. |
| **jacquelynmarcella/blackjack** | [jacquelynmarcella/blackjack](https://github.com/jacquelynmarcella/blackjack) | MIT | JavaScript / DOM | Yes, with attribution. |
| **HTMLPlinko** | [TrentPierce/HTMLPlinko](https://github.com/TrentPierce/HTMLPlinko) | MIT | JS / HTML5 Canvas / Physics | Yes, with attribution. |

> [!NOTE]
> All repositories use the **MIT License**, which allows commercial use, modification, distribution, and sub-licensing, provided the original copyright and license notice is included in the codebase.
> To prevent network/security risks and ensure perfect compatibility with GamerDrift's custom state management (`UserContext` / `driftCoins`), we will build clean, optimized Next.js component versions inspired by these projects.

---

## 2. Payout Balancing Engine (60% House Revenue / 40% Payout Pool)

To build a profitable, balanced casino model, we will design an **AI-driven balancing algorithm**:
- **Drift Coins** (virtual currency) are used for betting.
- **House Revenue Tracker**: Keeps track of `totalBets` and `totalWins`.
- **Dynamic Payout Adjuster (AI model)**:
  - The house target is to keep **60% of all bets** (cumulative) as revenue.
  - The maximum allowable payout pool is **40% of all cumulative bets** minus whatever has already been paid out to winners.
  - If a player wins a spin/hand/drop:
    - If the current cumulative payout ratio is **under 40%** (i.e., house holds > 60% of revenue), we allow standard high wins.
    - If the current cumulative payout ratio is **approaching or exceeding 40%** (i.e., house revenue is dropping close to 60%), the game shifts to "tight mode," where winning chances are dynamically lowered or win values are capped to ensure house holdings NEVER drop below the 60% threshold.
  - **Regular Player Retention Bias**: If a player plays regularly (i.e., spins slots/hands repeatedly), the algorithm guarantees a "pity win" when they hit a losing streak, pulling from the 40% pool to keep them engaged.

### Algorithm Spec
$$\text{House Margin} = \frac{\text{Total Bets} - \text{Total Payouts}}{\text{Total Bets}} \ge 0.60$$
$$\text{Available Pool} = (0.40 \times \text{Total Bets}) - \text{Total Payouts}$$

If a player bets $B$, and a win calculation results in payout $P$:
1. If $P > \text{Available Pool}$, cap the payout to $P = \text{Available Pool}$ (unless it's a minor return like a push in Blackjack).
2. If $\text{House Margin} < 0.60$, enforce tight/loss logic for the current turn.

---

## 3. Database Schemas (Firebase + Stripe)

We recommend the following schemas to track real money, virtual currency, and payout history.

### User Profile Collection (Firestore)
```typescript
interface UserProfile {
  username: string;
  driftCoins: number; // Virtual currency balance
  totalDepositedUSD: number; // Stripe deposits tracking
  totalWithdrawnUSD: number; // Stripe payouts tracking
  registeredAt: string;
  isVIP: boolean;
  vipTier: 'none' | 'silver' | 'gold' | 'drifter';
}
```

### Casino State Collection (Firestore / Global Document)
```typescript
interface CasinoStats {
  id: "global_telemetry";
  totalBets: number;       // Cumulative bets in Drift Coins
  totalPayouts: number;    // Cumulative payouts in Drift Coins
  totalRevenueUSD: number; // Real-money Stripe deposit logs
  houseEdgeRate: number;   // Configured default (0.60)
  lastUpdated: string;
}
```

### Leaderboard / Winners Collection (Firestore)
```typescript
interface CasinoLeader {
  username: string;
  totalWonCoins: number;
  biggestSingleWin: number;
  lastWinTimestamp: string;
}
```

### Stripe Transaction Collection (Firestore)
```typescript
interface StripeTransaction {
  id: string;
  userId: string;
  amountUSD: number;
  type: 'deposit' | 'withdrawal';
  status: 'succeeded' | 'failed' | 'pending';
  timestamp: string;
  stripePaymentIntentId?: string;
}
```

---

## 4. UI/UX Design: "GhostDaddy_Casino"

The interface will feature a dark cyberpunk style matching GamerDrift.
- **Top banner**: Glowing hacker badge and visual metrics HUD showing *Live Casino Pool*, *Total Jackpots*, and *Online Drifters*.
- **Navigation categories**: `ALL`, `SLOTS`, `CARD GAMES`, `WHEELS`, `MULTIPLIERS`.
- **Game Grid**: Game tiles styled like the Rogue Ghost cover. Each tile features an 8K poster, a glowing border that matches the game theme, active indicators, and real-time play metrics.
- **Leaderboard (Winner Board)**: Live ticker of the top 20 winners at the bottom of the page, styled as a scrolling cybernetic matrix feed.
- **Daily Challenges**: e.g., "Win 5 Blackjack rounds", "Hit a 10x multiplier in Plinko".

---

## Proposed Changes

We will modify or create the following files:

### Navigation & Header

#### [MODIFY] [Header.tsx](file:///c:/Users/Vidya/Desktop/gamerdrift.github.io/components/Header.tsx)
Add the `GhostDaddy_Casino` tab to the navigation links.

### Casino Module Pages

#### [NEW] [page.tsx](file:///c:/Users/Vidya/Desktop/gamerdrift.github.io/app/ghostdaddy-casino/page.tsx)
The main Casino hub showing available games, category filtering, user casino balance, and the Top 20 Winner Board.

#### [NEW] [slots/page.tsx](file:///c:/Users/Vidya/Desktop/gamerdrift.github.io/app/ghostdaddy-casino/slots/page.tsx)
A fully playable, interactive cyberpunk-themed slot machine with bet sizing, neon reels, custom sound effects, and house-balancing payout logic.

#### [NEW] [blackjack/page.tsx](file:///c:/Users/Vidya/Desktop/gamerdrift.github.io/app/ghostdaddy-casino/blackjack/page.tsx)
A holographic Blackjack game with hit, stand, double, split buttons, card animations, and user balancing.

#### [NEW] [roulette/page.tsx](file:///c:/Users/Vidya/Desktop/gamerdrift.github.io/app/ghostdaddy-casino/roulette/page.tsx)
A neon wheel-based Roulette game allowing inside/outside bets, interactive table selection, and spin physics.

#### [NEW] [plinko/page.tsx](file:///c:/Users/Vidya/Desktop/gamerdrift.github.io/app/ghostdaddy-casino/plinko/page.tsx)
A gravity-based physics Plinko game where balls bounce off pins to hit multiplier buckets at the bottom.

---

## Verification Plan

### Automated/Build Verification
- Run `npm run build` to verify there are no TypeScript, compilation, or routing errors.

### Manual Verification
1. Open the home page and click the `GhostDaddy_Casino` navigation tab.
2. Verify all four game tiles are rendered with the 8K generated posters and glowing borders.
3. Test placing bets, spinning reels, and card dealings.
4. Verify that coin balances are deducted on bets and added on wins.
5. Check the balancing engine logs to confirm that the house revenue remains $\ge 60\%$.
6. Check that the Top 20 Winner Board displays mock and real user wins correctly.
