<?php
// Fake API for transportation data
//
$neLat = (float) $_GET['neLat'];
$neLon = (float) $_GET['neLon'];
$swLat = (float) $_GET['swLat'];
$swLon = (float) $_GET['neLon'];

$data = array(
    array(
        array(
            'vehicleId' => 1,
            'vehicleType' => 1,
            'lineNumber' => 4,
            'timestamp' => time(),
            'latitude' => 4,
            'longitude' => 4,
        ) // tram
        array() // bus
        array() // trolley
    )
);

