const Device = require("../models/Device");

module.exports = async function deviceAuth(req, res, next) {
  try {
    // normalize headers (trim spaces)
    const deviceId = String(req.header("x-device-id") || "").trim();
    const deviceKey = String(req.header("x-device-key") || "").trim();

    if (!deviceId || !deviceKey) {
      return res.status(401).json({ message: "Missing x-device-id or x-device-key" });
    }

    const device = await Device.findOne({ deviceId }).lean();
    if (!device) return res.status(401).json({ message: "Unknown deviceId" });

    if (!device.isActive) {
      return res.status(403).json({ message: "Device inactive (payment not activated)" });
    }

    // constant-time compare not necessary here, but keep strict match
    if (String(device.deviceKey || "") !== deviceKey) {
      return res.status(401).json({ message: "Invalid deviceKey" });
    }

    // ensure device is linked to a bin (your telemetry route needs this)
    if (!device.binId) {
      return res.status(403).json({ message: "Device is not paired to any binId" });
    }

    // attach minimal safe device context
    req.device = {
      _id: device._id,
      deviceId: device.deviceId,
      binId: device.binId,     // ✅ what your telemetry route should use
      isActive: device.isActive,
    };

    return next();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Auth error" });
  }
};
