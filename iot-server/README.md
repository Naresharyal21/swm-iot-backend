# IoT Server (works with your Web-Server Bin model)

This IoT server is designed to **push telemetry (fillPercent, batteryPercent)** into your **existing web-server Bin collection** (the one that stores `binId`, `status`, `fillPercent`, `batteryPercent`, `batteryState`, `isOffline`, etc.).

It authenticates devices using headers:

- `x-device-id`
- `x-device-key`

## 1) Configure

Create/modify `.env`:

- `MONGO_URI=...` *(same MongoDB as your web server)*
- `PORT=7000`
- `WEB_BINS_COLLECTION=bins` *(optional; default is `bins`)*

## 2) Seed device credentials for your existing bins

First make sure your web server already has ACTIVE bins like `BIN-001`, `BIN-002`, etc.

Then run:

```bash
npm run seed
```

This will:

1. Find up to `SEED_COUNT` ACTIVE bins in the web bins collection
2. Create matching device credentials in `iot_devices`
3. Write `devices.json` for the emulator scripts

Optional envs:

- `SEED_COUNT=100`
- `SEED_WIPE=true` (clears old seeded devices for the same prefix)
- `SEED_DEV_PREFIX=DEV-KTM-`
- `SEED_KEY_PREFIX=key-`

## 3) Run the server

```bash
npm run dev
```

Health check:

`GET http://localhost:7000/iot/health`

## 4) Send telemetry

Endpoint:

`POST http://localhost:7000/iot/telemetry`

Body:

```json
{ "fillPercent": 67, "batteryPercent": 42 }
```

Headers:

- `x-device-id: DEV-KTM-0001`
- `x-device-key: key-0001`

On every telemetry post, the server:

1. Inserts a history row into `iot_telemetries`
2. Updates your web-server bin document (by `binId`) with:
   - `fillPercent`
   - `batteryPercent`
   - `batteryState` (OK/LOW/CRITICAL derived from batteryPercent)
   - `isOffline=false`
   - `lastTelemetryAt`
