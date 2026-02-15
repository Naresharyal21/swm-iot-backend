require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDb = require("./db");
const iotRoutes = require("./routes/iot.routes");

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.use("/iot", iotRoutes);

const port = Number(process.env.PORT || 7000);
const LAN_IP = process.env.LAN_IP;

connectDb()
  .then(() => {
    app.listen(port, "0.0.0.0", () => {
      console.log("✅ IoT server running:");
      console.log(`   Local: http://127.0.0.1:${port}/iot/health`);
      if (LAN_IP) console.log(`   LAN:   http://${LAN_IP}:${port}/iot/health`);
    });
  })
  .catch((err) => {
    console.error("❌ Failed to connect DB", err);
    process.exit(1);
  });
