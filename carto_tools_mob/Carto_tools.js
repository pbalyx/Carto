//
const version ="0.7.8";
const subV = "_b"; // 

// region init 

// 0.1.1 : lecture gpx ou json
// 0.2.1 : essai responsive design
// 0.3.0 : objets calques 
// 0.3.1 : objets calques debuggé
// 0.3.2 : OSM import
// 0.3.3 : Waymarked Trails
// 0.4.0 : gestion calques ok
// 0.4.1 : tableau de features
// 0.5.1 : localisation ok
// 0.5.2 : rge alti 2 (HR, encore des trous mais progresse)
// 0.5.3 : changé div coordonnées
// 0.5.4 : insérer point localisé ok
// 0.5.4_X : essais pour panoramax (tuiles) ok mais après ne marche plus
// 0.5.5 : essai de distance entre deux points -> ok
// 0.5.6 : 5.4.X + 5.5
// 0.5.7 : essai pour voir les photos panoramax
//		_b : ok à nettoyer
// 0.5.8 : supprimé panoramax de stephaneP calque Panox en cours
// 0.5.9 : panoramax en cours calques panox en 3 et 4 
// 0.6.0 : panoramax ok	
// 0.6.1 : intégré panox dans script
// 0.6.2 : panoramax ok
// 0.7.2 : version mobile
// 0.7.3 : mapView in localStorage
// 0.7.4 : image
// 0.7.6 : 360°
	
// osmtogeojson :  https://github.com/tyrasd/osmtogeojson
// Leaflet version = "1.6.0"

var isMobile = window.matchMedia('(hover: none) and (pointer: coarse)').matches;

window.onload = (event) => {
	b_version.innerHTML = 'V: ' + version + subV; 
	document.title = 'Carto_tools  V_' + version + subV;
	console.log("version : ", version + subV);
	init_features_table();
	cb_hd.checked = false;

// params test 
// https://pbalyx.github.io/Carto/carto_tools/Carto_tools.html?zoom=15&center=[44.56,4.4194]	

	mapCenter = defaultCenter;
	mapZoom = defaultZoom;
	
	const saved = localStorage.getItem('lastMapView');
	if (saved) {
		const { lat, lng, zoom } = JSON.parse(saved);
		mapCenter = [lat, lng];
		mapZoom = zoom;
	}
	
	const params = new URLSearchParams(window.location.search);
	if (params.toString() !== "") {
		decodeParams(params);
	}
	
/// console.log(mapCenter, mapZoom);
	init_map();
///	console.log("isMobile: ",isMobile ?  "true" : "false");
///	statusDiv.innerHTML = "isMobile: ";
///	statusDiv.innerHTML += isMobile ?  "true" : "false";	
};

function decodeParams(_params) {
	if (_params.has("zoom")) { mapZoom = _params.get("zoom")};
	if (_params.has("center")) { mapCenter = JSON.parse(_params.get("center"))};
	if (_params.has("source")) { 
		var _url = JSON.parse(_params.get("source"))
		switch (_url) {
			case "osm":
			panoxUrl = osmUrl;
			break;
			case "ign":
			panoxUrl = ignUrl;
			break;			
		}
	};
}

function init_map() {
	map.setView(mapCenter, mapZoom); 
	curPt_latlng = L.latLng(map.getCenter());
	curPtMark.setLatLng(curPt_latlng);
///	console.log("map.getCenter()",map.getCenter());
}

// endregion

// region Map Tiles

//region OTM
	var OTMLayer = L.tileLayer('https://a.tile.opentopomap.org/{z}/{x}/{y}.png', {
		maxNativeZoom:15,
		maxZoom: 18,
		attribution: '&copy  <a href="http://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> | <a href="https://www.opentopomap.org/ target="_blank"">OpenTopoMap</a>'
	}); 

//region OSM/ 	
////var OSMLayer = L.tileLayer('https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png', {
var OSMLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
		maxZoom: 19,
		attribution: '&copy <a href="http://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>'
	});	

// region PlanIGN
	var PlanIGNLayer = L.tileLayer('https://data.geopf.fr/wmts/?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2&STYLE=normal&TILEMATRIXSET=PM&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&FORMAT=image%2Fpng', {
		maxNativeZoom:19,
		maxZoom: 20,
		attribution: ' Carte: <a href="https://geoservices.ign.fr/planign" target="_blank">Plan IGN</a> | Tracés: <a href="https://www.openstreetmap.org" target="_blank">OpenStreetMap</a>'
	});

// region IGNPhoto
	var IGNPhotoLayer = L.tileLayer('https://data.geopf.fr/wmts/?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=ORTHOIMAGERY.ORTHOPHOTOS&STYLE=normal&TILEMATRIXSET=PM&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&FORMAT=image%2Fjpeg', {
		maxNativeZoom:19,
		maxZoom: 20,
		attribution: '<a href="https://geoservices.ign.fr/" target="_blank">IGN Image aérienne</a> | Tracés: <a href="https://www.openstreetmap.org" target="_blank">OpenStreetMap</a>'
	});
	
// region RGE alti

const RGEalti_url_1 = 'https://data.geopf.fr/wmts?service=WMTS&format=image/png&version=1.0.0&request=GetTile&style=normal&tilematrixset=PM&tilematrix={z}&tilerow={y}&tilecol={x}&layer=IGNF_ELEVATION.ELEVATIONGRIDCOVERAGE.SHADOW';

const RGEalti_url_2 = 'https://data.geopf.fr/wmts?service=WMTS&format=image/png&version=1.0.0&request=GetTile&style=normal&tilematrixset=PM&tilematrix={z}&tilerow={y}&tilecol={x}&layer=IGNF_LIDAR-HD_MNT_ELEVATION.ELEVATIONGRIDCOVERAGE.SHADOW';

	var RGEaltiLayer = L.tileLayer(RGEalti_url_2,
	{ 
		maxNativeZoom:17,
 		maxZoom: 20,
		attribution: '<a href="https://geoservices.ign.fr/" target="_blank">IGN RGE alti</a>'
	});

// region Stava

var url_strava1 = 'https://proxy.nakarte.me/https/heatmap-external-b.strava.com/tiles-auth/run/purple/{z}/{x}/{y}.png';

var url_strava2 = 'https://strava-heatmap.tiles.freemap.sk/run/purple/{z}/{x}/{y}.png';

var url_strava3old = 'https://heatmap-external-a.strava.com/tiles-auth/run/purple/{z}/{x}/{y}.png?Key-Pair-Id=APKAIDPUN4QMG7VUQPSA&Policy=eyJTdGF0ZW1lbnQiOiBbeyJSZXNvdXJjZSI6Imh0dHBzOi8vaGVhdG1hcC1leHRlcm5hbC0qLnN0cmF2YS5jb20vKiIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTczNjc4MDc2Mn0sIkRhdGVHcmVhdGVyVGhhbiI6eyJBV1M6RXBvY2hUaW1lIjoxNzM1NTU2NzYyfX19XX0_&Signature=cnbRKnURivt-1m8zfEChfy4tkMlNXm8jygO5a9FyKP40Y-TQGZzqdhPpl6sKgGMRr-59Lwjt3vMnM-9JdxXbLC1Hp~dd8IYUeOfGZBxTxbUm6Os0YyMUZBW7Z-ZG~H0zCcCRlhAL3vsc7StrRI8oCFxBbY4A~BgOWTAivLDHnYofcUr66DqTMAZyObhrewEyj1BkUyq96gNYDc7fDIPKaIf19nugtUY3k69BoJ03x0juUqjnbk~F2OVurOBulnYc2w15jGNlLqZwuhJ2v4ABmRZbJtOnE~vFLoYpwfC212eT0-zem95xyPRwk8jN00x7SaBrXmN90IBaGRvJm-Ak9w__';

var url_strava3 = 'https://heatmap-external-a.strava.com/tiles-auth/all/purple/{z}/{x}/{y}.png?Key-Pair-Id=K3VK9UFQYD04PI&Policy=eyJTdGF0ZW1lbnQiOiBbeyJSZXNvdXJjZSI6Imh0dHBzOi8vKmNvbnRlbnQtKi5zdHJhdmEuY29tL2lkZW50aWZpZWQvKiIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc0Mzk3Njc1OX19fV19&Signature=H-MKinYCo6~PwEZ48p~l88hdGLQvhrh3Fx6w3YKGcspWjTnItOQfeT7vq~KM-hrWC18Kt-VOn3hEWC6dKMFqftSRtzoJ4Mv9rjT89VKlp1GH7g6YJT4pq2oySA8ay9u6pCC7GCBjZoj44d0YZcgJjLoJ3MkNJ8eKUqZ~12sa4yCVTR6Tno6auHGQ0qBMYrzkUI7MyHJLov5NYcZNXtNNLUBevGamRBBxiJV7vBtKPon8jiSNbIWicMwVkUsbUTmoibd9QltQgiA0A20qwN~qtr5Vw00FjRHCyqRQ49kz8P3CbOfcNRSEkZoDlQxgvPr4ceeloDQNohN~KAU98WlJew__';

var url_strava4 = 'https://content-a.strava.com/anon/globalheat/all/purple/{z}/{x}/{y}.png';

	var StavaLayer = L.tileLayer(	url_strava4,{
		maxNativeZoom:11,
 		maxZoom: 19,
		minZoom: 11,
		attribution: '| <a href="https://www.strava.com/" target="_blank">Stava</a>'
	});
// endregion

// region BD Topo
//https://a.tile.openstreetmap.fr/bdtopo/14/8392/5917.png en direct marche
	var BD_TopoLayer = L.tileLayer('https://a.tile.openstreetmap.fr/bdtopo/{z}/{x}/{y}.png', {
		maxZoom: 19,
		attribution: '| <a href="https://geoservices.ign.fr/" target="_blank">IGN BD Topo</a>'
	});
// endregion

// region Waymarkedtrail
//https://tile.waymarkedtrails.org/hiking/14/8388/5930.png en direct marche
	var WMTLayer = L.tileLayer('https://tile.waymarkedtrails.org/hiking/{z}/{x}/{y}.png', {
		maxNativeZoom:17,
		maxZoom: 19,
		attribution: '| <a href="https://www.waymarkedtrails.org/" target="_blank">Waymarked Trails</a>'
	});

// endregion

// region Calques

function layer_onEachFeatureDo(feature, layer) {
	var popupStr = '';
	if (feature.assets) {
		layer.on('click', onCalqueClickPanox);
	} else {
		if (feature.properties) { 
			if (feature.properties.name) {
				popupStr += '<b>'+feature.properties.name+'</b>';
			} else if (feature.properties.lwn_ref) {
				popupStr += '<b>'+feature.properties.lwn_ref+'</b>';
			} else if (feature.id) {
				popupStr += '<b>'+feature.id+'</b>';
			}
			if (feature.properties.distance) {
				popupStr += '<br /> Longueur: '+ feature.properties.distance +' km';
			}
			if (feature.properties.ascent) {
				popupStr += '<br /> Denivelé:  +'+ feature.properties.ascent +' m  -'+ feature.properties.descent+ ' m';
			}
			if (feature.properties.ele) {
				popupStr += '<br /> '+ feature.properties.ele +' m';
			}
			if (feature.properties.note) {
				popupStr += '<br /> note: <i>'+ feature.properties.note +'</i>';
			}
			if (feature.properties.desc) {
				popupStr += '<br /> desc: '+ feature.properties.desc ;
			}
		}
		layer.bindPopup(popupStr);
		layer.on('click', onCalqueClickNormal);
	}
}

