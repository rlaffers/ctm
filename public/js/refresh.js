// CTM namespace
var ctm = ctm || {};

/**
 * refrehs
 *
 * Loads data and refreshes the layers.
 *
 * TODO web worker if possible to make redrawing separate from the main thread
 *
 * @param (int) refreshRate 	Milliseconds. Default 5000.
 */
ctm.refresh = function refresh(refreshRate) {
		refreshRate = refreshRate || 5000;

		// TODO websockets for push messages
		

		// AJAX polling
		if (!ctm.api) {
				ctm.api = new XMLHttpRequest();
				ctm.api.onload = function onLoad(ev) {
						try {
								data = JSON.parse(this.responseText);
								if (!data) {
										throw 'Invalid JSON in response from API:\n' + this.responseText;
								}
								ctm.UpdateMarkers(data);
						} catch (err) {
								console.error('Failed to update markers: ' + err);
						}
						setTimeout(ctm.refresh.bind(ctm, refreshRate), refreshRate);
				};

				ctm.api.onerror = function onError(ev) {
			  		console.error(ev);
				};
		}

		// 

		var bounds = ctm.map.getBounds();
		var sw = bounds.getSouthWest();
		var ne = bounds.getNorthEast();
		var params = [sw.lng, sw.lat, ne.lng, ne.lat];

		ctm.api.open('get', this.apiUrl+'?rect=[' + params.join(',') + ']');
		ctm.api.send();
};

/**
 * UpdateMarkers
 *
 * Updates the map with new data. Filter the data, search for changes.
 */
ctm.UpdateMarkers = function UpdateMarkers(data) {
		// TODO spravit to tak aby sme nemazali vsetky, ale len zmenene. Neriesit, ked poriesime push, nebude to treba robit
		ctm.overlays.trams.clearLayers();
		ctm.overlays.buses.clearLayers();
		ctm.overlays.trolleys.clearLayers();

		data = data.data;
		var item, k, overlay, lineNumber;
		for (k in data) {
				item = data[k];
				if (!item.linka || item.linka > 500) {
					  continue;
				}
				lineNumber = item.linka;
				switch (item.typ) {
						case 'n':
								overlay = 'buses';
								lineNumber = Number(String(item.linka).substr(1));
								break;
						case 'a':
								overlay = 'buses';
								break;
						case 'e':
								overlay = 'trams';
								break;
						case 't':
								overlay = 'trolleys';
								break;
				}
				ctm.AddMarker(k, [Number(item.ll[0]), Number(item.ll[1])], overlay, lineNumber, item.cas);
		}
};
