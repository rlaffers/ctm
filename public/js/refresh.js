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
 * @param (int) filter 				Line number to filter results by. It is stored locally, so every
 * 														subsequent refresh will use this value.
 */
ctm.refresh = function refresh(refreshRate, filter) {
		refreshRate = refreshRate || 5000;
		clearTimeout(ctm._refreshTimeout);

		// TODO websockets for push messages
		
		if (filter !== undefined && filter !== ctm.getFilter()) {
				ctm.setFilter(filter);
		}

		// AJAX polling
		if (!ctm.api) {
				ctm.api = new XMLHttpRequest();
				ctm.api.onload = function onLoad(ev) {
						try {
								data = JSON.parse(this.responseText);
								if (!data) {
										throw 'Invalid JSON in response from API:\n' + this.responseText;
								}
								ctm.updateMarkers(data);
						} catch (err) {
								console.error('Failed to update markers: ' + err);
						}
						ctm._refreshTimeout = setTimeout(ctm.refresh.bind(ctm, refreshRate), refreshRate);
				};

				ctm.api.onerror = function onError(ev) {
			  		console.error(ev);
				};
		}

		// 

		var bounds = ctm.map.getBounds();
		var sw = bounds.getSouthWest();
		var ne = bounds.getNorthEast();
		var rect = [sw.lng, sw.lat, ne.lng, ne.lat];
		var params = '?rect=[' + rect.join(',') + ']';
		var f = ctm.getFilter();
		if (f) {
				params = params + '&filter=' + f;
		}

		ctm.api.open('get', this.apiUrl + params);
		ctm.api.send();
};

/**
 * updateMarkers
 *
 * Updates the map with new data. Filter the data, search for changes.
 */
ctm.updateMarkers = function updateMarkers(data) {
		// TODO spravit to tak aby sme nemazali vsetky, ale len zmenene. Neriesit, ked poriesime push, nebude to treba robit
		ctm.overlays.trams.clearLayers();
		ctm.overlays.buses.clearLayers();
		ctm.overlays.trolleys.clearLayers();

		var filter = ctm.getFilter();

		data = data.data;
		var item, k, overlay, lineNumber;
		for (k in data) {
				item = data[k];
				if (!item.linka || item.linka > 500) {
					  continue;
				}
				if (filter !== null && filter !== undefined && item.linka != filter) {
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
				ctm.addMarker(k, [Number(item.ll[0]), Number(item.ll[1])], overlay, lineNumber, item.cas);
		}
};

ctm.getFilter = function getFilter() {
	  return ctm.filter;
};

ctm.setFilter = function setFilter(val) {
	  ctm.filter = val;
};

ctm.clearFilter = function clearFilter() {
	  ctm.filter = null;
};
