const Device = require("../models/Device");

module.exports = async function deviceAuth(req, res, next) {
  try {
    const deviceId = req.header("x-device-id");
    const deviceKey = req.header("x-device-key");

    if (!deviceId || !deviceKey) {
      return res.status(401).json({ message: "Missing x-device-id or x-device-key" });
    }

    const device = await Device.findOne({ deviceId }).lean();
    if (!device) return res.status(401).json({ message: "Unknown deviceId" });
    if (!device.isActive) return res.status(403).json({ message: "Device inactive (payment not activated)" });
    if (device.deviceKey !== deviceKey) return res.status(401).json({ message: "Invalid deviceKey" });

    req.device = device; // contains binId
    next();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Auth error" });
  }
};
