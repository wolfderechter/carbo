#include "EinkDisplay.h"

void EinkDisplay::begin() {
  display.init(115200, true, 2, false);
  display.setRotation(1);
  display.setFont(&FreeMonoBold9pt7b);
  display.setTextColor(GxEPD_BLACK);
}

void EinkDisplay::clear() {
  display.setFullWindow();
  display.firstPage();
  do {
    display.fillScreen(GxEPD_WHITE);
  } while (display.nextPage());
}

void EinkDisplay::drawStaticContent() {
  display.setFullWindow();
  display.firstPage();
  do {
    display.fillScreen(GxEPD_WHITE);

    display.setTextSize(1);

    // Labels only (not values)
    display.setCursor(20, 60);
    display.print("CO2 [ppm]:");

    display.setCursor(20, 110);
    display.print("Temp [°C]:");

    display.setCursor(20, 160);
    display.print("Humid [%]:");
  } while (display.nextPage());
}

void EinkDisplay::updateValues(uint16_t co2, float temperature, uint16_t humidity) {
  updateCount++;

  if (updateCount >= FULL_REFRESH_INTERVAL) {
    fullUpdate(co2, temperature, humidity);
    updateCount = 0;
  } else {
    partialUpdate(co2, temperature, humidity);
  }
}

void EinkDisplay::fullUpdate(uint16_t co2, float temperature, uint16_t humidity) {
  display.setFullWindow();
  display.firstPage();
  do {
    display.fillScreen(GxEPD_WHITE);

    display.setTextSize(1);

    // Draw labels
    display.setCursor(20, 60);
    display.print("CO2 [ppm]:");

    display.setCursor(20, 110);
    display.print("Temp [°C]:");

    display.setCursor(20, 160);
    display.print("Humid [%]:");

    // Draw values
    display.setCursor(150, 60);
    display.print(co2);

    display.setCursor(150, 110);
    display.print(temperature, 1);

    display.setCursor(150, 160);
    display.print(humidity, 1);
  } while (display.nextPage());
}

void EinkDisplay::partialUpdate(uint16_t co2, float temperature, uint16_t humidity) {
  const int valueX = 150;
  const int valueY = 40;
  const int valueWidth = 100;
  const int valueHeight = 130;

  display.setPartialWindow(valueX, valueY, valueWidth, valueHeight);
  display.firstPage();
  do {
    display.fillRect(valueX, valueY, valueWidth, valueHeight, GxEPD_WHITE);

    display.setCursor(valueX, 60);
    display.print(co2);

    display.setCursor(valueX, 110);
    display.print(temperature, 1);

    display.setCursor(valueX, 160);
    display.print(humidity, 1);
  } while (display.nextPage());

  display.powerOff();
}
