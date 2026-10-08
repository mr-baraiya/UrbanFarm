const mqtt = require('mqtt');
const iotService = require('./iotService');

let client = null;

/**
 * Initialize MQTT Client & Subscriptions
 */
function initMQTT() {
  const brokerUrl = process.env.MQTT_BROKER_URL || 'mqtt://broker.emqx.io:1883';
  const options = {
    clientId: `UrbanFarmBackend_${Math.random().toString(16).substring(2, 8)}`,
    clean: true,
    connectTimeout: 4000,
    reconnectPeriod: 10000,
  };

  if (process.env.MQTT_USERNAME) {
    options.username = process.env.MQTT_USERNAME;
  }
  if (process.env.MQTT_PASSWORD) {
    options.password = process.env.MQTT_PASSWORD;
  }

  console.log(`📡 Connecting to MQTT Broker at ${brokerUrl}...`);

  try {
    client = mqtt.connect(brokerUrl, options);

    client.on('connect', () => {
      console.log('✅ MQTT Broker Connected Successfully');
      const topic = 'urbanfarm/+/sensors';
      client.subscribe(topic, (err) => {
        if (!err) {
          console.log(`📡 Subscribed to MQTT topic pattern: ${topic}`);
        } else {
          console.error('❌ MQTT Subscription Error:', err.message);
        }
      });
      // Also subscribe to root topic for default simulator
      client.subscribe('urbanfarm/sensors');
    });

    client.on('message', async (topic, message) => {
      try {
        const payloadStr = message.toString();
        // console.log(`📥 MQTT Message received on [${topic}]:`, payloadStr);
        const data = JSON.parse(payloadStr);
        await iotService.processSensorReading(data);
      } catch (err) {
        console.warn('⚠️ Invalid MQTT JSON payload on topic', topic, err.message);
      }
    });

    client.on('error', (err) => {
      console.warn('⚠️ MQTT Connection Error:', err.message);
    });

    client.on('offline', () => {
      console.log('⚠️ MQTT Client currently offline');
    });

    // Periodic check for offline devices (every 1 minute)
    setInterval(() => {
      iotService.checkDeviceStatus();
    }, 60000);

  } catch (err) {
    console.error('❌ Failed to initialize MQTT client:', err.message);
  }
}

/**
 * Publish message to MQTT topic (used by Admin simulator or remote controls)
 */
function publishMessage(topic, payload) {
  if (client && client.connected) {
    const message = typeof payload === 'object' ? JSON.stringify(payload) : String(payload);
    client.publish(topic, message);
    return true;
  } else {
    // If MQTT broker client is not connected, process reading directly in IoT service for demo reliability
    if (typeof payload === 'object') {
      iotService.processSensorReading(payload);
    }
    return false;
  }
}

module.exports = {
  initMQTT,
  publishMessage,
};
