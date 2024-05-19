+++
title = 'Greenhouse Sensor'
date = 2024-05-19T11:35:16+02:00
draft = false
image = "img/greenhouse-sensor.jpg"
+++

This is a little project for our greenhouse. Even if we do not really need it (and I still need to make sure that the battery will be safe), this circuit uses a Raspberry Pi Pico for monitoring temperature, humidity, gas and and atmospheric pressure. The collected information is sent every 5 minutes to my Home Assistance instance via MQTT.

The Pico is powered by a rechargeable battery connected to a repurposed solar panel from the garden, but the charger module can also be connected to a phone charger. However, as the Pico goes to deep sleep when it is not running, the energy consumption is very low.

The shopping list, code and instructions can be found in my [electronics repository](https://github.com/mmartinortiz/electronics/tree/main/greenhouse).
