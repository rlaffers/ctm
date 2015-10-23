// Create the namespace for this app
var ctm = {};

(function (root, factory) {
	if (typeof define === 'function' && define.amd) {
		// AMD. Register as an anonymous module.
		define(['leaflet'], factory);
	} else if (typeof modules === 'object' && module.exports) {
		// define a Common JS module that relies on 'leaflet'
		module.exports = factory(require('leaflet'));
	} else {
		// Assume Leaflet is loaded into global object L already
		factory(L);
	}
}(this, function (L) {
	'use strict';

	L.TileLayer.Provider = L.TileLayer.extend({
		initialize: function (arg, options) {
			var providers = L.TileLayer.Provider.providers;

			var parts = arg.split('.');

			var providerName = parts[0];
			var variantName = parts[1];

			if (!providers[providerName]) {
				throw 'No such provider (' + providerName + ')';
			}

			var provider = {
				url: providers[providerName].url,
				options: providers[providerName].options
			};

			// overwrite values in provider from variant.
			if (variantName && 'variants' in providers[providerName]) {
				if (!(variantName in providers[providerName].variants)) {
					throw 'No such variant of ' + providerName + ' (' + variantName + ')';
				}
				var variant = providers[providerName].variants[variantName];
				var variantOptions;
				if (typeof variant === 'string') {
					variantOptions = {
						variant: variant
					};
				} else {
					variantOptions = variant.options;
				}
				provider = {
					url: variant.url || provider.url,
					options: L.Util.extend({}, provider.options, variantOptions)
				};
			} else if (typeof provider.url === 'function') {
				provider.url = provider.url(parts.splice(1, parts.length - 1).join('.'));
			}

			var forceHTTP = window.location.protocol === 'file:' || provider.options.forceHTTP;
			if (provider.url.indexOf('//') === 0 && forceHTTP) {
				provider.url = 'http:' + provider.url;
			}

			// If retina option is set
			if (provider.options.retina) {
				// Check retina screen
				if (options.detectRetina && L.Browser.retina) {
					// The retina option will be active now
					// But we need to prevent Leaflet retina mode
					options.detectRetina = false;
				} else {
					// No retina, remove option
					provider.options.retina = '';
				}
			}

			// replace attribution placeholders with their values from toplevel provider attribution,
			// recursively
			var attributionReplacer = function (attr) {
				if (attr.indexOf('{attribution.') === -1) {
					return attr;
				}
				return attr.replace(/\{attribution.(\w*)\}/,
					function (match, attributionName) {
						return attributionReplacer(providers[attributionName].options.attribution);
					}
				);
			};
			provider.options.attribution = attributionReplacer(provider.options.attribution);

			// Compute final options combining provider options with any user overrides
			var layerOpts = L.Util.extend({}, provider.options, options);
			L.TileLayer.prototype.initialize.call(this, provider.url, layerOpts);
		}
	});

	/**
	 * Definition of providers.
	 * see http://leafletjs.com/reference.html#tilelayer for options in the options map.
	 */

	L.TileLayer.Provider.providers = {
		OpenStreetMap: {
			url: '//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
			options: {
				maxZoom: 19,
				attribution:
					'&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
			},
			variants: {
				Mapnik: {},
				BlackAndWhite: {
					url: 'http://{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png',
					options: {
						maxZoom: 18
					}
				},
				DE: {
					url: 'http://{s}.tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png',
					options: {
						maxZoom: 18
					}
				},
				France: {
					url: 'http://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png',
					options: {
						attribution: '&copy; Openstreetmap France | {attribution.OpenStreetMap}'
					}
				},
				HOT: {
					url: 'http://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
					options: {
						attribution: '{attribution.OpenStreetMap}, Tiles courtesy of <a href="http://hot.openstreetmap.org/" target="_blank">Humanitarian OpenStreetMap Team</a>'
					}
				}
			}
		},
		OpenSeaMap: {
			url: 'http://tiles.openseamap.org/seamark/{z}/{x}/{y}.png',
			options: {
				attribution: 'Map data: &copy; <a href="http://www.openseamap.org">OpenSeaMap</a> contributors'
			}
		},
		OpenTopoMap: {
			url: '//{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
			options: {
				maxZoom: 16,
				attribution: 'Map data: {attribution.OpenStreetMap}, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
			}
		},
		Thunderforest: {
			url: '//{s}.tile.thunderforest.com/{variant}/{z}/{x}/{y}.png',
			options: {
				attribution:
					'&copy; <a href="http://www.opencyclemap.org">OpenCycleMap</a>, {attribution.OpenStreetMap}',
				variant: 'cycle'
			},
			variants: {
				OpenCycleMap: 'cycle',
				Transport: {
					options: {
						variant: 'transport',
						maxZoom: 19
					}
				},
				TransportDark: {
					options: {
						variant: 'transport-dark',
						maxZoom: 19
					}
				},
				Landscape: 'landscape',
				Outdoors: 'outdoors'
			}
		},
		OpenMapSurfer: {
			url: 'http://openmapsurfer.uni-hd.de/tiles/{variant}/x={x}&y={y}&z={z}',
			options: {
				maxZoom: 20,
				variant: 'roads',
				attribution: 'Imagery from <a href="http://giscience.uni-hd.de/">GIScience Research Group @ University of Heidelberg</a> &mdash; Map data {attribution.OpenStreetMap}'
			},
			variants: {
				Roads: 'roads',
				AdminBounds: {
					options: {
						variant: 'adminb',
						maxZoom: 19
					}
				},
				Grayscale: {
					options: {
						variant: 'roadsg',
						maxZoom: 19
					}
				}
			}
		},
		Hydda: {
			url: 'http://{s}.tile.openstreetmap.se/hydda/{variant}/{z}/{x}/{y}.png',
			options: {
				variant: 'full',
				attribution: 'Tiles courtesy of <a href="http://openstreetmap.se/" target="_blank">OpenStreetMap Sweden</a> &mdash; Map data {attribution.OpenStreetMap}'
			},
			variants: {
				Full: 'full',
				Base: 'base',
				RoadsAndLabels: 'roads_and_labels'
			}
		},
		MapQuestOpen: {
			/* Mapquest does support https, but with a different subdomain:
			 * https://otile{s}-s.mqcdn.com/tiles/1.0.0/{type}/{z}/{x}/{y}.{ext}
			 * which makes implementing protocol relativity impossible.
			 */
			url: 'http://otile{s}.mqcdn.com/tiles/1.0.0/{type}/{z}/{x}/{y}.{ext}',
			options: {
				type: 'map',
				ext: 'jpg',
				attribution:
					'Tiles Courtesy of <a href="http://www.mapquest.com/">MapQuest</a> &mdash; ' +
					'Map data {attribution.OpenStreetMap}',
				subdomains: '1234'
			},
			variants: {
				OSM: {},
				Aerial: {
					options: {
						type: 'sat',
						attribution:
							'Tiles Courtesy of <a href="http://www.mapquest.com/">MapQuest</a> &mdash; ' +
							'Portions Courtesy NASA/JPL-Caltech and U.S. Depart. of Agriculture, Farm Service Agency'
					}
				},
				HybridOverlay: {
					options: {
						type: 'hyb',
						ext: 'png',
						opacity: 0.9
					}
				}
			}
		},
		MapBox: {
			url: '//api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}',
			options: {
				attribution:
					'Imagery from <a href="http://mapbox.com/about/maps/">MapBox</a> &mdash; ' +
					'Map data {attribution.OpenStreetMap}',
				subdomains: 'abcd'
			}
		},
		Stamen: {
			url: '//stamen-tiles-{s}.a.ssl.fastly.net/{variant}/{z}/{x}/{y}.{ext}',
			options: {
				attribution:
					'Map tiles by <a href="http://stamen.com">Stamen Design</a>, ' +
					'<a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; ' +
					'Map data {attribution.OpenStreetMap}',
				subdomains: 'abcd',
				minZoom: 0,
				maxZoom: 20,
				variant: 'toner',
				ext: 'png'
			},
			variants: {
				Toner: 'toner',
				TonerBackground: 'toner-background',
				TonerHybrid: 'toner-hybrid',
				TonerLines: 'toner-lines',
				TonerLabels: 'toner-labels',
				TonerLite: 'toner-lite',
				Watercolor: {
					options: {
						variant: 'watercolor',
						minZoom: 1,
						maxZoom: 16
					}
				},
				Terrain: {
					options: {
						variant: 'terrain',
						minZoom: 4,
						maxZoom: 18,
						bounds: [[22, -132], [70, -56]]
					}
				},
				TerrainBackground: {
					options: {
						variant: 'terrain-background',
						minZoom: 4,
						maxZoom: 18,
						bounds: [[22, -132], [70, -56]]
					}
				},
				TopOSMRelief: {
					options: {
						variant: 'toposm-color-relief',
						ext: 'jpg',
						bounds: [[22, -132], [51, -56]]
					}
				},
				TopOSMFeatures: {
					options: {
						variant: 'toposm-features',
						bounds: [[22, -132], [51, -56]],
						opacity: 0.9
					}
				}
			}
		},
		Esri: {
			url: '//server.arcgisonline.com/ArcGIS/rest/services/{variant}/MapServer/tile/{z}/{y}/{x}',
			options: {
				variant: 'World_Street_Map',
				attribution: 'Tiles &copy; Esri'
			},
			variants: {
				WorldStreetMap: {
					options: {
						attribution:
							'{attribution.Esri} &mdash; ' +
							'Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012'
					}
				},
				DeLorme: {
					options: {
						variant: 'Specialty/DeLorme_World_Base_Map',
						minZoom: 1,
						maxZoom: 11,
						attribution: '{attribution.Esri} &mdash; Copyright: &copy;2012 DeLorme'
					}
				},
				WorldTopoMap: {
					options: {
						variant: 'World_Topo_Map',
						attribution:
							'{attribution.Esri} &mdash; ' +
							'Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community'
					}
				},
				WorldImagery: {
					options: {
						variant: 'World_Imagery',
						attribution:
							'{attribution.Esri} &mdash; ' +
							'Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
					}
				},
				WorldTerrain: {
					options: {
						variant: 'World_Terrain_Base',
						maxZoom: 13,
						attribution:
							'{attribution.Esri} &mdash; ' +
							'Source: USGS, Esri, TANA, DeLorme, and NPS'
					}
				},
				WorldShadedRelief: {
					options: {
						variant: 'World_Shaded_Relief',
						maxZoom: 13,
						attribution: '{attribution.Esri} &mdash; Source: Esri'
					}
				},
				WorldPhysical: {
					options: {
						variant: 'World_Physical_Map',
						maxZoom: 8,
						attribution: '{attribution.Esri} &mdash; Source: US National Park Service'
					}
				},
				OceanBasemap: {
					options: {
						variant: 'Ocean_Basemap',
						maxZoom: 13,
						attribution: '{attribution.Esri} &mdash; Sources: GEBCO, NOAA, CHS, OSU, UNH, CSUMB, National Geographic, DeLorme, NAVTEQ, and Esri'
					}
				},
				NatGeoWorldMap: {
					options: {
						variant: 'NatGeo_World_Map',
						maxZoom: 16,
						attribution: '{attribution.Esri} &mdash; National Geographic, Esri, DeLorme, NAVTEQ, UNEP-WCMC, USGS, NASA, ESA, METI, NRCAN, GEBCO, NOAA, iPC'
					}
				},
				WorldGrayCanvas: {
					options: {
						variant: 'Canvas/World_Light_Gray_Base',
						maxZoom: 16,
						attribution: '{attribution.Esri} &mdash; Esri, DeLorme, NAVTEQ'
					}
				}
			}
		},
		OpenWeatherMap: {
			url: 'http://{s}.tile.openweathermap.org/map/{variant}/{z}/{x}/{y}.png',
			options: {
				maxZoom: 19,
				attribution: 'Map data &copy; <a href="http://openweathermap.org">OpenWeatherMap</a>',
				opacity: 0.5
			},
			variants: {
				Clouds: 'clouds',
				CloudsClassic: 'clouds_cls',
				Precipitation: 'precipitation',
				PrecipitationClassic: 'precipitation_cls',
				Rain: 'rain',
				RainClassic: 'rain_cls',
				Pressure: 'pressure',
				PressureContour: 'pressure_cntr',
				Wind: 'wind',
				Temperature: 'temp',
				Snow: 'snow'
			}
		},
		HERE: {
			/*
			 * HERE maps, formerly Nokia maps.
			 * These basemaps are free, but you need an API key. Please sign up at
			 * http://developer.here.com/getting-started
			 *
			 * Note that the base urls contain '.cit' whichs is HERE's
			 * 'Customer Integration Testing' environment. Please remove for production
			 * envirionments.
			 */
			url:
				'//{s}.{base}.maps.cit.api.here.com/maptile/2.1/' +
				'{type}/{mapID}/{variant}/{z}/{x}/{y}/{size}/{format}?' +
				'app_id={app_id}&app_code={app_code}&lg={language}',
			options: {
				attribution:
					'Map &copy; 1987-2014 <a href="http://developer.here.com">HERE</a>',
				subdomains: '1234',
				mapID: 'newest',
				'app_id': '<insert your app_id here>',
				'app_code': '<insert your app_code here>',
				base: 'base',
				variant: 'normal.day',
				maxZoom: 20,
				type: 'maptile',
				language: 'eng',
				format: 'png8',
				size: '256'
			},
			variants: {
				normalDay: 'normal.day',
				normalDayCustom: 'normal.day.custom',
				normalDayGrey: 'normal.day.grey',
				normalDayMobile: 'normal.day.mobile',
				normalDayGreyMobile: 'normal.day.grey.mobile',
				normalDayTransit: 'normal.day.transit',
				normalDayTransitMobile: 'normal.day.transit.mobile',
				normalNight: 'normal.night',
				normalNightMobile: 'normal.night.mobile',
				normalNightGrey: 'normal.night.grey',
				normalNightGreyMobile: 'normal.night.grey.mobile',

				basicMap: {
					options: {
						type: 'basetile'
					}
				},
				mapLabels: {
					options: {
						type: 'labeltile',
						format: 'png'
					}
				},
				trafficFlow: {
					options: {
						base: 'traffic',
						type: 'flowtile'
					}
				},
				carnavDayGrey: 'carnav.day.grey',
				hybridDay: {
					options: {
						base: 'aerial',
						variant: 'hybrid.day'
					}
				},
				hybridDayMobile: {
					options: {
						base: 'aerial',
						variant: 'hybrid.day.mobile'
					}
				},
				pedestrianDay: 'pedestrian.day',
				pedestrianNight: 'pedestrian.night',
				satelliteDay: {
					options: {
						base: 'aerial',
						variant: 'satellite.day'
					}
				},
				terrainDay: {
					options: {
						base: 'aerial',
						variant: 'terrain.day'
					}
				},
				terrainDayMobile: {
					options: {
						base: 'aerial',
						variant: 'terrain.day.mobile'
					}
				}
			}
		},
		Acetate: {
			url: 'http://a{s}.acetate.geoiq.com/tiles/{variant}/{z}/{x}/{y}.png',
			options: {
				attribution:
					'&copy;2012 Esri & Stamen, Data from OSM and Natural Earth',
				subdomains: '0123',
				minZoom: 2,
				maxZoom: 18,
				variant: 'acetate-base'
			},
			variants: {
				basemap: 'acetate-base',
				terrain: 'terrain',
				all: 'acetate-hillshading',
				foreground: 'acetate-fg',
				roads: 'acetate-roads',
				labels: 'acetate-labels',
				hillshading: 'hillshading'
			}
		},
		FreeMapSK: {
			url: 'http://t{s}.freemap.sk/T/{z}/{x}/{y}.jpeg',
			options: {
				minZoom: 8,
				maxZoom: 16,
				subdomains: '1234',
				bounds: [[47.204642, 15.996093], [49.830896, 22.576904]],
				attribution:
					'{attribution.OpenStreetMap}, vizualization CC-By-SA 2.0 <a href="http://freemap.sk">Freemap.sk</a>'
			}
		},
		MtbMap: {
			url: 'http://tile.mtbmap.cz/mtbmap_tiles/{z}/{x}/{y}.png',
			options: {
				attribution:
					'{attribution.OpenStreetMap} &amp; USGS'
			}
		},
		CartoDB: {
			url: 'http://{s}.basemaps.cartocdn.com/{variant}/{z}/{x}/{y}.png',
			options: {
				attribution: '{attribution.OpenStreetMap} &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
				subdomains: 'abcd',
				maxZoom: 19,
				variant: 'light_all'
			},
			variants: {
				Positron: 'light_all',
				PositronNoLabels: 'light_nolabels',
				PositronOnlyLabels: 'light_only_labels',
				DarkMatter: 'dark_all',
				DarkMatterNoLabels: 'dark_nolabels',
				DarkMatterOnlyLabels: 'dark_only_labels'
			}
		},
		HikeBike: {
			url: 'http://{s}.tiles.wmflabs.org/{variant}/{z}/{x}/{y}.png',
			options: {
				maxZoom: 19,
				attribution: '{attribution.OpenStreetMap}',
				variant: 'hikebike'
			},
			variants: {
				HikeBike: {},
				HillShading: {
					options: {
						maxZoom: 15,
						variant: 'hillshading'
					}
				}
			}
		},
		BasemapAT: {
			url: '//maps{s}.wien.gv.at/basemap/{variant}/normal/google3857/{z}/{y}/{x}.{format}',
			options: {
				maxZoom: 19,
				attribution: 'Datenquelle: <a href="www.basemap.at">basemap.at</a>',
				subdomains: ['', '1', '2', '3', '4'],
				format: 'png',
				bounds: [[46.358770, 8.782379], [49.037872, 17.189532]],
				variant: 'geolandbasemap'
			},
			variants: {
				basemap: 'geolandbasemap',
				grau: 'bmapgrau',
				overlay: 'bmapoverlay',
				highdpi: {
					options: {
						variant: 'bmaphidpi',
						format: 'jpeg'
					}
				},
				orthofoto: {
					options: {
						variant: 'bmaporthofoto30cm',
						format: 'jpeg'
					}
				}
			}
		},
		NASAGIBS: {
			url: '//map1.vis.earthdata.nasa.gov/wmts-webmerc/{variant}/default/{time}/{tilematrixset}{maxZoom}/{z}/{y}/{x}.{format}',
			options: {
				attribution:
					'Imagery provided by services from the Global Imagery Browse Services (GIBS), operated by the NASA/GSFC/Earth Science Data and Information System ' +
					'(<a href="https://earthdata.nasa.gov">ESDIS</a>) with funding provided by NASA/HQ.',
				bounds: [[-85.0511287776, -179.999999975], [85.0511287776, 179.999999975]],
				minZoom: 1,
				maxZoom: 9,
				format: 'jpg',
				time: '',
				tilematrixset: 'GoogleMapsCompatible_Level'
			},
			variants: {
				ModisTerraTrueColorCR: 'MODIS_Terra_CorrectedReflectance_TrueColor',
				ModisTerraBands367CR: 'MODIS_Terra_CorrectedReflectance_Bands367',
				ViirsEarthAtNight2012: {
					options: {
						variant: 'VIIRS_CityLights_2012',
						maxZoom: 8
					}
				},
				ModisTerraLSTDay: {
					options: {
						variant: 'MODIS_Terra_Land_Surface_Temp_Day',
						format: 'png',
						maxZoom: 7,
						opacity: 0.75
					}
				},
				ModisTerraSnowCover: {
					options: {
						variant: 'MODIS_Terra_Snow_Cover',
						format: 'png',
						maxZoom: 8,
						opacity: 0.75
					}
				},
				ModisTerraAOD: {
					options: {
						variant: 'MODIS_Terra_Aerosol',
						format: 'png',
						maxZoom: 6,
						opacity: 0.75
					}
				},
				ModisTerraChlorophyll: {
					options: {
						variant: 'MODIS_Terra_Chlorophyll_A',
						format: 'png',
						maxZoom: 7,
						opacity: 0.75
					}
				}
			}
		},
		NLS: {
			// Maps from http://maps.nls.uk/geo/explore/
			url: '//nls-{s}.tileserver.com/{variant}/{z}/{x}/{y}.jpg',
			options: {
				attribution: '<a href="http://geo.nls.uk/maps/">National Library of Scotland Historic Maps</a>',
				bounds: [[49.6, -12], [61.7, 3]],
				minZoom: 1,
				maxZoom: 18,
				subdomains: '0123',
			},
			variants: {
				// OS 1:1m to 1:10K, 1900s
				//   z0-10 - 1:1m
				//  z11-12 - ?
				//  z13-14 - one inch (1:63360)
				//  z15-18 - six inch (1:10560)
				'OS_1900': 'NLS_API',
				// OS 1:1m to 1:63K, 1920s-1940s
				//   z0-9  - 1:1m
				//  z10-11 - quarter inch (1:253440)
				//  z12-18 - one inch (1:63360)
				'OS_1920': 'nls',
				'OS_opendata': {
					url: 'http://geo.nls.uk/maps/opendata/{z}/{x}/{y}.png',
					options: {
						maxZoom: 16
					}
				},
				// OS six inch, 1843 - 1882
				'OS_6inch_1st': {
					url: 'http://geo.nls.uk/maps/os/six_inch/{z}/{x}/{y}.png',
					options: {
						tms: true,
						minZoom: 6,
						maxZoom: 16,
						bounds: [[49.86261, -8.66444], [60.89421, 1.7785]]
					}
				},
				// OS six inch, 1888 - 1913
				'OS_6inch': 'os_6_inch_gb',
				// OS 1:25000, 1937 - 1961
				'OS_25k': '25k',
				// OS one inch, 1945 - 1947
				'OS_npe': {
					url: 'http://geo.nls.uk/maps/os/newpopular/{z}/{x}/{y}.png',
					options: {
						tms: true,
						minZoom: 3,
						maxZoom: 15
					}
				},
				// OS one inch, 1952 - 1961
				'OS_7th': 'os7gb',
				// OS 1:1056, 1893 - 1896
				'OS_London': {
					options: {
						variant: 'London_1056',
						minZoom: 9,
						bounds: [[51.177621, -0.708618], [51.618016, 0.355682]]
					}
				},
				'GSGS_Ireland': {
					url: 'http://geo.nls.uk/maps/ireland/gsgs4136/{z}/{x}/{y}.png',
					options: {
						tms: true,
						minZoom: 5,
						maxZoom: 15,
						bounds: [[51.371780, -10.810546], [55.422779, -5.262451]]
					}
				}
			}
		}
	};

	L.tileLayer.provider = function (provider, options) {
		return new L.TileLayer.Provider(provider, options);
	};

	return L;
}));

