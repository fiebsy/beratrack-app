import { ref, set } from 'firebase/database';
import { rtdb } from './config';

export async function testFirebaseConnection() {
  try {
    console.log('Starting Firebase test...');
    console.log('Database URL:', process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL);
    
    if (!rtdb) {
      throw new Error('Realtime Database not initialized');
    }
    
    const testRef = ref(rtdb, 'test');
    console.log('Reference created successfully');
    
    await set(testRef, {
      timestamp: new Date().toISOString(),
      message: 'Firebase Realtime Database test successful',
    });
    console.log('Test data written successfully');
    return true;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        // @ts-expect-error - Firebase error includes a code property that TypeScript doesn't know about
        code: error.code
      });
    } else {
      console.error('Unknown error:', error);
    }
    return false;
  }
} 