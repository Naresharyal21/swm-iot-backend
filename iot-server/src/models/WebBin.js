const mongoose = require("mongoose");

/**
 * WEB SERVER Bin (Digital Twin / Latest State)
 *
 * Your main backend already owns the Bin schema (binId, householdId, virtualBinId,
 * fillPercent, batteryPercent, batteryState, isOffline, location, status, ...).
 *
 * The IoT server should not duplicate that schema. We use a permissive schema
 * (strict: false) and point to the same MongoDB collection as your web server.
 *
 * Configure collection name via WEB_BINS_COLLECTION in .env.
 */

const WebBinSchema = new mongoose.Schema(
  {
    binId: { type: String, index: true },
    status: { type: String, index: true }, // e.g. ACTIVE / INACTIVE
    fillPercent: { type: Number },
    batteryPercent: { type: Number, default: null },
    batteryState: { type: String },
    isOffline: { type: Boolean },
    lastTelemetryAt: { type: Date }
  },
  {
    timestamps: true,
    strict: false,
    collection: process.env.WEB_BINS_COLLECTION || "bins"
  }
);

WebBinSchema.index({ binId: 1 }, { unique: false });

module.exports = mongoose.model("WebBin", WebBinSchema);