function onCalqueClickPanox(e) {
///	console.dir(e.target)	
	panox_click(e); //function in panoramax zone	
}

function onCalqueClickNormal(e) {
///	console.dir(e.target)
		e.target.bindPopup();
}


var defaultStyle = {
	color: "green",
	fillColor: "blue",
	"weight": 2,
	"opacity": 1,
	"fillOpacity": 0.8,
	"stoke": true,
	"fill":false
};

const style1 = {"color": "red",	"fillColor": "Yellow"};
const style2 = {"color": "Navy",	"fillColor": "Chartreuse",  "radius":"5"};
const style3 = {"color": "Maroon",	"fillColor": "green"};
const stylePanox = {"color": "red",	"fillColor": "Yellow"};
const styleSeq = {"color": "Blue",	"fillColor": "LightBlue",  "radius":"5"};
const styles = [style1, style2, style3, stylePanox, styleSeq];

const styleSelected = {"color": "Blue",	"fillColor": "PowderBlue", "radius":"8"};

function isPresentBad(_feature, _featuresList) {
	var _isPresent = false;
		for (var j = 0; j < _featuresList.length; j++) {
			if (Object.is(_feature, _featuresList[j])) {
				_isPresent = true;
				break;
			}
		}	
	return _isPresent;
}

function isPresent(_feature, _featuresList) {
	var _isPresent = false;
	var _featureId = _feature["id"];
	if (_featureId) {
		for (var j = 0; j < _featuresList.length; j++) {
			if (_featureId == _featuresList[j]["id"]) {
				_isPresent = true;
				break;
			}
		}
	} else if (_feature.properties) {
		var _propertyId = _feature.properties["@id"];
		if (_propertyId) {
			for (var j = 0; j < _featuresList.length; j++) {
				if (_featuresList[j].properties 
					&& _propertyId == _featuresList[j].properties["@id"]) {
					_isPresent = true;
					break;
				}
			}
		} else if (_feature.properties.name){
			for (var j = 0; j < _featuresList.length; j++) {
				if (_featuresList[j].properties 
					&& _feature.properties.name == _featuresList[j].properties.name) {
					_isPresent = true;
					break;
				}
			}

		}
	}
	
	return _isPresent;
}

function fillCircleMarkers(_layer) {
	_layer.eachLayer(function (subLayer) { 	
		if (subLayer.feature.geometry.type == "Point") {
			subLayer.setStyle({"fill":true, "weight": 2 });
		}		
	});
}
		
//objet layer
function CalqueObj (_name) {
	this.name = _name;
	this.layer = L.geoJSON(this.layerJson, {
		style: defaultStyle,
		onEachFeature: layer_onEachFeatureDo,
		pointToLayer: function(feature, latlng) {
			return new L.CircleMarker(latlng, {
				radius: 5,
				weight: 2
			});
		}
	});
	
	this.layerJson = {"features":[]};
	this.setStyle = function(_style) { 
		this.layer.setStyle(_style);
	}
	this.updateLayer = function () {
		this.layer.clearLayers();
		this.layer.addData(this.layerJson.features);
		fillCircleMarkers(this.layer); // needed to overwrite fill=false for markers
	}
	this.lastAddedFeaturesList = [];  // used to undo last action
	this.addFeatures = function(_addedJson) {
		this.lastAddedFeaturesList = [];
		for (var i = 0; i < _addedJson.features.length; i++) {
			if (!isPresent(_addedJson.features[i], this.layerJson.features)) {
				this.lastAddedFeaturesList.push(_addedJson.features[i]);
				this.layerJson.features.push(_addedJson.features[i]);
			}
		}
///console.log(this.layerJson.features);
		this.updateLayer();	
		fill_features_table();
	}
	
	this.undoLast = function() {
		var _tmpFeaturesList = [];
//		console.log("avant ",this.layerJson.features);
		for (var i = 0; i < this.layerJson.features.length; i++) {
			if (!isPresent(this.layerJson.features[i], this.lastAddedFeaturesList)) {
				_tmpFeaturesList.push(this.layerJson.features[i]);
			}
		}
		this.layerJson.features = _tmpFeaturesList;
		this.lastAddedFeaturesList =[];	
//		console.log("après ",this.layerJson.features);
		this.updateLayer();	
		fill_features_table();
	}
	this.clearLayer = function () {
		this.layer.clearLayers();
		this.layerJson = {"features":[]}; 
		fill_features_table();
	}
}

function updateCalque(_num, _addedJson) {
	var calque = calques[_num];
	var isNew = (calque.layerJson.features.length == 0);
	try {
	calque.addFeatures(_addedJson);
	if (isNew) {
		map.addLayer(calque.layer);
	}
	calque.setStyle(styles[_num]); //must be done each time (?)
	overlaysVis_remove(calque.name); 
	overlaysVis.push(calque.name);
	}
	catch (err) {
		console.log(err);
	}
}


var calque1 = new CalqueObj("Calque1");
var calque2 = new CalqueObj("Calque2");
var calque3 = new CalqueObj("Calque3");
var calquePanox = new CalqueObj("Panoramax");
var calqueSeq = new CalqueObj("Sequence");
const calques = [calque1, calque2, calque3, calquePanox, calqueSeq];

// endregion

// region map

const defaultCenter = [44.622, 4.40];// Aubenas
const defaultZoom = 13;

var mapCenter;
var mapZoom;

//const defaultCenter = [44.65, 4.251];//Jaujac
//const defaultCenter = [44.60758, 4.44063];// Jastres
//const defaultCenter = [44.56, 4.4194];// Vogüé

var map = L.map('map', {
	layers: [
		OTMLayer 
	]}); 

L.control.scale({maxWidth: 200, imperial: false}).addTo(map);
var zoom_div = document.getElementById("zoom_div");
zoom_div.innerHTML = 'zoom: ' + map.getZoom();
	
var baseMaps = {
    "OpenTopoMap": OTMLayer,
    "OpenStreetMap": OSMLayer,
	"Plan IGN": PlanIGNLayer,
	"IGN Image aérienne": IGNPhotoLayer,
	"RGEalti": RGEaltiLayer
	};
var overlayMaps = {
	"BD_Topo": BD_TopoLayer,
	"Stava": StavaLayer,
	"Waymarked_Trails": WMTLayer,
};
overlayMaps[calque1.name] = calque1.layer;
overlayMaps[calque2.name] = calque2.layer;
overlayMaps[calque3.name] = calque3.layer;
overlayMaps[calquePanox.name] = calquePanox.layer;
overlayMaps[calqueSeq.name] = calqueSeq.layer;

var layerControl = L.control.layers(baseMaps, overlayMaps).addTo(map);

// flags for visibility dependant of layerControl
// (don't add layers on moveend if their layerControl checkBox is not checked)
// add layers in correct order for superposition
var overlaysVis = [];

var map_moving = false;

map.on("movestart", function () {
	map_moving = true;
	for (var i = 0; i < calques.length; i++) {
		map.removeLayer(calques[i].layer);
	}
	map.removeLayer(StavaLayer);
	map.removeLayer(BD_TopoLayer);
	map.removeLayer(WMTLayer);
}); 

map.on("moveend", function () {
	for (var i = 0; i < overlaysVis.length; i++) {
		var layerName = overlaysVis[i];
		if (overlayMaps[layerName]) {
			map.addLayer(overlayMaps[overlaysVis[i]]);
		} 
/*		
//// todo : manage calque name change
		else {
			for (var j=0; j < calques.length; j++) {
				if (calques[j].name == layerName) {
					map.addLayer(calques[i].layer);
				}
			}
		}
*/
	}
	map_moving = false;
	saveView();
});

function overlaysVis_remove(name) {
	overlaysVis = overlaysVis.toSpliced(overlaysVis.indexOf(name),1)
}

map.on("overlayremove", e => {
	if (!map_moving) {
		overlaysVis_remove(e.name);
	}
});

map.on("overlayadd", e => {
	if (!map_moving) {
		overlaysVis.push(e.name);
	}
});

map.on("click", function(e){
	if (actionMode == "explore") {
		osm_latlng = e.latlng;
		osmMark.setLatLng(osm_latlng);
	} else {
		curPt_latlng = e.latlng;
//		console.log(curPt_latlng);
		curPtMark.setLatLng(curPt_latlng);
		if (coordsMode) { update3DCoords();} 
	}
});

map.on("zoomend", function(ev) {		
	setOsmSearchRadius();
	updateLocPtAccRadius();
	zoom_div.innerHTML = 'zoom: ' + map.getZoom();
});

function saveView() {
  const _center = map.getCenter();
  const _zoom = map.getZoom();
  localStorage.setItem('lastMapView', JSON.stringify({
    lat: _center.lat,
    lng: _center.lng,
    zoom: _zoom
  }));
}

function dragElement(header, elem) {
	header.onmousedown = dragMouseDown;
	header.addEventListener('touchstart', dragTouchStart, { passive: false });

	var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0, posTop = 0;

	// Ignore le drag si on clique/touche un élément interactif du header
	function isInteractive(target) {
		return target.closest('button, a, input, select, textarea, [data-no-drag]');
	}

	// ---- SOURIS ----
	function dragMouseDown(e) {
		e = e || window.event;
		if (isInteractive(e.target)) { return; }
		e.preventDefault();

		pos3 = e.clientX;
		pos4 = e.clientY;
		document.onmouseup = closeDragElement;
		document.onmousemove = elementDrag;
	}

	function elementDrag(e) {
		e = e || window.event;
		e.preventDefault();
		pos1 = pos3 - e.clientX;
		pos2 = pos4 - e.clientY;
		pos3 = e.clientX;
		pos4 = e.clientY;
		moveElement(pos1, pos2);
	}

	function closeDragElement() {
		document.onmouseup = null;
		document.onmousemove = null;
	}

	// ---- TACTILE ----
	function dragTouchStart(e) {
		if (isInteractive(e.target)) { return; }
		e.preventDefault();
		var touch = e.touches[0];

		pos3 = touch.clientX;
		pos4 = touch.clientY;

		document.addEventListener('touchend', closeDragTouch, { passive: false });
		document.addEventListener('touchmove', elementTouchDrag, { passive: false });
	}

	function elementTouchDrag(e) {
		e.preventDefault();
		var touch = e.touches[0];

		pos1 = pos3 - touch.clientX;
		pos2 = pos4 - touch.clientY;
		pos3 = touch.clientX;
		pos4 = touch.clientY;
		moveElement(pos1, pos2);
	}

	function closeDragTouch() {
		document.removeEventListener('touchend', closeDragTouch);
		document.removeEventListener('touchmove', elementTouchDrag);
	}

	// ---- Fonction commune de déplacement ----
	function moveElement(deltaX, deltaY) {
		posTop = elem.offsetTop - deltaY;
		if (posTop < 0) { posTop = 0; } // empêche le header de dépasser le haut
		elem.style.top = posTop + "px";
		elem.style.left = (elem.offsetLeft - deltaX) + "px";
	}
}
	
