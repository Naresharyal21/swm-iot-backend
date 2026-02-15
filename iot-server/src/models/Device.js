const mongoose = require("mongoose");

const DeviceSchema = new mongoose.Schema(
  {
    deviceId: { type: String, required: true, unique: true, index: true },
    deviceKey: { type: String, required: true },

    /**
     * Link to WEB SERVER Bin using Bin.binId (e.g. "BIN-01").
     * Device can exist without being paired yet.
     */
    binId: { type: String, default: null, index: true },

    isActive: { type: Boolean, default: false, index: true },

    pairedAt: { type: Date, default: null },
  },
  { timestamps: true, collection: "iot_devices" }
);

// Optional: prevent multiple devices linking to the same binId
DeviceSchema.index({ binId: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model("Device", DeviceSchema);
