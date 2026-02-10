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

connectDb().then(() => {
  app.listen(port, () => console.log(`✅ IoT server running on http://localhost:${port}`));
}).catch((err) => {
  console.error("❌ Failed to connect DB", err);
  process.exit(1);
});
