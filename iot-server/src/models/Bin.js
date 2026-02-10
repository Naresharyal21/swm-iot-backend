const mongoose = require('mongoose');

/**
 * Web-server Bin model (latest state / digital twin)
 *
 * This IoT server connects to the SAME MongoDB Atlas database as your web server.
 * We point this model to the same collection: "bins".
 *
 * Notes:
 * - `binId` (String) is your business identifier (e.g., "BIN-002").
 * - MongoDB `_id` is the ObjectId used by your Telemetry model ref.
 */

const BinSchema = new mongoose.Schema(
  {
    binId: { type: String, required: true, unique: true, trim: true, index: true },
    householdId: { type: mongoose.Schema.Types.ObjectId, ref: 'Household', required: true, index: true },
    virtualBinId: { type: mongoose.Schema.Types.ObjectId, ref: 'VirtualBin', default: null, index: true },
    fillPercent: { type: Number, required: true, min: 0, max: 100 },
    batteryPercent: { type: Number, default: null, min: 0, max: 100 },
    batteryState: { type: String, default: 'OK' },
    isOffline: { type: Boolean, default: false },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true }, // [lng, lat]
    },
    status: { type: String, default: 'INACTIVE' },

    // Recommended for offline detection / QA. Safe even if your web server hasn't added it yet.
    lastTelemetryAt: { type: Date, default: null, index: true },
  },
  { timestamps: true, collection: 'bins' }
);

BinSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Bin', BinSchema);