function moveableMarker(map, marker) {
// drag circleMarker from
// https://stackoverflow.com/questions/43410600/leaflet-v1-03-make-circlemarker-draggable
  function trackCursor(evt) {
    marker.setLatLng(evt.latlng)
  }
  marker.on("mousedown", () => {
    map.dragging.disable()
    map.on("mousemove", trackCursor)
  })
  marker.on("mouseup", () => {
    map.dragging.enable()
    map.off("mousemove", trackCursor)
  })
  return marker
}
	
// endregion

// region menu

var calqueIndex = 0;
var calqueMode = true;

b_calque.onclick = ()=>{
alert("A faire");
}
b_layer_1.onclick = setLayer;
b_layer_2.onclick = setLayer;
b_layer_3.onclick = setLayer;
b_element.onclick = setLayer;
b_layer_1b.onclick = setLayer;
b_layer_2b.onclick = setLayer;
b_layer_3b.onclick = setLayer;

function setLayer(ev) {
	var b_id = ev.target.id;
//	console.log(b_id);
	if (b_id == "b_element") {
		updateInfoMode(!calqueMode);
	} else {
		switch (b_id) {
			case "b_layer_1": 
			case "b_layer_1b": 
				calqueIndex = 0;
				break;
			case "b_layer_2": 
			case "b_layer_2b": 
				calqueIndex = 1;
				break;
			case "b_layer_3": 
			case "b_layer_3b": 
				calqueIndex = 2;
				break;
		}
		updateLayerMenu();
		fill_features_table();
	} 

}

function updateLayerMenu() {
	b_element.innerHTML = "Element";
	b_layer_1.innerHTML = calque1.name;
	b_layer_2.innerHTML = calque2.name;
	b_layer_3.innerHTML = calque3.name;
	b_element.style.backgroundColor = "MediumSpringGreen";
	b_layer_1b.style.backgroundColor = "MediumSpringGreen";
	b_layer_2b.style.backgroundColor = "MediumSpringGreen";
	b_layer_3b.style.backgroundColor = "MediumSpringGreen";
	switch (calqueIndex) {
		case 0: 
			b_layer_1.innerHTML += ' -x-';
			b_layer.innerHTML = calque1.name;
			b_layer_1b.style.backgroundColor = "Orange";
			break;
		case 1: 
			b_layer_2.innerHTML += ' -x-';
			b_layer.innerHTML = calque2.name;
			b_layer_2b.style.backgroundColor = "Orange";
			break;
		case 2: 
			b_layer_3.innerHTML += ' -x-';
			b_layer.innerHTML = calque3.name;
			b_layer_3b.style.backgroundColor = "Orange";
			break;
	}
}

//----------- file ---------------
// read file in handleFileSelect

b_networkImport.onclick =  ()=>{
	if (actionMode != "import") { actionMode = "import" } else {actionMode = "none"};
	show_hideOsm();
}

b_panoramaxAround.onclick =  ()=>{ 
	panoramaxAround(1000);
	updateInfoMode(false); // set infoDiv on panoramax
}

b_panoramaxInBox.onclick = panoramaxInBox;
b_panoramaxClear.onclick = panoramaxClear;

b_undo.onclick = () => {	
	calques[calqueIndex].undoLast();
	calques[calqueIndex].setStyle(styles[calqueIndex]);
}

b_center_file.onclick = centerCalque;
b_panoramaxCenter.onclick = centerCalque;
function centerCalque(ev) {
	var _index = calqueIndex;
	if (ev.target.id == "b_panoramaxCenter") {
		_index = 3;
	}
	var bounds = calques[_index].layer.getBounds();
	if (bounds.isValid()) {
		map.fitBounds(bounds);
	}
}

b_close_file.onclick = () => {	
//console.log(calques[calqueIndex].layer);
	calques[calqueIndex].clearLayer();
	map.removeLayer(calques[calqueIndex].layer);
	overlaysVis_remove(calques[calqueIndex].name);
//console.log(calques[calqueIndex].layer);
}


//------------ tools --------------
b_coords.onclick = ()=> {
	coordsMode = !coordsMode;
	show_hideCoords(coordsMode);
}

b_centerPoint.onclick = ()=> {
	map.setView(curPt_latlng);
}

b_center.onclick = ()=> {
	map.setView(curPt_latlng);
}

b_osmExplore.onclick = ()=>{
	if (actionMode != "explore") { actionMode = "explore" } else {actionMode = "none"};
//	osmExploreMode = !osmExploreMode;
	show_hideOsm();
}

//----------- GPS --------------

b_loc.onclick = ()=> {
	geoFindMe("loc");
}

b_center_loc.onclick = ()=> {
	geoFindMe("center");
//	alert('to do');
}

b_wpt.onclick = ()=> {
	geoFindMe("wpt");
}

b_trkpt.onclick = ()=> {
	geoFindMe("trkpt");
}

b_save_gpx.onclick = ()=> {
  saveGpx();
}

//endregion

// region point courant

var curPt_latlng = L.latLng([0,0]);
var curPt1_latlng = L.latLng([0,0]);
var curPt2_latlng = L.latLng([0,0]);
var curPtDiv = document.getElementById('curPtDiv');
var curPtHeader = document.getElementById('curPtHeader');
var curPtElev = document.getElementById('curPtElev');
var cb_LatLng = document.getElementById('cb_LatLng');

cb_LatLng.addEventListener('change', (event) => {
	update3DCoords();
});

dragElement(curPtHeader, curPtDiv );

var coordsMode = false;

bCloseCurPt.onclick = ()=> {
	show_hideCoords(false);
}

function show_hideCoords(vis){
	if(vis) {
		curPtDiv.style.display = "block";			
		update3DCoords();
		b_coords.innerHTML = "Coordonnées -x-";
		actionMode = "none";
		show_hideOsm();
	}
	else {
		curPtDiv.style.display = "none";			
		b_coords.innerHTML = "Coordonnées";
	}
	coordsMode = vis;
	
}

var curPtMark = new L.CircleMarker(curPt_latlng,
	{
		radius: 4,
		fillColor: "orange",
		fillOpacity: 0.6,
		color: "black",
		weight: 1					
	}
).addTo(map);
var curPtMov = moveableMarker(map, curPtMark)	//même marker mais déplaçable

var curPt1Mark = new L.CircleMarker(curPt1_latlng,
	{
		radius: 4,
		fillColor: "red",
		fillOpacity: 0.6,
		color: "black",
		weight: 1					
	}
).addTo(map);
var curPtMov1 = moveableMarker(map, curPt1Mark)	//même marker mais déplaçable

var curPt2Mark = new L.CircleMarker(curPt2_latlng,
	{
		radius: 4,
		fillColor: "blue",
		fillOpacity: 0.6,
		color: "black",
		weight: 1					
	}
).addTo(map);
var curPtMov2 = moveableMarker(map, curPt2Mark)	//même marker mais déplaçable

function curPtCoordsStr() {
	var latLngStr;
	if (cb_LatLng.checked) {
		latLngStr = curPt_latlng.lat.toFixed(5)+ ', ' + curPt_latlng.lng.toFixed(5);
	} else {
		latLngStr = curPt_latlng.lng.toFixed(5)+ ', ' + curPt_latlng.lat.toFixed(5);
	}
	return latLngStr;
}

function update3DCoords(){
	updateLonLat();
	getPointElev(curPtCoordsStr());
}

function updateLonLat() {
	editLonLat.value = curPtCoordsStr();

}

b_copyCoords.onclick = copyCoords;	
b_copy1.onclick = copyCoords;	
b_copy2.onclick = copyCoords;	
function copyCoords(event) {
	var strTmp, strSplit;
		strTmp = editLonLat.value;
	if (event.target.id == "b_copyCoords") {
	} else {
		strSplit = strTmp.split(',');
		if (event.target.id == "b_copy1") {
			strTmp = strSplit[0].trim();
		} else {
			strTmp = strSplit[1].trim();
		}
	}
		
	navigator.clipboard.writeText(strTmp)
}

b_paste.onclick = a_pasteCoords;
async function a_pasteCoords() {
    const text = await navigator.clipboard.readText()
	editLonLat.value = text;
	setEdit();
}

function pasteCoords() {
 // document.querySelector('editLonLat').focus();
 editLonLat.focus();
  const result = document.execCommand('paste')
  console.log('document.execCommand result: ', result);
}

editLonLat.onchange = setEdit;
function setEdit() {
	b_editCancel.style.display = "inline";
	b_editOk.style.display = "inline";
	console.log(editLonLat.value);
}

editLonLat.addEventListener('keypress', function(event) {
 // Vérifiez si la touche pressée est Entrée
 if (event.keyCode === 13) {
     // Appeler votre fonction de validation ici
     validInput(true);
 }
});

function validInput(isOk) {
	if (isOk) {
		decodeEdit(editLonLat.value, 0);
	}else {
		update3DCoords(); //restore previous value	
	}
	b_editOk.style.display = "none";
	b_editCancel.style.display = "none";	
}

b_editOk.onclick = ()=> {
	validInput(true);
}

b_editCancel.onclick = ()=> {
	validInput(false);
}

function decodeEdit(lonLatStr, _num) {
/*	lonLatSplit = lonLatStr.split(',');
	if (cb_LatLng.checked) {
		ptLatlng = L.latLng(lonLatSplit[0], lonLatSplit[1]);
	} else {
		ptLatlng = L.latLng(lonLatSplit[1], lonLatSplit[0]);
	}*/
	var _ptLatlng = ptLatlng(lonLatStr);
	switch(_num) {
		case 0:
			curPt_latlng = _ptLatlng;
			curPtMark.setLatLng(curPt_latlng);
			update3DCoords();
		break;
		case 1:
			curPt1_latlng = _ptLatlng;
			curPt1Mark.setLatLng(curPt1_latlng);
		break;
		case 2:
			curPt2_latlng = _ptLatlng;
			curPt2Mark.setLatLng(curPt2_latlng);
		break;
	}
	console.log(_num, curPt_latlng);
}
function ptLatlng(lonLatStr) {
	var _ptLatlng;
	lonLatSplit = lonLatStr.split(',');
	if (cb_LatLng.checked) {
		_ptLatlng = L.latLng(lonLatSplit[0], lonLatSplit[1]);
	} else {
		_ptLatlng = L.latLng(lonLatSplit[1], lonLatSplit[0]);
	}
 return _ptLatlng;
}
	
// region elev

