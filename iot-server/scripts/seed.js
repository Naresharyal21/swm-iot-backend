// scripts/seed.js
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

const Device = require("../src/models/Device");
const Bin = require("../src/models/Bin");

function pad4(n) {
  return String(n).padStart(4, "0");
}

async function main() {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error("Missing MONGO_URI in .env");

  await mongoose.connect(uri);
  console.log("✅ Connected. DB =", mongoose.connection.name);

  const COUNT = Number(process.env.SEED_COUNT || 100);
  const DEV_PREFIX = process.env.SEED_DEV_PREFIX || "DEV-KTM-";
  const KEY_PREFIX = process.env.SEED_KEY_PREFIX || "key-";

  const wipe = String(process.env.SEED_WIPE || "false").toLowerCase() === "true";
  if (wipe) {
    const devRegex = new RegExp(`^${DEV_PREFIX}`);
    const delDev = await Device.deleteMany({ deviceId: devRegex });
    console.log("🧹 Wiped devices:", delDev.deletedCount);
  }

  // ✅ Only ACTIVE bins are used for emulation
  const activeBins = await Bin.find({ status: { $in: ["ACTIVE", "active"] } })
    .select("binId status")
    .limit(COUNT)
    .lean();

  if (!activeBins.length) {
    throw new Error(
      `No ACTIVE bins found in "${Bin.collection.name}". Set bin.status="ACTIVE" for bins you want to emulate, then run seed again.`
    );
  }

  console.log(`✅ Found ${activeBins.length} ACTIVE bins in "${Bin.collection.name}" (seeding devices for them)`);

  // Create devices linked to bins (binCode = bin.binId)
  const devicesToInsert = [];
  for (let i = 1; i <= activeBins.length; i++) {
    const n = pad4(i);
    const bin = activeBins[i - 1];
    devicesToInsert.push({
      deviceId: `${DEV_PREFIX}${n}`,
      deviceKey: `${KEY_PREFIX}${n}`,
      binCode: bin.binId,
      isActive: true,
    });
  }

  const devices = await Device.insertMany(devicesToInsert, { ordered: true });
  console.log(`✅ Inserted ${devices.length} devices into "${Device.collection.name}"`);

  // Write devices.json for emulator use
  const outPath = path.join(__dirname, "..", "devices.json");
  fs.writeFileSync(
    outPath,
    JSON.stringify(
      devicesToInsert.map((d) => ({ deviceId: d.deviceId, deviceKey: d.deviceKey, binCode: d.binCode })),
      null,
      2
    )
  );
  console.log("📝 Wrote", outPath);

  await mongoose.disconnect();
  console.log("✅ Done");
}

main().catch((e) => {
  console.error("❌ Seed failed:", e);
  process.exit(1);
});
