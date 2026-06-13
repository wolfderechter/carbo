# carbo

<pre>
carbo/
├── <a href="./README.md">README.md</a>
├── <a href="./pkgs">packages</a>
│   ├── <a href="./pkgs/firmware">firmware</a>: ESP32 firmware for reading CO2/Temp/Humidity data using the SCD41 sensor.
│   ├── <a href="./pkgs/backend">backend</a>: NodeJS backend connecting with influxdb database and homeassistant.
</pre>

## Architecture
![image](https://github.com/user-attachments/assets/028a8e3d-0414-4822-a578-994aa17a99ec)
### InfluxDB dashboard
![image](https://github.com/user-attachments/assets/717fd635-c727-490f-b165-8b0cb1f59a1b)


## Requirements

- ESP32
- SCD41 sensor (SCD40 sensors should also work but is untested)
- Lcd or E-Ink display

## Practical

This project allows to create your own CO2 monitor (and temperature and humidty) using an ESP32 with the SCD41 sensor. The backend is a small nodejs (bun) project that will receive the sensor readings and store them in an influxdb database. And optionally it will also integrate with homeassistant.

The device will send and store the sensor readings by using the MAC address of the ESP32, acting as a unique identifier. Which allows us to connect multiple sensors and connect them to the same backend.

## Wiring

### SCD41

| SCD41 PIN | ESP32 GPIO |
| --------- | ---------- |
| GND       | GND        |
| VDD       | 3V3        |
| SCL       | (D)22      |
| SDA       | (D)21      |

### LCD Display

| Pin       | ESP32 GPIO |
| --------- | ---------- |
| BLK       | n/a        |
| RST (RES) | (D)4       |
| DC        | (D)2       |
| CS        | GND        |
| SDA       | (D)23      |
| SCL       | (D)18      |
| GND       | GND        |
| VCC       | 3V3        |

### E-Ink Display

| Pin            | ESP32 GPIO |
| -------------- | ---------- |
| BUSY GPIO      | 4          |
| RST (RES) GPIO | 16         |
| DC GPIO        | 17         |
| CS GPIO        | 5          |
| SCL (CLK) GPIO | 18         |
| SDA (DIN) GPIO | 23         |
| GND            | GND        |
| VCC            | 3V3        |

## Getting started

### firmware

1. Make sure you have installed platformio with `brew install platformio` or [another install method](https://docs.platformio.org/en/latest/core/installation/methods/index.html).
2. Setup the wifi credentials for the ESP32 by updating the SSID credentials in the `Secrets.h` file.
3. In the `pkgs/firmware` directory, run `pio run -t upload` to upload the firmware to your ESP32. You can monitor the ESP32 with `pio device monitor`.

### backend

1. Set up the `.env` file based on `.env.example`, make sure to update the password and token variables:
  - To enable homeassistant integration, set the url and token variable
2. Run `docker compose up -d`
3. Visit influxdb on `http://localhost:4451`