// const URLbase = 'https://wxs.ign.fr/calcul/alti/rest/elevation.json?'; old url
const 
  URLbase = 'https://data.geopf.fr/altimetrie/1.0/calcul/alti/rest/elevation.json?resource=ign_rge_alti_wld&';
	
function getPointElev(_coordStr) {
var lonPrm, latPrm, URLFull, responseStr;
var elevStr = '???';
var	ptStrs ;
	ptStrs = _coordStr.split(',');
	if (cb_LatLng.checked) {
		lonPrm = 'lon=' + ptStrs[1].trim();
		latPrm = 'lat=' + ptStrs[0].trim();
	} else {
		lonPrm = 'lon=' + ptStrs[0].trim();
		latPrm = 'lat=' + ptStrs[1].trim();
	}
	URLFull = URLbase + lonPrm + '&' +latPrm + '&zonly=true';  
////	URLFull = URLbase + lonPrm + '&' +latPrm ;  
	curPtElev.style.backgroundColor = "Red";
	var httpRequest = new XMLHttpRequest();
	httpRequest.open('GET', URLFull);
	httpRequest.onload = function() {
		responseStr = httpRequest.response;
// 		console.log(responseStr);
		elevStr = responseStr.substring(responseStr.indexOf("[")+1, responseStr.indexOf("]"));
		curPtElev.innerHTML = 'ele: ' + elevStr + ' m' ;
		curPtElev.style.backgroundColor = "Lavender";
	}
	httpRequest.send();
}

// endregion
	
// endregion

// region distance
var distDiv = document.getElementById('distDiv');
var distHeader = document.getElementById('distHeader');
var distSpan = document.getElementById('distSpan');

var distMode = false;

b_dist.onclick  = ()=> {
	show_hideDist(true);
}
bCloseDist.onclick = ()=> {
	show_hideDist(false);
}

function show_hideDist(vis){
	if(vis) {
		distDiv.style.display = "block";			
	}
	else {
		distDiv.style.display = "none";			
	}
	distMode = vis;
}

dragElement(distHeader, distDiv );


b_cur1.onclick = copyCurrent;
b_cur2.onclick = copyCurrent;
function copyCurrent(ev) {
	switch (ev.target.id) {
		case "b_cur1":
			curPt1_latlng = curPt_latlng;
			editPt1.value = curPtCoordsStr();
			curPt1Mark.setLatLng(curPt1_latlng);
		break;
		case "b_cur2":
			curPt2_latlng = curPt_latlng;
			editPt2.value = curPtCoordsStr();
			curPt2Mark.setLatLng(curPt2_latlng);
		break;	
	}
}

b_paste1.onclick = a_paste;
b_paste2.onclick = a_paste;
async function a_paste(ev) {
	
console.log(ev.target.id);
	var ptNum = 1;
 	if (ev.target.id == "b_paste2") {ptNum = 2};
   const text = await navigator.clipboard.readText()
//	editPt1.value = text;
	setEdit_num(ptNum, text);
}

function pasteCoords() {
 // document.querySelector('editLonLat').focus();
 editPt1.focus();
  const result = document.execCommand('paste')
  console.log('document.execCommand result: ', result);
}

editPt1.onchange = setEdit_num;
function setEdit_num(_num, _text) {
	switch (_num) {
		case 1: 
			editPt1.value = _text;
			break;
		case 2 :
			editPt2.value = _text;
			break;
	}
	decodeEdit(_text,_num)
//	b_editCancel.style.display = "inline";
//	b_editOk.style.display = "inline";
//	console.log(_num, _text);
}

b_calc.onclick = calcDist;
function calcDist() {
	var _dist = distSphere(curPt1_latlng, curPt2_latlng);
	distSpan.innerText = _dist.toFixed(3);
}

	function distSphere(pt1, pt2) { // units metre
		function _deg2rad (deg) { return deg * Math.PI / 180; }
		var R = 6371000;
		var dLat = _deg2rad(pt2.lat - pt1.lat);
		var dLon = _deg2rad(pt2.lng - pt1.lng);
		var r = Math.sin(dLat/2) *
		  Math.sin(dLat/2) +
		  Math.cos(_deg2rad(pt1.lat)) *
		  Math.cos(_deg2rad(pt2.lat)) *
		  Math.sin(dLon/2) *
		  Math.sin(dLon/2);
		var c = 2 * Math.atan2(Math.sqrt(r), Math.sqrt(1-r));
		var d = R * c;
		return d;
	  }


// endregion

// region statusDiv
var statusDiv = document.getElementById('statusDiv');
var statusHeader = document.getElementById('statusHeader');
var statusTxt = document.getElementById('statusTxt');
var statusVisible = false;

	b_status.onclick = () => {
		statusVisible = !statusVisible;
		show_hideStatus(statusVisible);
	}
	
	bCloseStatus.onclick = (ev) => {
		show_hideStatus(false);
	}
	
	function show_hideStatus(vis){
		if(vis) {
			statusDiv.style.display = "block";
			b_status.innerHTML = "Status -x-";
		}
		else {
			statusDiv.style.display = "none";
			b_status.innerHTML = "Status";
		}
		statusVisible = vis;
	}

dragElement(statusHeader, statusDiv );


//endregion

// region infoDiv
var infoDiv = document.getElementById("infoDiv");
var infoHeader = document.getElementById("infoHeader");
var countSpan = document.getElementById("countSpan");
var element_div = document.getElementById("element_div"); 
var elementInfo_div = document.getElementById("elementInfo_div"); 
var features_div = document.getElementById("features_div"); 
var features_table = document.getElementById("features_table");
var features_table_head = document.getElementById("features_table_head"); 

var infoVisible = false;

	b_info.onclick = () => {
		infoVisible = !infoVisible;
		show_hideInfo(infoVisible);
	}
	
	bCloseInfo.onclick = (ev) => {
		show_hideInfo(false);
	}
	
	function show_hideInfo(vis){
		if(vis) {
			infoDiv.style.display = "block";
			b_info.innerHTML = "Info -x-";
		}
		else {
			infoDiv.style.display = "none";
			b_info.innerHTML = "Info";
		}
		infoVisible = vis;
	}

dragElement(infoHeader, infoDiv );

function updateInfoMode(_calqueMode) {
	calqueMode = _calqueMode;
	if (calqueMode) {
		b_layer_1b.style.display = "inline";	
		b_layer_2b.style.display = "inline";	
		b_layer_3b.style.display = "inline";
		b_element.innerHTML = " -> Panoramax";
		features_div.style.display = "block";
		element_div.style.display = "none";	
	} else {
		b_layer_1b.style.display = "none";	
		b_layer_2b.style.display = "none";	
		b_layer_3b.style.display = "none";	
		b_element.innerHTML = " -> Calques";
		features_div.style.display = "none";
		element_div.style.display = "block";		
	}

}

function init_features_table() {
	features_table_head.innerHTML = 
	`
		<th style="width:55px">type</th>
		<th style="width:150px">id</th>
		<th style="width:400px">Nom</th>	
	`;
}

function fill_features_table() {
	//clear table
	var rows = features_table.getElementsByTagName('tr');
	for (var i = features_table.rows.length -1; i > 0; i--) {
		features_table.deleteRow(-1);
	}
	var nbFeatures = calques[calqueIndex].layerJson.features.length;
	countSpan.innerHTML = nbFeatures + " items: ";
//	console.log(calques[calqueIndex].layerJson.features);
	calques[calqueIndex].layerJson.features.forEach(function (item) {
		var row = features_table.insertRow();
		var _id = osmId(item);
		if (_id == "") {
			addCell(row, "xx");		
			addCell(row, "yy");		
		} else if (_id.indexOf('/') > 0) {
			addCell(row, _id.substring(0, _id.indexOf('/')));
			addCell(row, _id.substring( _id.indexOf('/')+1, _id.length));
		} else {
			addCell(row, "--");
			addCell(row, _id); 
		}
;	
		if (item.properties && item.properties.name ) { 
			addCell(row, item.properties.name); 
		} else { addCell(row, "zz");};		
	});
}

function osmId(_feature) {
	var strOut = "";
	if (_feature.id) {
		strOut = _feature.id 
	} else if (_feature.properties && _feature.properties["@id"]) {
		strOut = _feature.properties["@id"];
	}
	return strOut;
}

//endregion

// region OSM

var actionMode = "none"; // "none", "import", "explore"

function show_hideOsm(){
		if(actionMode == "none") {
			osmDiv.style.display = "none";
			importDiv.style.display = "none";
			b_osmExplore.innerHTML = "Explorer OSM";
			b_networkImport.innerHTML = "Importer sentiers";
			osmMark.removeFrom(map);
			curPtMark.addTo(map);		
		} 
		else if(actionMode == "explore") {
			osmStatus.innerHTML = "";
			osmDiv.style.display = "block";
			elements_div.style.display = "block";
			b_osmExplore.innerHTML = "Explorer OSM -x-";
			osm_latlng = curPt_latlng;
			osmMark.addTo(map);
			osmMark.setLatLng(osm_latlng);
			curPtMark.removeFrom(map);
			close_tags();
			objectsFound_array.length = 0;
			fill_elements_table();
			
			b_networkImport.innerHTML = "Importer sentiers";
			importDiv.style.display = "none";

			show_hideCoords(false);
		}
		else if (actionMode == "import") {
			osmStatus.innerHTML = "";
			osmDiv.style.display = "none";
			importDiv.style.display = "block";
///			elements_div.style.display = "none";
			b_osmExplore.innerHTML = "Explorer OSM";
			b_networkImport.innerHTML = "Importer sentiers -x-";
///			b_request.innerHTML = "Importer";

			show_hideCoords(false);
		} else {alert("actionMode", actionMode);
	}
}
	
// region Overpass

var overpassUrl = 'https://overpass-api.de/api/interpreter';
////var overpassUrl = 'https://overpass.openstreetmap.fr/api/interpreter';
////var overpassUrl = 'https://api-overpass.pikamap.fr/api/interpreter';

var queryType = ""; // type enum ?? (around, meta, import)
var queryOk = true;
var osmDiv = document.getElementById('osmDiv');
var osmHeader = document.getElementById('osmHeader');
var osmStatus = document.getElementById('osmStatus');
var importHeader = document.getElementById('importHeader');
var importStatus = document.getElementById('importStatus');

function centralQuery_around(_params) {
		var txt = "(nwr(around:";  //tout
		txt += _params._searchRadius;
		txt += ", ";
		txt+= latlngStr(_params._osm_latlng);
		txt += ");)";
		return txt;
}

function centralQueryMeta(_params) {
		var _type = _params.type;
		var _id = _params.id;
		var metaUrl = ""; 
		metaUrl += "(" + _type;
		metaUrl += "(id:" + _id + ");); out meta;";
		return metaUrl;
}
	
