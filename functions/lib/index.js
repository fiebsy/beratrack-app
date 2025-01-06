"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.manualQualityScoresUpdateV2 = exports.scheduledQualityScoresUpdateV2 = exports.manualRoleStatsUpdateV2 = exports.scheduledRoleStatsUpdateV2 = exports.manualRolesUpdateV2 = exports.scheduledRolesUpdateV2 = void 0;
const v2_1 = require("firebase-functions/v2");
const admin = require("firebase-admin");
const discord_roles_1 = require("./berachain/roles/discord-roles");
Object.defineProperty(exports, "scheduledRolesUpdateV2", { enumerable: true, get: function () { return discord_roles_1.scheduledRolesUpdateV2; } });
Object.defineProperty(exports, "manualRolesUpdateV2", { enumerable: true, get: function () { return discord_roles_1.manualRolesUpdateV2; } });
const activity_stats_1 = require("./berachain/roles/activity-stats");
Object.defineProperty(exports, "scheduledRoleStatsUpdateV2", { enumerable: true, get: function () { return activity_stats_1.scheduledRoleStatsUpdateV2; } });
Object.defineProperty(exports, "manualRoleStatsUpdateV2", { enumerable: true, get: function () { return activity_stats_1.manualRoleStatsUpdateV2; } });
const quality_scores_1 = require("./berachain/roles/quality-scores");
Object.defineProperty(exports, "scheduledQualityScoresUpdateV2", { enumerable: true, get: function () { return quality_scores_1.scheduledQualityScoresUpdateV2; } });
Object.defineProperty(exports, "manualQualityScoresUpdateV2", { enumerable: true, get: function () { return quality_scores_1.manualQualityScoresUpdateV2; } });
// Set global options
(0, v2_1.setGlobalOptions)({
    maxInstances: 10,
    memory: "256MiB",
    timeoutSeconds: 60,
    minInstances: 0
});
// Initialize Firebase Admin
admin.initializeApp();
//# sourceMappingURL=index.js.map