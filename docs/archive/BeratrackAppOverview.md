# Beratrack App Technical Overview

## Current Infrastructure

### Firebase Project Structure
- **Project Name**: Pickaxe Dashboard
- **Project ID**: pickaxe-dashboard
- **Database URL**: https://pickaxe-dashboard-bera.firebaseio.com
- **Region**: us-central1

### Firebase Services in Use
1. **Realtime Database**
   - Used for: Real-time data synchronization
   - Rules Location: `database.rules.json`
   - Current Rules: Allow all read/write (temporary for testing)
   ```json
   {
     "rules": {
       ".read": true,
       ".write": true
     }
   }
   ```

2. **Cloud Functions**
   - Runtime: Node.js 18 (2nd Gen)
   - Location: `/functions` directory
   - Current Active Functions:
     - `backfillChannelData`: Processes historical channel data
   - Deployment Command:
     ```bash
     cd functions && firebase deploy --only functions:functionName
     ```

3. **Firestore**
   - Used for: Structured data storage
   - Collections: TBD

### BigQuery Integration
- **Dataset**: discord_berachain_analytics
- **Tables**:
  - `daily_channel_analytics`: Contains daily Discord channel metrics
  - Schema includes: date, channel_id, total_messages, etc.

## Development Environment

### Local Setup
1. **Environment Variables** (`.env.local`):
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
   NEXT_PUBLIC_FIREBASE_DATABASE_URL=
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
   NEXT_PUBLIC_FIREBASE_APP_ID=
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=
   ```

2. **Firebase Configuration**
   - Location: `src/lib/firebase/config.ts`
   - Exports:
     - `app`: Firebase app instance
     - `db`: Firestore instance
     - `rtdb`: Realtime Database instance

### Testing Firebase Connection
- Test endpoint: `http://localhost:3000/test`
- Test file: `src/lib/firebase/test.ts`
- Validates: Realtime Database write operations

## Deployment Process

### Firebase Functions
1. Navigate to functions directory:
   ```bash
   cd functions
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Deploy specific function:
   ```bash
   firebase deploy --only functions:functionName
   ```

4. Deploy all functions:
   ```bash
   firebase deploy --only functions
   ```

### Database Rules
1. Update rules in `database.rules.json`
2. Deploy rules:
   ```bash
   firebase deploy --only database
   ```

## Adding New Functions

1. Create function in `functions/src/index.ts`:
   ```typescript
   export const newFunction = functions.https.onRequest(async (req, res) => {
     // Function logic
   });
   ```

2. Test locally (optional):
   ```bash
   firebase emulators:start --only functions
   ```

3. Deploy:
   ```bash
   firebase deploy --only functions:newFunction
   ```

## Common Issues & Solutions

1. **PERMISSION_DENIED Error**
   - Check Firebase Console for database rules
   - Verify authentication state
   - Confirm database URL matches project

2. **Firebase Emulator Issues**
   - Web framework error can be ignored for our setup
   - Use `--only` flag to start specific emulators:
     ```bash
     firebase emulators:start --only auth,functions,firestore
     ```

## Future Considerations

1. **Security**
   - Implement proper database rules
   - Set up authentication
   - Add IP restrictions if needed

2. **Analytics Integration**
   - Set up automated data collection
   - Implement real-time analytics updates
   - Create scheduled tasks for data processing

3. **Monitoring**
   - Add error tracking
   - Set up performance monitoring
   - Implement logging system

## Updating This Document

Please update this document when making significant changes to:
- Firebase configuration
- Function deployments
- Security rules
- Database schema
- Integration points