function centralQueryImport(_params) {
		var txt = "";
		switch (_params._subType) {
			case "route": 
				txt += '(relation["route"~"hiking|foot"]["network:type" = "node_network"]'; 
				break;
			case "guidepost": 
				txt += '(node["information" ="guidepost"]["hiking"="yes"]'; 
				break;
			case "network_map": 
				txt += '(node["information" ="map"]["map_type"="scheme"]'; 
				break;
			case "network_node": 
				txt += '(node["network:type" ="node_network"]'; 
				break;
			default: 
				alert(_params._subType +' non implémenté');
				queryOk = false;
		}
		txt += bounds_strNew(_params._boundsObj);
		txt += ";)";
		return txt;
}

function bounds_strNew(_bounds) {
	//Overpass requires SW, NE
	var boundsStr = "";
	boundsStr +=  '( ' 
		+ _bounds._southWest.lat.toFixed(6) + ', '
		+ _bounds._southWest.lng.toFixed(6) +', '
		+ _bounds._northEast.lat.toFixed(6) + ', '
		+ _bounds._northEast.lng.toFixed(6) + ')';
	return boundsStr;
}
	
function buildQuery(_type,  _params) {
	var queryStr = "?data=[out:json][timeout:15];"
	switch(_type) {
		case "around" :
			queryStr += centralQuery_around(_params);
			queryStr += ";out geom;";
		break;
		case "meta" :
			queryStr += centralQueryMeta(_params);
		break;
		case "import" :
			queryStr += centralQueryImport(_params);
			queryStr += ";out geom;";
		break;
	}
	
	return queryStr;
}

function callOverpass(type, params) {
	queryOk = true;
	var _status;
	switch (type) {
		case "around":
			_status = osmStatus;
			break;
		case "meta":
			_status = osmStatus;
			break;
		case "import":
			_status = importStatus;
			break;
	}
	var _query = buildQuery(type, params);
	if (!queryOk) {
//		console.log("overpassUrl: ",overpassUrl);
//		console.log("_query: ",_query);
		_status.innerHTML = "Erreur";
		_status.style.backgroundColor = "OrangeRed";
		
	} else {
		_status.innerHTML = "Attente";
		_status.style.backgroundColor = "Orange";
		fetch(overpassUrl + _query)
		.then(
			function(response) {
				if (response.status == 200) {
				// Examine the text in the response
					response.json().then(function(data) {
						display_result(type, data);
					});
					_status.innerHTML = "reponse ok";				
					_status.style.backgroundColor = "LightGreen";	 
				} else {
					console.log('Looks like there was a problem. Status Code: ' +
						response.status);
					_status.innerHTML = "time out";
					_status.style.backgroundColor = "OrangeRed";
			   }
			}
		)
		.catch(function(err) {
			_status.innerHTML = err;
		_status.style.backgroundColor = "OrangeRed";
		 });
	 }
}

function display_result(_type, _data) {
	switch(_type) {
		case "around" :
			display_resultAround(_data);
		break;
		case "meta" :
			complete_tags_table(_data.elements[0]);
		break;
		case "import" :
			display_resultImport(_data);
		break;	
	}
}

// endregion

// region OSM around

var searchRadius = 32;
var osm_latlng = L.latLng([0,0]);

bCloseOsm.onclick = () =>{	
		actionMode = "none";
		show_hideOsm();
	}

b_request.onclick = () =>{queryAround()}

b_back_to_list.onclick = close_tags;
b_call_osm.onclick = show_in_OSM;

dragElement(osmHeader, osmDiv );

var osmMark = new L.CircleMarker(osm_latlng, {
	radius: 20,
	fillColor: "white",
	fillOpacity: 0.0,
	color: "red",
	weight: 2					
});
var osmMov = moveableMarker(map, osmMark)
	
function queryAround() {
	var aroundParams = {"_searchRadius" :searchRadius, "_osm_latlng":osm_latlng};
	callOverpass("around", aroundParams);
}

function queryMetadata(_element) {
	callOverpass("meta", _element);
}

function display_resultAround(response_data) {
		objectsFound_array = response_data.elements;
		tags_div.style.display = "none";
		elements_div.style.display = "block";
		init_table(elements_table);
		set_cells_event();
		fill_elements_table();
}

function setOsmSearchRadius() {
	var zoomDiff = 17.0 - map.getZoom(); // 17.5 donne 10m
	////	  var r = Math.pow(2,zoomDiff)* R_pixels * 0.95;  // R_pixels ??
	var r = Math.pow(2,zoomDiff)* osmMark._radius * 0.95;
	searchRadius = Math.round(r)
}

function latlngStr(_coordDegre) {
	var coordStr =  _coordDegre.lat.toFixed(7) +', '+_coordDegre.lng.toFixed(7);
	return coordStr;
}

var elements_div = document.getElementById("elements_div"); 
var elements_table = document.getElementById("elements_table");
var elements_table_head = document.getElementById("elements_table_head"); 
var tags_div = document.getElementById("tags_div"); 
var tags_table = document.getElementById("tags_table");
var tags_table_head = document.getElementById("tags_table_head"); 
var objectsFound_array = [];
var currentObject;

function init_table(_table) {
	for (var i = _table.rows.length -1; i > 0; i--) {
		_table.deleteRow(-1);
	}
	switch (_table.id){
	case "elements_table" :
		elements_table_head.innerHTML = 
		`
			<th style="width:50px">type</th>
			<th style="width:100px">id</th>
			<th style="width:400px">Nom</th>	
		`;
		break;
	case "tags_table" :
		tags_table_head.innerHTML = 
		`
			<th style="width:200px">Key</th>
			<th style="width:360px">Value</th>
		`;
		break;
	}
}

function set_cells_event() { 
	elements_table.addEventListener('click', set_events);
}

function set_events(event) {
		var rows = elements_table.getElementsByTagName('tr');
		var rowsArray = Array.from(rows);
		var rowIndex = rowsArray.findIndex(row => row.contains(event.target));
		var currentRow = rowsArray[rowIndex];
		var columsArray = currentRow.querySelectorAll('td')
		var columns = Array.from(columsArray);
		var columnIndex = columns.findIndex(column => column == event.target);
		
		for (var i = elements_table.rows.length -1; i > 0; i--) {
			elements_table.rows[i].cells.item(1).style.backgroundColor = '';
		}
		
		elements_table.rows[rowIndex].cells.item(1).style.backgroundColor = 'aqua';
		
		show_tags(rowIndex - 1, columnIndex, event);
	currentRow.style.backgroundColor = 'blue';
//	.setStyle("backgroundColor: red");
}

function show_tags(row, column,evt) {
	currentObject = objectsFound_array[row];
	//console.dir(currentObject);
	var tags = currentObject.tags; 
	elements_div.style.display = "none";
	tags_div.style.display = "block";
	init_table(tags_table);
	if (tags) {
		fill_tags_table(currentObject);
	}
	queryMetadata(currentObject);
}

function close_tags() {
	tags_div.style.display = "none";
	elements_div.style.display = "block";
}

function fill_elements_table() {
	//clear table
	var rows = elements_table.getElementsByTagName('tr');
	for (var i = elements_table.rows.length -1; i > 0; i--) {
		elements_table.deleteRow(-1);
	}
	objectsFound_array.forEach(function (item) {
	var row = elements_table.insertRow();
		addCell(row, item.type);
		addCell(row, item.id);
		if (item.tags && item.tags.name ) { 
			addCell(row, item.tags.name); }
		else { addCell(row, "");};	
	});
}

function fill_tags_table(_currentObject) {
	//clear table
	var _tags = _currentObject.tags;
	var rows = tags_table.getElementsByTagName('tr');
	for (var i = tags_table.rows.length -1; i > 0; i--) {
		tags_table.deleteRow(-1);
	}
	var _keys = Object.keys(_tags);
	var _values = Object.values(_tags);
	var row = tags_table.insertRow();
	addCell(row, 'id');
	addCell(row, _currentObject.id);
	for (var i = 0; i < _keys.length; i++) {
			var row = tags_table.insertRow();
			addCell(row, _keys[i]);
			addCell(row, _values[i]);
		}
}

function complete_tags_table(_element ) {
	var row = tags_table.insertRow();
	addCell(row, 'version');
	addCell(row, _element.version);
	row.cells.item(0).style.backgroundColor = 'azure';		
	row.cells.item(1).style.backgroundColor = 'azure';		
	var row = tags_table.insertRow();
	addCell(row, 'timestamp');
	addCell(row, _element.timestamp);
	row.cells.item(0).style.backgroundColor = 'azure';		
	row.cells.item(1).style.backgroundColor = 'azure';		
	var row = tags_table.insertRow();
	addCell(row, 'user');
	addCell(row, _element.user);
	row.cells.item(0).style.backgroundColor = 'azure';		
	row.cells.item(1).style.backgroundColor = 'azure';		
	var row = tags_table.insertRow();
	addCell(row, 'changeset');
	addCell(row, _element.changeset);
	row.cells.item(0).style.backgroundColor = 'azure';		
	row.cells.item(1).style.backgroundColor = 'azure';		

}

function addCell(tr, text) {
        var td = tr.insertCell();
        td.textContent = text;
        return td;
}

	var	osm_tab;
//	var osm_tab_name;
	
function show_in_OSM() {
	//https://www.openstreetmap.org/relation/
	var url = "https://www.openstreetmap.org/";
	url += currentObject.type + "/";
	url += currentObject.id;
//	window.open(url, "_blank");
	if (!osm_tab) {
		osm_tab = window.open(url, "_blank");
		osm_tab.name = "osm";			
	}
	else {	
//		osm_tab = window.open(url, "osm");  
		window.open(url, "osm");  
	}
}

// endregion

// region OSM Import

var import_div = document.getElementById("import_div"); 

dragElement(importHeader, importDiv );


var osm_geojson = {"features":[]};

b_import.onclick = () => {
	for (const radioButton of radioButtons) {
		if (radioButton.checked) {
			subType = radioButton.value;
			break;
		}
	}
	importOsm(subType);
}


bCloseImport.onclick = () =>{	
	actionMode = "none";
	show_hideOsm();
}

const radioButtons = document.querySelectorAll('input[name="subType"]');
var subType;


function importOsm(_subType) {
	var boundsObjTmp = //Fabras
		{_southWest : { lat: 44.6399, lng: 4.2562 }, _northEast: {lat: 44.6600, lng: 4.3056 }};
	boundsObjTmp = map.getBounds();
	var importParams = {"_boundsObj" : boundsObjTmp, "_subType": _subType};
	callOverpass("import", importParams);
}

function display_resultImport(osm_data) {
	var geojson_tmp;
	try {
		isrefFile = false;
		geojson_tmp = osmtogeojson(osm_data, {flatProperties:false});		
		geojson_tmp1 = reformatJson(geojson_tmp);
		updateCalque(calqueIndex, geojson_tmp1);
///		console.log(geojson_tmp1);
	}
	catch(err) {
		console.log( err); 
	}
}
	
	function reformatJson(jsonIn)  {
		var jsonOut = jsonIn;
		for (var i=0; i< jsonIn.features.length; i++) {
			Object.keys(jsonIn.features[i].properties.tags).forEach(function(key){	
				jsonOut.features[i].properties[key] = jsonIn.features[i].properties.tags[key]
			});
			delete jsonOut.features[i].properties["tags"];			
		}
		return jsonOut;
	}

