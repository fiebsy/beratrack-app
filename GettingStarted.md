# Beratrack React App - Getting Started

## Quick Setup

1. **Navigate to App**
   ```bash
   cd /Users/derickfiebiger/app-beratrack
   ```

   The app has been created with:
   - Next.js 13+ App Router
   - TypeScript
   - Tailwind CSS
   - Firebase Functions
   - All necessary dependencies

2. **Verify Setup**
   ```bash
   # Verify BigQuery
   bq show discord_berachain_analytics.daily_channel_analytics

   # Verify Firebase
   firebase projects:list
   ```

3. **Start Development**
   ```bash
   # Terminal 1: Next.js
   pnpm dev

   # Terminal 2: Firebase
   cd functions
   pnpm install
   firebase emulators:start
   ```

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── analytics/         # Analytics dashboard
│   ├── curator/          # Content curation
│   ├── automation/       # Twitter automation
│   └── settings/         # App settings
├── components/            # Shared components
├── lib/                   # Core utilities
│   ├── bigquery/        # BigQuery client
│   ├── firebase/        # Firebase config
│   └── twitter/         # Twitter integration
└── functions/            # Firebase Functions
```

## Core Features

### 1. Analytics Dashboard
- Real-time Discord analytics
- Channel activity metrics
- Engagement tracking
- Thread analysis

### 2. Content Curation
- High-engagement thread discovery
- Media content management
- Team member activity tracking
- Content export for social

### 3. Twitter Automation
- Automated posting
- Content scheduling
- Engagement tracking
- Performance analytics

## Development Guide

### BigQuery Integration
```typescript
// lib/bigquery/client.ts
import { bigquery } from './client';

export async function fetchAnalytics(date: Date) {
  const query = `
    SELECT * FROM discord_berachain_analytics.daily_channel_analytics
    WHERE date = @date
  `;
  return await bigquery.query({ query, params: { date } });
}
```

### Firebase Functions
```typescript
// functions/src/twitter.ts
import * as functions from 'firebase-functions';

export const postToTwitter = functions.pubsub
  .schedule('every 6 hours')
  .onRun(async () => {
    // Post content to Twitter
  });
```

### React Components
```typescript
// app/analytics/page.tsx
import { fetchAnalytics } from '@/lib/bigquery';

export default async function AnalyticsPage() {
  const data = await fetchAnalytics(new Date());
  return (
    <div>
      <h1>Analytics Dashboard</h1>
      {/* Your components */}
    </div>
  );
}
```

## Available Scripts

```bash
# Development
pnpm dev               # Start Next.js
pnpm build            # Production build
pnpm start            # Start production server

# Firebase
pnpm functions:dev    # Start emulators
pnpm deploy           # Deploy to production

# Testing
pnpm test            # Run tests
pnpm lint            # Run linter
```

## Deployment

1. **Vercel (Frontend)**
   ```bash
   vercel deploy
   ```

2. **Firebase (Backend)**
   ```bash
   firebase deploy --only functions
   ```

## Useful Links

- [BigQuery Schema](https://console.cloud.google.com/bigquery?project=pickaxe-dashboard)
- [Firebase Console](https://console.firebase.google.com/project/pickaxe-dashboard)
- [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)

## Common Tasks

### Adding a New Analytics Query
1. Create query in `lib/bigquery/queries.ts`
2. Add TypeScript types in `types/analytics.ts`
3. Create React component in `components/analytics/`
4. Add to dashboard in `app/analytics/page.tsx`

### Creating a New Firebase Function
1. Add function to `functions/src/`
2. Test locally with emulators
3. Deploy with `firebase deploy --only functions:yourFunction`

### Adding New UI Components
1. Create component in `components/ui/`
2. Add Storybook story if needed
3. Use Tailwind for styling
4. Add to relevant page

## Troubleshooting

### Firebase Emulators
```bash
# Reset emulator data
rm -rf .firebase/emulator-data

# Clear Firebase cache
firebase logout
firebase login
```

### BigQuery Issues
```bash
# Verify credentials
bq show discord_berachain_analytics.daily_channel_analytics

# Test query
bq query --use_legacy_sql=false 'SELECT COUNT(*) FROM discord_berachain_analytics.daily_channel_analytics'
```

### Next.js
```bash
# Clear Next.js cache
rm -rf .next
pnpm dev
```
