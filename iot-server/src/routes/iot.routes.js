const express = require("express");
const deviceAuth = require("../middleware/deviceAuth");
const Telemetry = require("../models/Telemetry");
const Bin = require("../models/Bin");

const router = express.Router();

function toNum(x) {
  const n = Number(x);
  return Number.isFinite(n) ? n : null;
}

router.get("/health", (req, res) => res.json({ status: "ok" }));

router.post("/telemetry", deviceAuth, async (req, res) => {
  try {
    const { ts, fillPercent, batteryPercent } = req.body || {};
    const binCode = req.device.binCode;
    if (!binCode) return res.status(500).json({ message: "Device is not linked to a binCode" });

    // Gate: the web-server Bin must exist and be ACTIVE
    const bin = await Bin.findOne({ binId: binCode });
    if (!bin) return res.status(404).json({ message: `Linked bin not found for binId=${binCode}` });
    if (String(bin.status || "").toUpperCase() !== "ACTIVE") {
      return res.status(403).json({ message: "Bin is not ACTIVE" });
    }

    const fill = toNum(fillPercent);
    if (fill === null || fill < 0 || fill > 100) {
      return res.status(400).json({ message: "fillPercent must be 0..100" });
    }

    const batt = (batteryPercent === undefined || batteryPercent === null) ? null : toNum(batteryPercent);
    if (batt !== null && (batt < 0 || batt > 100)) {
      return res.status(400).json({ message: "batteryPercent must be null or 0..100" });
    }

    const tsDate = ts ? new Date(ts) : new Date();
    if (Number.isNaN(tsDate.getTime())) {
      return res.status(400).json({ message: "Invalid ts" });
    }

    // Persist history in Telemetry collection (binId is ObjectId ref Bin)
    await Telemetry.create({
      binId: bin._id,
      ts: tsDate,
      fillPercent: fill,
      batteryPercent: batt,
    });

    // Update latest state in Bin document
    const batteryState = batt === null ? (bin.batteryState || "OK") : batt <= 15 ? "CRITICAL" : batt <= 30 ? "LOW" : "OK";

    bin.fillPercent = fill;
    bin.batteryPercent = batt;
    bin.batteryState = batteryState;
    bin.isOffline = false;
    bin.lastTelemetryAt = tsDate;
    await bin.save();

    return res.status(201).json({ ok: true });
  } catch (err) {
    // Unique index: {binId, ts}
    if (err && err.code === 11000) return res.status(200).json({ ok: true, deduped: true });
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