// endregion

// endregion

// region Panoramax

const panoxNum = 3;
const seqNum = 4;
const photoDiv = document.getElementById('photoDiv');
const photoHeader = document.getElementById('photoHeader');
const cb_hd = document.getElementById('cb_hd');

var image = document.getElementById("image");
var currentCollectionId;
var currentCollectionCount = 0;
var currentImageIndex = 0;
var next_apiUrl, prev_apiUrl;
var currentFeature;
var currentFeatureUrl;
var currentFeatureImgUrl;
var azimuthPtr = L.polyline([], {color: 'blue'});

// if prevNextMode new feature is fetched using prev and next url in current feature
// else new feature is got simply by its index in already loaded collection (faster)
// prevNextMode is set if feature is not found in the loaded part of the current collection
var prevNextMode = false;

// region resize and drag photoDiv

dragElement(photoHeader, photoDiv );

const resizeHandleW = document.getElementById('resizeHandleW');
const resizeHandleH = document.getElementById('resizeHandleH');

let isResizingW = false;
let isResizingH = false;
let startResizeX = 0;
let startWidth = 0;
let startResizeY = 0;
let startHeight = 0;
resizeHandleW.addEventListener('mousedown', (e) => {
  isResizingW = true;
  startResizeX = e.clientX;
  startWidth = photoDiv.offsetWidth;

  // Empêche la sélection de texte pendant le drag
  document.body.style.userSelect = 'none';
  e.preventDefault();
});

resizeHandleH.addEventListener('mousedown', (e) => {
  isResizingH = true;
  startResizeY = e.clientY;
  startHeight = photoDiv.offsetHeight;
  // Empêche la sélection de texte pendant le drag
  document.body.style.userSelect = 'none';
  e.preventDefault();
});

photoDiv.addEventListener('mousemove', (e) => {
  if (isResizingW) {
	  const diff = e.clientX - startResizeX;
	  const newWidth = startWidth + diff;
	  // Optionnel : bornes min/max
	  const minWidth = 100;
	  const maxWidth = window.innerWidth - photoDiv.offsetLeft - 20;
	  if (newWidth >= minWidth && newWidth <= maxWidth) {
		photoDiv.style.width = newWidth + 'px';
	  }
  }
  if (isResizingH) {
	  const diffY = e.clientY - startResizeY;
	  const newHeight = startHeight + diffY;
	  // Optionnel : bornes min/max
	  const minHeight = 100;
	  const maxHeight = window.innerHeight - photoDiv.offsetTop - 20;
	  if (newHeight >= minHeight && newHeight <= maxHeight) { 
		photoDiv.style.height = newHeight + 'px';
	  }
  }
});

photoDiv.addEventListener('mouseup', () => {
  if (isResizingW) {
    isResizingW = false;
    document.body.style.userSelect = '';
  }
  if (isResizingH) {
    isResizingH = false;
    document.body.style.userSelect = '';
  }
});

// endregion
	
// region  menu and utils 

async function panoramaxAround(boxSize) {
	const bbStr = bboxAround(curPtCoordsStr(), boxSize);
	const dataJson = await px_getFeaturesBbox(bbStr);

	updateCalque(panoxNum, dataJson);
	// set calque seq above calque panox
	map.removeLayer(calques[seqNum].layer);
	map.addLayer(calques[seqNum].layer);
}

async function panoramaxInBox() {
	const bbxStr = bboxStr(map.getBounds());
	const dataJson = await px_getFeaturesBbox(bbxStr);
	updateCalque(panoxNum, dataJson);
	updateInfoMode(false); // set infoDiv on panoramax
}

function panoramaxClear() {
	calques[panoxNum].clearLayer();
	calques[seqNum].clearLayer();
}

bClosePhoto.onclick = hidePhoto;
function hidePhoto(){
		photoDiv.style.display = "none";			
	}
	
bImgHD.onclick = () => {
	window.open(currentFeatureImgUrl);  
}

bInfo.onclick = () => {
	window.open(currentFeatureUrl);  
}

bPanox.onclick = () => {
var pxUrl = 'https://api.panoramax.xyz/fr/index?focus=pic&pic='
	pxUrl += currentFeature.id;
	window.open(pxUrl);  
}

function updatePanoxInfo(_feature) {
	elementInfo_div.innerHTML = "image id: " + _feature.id;
	elementInfo_div.innerHTML += 
		"<br>date: " + _feature.properties.datetime.substring(0,10) + 
		",  time: " + _feature.properties.datetime.substring(11,19);
	elementInfo_div.innerHTML += 
		"<br>azimuth: " + _feature.properties["view:azimuth"];
	elementInfo_div.innerHTML += 
		"<br>index in sequence: " + _feature.properties["geovisio:rank_in_collection"];
	elementInfo_div.innerHTML += 
		"<br>instance: " + _feature.assets.hd.href.substring(0,35) + "...";
	elementInfo_div.innerHTML += 
		"<br>provider.name: " + _feature.providers[0].name;
}

function bboxAround(lonLatStr, dist) {
var bboxStr = "";
var strSplit, lon, lat;
	strSplit = lonLatStr.split(',');
	lon = parseFloat(strSplit[0]);
	lat = parseFloat(strSplit[1]); 
var distDeg = parseFloat(dist) * 180 / 40000000; //halfdist
bboxStr += (lon - distDeg * Math.cos(lat)).toFixed(7);
bboxStr += ',' + (lat - distDeg).toFixed(7);
bboxStr += ',' + (lon + distDeg * Math.cos(lat)).toFixed(7);
bboxStr += ',' + (lat + distDeg).toFixed(7);
return bboxStr;
}

function bboxStr(bboxJson) {
  var tmpStr;
  tmpStr = bboxJson._southWest.lng.toFixed(6);
  tmpStr += ',' + bboxJson._southWest.lat.toFixed(6);
  tmpStr += ',' + bboxJson._northEast.lng.toFixed(6);
  tmpStr += ',' + bboxJson._northEast.lat.toFixed(6);
  
  return tmpStr
}

function buildPolyLine(coords, azim, dist) {
var distDeg = parseFloat(dist) * 360 / 40000000; 
var azimRad = 3.14 / 180 * azim;
var delta = 0.16;
var pt2Lon = coords[0] + distDeg / Math.cos(parseFloat(coords[1])) * Math.sin(azimRad - delta);
var pt2Lat = coords[1] + distDeg * Math.cos(azimRad - delta);
var pt3Lon = coords[0] + distDeg / Math.cos(parseFloat(coords[1])) * Math.sin(azimRad + delta);
var pt3Lat = coords[1] + distDeg * Math.cos(azimRad + delta);
var polyL = [[pt2Lat, pt2Lon], [coords[1], coords[0]],[pt3Lat, pt3Lon]];
///console.log(polyL);
return polyL;
}

//-------- core -----------

function panox_click(e) {
	manageItem(e.target.feature, true);
}

bPrevPoint.onclick = () => {
	if (currentImageIndex > 0) {
		currentImageIndex--;
	}	
	if (prevNextMode) {
		managePrevNext(prev_apiUrl);
	} else {
		const _feature = calques[seqNum].layerJson.features[currentImageIndex];
		manageItem(_feature, true);
	}
}

bNextPoint.onclick = () => {
	if (currentImageIndex < currentCollectionCount) {
		currentImageIndex++;
	}
	if (prevNextMode) {
		managePrevNext(next_apiUrl);
	} else {
		const _feature = calques[seqNum].layerJson.features[currentImageIndex];
		manageItem(_feature, true);
	}
}

async function managePrevNext(prevNextUrl) {
///	console.log("prevNextUrl", prevNextUrl);
//  this take more time (500 ms) than direct call 
	const res = await fetch(prevNextUrl);
	const data = await res.json();
	manageItem(data, false);
}

// check what to do with new feature	
async function manageItem(_feature, checkSeq) {
    const imgIndex = await updateCollection(_feature, checkSeq);	
	if (imgIndex < 0) {  //feature is not in loaded part of the collection
		prevNextMode = true;
	}
	else {
		prevNextMode = false;
	}
	currentImageIndex = imgIndex;
	const nextLink = _feature.links.find(obj => obj?.rel === "next");
	if (nextLink) {
		next_apiUrl = nextLink.href; 
		bNextPoint.disabled = false;
	} else { 
		bNextPoint.disabled = true;
	}
	const prevLink = _feature.links.find(obj => obj?.rel === "prev");
	if (prevLink) {
		prev_apiUrl = prevLink.href;
		bPrevPoint.disabled = false;
	} else { 
		bPrevPoint.disabled = true;
	}

	showImage(_feature);
	
	if (!nextLink || !prevLink) {
		panoramaxAround(400);		
	}
	currentFeature = _feature; 
	currentFeatureUrl = _feature.links.find(obj => obj?.rel === "self").href;
	currentFeatureImgUrl = _feature.assets.hd.href;
	updatePanoxInfo(_feature);
	showSelectedPoint(_feature);	
}

async function updateCollection(_feature, checkSeq){
	var imgIndex = -1;
	var dataJson;
	const newCollectionId = _feature.collection;
	if (checkSeq && newCollectionId != currentCollectionId) {
///	console.log("collection changed - old", currentCollectionId," - new  ", newCollectionId)		
		currentCollectionId = newCollectionId;
		calques[seqNum].clearLayer();
		dataJson = await px_getFeaturesInCollection(currentCollectionId);
		currentCollectionCount = dataJson.features.length; 
	    imgIndex = dataJson.features.findIndex(checkId);
		// on a chargé les 1000 premiers points de la collection dans dataJson
		// si la collection est trop grande ils peuvent être tous hors de la carte
		// dans ce cas imgIndex est négatif et il est inutile de les ajouter
		if (imgIndex >=0) {
		// la collection peut dépasser les points déjà chargés
			updateCalque(panoxNum, dataJson);
		// charger la collection dans son calque
			updateCalque(seqNum, dataJson);
		}
	} else {
		dataJson = calques[seqNum].layerJson;
	    imgIndex = dataJson.features.findIndex(checkId);
	}
	function checkId(_f) {
		return (_f.id == _feature.id);
	}	
///	console.log(imgIndex);
	return imgIndex;
}

const Y360Div = document.getElementById('Y360Div');

function showSelectedPoint(_feature) {
// 	set a larger marker on selected feature
// 	set map current_point on this feature (useful to search around)
	calques[seqNum].layer.eachLayer(function (subLayer) { 	
		if (subLayer.feature && subLayer.feature.id == _feature.id) {
			subLayer.setStyle(styleSelected);
		} else {
			subLayer.setStyle(styles[seqNum]);		
		}
	});	
// 	set azimuth if present in feature
// 	build azimuth pointer
	const azimuth = _feature.properties["view:azimuth"];
	const ptLngLat = _feature.geometry.coordinates;
	if (azimuth) {
		const longueur = 50 * Math.pow(2, 17 - map.getZoom());
		const polyL = buildPolyLine(_feature.geometry.coordinates, azimuth, longueur);
		azimuthPtr.setLatLngs(polyL).addTo(calques[seqNum].layer);;
	}
	curPt_latlng.lat = ptLngLat[1];
	curPt_latlng.lng = ptLngLat[0];
	
}

