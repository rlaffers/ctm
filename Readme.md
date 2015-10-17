# City Transport Map

Live map of public transportation vehicles in Bratislava, Slovakia.

![Screenshot](screenshot.png?raw=true "Screenshot of the City Transportation Map")

## Features

* live positions of vehicles on the map
* 3 base maps available (Standard, Transport, OpenStreetMap)
* filtering by vehicle types (trams, buses, trolleybuses)
* filtering by line number
* time of the last recorded position in the tooltip

## Installation

Install dependencies:

```
npm install
```

Create a config.js file at public/js directory. See the public/js/config.example.js
 for what's required.

Lastly, configure your web server's document root to public/ and open the page in browser.

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

## License

CTM is open source software licensed under the GPL3 License. See the LICENSE.txt file for more information.
