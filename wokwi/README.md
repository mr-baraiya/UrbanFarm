# UrbanFarm Wokwi ESP32 Virtual IoT Sensor

This directory contains the virtual ESP32 sensor simulation for **UrbanFarm**.

## Hardware Simulation Components
- **ESP32 DevKit V4** controller
- **DHT22** Sensor: Measures ambient Temperature (°C) and Relative Humidity (%)
- **Potentiometer**: Simulates Soil Moisture percentage (0% - 100%)
- **Photoresistor (LDR)**: Simulates Light Intensity (Lux)

## MQTT Communication
- **Broker**: `broker.emqx.io` (Port 1883)
- **Topic**: `urbanfarm/tomato-01/sensors`
- **Payload format**:
```json
{
  "deviceId": "ESP32-TOMATO-01",
  "plantId": "tomato-01",
  "temperature": 31.2,
  "humidity": 55,
  "soilMoisture": 27,
  "light": 820,
  "timestamp": "2026-10-07T10:30:00Z"
}
```

## Running in Wokwi
1. Open [wokwi.com](https://wokwi.com)
2. Create an ESP32 project and copy `sketch.ino` and `diagram.json`.
3. Click **Start Simulation**.
4. The virtual ESP32 will connect to `Wokwi-GUEST` WiFi and publish live sensor readings over MQTT to UrbanFarm backend.
