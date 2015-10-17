# City Transportation Map

Live map of public transportation vehicles in Bratislava, Slovakia.

![Screenshot](screenshot.png?raw=true "Screenshot of the City Transportation Map")

## Features

* live positions of vehicles on the map
* 3 base maps available (Standard, Transport, OpenStreetMap)
* filtering by vehicle types (trams, buses, trolleybuses)
* filtering by line number
* time of the last recorded position in the tooltip

## Installation

Before use, a config.js file must be created before first use. See the config.example.js
in public/js directory for what's required.

## TODO

* layer with bus stops
* layer with traffic data
* websockets for push messages (requires a new server)
* search for location
* ~~filter by line number~~
* line info (destination) in the tooltip
* follow vehicle
* virtual table of departures
* better arrival estimates based on traffic and historical data
* ride planner
