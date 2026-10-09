/*
============================================================
UrbanFarm IoT Virtual Sensor Node
Wokwi ESP32 + EMQX Cloud (MQTT over TLS)
============================================================

Sensors:
- DHT22          -> Temperature + Humidity
- Potentiometer  -> Soil Moisture (GPIO 34)
- Photoresistor  -> Light Intensity (GPIO 35)

EMQX Cloud:
- Broker: f2a22faf.ala.asia-southeast1.emqxsl.com
- Port: 8883 (MQTT over TLS)
- Topic: urbanfarm/tomato-01/sensors

Device:
- Device ID: ESP32-TOMATO-01
- Plant ID: tomato-01

IMPORTANT:
- Replace MQTT_PASSWORD with your current EMQX device password.
- Do NOT commit the real password to GitHub.
- The CA certificate below is the EMQX CA certificate supplied for this deployment.
============================================================
*/

#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <PubSubClient.h>
#include <DHT.h>
#include <time.h>

// ============================================================
// Wi-Fi Configuration
// ============================================================

const char* WIFI_SSID = "Wokwi-GUEST";
const char* WIFI_PASSWORD = "";

// ============================================================
// EMQX Cloud MQTT Configuration
// ============================================================

const char* MQTT_SERVER = "f2a22faf.ala.asia-southeast1.emqxsl.com";
const uint16_t MQTT_PORT = 8883;

const char* MQTT_USERNAME = "urbanfarm_device_01";
const char* MQTT_PASSWORD = "urbanfarm@123";

const char* MQTT_TOPIC = "urbanfarm/tomato-01/sensors";

// ============================================================
// EMQX CA Certificate
// ============================================================

static const char* EMQX_ROOT_CA = R"EOF(
-----BEGIN CERTIFICATE-----
MIIDjjCCAnagAwIBAgIQAzrx5qcRqaC7KGSxHQn65TANBgkqhkiG9w0BAQsFADBh
MQswCQYDVQQGEwJVUzEVMBMGA1UEChMMRGlnaUNlcnQgSW5jMRkwFwYDVQQLExB3
d3cuZGlnaWNlcnQuY29tMSAwHgYDVQQDExdEaWdpQ2VydCBHbG9iYWwgUm9vdCBH
MjAeFw0xMzA4MDExMjAwMDBaFw0zODAxMTUxMjAwMDBaMGExCzAJBgNVBAYTAlVT
MRUwEwYDVQQKEwxEaWdpQ2VydCBJbmMxGTAXBgNVBAsTEHd3dy5kaWdpY2VydC5j
b20xIDAeBgNVBAMTF0RpZ2lDZXJ0IEdsb2JhbCBSb290IEcyMIIBIjANBgkqhkiG
9w0BAQEFAAOCAQ8AMIIBCgKCAQEAuzfNNNx7a8myaJCtSnX/RrohCgiN9RlUyfuI
2/Ou8jqJkTx65qsGGmvPrC3oXgkkRLpimn7Wo6h+4FR1IAWsULecYxpsMNzaHxmx
1x7e/dfgy5SDN67sH0NO3Xss0r0upS/kqbitOtSZpLYl6ZtrAGCSYP9PIUkY92eQ
q2EGnI/yuum06ZIya7XzV+hdG82MHauVBJVJ8zUtluNJbd134/tJS7SsVQepj5Wz
tCO7TG1F8PapspUwtP1MVYwnSlcUfIKdzXOS0xZKBgyMUNGPHgm+F6HmIcr9g+UQ
vIOlCsRnKPZzFBQ9RnbDhxSJITRNrw9FDKZJobq7nMWxM4MphQIDAQABo0IwQDAP
BgNVHRMBAf8EBTADAQH/MA4GA1UdDwEB/wQEAwIBhjAdBgNVHQ4EFgQUTiJUIBiV
5uNu5g/6+rkS7QYXjzkwDQYJKoZIhvcNAQELBQADggEBAGBnKJRvDkhj6zHd6mcY
1Yl9PMWLSn/pvtsrF9+wX3N3KjITOYFnQoQj8kVnNeyIv/iPsGEMNKSuIEyExtv4
NeF22d+mQrvHRAiGfzZ0JFrabA0UWTW98kndth/Jsw1HKj2ZL7tcu7XUIOGZX1NG
Fdtom/DzMNU+MeKNhJ7jitralj41E6Vf8PlwUHBHQRFXGU7Aj64GxJUTFy8bJZ91
8rGOmaFvE7FBcf6IKshPECBV1/MUReXgRPTqh5Uykw7+U0b6LJ3/iyK5S9kJRaTe
pLiaWN0bfVKfjllDiIGknibVb63dDcY3fe0Dkhvld1927jyNxF1WW6LZZm6zNTfl
MrY=
-----END CERTIFICATE-----
)EOF";

// ============================================================
// Device / Plant Configuration
// ============================================================

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

// ============================================================
// Network Clients
// ============================================================

WiFiClientSecure wifiClient;
PubSubClient mqttClient(wifiClient);

// ============================================================
// Timing
// ============================================================

const unsigned long SENSOR_INTERVAL = 5000;
unsigned long lastSensorUpdate = 0;

// ============================================================
// Connect to Wi-Fi
// ============================================================

void connectWiFi() {
  Serial.println();
  Serial.println("================================");
  Serial.println("Wi-Fi Connection");
  Serial.println("================================");

  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println();
  Serial.println("✓ Wi-Fi connected");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());
}

// ============================================================
// Synchronize time for TLS certificate validation
// ============================================================

