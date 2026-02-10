const mongoose = require("mongoose");

const DeviceSchema = new mongoose.Schema(
  {
    deviceId: { type: String, required: true, unique: true, index: true },
    deviceKey: { type: String, required: true },
    /**
     * Link to your WEB SERVER bin using its business identifier (e.g. "BIN-001").
     * This avoids needing the IoT server to maintain a separate "iot_bins" collection.
     */
    binCode: { type: String, required: true, index: true },
    isActive: { type: Boolean, default: false, index: true }
  },
  { timestamps: true, collection: "iot_devices" }
);

module.exports = mongoose.model("Device", DeviceSchema);
