#include <Arduino.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>

// chatgpt code bruh :skull:

const int trigPin = GPIO_NUM_5;
const int echoPin = GPIO_NUM_18;
const int buttonPin = GPIO_NUM_19;


int lcdColums = 16;
int lcdRows = 2;

LiquidCrystal_I2C lcd(0x27, lcdColums, lcdRows); // Set the LCD I2C address and dimensions

void setup() {
  Serial.begin(115200);
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);
  pinMode(buttonPin, INPUT_PULLUP);
  lcd.init(); // Initialize the LCD
  lcd.backlight(); // Turn on the backlight
}

void loop() {
  if (digitalRead(buttonPin) == LOW) {
    digitalWrite(trigPin, LOW);
    delayMicroseconds(2);
    digitalWrite(trigPin, HIGH);
    delayMicroseconds(10);
    digitalWrite(trigPin, LOW);

    long duration = pulseIn(echoPin, HIGH);
    float distanceCm = duration * 0.034 / 2; // Speed of sound = 0.034 cm/µs

    Serial.print("Distance: ");
    Serial.print(distanceCm);
    Serial.println(" cm");
    lcd.clear(); // Clear the LCD
    lcd.setCursor(0, 0); // Set cursor to the first column of the first row
    lcd.print("Distance: ");
    lcd.setCursor(0, 1); // Set cursor to the first column of the second row
    lcd.print(distanceCm);
  }
}