// endregion

// region image

function showImage(_feature) {
	photoDiv.style.display = "flex";	
	const exif = _feature.properties.exif;
	const is360 = (exif['Xmp.GPano.ProjectionType'] == 'equirectangular');
///	console.log("is360", is360 );
	bWaiting.style.display = "block";
	if (!is360) {
		imageDiv.style.display = "flex";
		Y360Div.style.display = "none";
		if (cb_hd.checked) {
			image.src = _feature.assets.hd.href;
		} else {
			image.src = _feature.assets.sd.href;
		}
	} else {
		imageDiv.style.display = "none";
		Y360Div.style.display = "flex";;
		document.dispatchEvent(new CustomEvent('newImage', { 
			detail: { imageAsset: _feature.assets.hd.href}
		}));
	}
}

// Après chargement de l'image
image.addEventListener('load', centrerImage);

function centrerImage() {
//console.log(initialScale, currentScale)
    const marginNeeded = (imageDiv.offsetWidth - image.offsetWidth) / 2;
	if (marginNeeded > 0) {
		// image plus étroite : on centre avec une marge calculée
		image.style.margin = `0 ${marginNeeded}px`;
	} else {
		// image plus large : on retire toute marge et on centre le scroll
		image.style.margin = '0';
		if (currentScale <= 1.2) { // si zoomé on garde la position
			imageDiv.scrollLeft = -marginNeeded;
		}
	}
	bWaiting.style.display = "none";
	marginNeeded_ = marginNeeded;
}


//-----------pan
let isDragging = false;
let startX = 0;
let scrollStartX = 0;
let startY = 0;
let scrollStartY = 0;

function dragStart(clientX, clientY) {
  isDragging = true;
  startX = clientX;
  startY = clientY;
  scrollStartX = imageDiv.scrollLeft;
  scrollStartY = imageDiv.scrollTop;
}

function dragMove(clientX, clientY) {
  if (!isDragging) return;
  const diffX = clientX - startX;
  imageDiv.scrollLeft = scrollStartX - diffX;
  const diffY = clientY - startY;
  imageDiv.scrollTop = scrollStartY - diffY;
///  statusTxt.textContent = imageDiv.scrollTop;
///  console.log(imageDiv.scrollTop, scrollStartY, diffY, clientY, startY);
}

function dragEnd() {
  isDragging = false;
}

if (isMobile) {

  image.addEventListener('touchstart', (e) => {
    dragStart(e.touches[0].clientX, e.touches[0].clientY);
  }, 
  { passive: true });

  image.addEventListener('touchmove', (e) => {
    dragMove(e.touches[0].clientX, e.touches[0].clientY);
  }, 
  { passive: true });

  image.addEventListener('touchend', dragEnd);

} else {

  image.addEventListener('mousedown', (e) => {
    dragStart(e.clientX, e.clientY);
    image.style.cursor = 'grabbing';
    e.preventDefault();
  });

  image.addEventListener('mousemove', (e) => {
    dragMove(e.clientX, e.clientY);
  });

  document.addEventListener('mouseup', () => {
	if (isDragging) {
		dragEnd();
		image.style.cursor = 'grab';
	}
  });

}

//--------------- zoom

// Zoom au pincement (pinch-to-zoom) sur mobile

let currentScale = 1;
const minScale = 1;
const maxScale = 8;
let baseHeight = null;

function getBaseHeight() {
  if (baseHeight === null) {
    baseHeight = imageDiv.offsetHeight; // hauteur "naturelle" = 100% du conteneur
  }
  return baseHeight;
}
let textInfo ="";

function applyZoomAtPoint(newScale, centerX, centerY) {////) {
  newScale = Math.min(maxScale, Math.max(minScale, newScale));
///  console.log(newScale);
  if (newScale === currentScale) return;

  const rect = imageDiv.getBoundingClientRect();

  // Position du curseur relative à imageDiv
  const pointerX = centerX - rect.left;
  const pointerY = centerY - rect.top;

  // Point visé dans le contenu (image) AVANT zoom
  const contentX = imageDiv.scrollLeft + pointerX;
  const contentY = imageDiv.scrollTop + pointerY;

  // Ratio entre nouvelle et ancienne échelle
  const ratio = newScale / currentScale;

  // Applique le zoom (taille réelle, pas transform)
  currentScale = newScale;
  image.style.height = (getBaseHeight() * currentScale) + 'px';

  // Recalcule le scroll pour garder le même point sous le curseur
  imageDiv.scrollLeft = contentX * ratio - pointerX;
  imageDiv.scrollTop = contentY * ratio - pointerY;
  pointerX_ = pointerX;
  contentX_ = contentX;
}

if (!isMobile) {
  imageDiv.addEventListener('wheel', (e) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 1.2 : 1/1.2;
//    const delta = e.deltaY < 0 ? 0.2 : -0.2;
    applyZoomAtPoint(currentScale * delta, e.clientX, e.clientY);
  });
}

////------------touch

let initialPinchDistance = null;
/////let initialScale = 1;
let pinchCenterX = 0;
let pinchCenterY = 0;

function getPinchDistance(touches) {
  const dx = touches[0].clientX - touches[1].clientX;
  const dy = touches[0].clientY - touches[1].clientY;
  return Math.sqrt(dx * dx + dy * dy);
}

function getPinchCenter(touches) {
  const rect = imageDiv.getBoundingClientRect();
  return {
    x: (rect.right + rect.left) / 2,
    y: (rect.top + rect.bottom) / 2
  };
}

function getPinchCenter0(touches) {
  return {
    x: (touches[0].clientX + touches[1].clientX) / 2,
    y: (touches[0].clientY + touches[1].clientY) / 2
  };
}

if (isMobile) {
  imageDiv.addEventListener('touchstart', (e) => {
    if (e.touches.length === 2) {
      initialPinchDistance = getPinchDistance(e.touches);
/////      initialScale = currentScale;
      const center = getPinchCenter(e.touches);
      pinchCenterX = center.x;
      pinchCenterY = center.y;
    }
  }, 
  { passive: false });

  imageDiv.addEventListener('touchmove', (e) => {
    if (e.touches.length === 2 && initialPinchDistance) {
      const newDistance = getPinchDistance(e.touches);
	  initialPinchDistance = newDistance;
      const ratio = newDistance / initialPinchDistance;
/*      // le centre du pinch peut légèrement bouger, on le remet à jour
////      const center = getPinchCenter(e.touches);
////      applyZoomAtPoint(currentScale * ratio, center.x, center.y);*/
      applyZoomAtPoint(currentScale * ratio, pinchCenterX, pinchCenterY);
  textInfo += ';<br> dist '+ initialPinchDistance.toFixed(2)  + 'new: ' + newDistance.toFixed(2);
  statusTxt.innerHTML = textInfo;
    }
	e.preventDefault();
  }, 
  { passive: false });

  imageDiv.addEventListener('touchend', (e) => {
    if (e.touches.length < 2) {
      initialPinchDistance = null;
    }
  });
}


// endregion

//region panoramax api calls -----

const metaCatalogUrl = "https://api.panoramax.xyz/api"
const osmUrl = "https://panoramax.openstreetmap.fr/api"
const ignUrl = "https://panoramax.ign.fr/api"

var panoxUrl = metaCatalogUrl;

async function px_getFeaturesBbox(bboxString) {
	const apiUrl = `${panoxUrl}/search?bbox=${bboxString}&limit=1000`;
	try {
		const res = await fetch(apiUrl);
		const data = await res.json();
		return data;
	} catch (e) {
		console.error("[Panoramax] erreur", e);
	}
}

async function px_getFeaturesInCollection(_collection_id) {
	const apiUrl = `${panoxUrl}/search?collections=${_collection_id}&sortby=ts&limit=1000`;	
	
	try {
		const res = await fetch(apiUrl);
		const data = await res.json();
		return data;
	} catch (e) {
		  console.error("[Panoramax] erreur", e);
	}
}

// endregion

// endregion

// region file

document.getElementById('file_selectX').addEventListener('change', handleFileSelect, false);
function handleFileSelect(evt) {
	const fileList = evt.target.files; // FileList object
	currentFile = fileList[0];
	read_File(currentFile);
}

function read_File(_file) {
	var reader = new FileReader(); 
	reader.readAsText(_file, "UTF-8");
	reader.onload = function (evt) {	//onload : lecture terminée ok
		input_Text = evt.target.result;
		var layerJson = toJsonObj(input_Text);
		updateCalque(calqueIndex, layerJson);
///		console.log(input_Text, layerJson);
	}
}

function toJsonTxt(gpxText) {
//// todo get name if it is in metadata and if there is only one track
	const jsonTxtStart = '{"type": "FeatureCollection","features": ['; 
//	const jsonTxtEnd = ']}}]}';
	const jsonTxtEnd = ']}';
	const featureStart = '{"type": "Feature",';
	const featureEnd = '}';
	const propStart = '"properties": {'
	const propEnd = '},'
	const geomStart = '"geometry": {"type":"LineString","coordinates": [';
	const geomEnd = ']}';
	var singleName = ""; // used if only one track and name in metadata
	
	function trkptStr(trkPtXml) {
		var strTmp = '[';
	//	strTmp += trkPtXml.attributes[1].nodeValue;
		strTmp += trkPtXml.getAttribute("lon");
		strTmp += ', ';
		strTmp += trkPtXml.getAttribute("lat");
		var eleNodes = trkPtXml.getElementsByTagName("ele");
		if (eleNodes.length > 0) {
			strTmp += ', ';
			strTmp += eleNodes[0].childNodes[0].nodeValue;
		}
		strTmp += ']';
		return strTmp;
	}
	
	function trkStr(trkXml) {
		var strTmp = featureStart;
		var _name = singleName;
		// if one sinle track, singleName has been filled, else find it in each track
		if (_name == "") {
			var xmlNameNode = trkXml.getElementsByTagName("name")		
			if (xmlNameNode.length > 0) {
				_name = xmlNameNode[0].childNodes[0].nodeValue;
			}	
		}
		if (_name != "") {
			var nameStr = '"' + _name + '"';
			strTmp += propStart;
			strTmp += '"name": ' + nameStr;
			strTmp += propEnd;
		}
		console.log(strTmp);
		//geometry
		strTmp += geomStart;
		var trkpts = Array.from(trkXml.getElementsByTagName("trkpt"));
		for (var i = 0; i < trkpts.length; i++) {
			strTmp += trkptStr(trkpts[i]) ;
			if (i < trkpts.length - 1) {strTmp += ',';}
		}
		strTmp += geomEnd;
		
		strTmp += featureEnd;
		
		return strTmp;
	}

	try {
		if (gpxText.indexOf("<rte>") > 0) {
			gpxText = gpxText.replaceAll("<rte","<trk");
			gpxText = gpxText.replaceAll("</rte","</trk");
			gpxText = gpxText.replaceAll("<rtept","<trkpt");
			gpxText = gpxText.replaceAll("</rtept","</trkpt");
		}
		
		parser = new DOMParser();
		xmlDoc = parser.parseFromString(gpxText,"text/xml");
		var _jsonTxt = jsonTxtStart;
		var tracks = xmlDoc.getElementsByTagName("trk");
		if (tracks.length == 1) { //single track
			var nameNodes =  xmlDoc.getElementsByTagName("name");
			singleName =nameNodes[0].childNodes[0].nodeValue;
		}
		for (var i = 0; i<tracks.length; i++) {
			_jsonTxt += trkStr(tracks[i]);
				if (i < tracks.length - 1) {_jsonTxt += ',';}
		}
		_jsonTxt += jsonTxtEnd;
		return _jsonTxt;
	}
	catch (ex) {
			alert('error toJsonTxt : \n' + ex.message);
			console.log(ex.message);
		return null;
	}
}

