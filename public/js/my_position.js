// CTM namespace
var ctm = ctm || {};

/**
 * markMyPosition 
 *
 * @var {int} 	Refresh rate in milliseconds.
 */
ctm.markMyPosition = function markMyposition(refreshRate) {
		if (!navigator.geolocation) {
				console.error('Sorry, no geolocation in your browser.');
				return;
		}
		var marker = L.marker([0, 0], {
				//icon: L.divIcon({className: 'icon-my-location', iconSize: null})
		});
		navigator.geolocation.getCurrentPosition(function(position) {
				marker.setLatLng([position.coords.latitude, position.coords.longitude]);
				marker.addTo(ctm.map);
		});
		var setMarker = function setMarker() {
				//console.log("refreshing your position");
				navigator.geolocation.getCurrentPosition(function(position) {
						marker.setLatLng([position.coords.latitude, position.coords.longitude]);
				});
				setTimeout(setMarker, refreshRate);
		};
		setMarker();
};
