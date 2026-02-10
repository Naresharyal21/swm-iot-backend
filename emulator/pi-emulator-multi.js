// emulator/pi-emulator-multi.js
const fs = require("fs");
const path = require("path");

const url = "http://127.0.0.1:7000/iot/telemetry";

// ✅ Your devices.json is here:
// C:\Users\aryal\Downloads\iot-server\iot-server\devices.json
// And this file is here:
// C:\Users\aryal\Downloads\iot-server\emulator\pi-emlator-multi.js  (or similar)
//
// So from __dirname (emulator folder), go up one level -> iot-server -> iot-server -> devices.json
// ❌ But you had iot-server twice. You only need ONE "iot-server".
const devicesPath = path.join(__dirname, "..", "iot-server", "devices.json");



if (!fs.existsSync(devicesPath)) {
  console.error("❌ devices.json not found at:", devicesPath);
  console.error("✅ Expected: C:\\Users\\aryal\\Downloads\\iot-server\\iot-server\\devices.json");
  process.exit(1);
}

const devices = JSON.parse(fs.readFileSync(devicesPath, "utf8"));

function rand(min, max) {
  return Math.floor(min + Math.random() * (max - min + 1));
}

async function sendForDevice(d) {
  const fillPercent = rand(5, 98);
  const batteryPercent = rand(20, 100);

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-device-id": d.deviceId,
      "x-device-key": d.deviceKey,
    },
    body: JSON.stringify({ fillPercent, batteryPercent }),
  });

  const text = await res.text();
  console.log(new Date().toISOString(), d.deviceId, res.status, text);
}

// ✅ Round-robin: 5 devices/sec (100 devices in ~20 sec)
let idx = 0;
const perTick = 5;
const tickMs = 1000;

console.log(`✅ Loaded ${devices.length} devices from ${devicesPath}`);
console.log(`✅ Sending ${perTick} devices every ${tickMs}ms to ${url}`);

setInterval(async () => {
  const batch = [];
  for (let i = 0; i < perTick; i++) {
    batch.push(devices[idx]);
    idx = (idx + 1) % devices.length;
  }
  await Promise.allSettled(batch.map(sendForDevice));
}, tickMs);