//(function (google, L) {

L.Google = L.Class.extend({
	includes: L.Mixin.Events,

	options: {
		minZoom: 0,
		maxZoom: 18,
		tileSize: 256,
		subdomains: 'abc',
		errorTileUrl: '',
		attribution: '',
		opacity: 1,
		continuousWorld: false,
		noWrap: false,
		mapOptions: {
			backgroundColor: '#dddddd'
		}
	},

	// Possible types: SATELLITE, ROADMAP, HYBRID, TERRAIN
	initialize: function(type, options) {
		L.Util.setOptions(this, options);

		this._ready = google.maps.Map !== undefined;
		if (!this._ready) {
            L.Google.asyncWait.push(this);   
        }

		this._type = type || 'SATELLITE';
	},

	onAdd: function(map, insertAtTheBottom) {
		this._map = map;
		this._insertAtTheBottom = insertAtTheBottom;

		// create a container div for tiles
		this._initContainer();
		this._initMapObject();

		// set up events
		map.on('viewreset', this._resetCallback, this);

    if (L.Util.throttle) {
		    this._limitedUpdate = L.Util.throttle(this._update, 150, this);
    }
		map.on('move', this._update, this);

		map.on('zoomanim', this._handleZoomAnim, this);

		//20px instead of 1em to avoid a slight overlap with google's attribution
		map._controlCorners.bottomright.style.marginBottom = "20px";

		this._reset();
		this._update();
	},

	onRemove: function(map) {
		this._map._container.removeChild(this._container);
		//this._container = null;

		this._map.off('viewreset', this._resetCallback, this);

		this._map.off('move', this._update, this);

		this._map.off('zoomanim', this._handleZoomAnim, this);

		map._controlCorners.bottomright.style.marginBottom = "0em";
		//this._map.off('moveend', this._update, this);
	},

	getAttribution: function() {
		return this.options.attribution;
	},

	setOpacity: function(opacity) {
		this.options.opacity = opacity;
		if (opacity < 1) {
			L.DomUtil.setOpacity(this._container, opacity);
		}
	},

	setElementSize: function(e, size) {
		e.style.width = size.x + "px";
		e.style.height = size.y + "px";
	},

	_initContainer: function() {
		var tilePane = this._map._container,
			first = tilePane.firstChild;

		if (!this._container) {
			this._container = L.DomUtil.create('div', 'leaflet-google-layer leaflet-top leaflet-left');
			this._container.id = "_GMapContainer_" + L.Util.stamp(this);
			this._container.style.zIndex = "auto";
		}

		tilePane.insertBefore(this._container, first);

		this.setOpacity(this.options.opacity);
		this.setElementSize(this._container, this._map.getSize());
	},

	_initMapObject: function() {
		if (!this._ready) {
            return;   
        }
		this._google_center = new google.maps.LatLng(0, 0);
		var map = new google.maps.Map(this._container, {
		    center: this._google_center,
		    zoom: 0,
		    tilt: 0,
		    mapTypeId: google.maps.MapTypeId[this._type],
		    disableDefaultUI: true,
		    keyboardShortcuts: false,
		    draggable: false,
		    disableDoubleClickZoom: true,
		    scrollwheel: false,
		    streetViewControl: false,
		    styles: this.options.mapOptions.styles,
		    backgroundColor: this.options.mapOptions.backgroundColor
		});

		var _this = this;
		this._reposition = google.maps.event.addListenerOnce(map, "center_changed",
			function() { _this.onReposition(); });
		this._google = map;

		google.maps.event.addListenerOnce(map, "idle",
			function() { _this._checkZoomLevels(); });
	},

	_checkZoomLevels: function() {
		//setting the zoom level on the Google map may result in a different zoom level than the one requested
		//(it won't go beyond the level for which they have data).
		// verify and make sure the zoom levels on both Leaflet and Google maps are consistent
		if (this._google.getZoom() !== this._map.getZoom()) {
			//zoom levels are out of sync. Set the leaflet zoom level to match the google one
			this._map.setZoom( this._google.getZoom() );
		}
	},

	_resetCallback: function(e) {
		this._reset(e.hard);
	},

	_reset: function(clearOldContainer) {
		this._initContainer();
	},

	_update: function(e) {
		if (!this._google) {
            return;   
        }
		this._resize();

		var center = e && e.latlng ? e.latlng : this._map.getCenter();
		var _center = new google.maps.LatLng(center.lat, center.lng);

		this._google.setCenter(_center);
		this._google.setZoom(this._map.getZoom());

		this._checkZoomLevels();
		//this._google.fitBounds(google_bounds);
	},

	_resize: function() {
		var size = this._map.getSize();
		if (this._container.style.width === size.x &&
		    this._container.style.height === size.y) {
                
			    return;
            }
		this.setElementSize(this._container, size);
		this.onReposition();
	},


	_handleZoomAnim: function (e) {
		var center = e.center;
		var _center = new google.maps.LatLng(center.lat, center.lng);

		this._google.setCenter(_center);
		this._google.setZoom(e.zoom);
	},


	onReposition: function() {
		if (!this._google) {
            return;   
        }
		google.maps.event.trigger(this._google, "resize");
	}
});

