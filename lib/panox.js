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

async function px_getFeaturesAround(_ptStr, _dist) {
	const bbStr = bboxAround(_ptStr, _dist);
	return px_getFeaturesBbox(bbStr);
}

async function px_getFeaturesBbox(bboxString) {
	const apiUrl = `https://api.panoramax.xyz/api/search?bbox=${bboxString}&sortby=-ts&limit=1000`;
	try {
		const res = await fetch(apiUrl);
		const data = await res.json();
		return data;
	} catch (e) {
		console.error("[Panoramax] erreur", e);
	}
}

async function px_getFeaturesInCollection(_collection_id) {
		const apiUrl = `https://api.panoramax.xyz/api/search?collections=${_collection_id}&sortby=datetime&limit=1000`;
	try {
		const res = await fetch(apiUrl);
		const data = await res.json();
		return data;
	} catch (e) {
		  console.error("[Panoramax] erreur", e);
	}
}