void syncTime() {
  Serial.println();
  Serial.println("Synchronizing time for TLS...");

  configTime(0, 0, "pool.ntp.org", "time.nist.gov");

  time_t now = time(nullptr);
  unsigned long start = millis();

  while (now < 1700000000 && millis() - start < 20000) {
    delay(500);
    Serial.print(".");
    now = time(nullptr);
  }

  Serial.println();

  if (now >= 1700000000) {
    Serial.println("✓ Time synchronized");
  } else {
    Serial.println("⚠ Time synchronization timed out");
    Serial.println("TLS may fail if the system time is invalid.");
  }
}

// ============================================================
// Generate Unique MQTT Client ID
// ============================================================

String generateClientId() {
  String clientId = DEVICE_ID;
  clientId += "-";
  clientId += String((uint32_t)ESP.getEfuseMac(), HEX);
  return clientId;
}

// ============================================================
// Connect to MQTT Broker
// ============================================================

void connectMQTT() {
  while (!mqttClient.connected()) {
    Serial.println();
    Serial.println("================================");
    Serial.println("MQTT TLS Connection");
    Serial.println("================================");

    Serial.print("Broker: ");
    Serial.println(MQTT_SERVER);

    Serial.print("Port: ");
    Serial.println(MQTT_PORT);

    String clientId = generateClientId();

    Serial.print("Client ID: ");
    Serial.println(clientId);

    Serial.print("Username: ");
    Serial.println(MQTT_USERNAME);

    Serial.println("Connecting...");

    if (mqttClient.connect(clientId.c_str(), MQTT_USERNAME, MQTT_PASSWORD)) {
      Serial.println("✓ MQTT connected successfully");
      Serial.print("Publishing Topic: ");
      Serial.println(MQTT_TOPIC);
    } else {
      Serial.print("✗ MQTT connection failed | Error Code: ");
      Serial.println(mqttClient.state());
      Serial.println("Retrying in 5 seconds...");
      delay(5000);
    }
  }
}

// ============================================================
// Read Soil Moisture
// ============================================================

float readSoilMoisture() {
  int rawValue = analogRead(SOIL_PIN);

  float moisture = (rawValue / 4095.0f) * 100.0f;

  moisture = constrain(moisture, 0.0f, 100.0f);

  return moisture;
}

// ============================================================
// Read Light Level
// ============================================================

float readLightLevel() {
  int rawValue = analogRead(LDR_PIN);

  float lux = (rawValue / 4095.0f) * 1500.0f;

  lux = constrain(lux, 0.0f, 1500.0f);

  return lux;
}

// ============================================================
// Create and Publish Sensor Data
// ============================================================

void publishSensorData() {
  float temperature = dht.readTemperature();
  float humidity = dht.readHumidity();

  if (isnan(temperature)) {
    temperature = 26.5f;
  }

  if (isnan(humidity)) {
    humidity = 60.0f;
  }

  float soilMoisture = readSoilMoisture();
  float lightLux = readLightLevel();

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

  Serial.println();
  Serial.println("================================");
  Serial.println("UrbanFarm IoT Telemetry");
  Serial.println("================================");

  Serial.print("Device ID      : ");
  Serial.println(DEVICE_ID);

  Serial.print("Plant ID       : ");
  Serial.println(PLANT_ID);

  Serial.print("Temperature    : ");
  Serial.print(temperature, 1);
  Serial.println(" °C");

  Serial.print("Humidity       : ");
  Serial.print(humidity, 1);
  Serial.println(" %");

  Serial.print("Soil Moisture  : ");
  Serial.print(soilMoisture, 1);
  Serial.println(" %");

  Serial.print("Light          : ");
  Serial.print(lightLux, 0);
  Serial.println(" lux");

  Serial.print("MQTT Topic     : ");
  Serial.println(MQTT_TOPIC);

  Serial.print("MQTT Payload   : ");
  Serial.println(payload);

  bool published = mqttClient.publish(MQTT_TOPIC, payload.c_str());

  if (published) {
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
  Serial.println("      UrbanFarm IoT Node");
  Serial.println("      Wokwi ESP32 Sensor");
  Serial.println("================================");

  Serial.print("Device: ");
  Serial.println(DEVICE_ID);

  Serial.print("Plant: ");
  Serial.println(PLANT_ID);

  dht.begin();
  pinMode(SOIL_PIN, INPUT);
  pinMode(LDR_PIN, INPUT);

  Serial.println("✓ Sensors initialized");

  connectWiFi();

  // Required for validating the EMQX TLS certificate.
  syncTime();

  // Load EMQX CA certificate.
  wifiClient.setCACert(EMQX_ROOT_CA);

  mqttClient.setServer(MQTT_SERVER, MQTT_PORT);
  mqttClient.setKeepAlive(60);

  connectMQTT();

  Serial.println();
  Serial.println("================================");
  Serial.println("✓ IoT SENSOR NODE READY");
  Serial.println("================================");
}

// ============================================================
// Main Loop
// ============================================================

void loop() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println();
    Serial.println("⚠ Wi-Fi disconnected");
    connectWiFi();
    syncTime();
  }

  if (!mqttClient.connected()) {
    Serial.println();
    Serial.println("⚠ MQTT disconnected");
    connectMQTT();
  }

  mqttClient.loop();

  unsigned long currentMillis = millis();

  if (currentMillis - lastSensorUpdate >= SENSOR_INTERVAL) {
    lastSensorUpdate = currentMillis;
    publishSensorData();
  }
}
