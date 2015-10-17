// CTM namespace
var ctm = ctm || {};

/**
 * AddMarker 
 *
 * Displays marker
 *
 * @param {array} 	coords
 * @param {string} 	type 	trams, buses, trolleys...
 * @param {int} 	lineNumber
 * @param {int} 	timestamp
 */
ctm.AddMarker = function AddMarker(id, coords, type, lineNumber, timestamp) {
		var marker = new ctm.Marker(id, timestamp, [coords[0], coords[1]], {
				icon: L.divIcon({
					className: this.icons[type] + ' line-number line-number-' + lineNumber, 
					iconSize: [32, 25],
					iconAnchor: [16, 25]
				}),
				title: 'Linka č. ' + lineNumber + '\n' + ctm.fuzzy(timestamp*1000)
		});
		marker.addTo(this.overlays[type]);
};

ctm.Marker = L.Marker.extend({
		// custom marker data
	  data: {
			id: null,
			timestamp: null
		},

		initialize: function initialize(id, timestamp, coords, options) {
				this.data.id = id;
				this.data.timestamp = timestamp;
				L.Marker.prototype.initialize.call(this, coords, options);
		}
});
