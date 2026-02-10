// emulator.js
const deviceId = "DEV-KTM-0001";
const deviceKey = "testkey123";
const url = "http://localhost:7000/iot/telemetry"; // change later if server is cloud

async function sendOnce() {
  const fillPercent = Math.floor(40 + Math.random() * 50);    // 40..90
  const batteryPercent = Math.floor(30 + Math.random() * 70); // 30..100

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-device-id": deviceId,
      "x-device-key": deviceKey,
    },
    body: JSON.stringify({ fillPercent, batteryPercent }) // no ts => server uses now
  });

  const text = await res.text();
  console.log(new Date().toISOString(), res.status, text);
}

setInterval(sendOnce, 30_000);
sendOnce();