L.Google.asyncWait = [];
L.Google.asyncInitialize = function() {
	var i;
	for (i = 0; i < L.Google.asyncWait.length; i++) {
		var o = L.Google.asyncWait[i];
		o._ready = true;
		if (o._container) {
			o._initMapObject();
			o._update();
		}
	}
	L.Google.asyncWait = [];
};
//})(window.google, L)

//ctm.apiUrl = 'https://ctm.mrdnik.sk/v/1/json/example';
ctm.apiUrl = 'https://imhd.zoznam.sk/rt/danubehackdata';

// access token for the mapbox account
ctm.mapboxAccessToken = 'pk.eyJ1IjoicmxhZmZlcnMiLCJhIjoiY2lmdGNyZmZlMDF3N3RkbTBxMmcxcmwzYyJ9.jTqMImbRFKuNS39QXqSuEA';
ctm.mapboxId = 'rlaffers.nnf9dj3d';

// refresh map for vehicle positions in millisecs
ctm.refreshRate = 10000;

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

ctm.addMarker = function addMarker(id, coords, type, lineNumber, timestamp) {
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
                var data = JSON.parse(this.responseText);
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
                if (filter !== null && filter !== undefined && String(item.linka) !== String(filter)) {
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

ctm.fuzzyStrings = {
    prefixAgo: null,
    prefixFromNow: null,
    suffixAgo: "",
    suffixFromNow: "",
    inPast: 'každú chvíľku',
    seconds: "menej ako pred minútou",
    minute: "okolo minúty",
    minutes: "%d minút",
    minutes2: "%d minúty",
    hour: "okolo 1 hodiny",
    hours: "okolo %d hodín",
    day: "1 deň",
    days2: "%d dni",
    days: "%d dní",
    month: "okolo 1 mesiaca",
    months: "%d mesiacov",
    months2: "%d mesiace",
    year: "okolo 1 roka",
    years: "%d rokov",
    years2: "%d roky",
    wordSeparator: " ",
    numbers: []
};

// shamelessly stolen from http://timeago.yarp.com/, then creatively altered :-)
ctm.fuzzy = function fuzzy(timestamp) {
    var now = Date.now();
    if (timestamp > now) {
        console.warn("Time is in future!", timestamp);
        var d = new Date(timestamp);
        return d.toDateString() + ' ' + d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds();
    }
    var delta = now - timestamp;
    var $l = this.fuzzyStrings;
    var prefix = $l.prefixAgo;
    var suffix = $l.suffixAgo;

    var seconds = Math.abs(delta) / 1000;
    var minutes = seconds / 60;
    var hours = minutes / 60;
    var days = hours / 24;
    var years = days / 365;

    function substitute(stringOrFunction, number) {
        var string = typeof stringOrFunction === 'function' ? stringOrFunction(number, delta) : stringOrFunction;
        var value = ($l.numbers && $l.numbers[number]) || number;
        return string.replace(/%d/i, value);
    }

    var words = seconds < 45 && substitute($l.seconds, Math.round(seconds)) ||
    seconds < 90 && substitute($l.minute, 1) ||
    minutes < 45 && minutes > 1 && minutes < 5 && substitute($l.minutes2, Math.round(minutes)) ||
    minutes < 45 && minutes >= 5 && substitute($l.minutes, Math.round(minutes)) ||
    //minutes < 45 && substitute($l.minutes, Math.round(minutes)) ||
    minutes < 90 && substitute($l.hour, 1) ||
    //hours < 24 && substitute($l.hours, Math.round(hours)) ||
    hours < 24 && hours > 1 && substitute($l.hours, Math.round(hours)) ||
    hours < 42 && substitute($l.day, 1) ||
    //days < 30 && substitute($l.days, Math.round(days)) ||
    days < 30 && days > 1 && days < 5 && substitute($l.days2, Math.round(days)) ||
    days < 30 && days >= 5 && substitute($l.days, Math.round(days)) ||
    days < 45 && substitute($l.month, 1) ||
    //days < 365 && substitute($l.months, Math.round(days / 30)) ||
    days < 365 && days > 30 && days < 150 && substitute($l.months2, Math.round(days / 30)) ||
    days < 365 && days >= 150 && substitute($l.months, Math.round(days / 30)) ||
    years < 1.5 && substitute($l.year, 1) ||
    years > 1.5 && years < 5 && substitute($l.years2, Math.round(years)) ||
    substitute($l.years, Math.round(years));

    var separator = $l.wordSeparator || "";
    if ($l.wordSeparator === undefined) { separator = " "; }
    return [prefix, words, suffix].join(separator);
};

ctm.search = function search(value) {
    if (String(parseInt(value, 10)) !== String(value)) {
        console.log("Only numbers can be entered at the moment.", value);
        return;
    }
    ctm.clearFilter();
    ctm.refresh(ctm.refreshRate, parseInt(value, 10));
};

// Initialize the map
window.onload = function() {
    ctm.map = (function (window) {

        // some defaults if geolocation is not available
        var defaultX = 48.14425;
        var defaultY = 17.10938;
        var zoomLevel = 16;

        // base layers
        var baseMaps = {
            mapbox: (ctm.mapboxAccessToken) ? L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
                attribution: '© <a href="https://www.mapbox.com/map-feedback/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
                maxZoom: 18,
                minZoom: 13,
                id: ctm.mapboxId,
                accessToken: ctm.mapboxAccessToken
            }) : null,
            osm: L.tileLayer.provider('OpenStreetMap.Mapnik'),
            transport: L.tileLayer.provider('Thunderforest.Transport')
            ,google: new L.Google('ROADMAP')

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
            layers: [baseMaps.osm],
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
        var overlays = {
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
    layers.addBaseLayer(baseMaps.osm, 'Základná mapa');
    if (baseMaps.mapbox) {
        layers.addBaseLayer(baseMaps.mapbox, 'Mapbox');
    }
    layers.addBaseLayer(baseMaps.transport, 'Mapa MHD');
    layers.addBaseLayer(baseMaps.google, 'Google');
    layers.addOverlay(overlays.trams, 'Električky');
    layers.addOverlay(overlays.buses, 'Autobusy');
    layers.addOverlay(overlays.trolleys, 'Trolejbusy');
    layers.addTo(map);

    ctm.overlays = overlays;

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
};
