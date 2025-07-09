/* global turf */
/* global autocomplete */
/* global L */

let initialized = false;
let sg;
let hg;


let leafletMap = L.map('leaflet-map').fitBounds([[41.187053,-73.50821],[42.886778,-69.858861]]);
L.tileLayer('https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=1HCKO0pQuPEfNXXzGgSM',{
        tileSize: 512,
        zoomOffset: -1,
        minZoom: 1,
        attribution: "\u003ca href=\"https://www.maptiler.com/copyright/\" target=\"_blank\"\u003e\u0026copy; MapTiler\u003c/a\u003e \u003ca href=\"https://www.openstreetmap.org/copyright\" target=\"_blank\"\u003e\u0026copy; OpenStreetMap contributors\u003c/a\u003e",
        crossOrigin: true
      }).addTo(leafletMap);

let senateMapLayer = L.geoJSON(null, {
  style: () => { return { color: '#ee6c4d', weight: 5 } }
}).addTo(leafletMap);

let houseMapLayer = L.geoJSON(null, {
  style: () => { return { color: '#ba181b', weight: 5 } }
}).addTo(leafletMap);


autocomplete({
	input: document.getElementById('address-input'),
	fetch: function(text, callback) {
		fetch(
			`https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/suggest?text=${encodeURIComponent(text + ', Massachusetts')}&f=json&category=address&searchExtent=-73.50821,41.187053,-69.858861,42.886778&preferredLabelValues=localCity`
		)
			.then((response) => response.json())
			.then((j) => {
				callback(
					j.suggestions.map((x) => {
						return {
							label: x.text,
							mk: x.magicKey
						};
					})
				);
			});
	},
	debounceWaitMs: 300,
	onSelect: function(item) {
		fetch(
			`https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates?SingleLine=${encodeURIComponent(
				item.text
			)}&magicKey=${encodeURIComponent(item.mk)}&f=json`
		)
			.then((r) => r.json())
			.then((d) => {
				let xy = [ d.candidates[0].location.x, d.candidates[0].location.y ];
        document.getElementById("selected-address").textContent = item.label;

				findDistricts(xy);
			});
	}
});


// helper function to get around point-in-multipolygon boolean errors
function testContains(district, point) {
    if (district.geometry.type === 'MultiPolygon') {
        for (let i = 0; i < district.geometry.coordinates.length; i++) {
            if (turf.booleanContains(turf.polygon(district.geometry.coordinates[i]), point)) {
                return true;
            } else {
                continue;
            }
        }
    } else {
        return turf.booleanContains(district, point);
    }
}

function findDistricts(xy) {
	if (!initialized) {
    window.alert("Wait until the map data has loaded to look up an address.")
		return false;
	}

	let point = turf.point(xy);

	let senateFound = sg.features.find((district) => {
		return testContains(district, point)
	});
	
    let houseFound = hg.features.find((district) => {
        return testContains(district, point);
    })

    document.getElementById("senate-result").textContent = senateFound.properties.ID;
    document.getElementById("house-result").textContent = houseFound.properties["Name"];

    document.getElementById("ready-modal").classList.add("is-hidden");
    document.getElementById("results").classList.remove("is-hidden");
  
    senateMapLayer.clearLayers();
    houseMapLayer.clearLayers();
  
    senateMapLayer.addData(senateFound);
    houseMapLayer.addData(houseFound);
    leafletMap.flyToBounds(senateMapLayer.getBounds())

    // console.log(senateFound, houseFound)
}

async function fetchMaps() {
	const [ sr, hr ] = await Promise.all([ fetch('https://s3.us-east-2.wasabisys.com/public-geospatial/dkupie15y/dkupie15y.json'), fetch('https://s3.us-east-2.wasabisys.com/public-geospatial/dkusg3ve1/dkusg3ve1.json') ]);
	const senateGeometry = await sr.json();
	const houseGeometry = await hr.json();
	return [ senateGeometry, houseGeometry ];
}

fetchMaps()
	.then(([ senateGeometry, houseGeometry ]) => {
		initialized = true;
		sg = senateGeometry;
		hg = houseGeometry;
		document.getElementById("loading-modal").classList.add("is-hidden");
    document.getElementById("ready-modal").classList.remove("is-hidden");
	})
	.catch((error) => {
		window.alert('Something went wrong');
	});

