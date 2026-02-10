const mongoose = require('mongoose');

/**
 * Telemetry history (time-series)
 *
 * Matches your web-server telemetry model shape:
 *   - binId: ObjectId ref 'Bin' (this is Bin._id)
 *   - ts: timestamp of reading
 *   - fillPercent, batteryPercent
 *
 * Collection name:
 *   Your web server uses `mongoose.model('Telemetry', ...)` without overriding
 *   collection, so Mongo collection becomes `telemetries`.
 */

const TelemetrySchema = new mongoose.Schema(
  {
    binId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bin', required: true, index: true },
    ts: { type: Date, required: true },
    fillPercent: { type: Number, required: true, min: 0, max: 100 },
    batteryPercent: { type: Number, default: null, min: 0, max: 100 },
  },
  { timestamps: true, collection: 'telemetries' }
);

TelemetrySchema.index({ binId: 1, ts: 1 }, { unique: true });

module.exports = mongoose.model('Telemetry', TelemetrySchema);
