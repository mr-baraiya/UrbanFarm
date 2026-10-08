/*
  UrbanFarm IoT Virtual Sensor Node
  Wokwi ESP32

  Sensors:
  - DHT22          -> Temperature + Humidity
  - Potentiometer  -> Soil Moisture (GPIO 34)
  - Photoresistor  -> Light Intensity (GPIO 35)

  MQTT Topic:
  urbanfarm/tomato-01/sensors
*/

#include <WiFi.h>
#include <PubSubClient.h>
#include <DHT.h>

// ============================================================
// Configuration
// ============================================================

// Wi-Fi - Wokwi
const char* WIFI_SSID = "Wokwi-GUEST";
const char* WIFI_PASSWORD = "";

// MQTT
const char* MQTT_SERVER = "broker.emqx.io";
const uint16_t MQTT_PORT = 1883;
const char* MQTT_TOPIC = "urbanfarm/tomato-01/sensors";

// Device / Plant
const char* DEVICE_ID = "ESP32-TOMATO-01";
const char* PLANT_ID = "tomato-01";

// ============================================================
// Sensor Configuration
// ============================================================

#define DHT_PIN 15
#define DHT_TYPE DHT22

#define SOIL_PIN 34
#define LDR_PIN 35

DHT dht(DHT_PIN, DHT_TYPE);

WiFiClient wifiClient;
PubSubClient mqttClient(wifiClient);

// ============================================================
// Timing
// ============================================================

const unsigned long SENSOR_INTERVAL = 5000;
unsigned long lastSensorUpdate = 0;

// ============================================================
// Wi-Fi
// ============================================================

void connectWiFi() {
  Serial.println();
  Serial.print("Connecting to Wi-Fi: ");
  Serial.println(WIFI_SSID);

  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println();
  Serial.println("Wi-Fi connected successfully!");

  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());
}

// ============================================================
// MQTT
// ============================================================

void connectMQTT() {

  while (!mqttClient.connected()) {

    Serial.print("Connecting to MQTT: ");
    Serial.print(MQTT_SERVER);
    Serial.print(":");
    Serial.print(MQTT_PORT);
    Serial.print(" ... ");

    // Unique MQTT client ID
    String clientId = DEVICE_ID;
    clientId += "-";
    clientId += String((uint32_t)ESP.getEfuseMac(), HEX);

    if (mqttClient.connect(clientId.c_str())) {

      Serial.println("CONNECTED!");

      Serial.print("MQTT Topic: ");
      Serial.println(MQTT_TOPIC);

    } else {

      Serial.print("FAILED, rc=");
      Serial.println(mqttClient.state());

      Serial.println("Retrying in 5 seconds...");
      delay(5000);
    }
  }
}

// ============================================================
// Soil Moisture
// ============================================================

float readSoilMoisture() {

  int rawValue = analogRead(SOIL_PIN);

  // Convert ADC 0-4095 → 0-100%
  float moisture = (rawValue / 4095.0f) * 100.0f;

  moisture = constrain(moisture, 0.0f, 100.0f);

  return moisture;
}

// ============================================================
// Light
// ============================================================

float readLightLevel() {

  int rawValue = analogRead(LDR_PIN);

  // Approximate 0-4095 ADC → 0-1500 lux
  float lux = (rawValue / 4095.0f) * 1500.0f;

  lux = constrain(lux, 0.0f, 1500.0f);

  return lux;
}

// ============================================================
// Publish Sensor Data
// ============================================================

void publishSensorData() {

  // -----------------------------
  // Read DHT22
  // -----------------------------

  float temperature = dht.readTemperature();
  float humidity = dht.readHumidity();

  // Prevent invalid DHT readings
  if (isnan(temperature)) {
    temperature = 26.5f;
  }

  if (isnan(humidity)) {
    humidity = 60.0f;
  }

  // -----------------------------
  // Read Soil
  // -----------------------------

  float soilMoisture = readSoilMoisture();

  // -----------------------------
  // Read Light
  // -----------------------------

  float lightLux = readLightLevel();

  // -----------------------------
  // Create JSON
  // -----------------------------

  String payload = "{";

  payload += "\"deviceId\":\"";
  payload += DEVICE_ID;
  payload += "\",";

  payload += "\"plantId\":\"";
  payload += PLANT_ID;
  payload += "\",";

  payload += "\"temperature\":";
  payload += String(temperature, 1);
  payload += ",";

  payload += "\"humidity\":";
  payload += String(humidity, 1);
  payload += ",";

  payload += "\"soilMoisture\":";
  payload += String(soilMoisture, 1);
  payload += ",";

  payload += "\"light\":";
  payload += String(lightLux, 0);

  payload += "}";

  // -----------------------------
  // Serial Output
  // -----------------------------

  Serial.println();
  Serial.println("================================");

  Serial.println("UrbanFarm IoT Telemetry");

  Serial.print("Device: ");
  Serial.println(DEVICE_ID);

  Serial.print("Plant: ");
  Serial.println(PLANT_ID);

  Serial.print("Temperature: ");
  Serial.print(temperature, 1);
  Serial.println(" °C");

  Serial.print("Humidity: ");
  Serial.print(humidity, 1);
  Serial.println(" %");

  Serial.print("Soil Moisture: ");
  Serial.print(soilMoisture, 1);
  Serial.println(" %");

  Serial.print("Light: ");
  Serial.print(lightLux, 0);
  Serial.println(" lux");

  Serial.print("MQTT Payload: ");
  Serial.println(payload);

  // -----------------------------
  // Publish
  // -----------------------------

  if (mqttClient.publish(MQTT_TOPIC, payload.c_str())) {

    Serial.println("✓ MQTT publish successful");

  } else {

    Serial.println("✗ MQTT publish failed");
  }

  Serial.println("================================");
}

// ============================================================
// Setup
// ============================================================

void setup() {

  Serial.begin(115200);

  delay(1000);

  Serial.println();
  Serial.println("================================");
  Serial.println("UrbanFarm IoT Sensor Node");
  Serial.println("Wokwi ESP32 Simulator");
  Serial.println("================================");

  // Sensor initialization
  dht.begin();

  pinMode(SOIL_PIN, INPUT);
  pinMode(LDR_PIN, INPUT);

  // Wi-Fi
  connectWiFi();

  // MQTT
  mqttClient.setServer(MQTT_SERVER, MQTT_PORT);

  connectMQTT();

  Serial.println();
  Serial.println("IoT sensor node is ready!");
}

// ============================================================
// Main Loop
// ============================================================

void loop() {

  // -----------------------------
  // Wi-Fi reconnect
  // -----------------------------

  if (WiFi.status() != WL_CONNECTED) {
    connectWiFi();
  }

  // -----------------------------
  // MQTT reconnect
  // -----------------------------

  if (!mqttClient.connected()) {
    connectMQTT();
  }

  mqttClient.loop();

  // -----------------------------
  // Sensor update
  // -----------------------------

  unsigned long currentMillis = millis();

  if (currentMillis - lastSensorUpdate >= SENSOR_INTERVAL) {

    lastSensorUpdate = currentMillis;

    publishSensorData();
  }
}