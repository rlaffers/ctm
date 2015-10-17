// CTM namespace
var ctm = ctm || {};

// Initialize the map
ctm.map = (function (window) {

        // some defaults if geolocation is not available
        var defaultX = 48.14425;
        var defaultY = 17.10938;
        var zoomLevel = 16;

        // base layers
        var baseMaps = {
            mapbox: L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
                //attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
								attribution: '© <a href="https://www.mapbox.com/map-feedback/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
                maxZoom: 18,
                minZoom: 13,
                id: ctm.mapboxId,
                accessToken: ctm.mapboxAccessToken
            }),
						osm: L.tileLayer.provider('OpenStreetMap.Mapnik'),
						transport: L.tileLayer.provider('Thunderforest.Transport')

        };

        ctm.icons = {
            'trams': 'icon-tram',
            'buses': 'icon-bus',
            'trolleys': 'icon-trolley'
        };


        /**
         * @var map
         *
         * Map container
         */
        var map = L.map('map', {
            zoom: zoomLevel,
            center: [defaultX, defaultY],
            layers: [baseMaps.mapbox],
						zoomControl: false
        });

        ctm.map = map;

				new L.Control.Zoom({ position: 'bottomright' }).addTo(map);

        // render tile layer, set view
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {
                map = map.setView([position.coords.latitude, position.coords.longitude], zoomLevel);

            });
        } else {
            map.setView([defaultX, defaultY], zoomLevel);
        }

        // async render my position
        ctm.markMyPosition(5000);

        // add layers for trams, trolleys, buses, stops, routes, traffic
        overlays = {
            trams: L.layerGroup(),
            buses: L.layerGroup(),
            trolleys: L.layerGroup()
        };
				//var control = L.control({
						//position: 'bottomright'
				//}).addTo(map);
        //var layers = control.layers();
        map.addLayer(overlays.trams);
        map.addLayer(overlays.buses);
        map.addLayer(overlays.trolleys);

				var layers = L.control.layers(null, null, {
						position: 'topright'
				});
        layers.addBaseLayer(baseMaps.mapbox, 'Základná mapa');
        layers.addBaseLayer(baseMaps.osm, 'OpenStreetMap');
        layers.addBaseLayer(baseMaps.transport, 'Mapa MHD');
        layers.addOverlay(overlays.trams, 'Električky');
        layers.addOverlay(overlays.buses, 'Autobusy');
        layers.addOverlay(overlays.trolleys, 'Trolejbusy');
        layers.addTo(map);

        ctm.overlays = overlays;

        // TODO skuska
        //ctm.addMarker(1050, [48.14383305429929, 17.11297631263733], 'trams', '1', 1234567890);
        //ctm.addMarker(1051, [48.14220794586267, 17.11073398590088], 'buses', '93', 'pred 30 sekundami');
        //ctm.addMarker(1052, [48.1428451090465, 17.10644245147705], 'trolleys', '204', 'pred 1 hodinou');

				// attach listeners to search box
				var search = document.getElementById('search');
				if (!search) {
						console.warn('The search element not found!');
				} else {
					  search.addEventListener('keydown', function onKeydown(e) {
								if (e.keyCode === 13) {
										ctm.search(this.value);
								}
								return true;
						});
						search.addEventListener('search', function onSearch(e) {
								if (this.value.length < 1) {
										ctm.clearFilter();
										ctm.refresh(ctm.refreshRate);
								}
						});
				}

        // TODO ak server vracia data len pre vyrez mapy, tak ked sa zmeni doom, treba refresh
        ctm.refresh(ctm.refreshRate);
        return map;
}(window));
