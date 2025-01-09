import { setGlobalOptions } from "firebase-functions/v2";
import * as admin from 'firebase-admin';
import { 
  scheduledRolesUpdateV2, 
  manualRolesUpdateV2 
} from './berachain/roles/discord-roles';
import {
  scheduledRoleStatsUpdateV2,
  manualRoleStatsUpdateV2
} from './berachain/roles/activity-stats';
import {
  scheduledQualityScoresUpdateV2,
  manualQualityScoresUpdateV2
} from './berachain/roles/quality-scores';
import {
  scheduledRoleChangeTrackerUpdateV2,
  manualRoleChangeTrackerUpdateV2
} from './berachain/roles/change-tracker';

// Set global options
setGlobalOptions({ 
  maxInstances: 10,
  memory: "256MiB",
  timeoutSeconds: 60,
  minInstances: 0
});

// Initialize Firebase Admin
admin.initializeApp();

// Export the roles functions
export {
  scheduledRolesUpdateV2,
  manualRolesUpdateV2,
  scheduledRoleStatsUpdateV2,
  manualRoleStatsUpdateV2,
  scheduledQualityScoresUpdateV2,
  manualQualityScoresUpdateV2,
  scheduledRoleChangeTrackerUpdateV2,
  manualRoleChangeTrackerUpdateV2
};
