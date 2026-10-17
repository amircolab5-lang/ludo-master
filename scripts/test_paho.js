// Test syntax of Paho MQTT loading
const fs = require('fs');
console.log('Testing Paho MQTT existence in assets:');
const exists = fs.existsSync('app/src/main/assets/paho-mqtt.min.js');
console.log('paho-mqtt.min.js exists:', exists);