function toJsonObj(jsonText) {
	try {
		if (jsonText.indexOf("<gpx") >= 0) {
			jsonText = toJsonTxt(jsonText);
		};
		return JSON.parse(jsonText);
	}
	catch(ex) {
		alert('Error toJsonObj: \n'+ ex.message);
 		console.log(ex.message);
		return null;
	}
}



// endregion

// region geolocation

var locPtMark = new L.CircleMarker(curPt_latlng, //for initialisation
	{
		radius: 4,
		fillColor: "red",
		fillOpacity: 0.6,
		color: "red",
		weight: 1					
	}
);

var locPtAcc = new L.CircleMarker(curPt_latlng, //for initialisation
	{
		radius: 10,
		fillOpacity: 0.0,
		color: "red",
		weight: 2					
	}
);

function metersPerPixel() {
  var truc = 40075016.686 * Math.abs(Math.cos(map.getCenter().lat * Math.PI/180)) / Math.pow(2, map.getZoom()+8);
  return truc;
 }
 
function updateLocPtAccRadius() {
	var r = accuracy/metersPerPixel();
	locPtAcc.setRadius(r);
}

var accuracy = 100;

function date_format(unix_timestamp,format){
    const date=new Date(unix_timestamp);
    const dateObject={
        'Y' : date.getFullYear(),
        'M' : String(date.getMonth()).padStart(2,'0'),
        'D' : String(date.getDate()).padStart(2,'0'),
        'h' : String(date.getHours()).padStart(2,'0'),
        'm' : String(date.getMinutes()).padStart(2,'0'),
        's' : String(date.getSeconds()).padStart(2,'0'),
    };
    var dateString='';
    for (let char of format) {
        if(char in dateObject){
            dateString+=dateObject[char];
        }else{
            dateString+=char;
        }
    }
    return dateString;
}

function gpxFormattedDate(date) {
	var formattedStr = date_format(date,'Y-M-DTh:m:sZ'); // 12:00:54
	return formattedStr;
}

function formattedTime(date) {
	var formattedStr = date_format(date,'h:m:s'); // 12:00:54
	return formattedStr;
 }
 
 function decodePosition(position, option) {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;
var gpsLatLon = L.latLng(latitude, longitude);	
	accuracy = position.coords.accuracy;
	const ele = position.coords.altitude;
	const eleAcc = position.coords.altitudeAccuracy;
	const unixTime = position.timestamp;
//	var timeStr = unixTime.toGMTString();
var date = new Date(unixTime);
var timeStr = formattedTime(date);
    console.log(position);
//	console.log(trkptNode(position));
//	console.log(wptNode(position));
	statusTxt.innerHTML = 
		`Lat: ${latitude.toFixed(5)} <br> 
		Long: ${longitude.toFixed(5)} <br> 
		Accuracy:${accuracy} <br> 
		Ele: ${ele} <br> 
		EleAccuracy: ${eleAcc} <br>
		time: ${timeStr}
		`;
	locPtMark.setLatLng([latitude, longitude]);
	locPtAcc.setLatLng([latitude, longitude]);
	updateLocPtAccRadius();
	locPtMark.addTo(map);
	locPtAcc.addTo(map);
	switch (option) {
		case "center" :
			map.setView([latitude, longitude]);
			break;
		case "wpt" :
			addWpt(position);
			break;
		case "trkpt" :
			addTrkpt(position);
			break;
		default :
		
//		console.log("option" );
	}

}

function geoFindMe(option) {  // option : loc, center, wpt, trkpt

  function success(position) {
	decodePosition(position, option);
  }

  function error() {
    statusTxt.textContent = "Unable to retrieve your location";
  }
  
  const options = {
  enableHighAccuracy: true,
  maximumAge: 10000,
  timeout: 10000,
};

  if (!navigator.geolocation) {
    statusTxt.textContent = "Geolocation is not supported by your browser";
  } else {
    statusTxt.textContent = "Locating…";
    navigator.geolocation.getCurrentPosition(success, error, options);
  }
}

//----------------------------

var wptNodes = [];
var trkptNodes = [];

var fileNameToSave = "carto.gpx";

function addWpt(_position) {
	wptNodes.push(wptNode(_position));
}

function addTrkpt(_position) {
	trkptNodes.push(trkptNode(_position));
}

function trkptNode(position){	
	var tmpStr;
	var coordStr = `lat= "${position.coords.latitude.toFixed(6) }" lon= " ${position.coords.longitude.toFixed(6)}"`;
	tmpStr = "<trkpt " + coordStr + ">";
	tmpStr += "<ele>" + position.coords.altitude.toFixed(1) + "</ele>";
	tmpStr += "<time>" + gpxFormattedDate(position.timestamp) + "</time>";
	tmpStr += "</trkpt>";
    return tmpStr;  
}

function wptNode(position) {
	var tmpStr;
	var coordStr = `lat= "${position.coords.latitude.toFixed(6)}" lon= " ${position.coords.longitude.toFixed(6)}"`;
	tmpStr = "<wpt " + coordStr + ">";
	tmpStr += "<ele>" + position.coords.altitude.toFixed(1) + "</ele>";
	tmpStr += "<time>" + gpxFormattedDate(position.timestamp) + "</time>";
	tmpStr += "\n<name>" + formattedTime(position.timestamp) + "</name>";	
	tmpStr += "</wpt>";
    return tmpStr;  

}

function build_gpx_0 () {
	var creatorStr = "Carto_tools " + version + subV;
	var gpxString = "";
	gpxString += '<gpx xmlns="http://www.topografix.com/GPX/1/1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd" version="1.1"';
	gpxString += ' creator= "' + creatorStr + '">';
	
	gpxString += "\n<trk>\n";	
//	gpxString += "<name>" + Name + "</name>\n";		
	gpxString += "<trkseg>\n";
	
/*	for(var j = 0; j < circuitRoutes.length; j++){  
		for(var i = 0; i < circuitRoutes[j].length; i++){  
			gpxString += trkptNode(circuitRoutes[j][i])+'\n';
		}
	}
*/
	gpxString += "</trkseg>\n";
	gpxString += "</trk></gpx>";	
	return gpxString;
}

function build_gpx() {
	var gpxString = "";
	gpxString = gpxHead();
	for(var i = 0; i < wptNodes.length; i++){  
		gpxString+=wptNodes[i] + '\n';
	}
	if (trkptNodes.length > 0) {
		gpxString += trkHead(fileNameToSave);
			for(var i = 0; i < trkptNodes.length; i++){  
			gpxString+=trkptNodes[i] + '\n';
			}
		gpxString += trkEnd;
	}			
	gpxString += gpxEnd;
	return gpxString;
}

function gpxHead () {
	var creatorStr = "Carto_tools " + version + subV;
	var gpxString = "";
	gpxString += '<gpx xmlns="http://www.topografix.com/GPX/1/1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd" version="1.1"';
	gpxString += ' creator= "' + creatorStr + '">\n';
	return gpxString;	
}

function trkHead(trkName) {
	var gpxString = "\n<trk>\n";	
	gpxString += "<name>" + trkName + "</name>\n";		
	gpxString += "<trkseg>\n";
	return gpxString;	
} 

const trkEnd = "</trkseg>\n</trk>";
const gpxEnd = "\n</gpx>\n";

function writeFile (strToWrite, _fileName) {
	var textToSaveAsBlob = new Blob([strToWrite], {type:"text/plain"});
	var textToSaveAsURL = window.URL.createObjectURL(textToSaveAsBlob);
	var downloadLink = document.createElement("a");
	downloadLink.download = _fileName;
	downloadLink.innerHTML = "Download File";
	downloadLink.href = textToSaveAsURL;
	downloadLink.onclick = destroyClickedElement;
	downloadLink.style.display = "none";
	document.body.appendChild(downloadLink);
 
 //comment next line to avoid create gpx file and to see the console.log
	downloadLink.click();

	function destroyClickedElement(event){
		document.body.removeChild(event.target);
	}
}

function saveGpx() {
	var gpxStr = build_gpx();
	console.log(gpxStr, fileNameToSave);
	writeFile(gpxStr, fileNameToSave);
//	info_status.style.backgroundColor = "Aqua";
//	info_status.innerHTML = "--- fichier <i>circuit.gpx</i> enregistré --- ";
//	info_dist.innerHTML = "";
//	info_ascent.innerHTML = "";
}




// endregion

b_test.onclick = test1;

function test() {
	alert("no test");
}

var pointerX_ = 111;
var contentX_ = 222;
var marginNeeded_;

function test1() {
	textInfo = 'marginNeeded: ' + marginNeeded_;
/*  textInfo += '---------- <br> pointerX '+ pointerX_.toFixed(2);
  textInfo += '; contentX ' + contentX_.toFixed(2);
  textInfo += ';<br> scroll Left '+ imageDiv.scrollLeft.toFixed(2) ;
  textInfo += ';<br> width '+ image.width.toFixed(2) ;
  textInfo += ';<br> currentScale '+ currentScale.toFixed(2) ;*/
  statusTxt.innerHTML = textInfo;
///	console.log(textInfo);
}

function test2() {
try {
	window.open(currentFeatureImgUrl);  
}
catch(err){
alert(err);
}
}

async function test_delay() {
//var colId = "3ce69743-1145-4d7f-996e-927da309eaca";  // RN102 : 
//var colId = "55c51472-14d5-4a10-ae30-41e1a07bd886"; //vinobre 
var colId = "5b99d0f3-474b-41dd-a23a-de0ee4aa013c"; //bayssac 

    const url = `https://api.panoramax.xyz/api/collections/${colId}/items?limit=1000`;
    const res = await fetch(url);
    const data = await res.json();
console.log("col", data);


}

////var statusTxt =	document.getElementById("statusTxt");

// region poub

// endregion