# Beratrack Analytics Dashboard

This project is built with Next.js 15.1.2 and Firebase, designed to track and analyze Discord engagement metrics for Berachain.

## Project Configuration

### Environment Setup

Create a `.env.local` file with the following Firebase configuration:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_DATABASE_URL=your_database_url
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### Firebase Configuration

The project uses Firebase for:
- Realtime Database: Real-time data synchronization
- Cloud Functions: Automated analytics processing
- Authentication: Secure access control
- Firestore: Structured data storage

Firebase configuration is located in `src/lib/firebase/config.ts`.

### Development Setup

1. Install dependencies:
```bash
pnpm install
cd functions && pnpm install
```

2. Start the development server:
```bash
pnpm dev
```

3. Open [http://localhost:3000](http://localhost:3000) to view the application.

## Project Structure

```
├── src/
│   ├── app/            # Next.js app router pages
│   ├── lib/
│   │   ├── firebase/   # Firebase configuration and utilities
│   │   ├── bigquery/   # BigQuery integration
│   │   └── twitter/    # Twitter integration
│   └── components/     # React components
├── functions/          # Firebase Cloud Functions
└── public/            # Static assets
```

## Firebase Functions

The project includes several Firebase functions for analytics processing:
- Channel data backfilling
- Real-time analytics updates
- Scheduled data processing

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [BigQuery Documentation](https://cloud.google.com/bigquery/docs)

## Deployment

The application can be deployed using:
- Vercel for the Next.js frontend
- Firebase CLI for Cloud Functions

```bash
# Deploy Firebase functions
cd functions && firebase deploy --only functions

# Deploy database rules
firebase deploy --only database
```
