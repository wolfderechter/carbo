import { InfluxDB, Point } from "@influxdata/influxdb-client";
import { fetch } from "bun";

// Influxdb
const influxDbUrl =
  process.env.NODE_ENV === "production"
    ? "http://influxdb:8086"
    : "http://localhost:8086";
const token = process.env.DOCKER_INFLUXDB_INIT_ADMIN_TOKEN;
const org = process.env.DOCKER_INFLUXDB_INIT_ORG || "carbo";
const bucket = process.env.DOCKER_INFLUXDB_INIT_BUCKET || "carbo";
const influxdb = new InfluxDB({ url: influxDbUrl, token: token });
const writeClient = influxdb.getWriteApi(org, bucket);
// Homeassistant
const homeassistantUrl = process.env.HOMEASSISTANT_URL;
const homeassistantToken = process.env.HOMEASSISTANT_TOKEN;

interface CarboData {
  mac: string;
  data: {
    co2: number;
    temperature: number;
    humidity: number;
    timestamp: number;
  };
}

Bun.serve({
  port: 3000,
  routes: {
    "/": (req) => {
      const formatMemoryUsage = (data: any) =>
        `${Math.round((data / 1024 / 1024) * 100) / 100} MB`;
      const memoryData = process.memoryUsage();

      return new Response(
        `carbo-backend is running with ${formatMemoryUsage(memoryData.heapUsed)} MB RAM.`,
      );
    },
    "/latestReading": {
      POST: async (req) => {
        const body = (await req.json()) as CarboData;
        const { co2, temperature, humidity, timestamp } = body.data;
        const mac = body.mac;
        const influxTimestamp = new Date(timestamp * 1000);
        console.log(
          "received latest reading",
          mac,
          co2,
          temperature,
          humidity,
          timestamp,
        );

        // Write latestReading to influxdb
        const point = new Point("carbo measurement")
          .tag("device_id", mac)
          .uintField("co2", co2)
          .floatField("temperature", temperature)
          .uintField("humidity", humidity)
          .timestamp(influxTimestamp);
        writeClient.writePoint(point);
        await writeClient.flush();

        // Write latestReading to homeassistant
        if (homeassistantUrl && homeassistantToken) {
          const deviceInfo = {
            identifiers: ["carbo_monitor"],
            name: "carbo",
            model: "ESP32 CO2 monitor",
          };

          await Promise.all([
            fetch(`${homeassistantUrl}/api/states/sensor.carbo_co2`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${homeassistantToken}`,
              },
              body: JSON.stringify({
                state: co2,
                attributes: {
                  unit_of_measurement: "ppm",
                  friendly_name: "CO2 level",
                  device_class: "carbon_dioxide",
                  device: deviceInfo,
                },
              }),
            }),
            fetch(`${homeassistantUrl}/api/states/sensor.carbo_temperature`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${homeassistantToken}`,
              },
              body: JSON.stringify({
                state: temperature,
                attributes: {
                  unit_of_measurement: "°C",
                  friendly_name: "Temperature",
                  device_class: "temperature",
                  device: deviceInfo,
                },
              }),
            }),
            fetch(`${homeassistantUrl}/api/states/sensor.carbo_humidity`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${homeassistantToken}`,
              },
              body: JSON.stringify({
                state: humidity,
                attributes: {
                  unit_of_measurement: "%",
                  friendly_name: "Humidity",
                  device_class: "humidity",
                  device: deviceInfo,
                },
              }),
            }),
          ]);
        }

        return new Response("Added latestReading");
      },
    },
  },

  // Fallback if route not found
  fetch(req) {
    return new Response("Route not found", { status: 404 });
  },
});

console.log("carbo-backend is running on localhost:3000");
