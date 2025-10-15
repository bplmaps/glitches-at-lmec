/* global L, Allmaps */

// variable creation

let annotationUrl_Left, annotationUrl_Right;
let wml_l, wml_r;
let sideBySide;
let go = document.getElementById("go");
let leftbutton = document.getElementById("left");
let rightbutton = document.getElementById("right");
let key = "key=1HCKO0pQuPEfNXXzGgSM";

// map setup functions

const map = L.map("map", {
  center: [42.3518, -71.05],
  zoom: 13,
  minZoom: 7,
  maxZoom: 24,
  zoomControl: false,
});

let left = map.createPane("left");
let right = map.createPane("right");

let tileLayerDetails = [
  {
    tileSize: 512,
    zoomOffset: -1,
    minZoom: 14,
    maxZoom: 24,
    crossOrigin: true,
  },
];

// make base map

let streetsURL = "https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?";
let streets_base = L.tileLayer(streetsURL + key, tileLayerDetails);
map.addLayer(streets_base);

// define and load default warped maps

annotationUrl_Left = 'https://annotations.allmaps.org/manifests/cfb327e4b43395e3'
wml_l = new Allmaps.WarpedMapLayer(annotationUrl_Left).addTo(map);
annotationUrl_Right = 'https://annotations.allmaps.org/manifests/0f37acecf953fff2'
wml_r = new Allmaps.WarpedMapLayer(annotationUrl_Right).addTo(map);

// add sidebyside slider

sideBySide = L.control.sideBySide(wml_l, wml_r);
sideBySide.addTo(map);

// function for repopulating annotation data

go.addEventListener("click", (event) => {
  map.removeLayer(wml_r);
  map.removeLayer(wml_l);
  map.removeControl(sideBySide);
  
  annotationUrl_Left = document.getElementById("anno-left").value;
  annotationUrl_Right = document.getElementById("anno-right").value;
  
  wml_l = new Allmaps.WarpedMapLayer(annotationUrl_Left).addTo(map);
  wml_r = new Allmaps.WarpedMapLayer(annotationUrl_Right).addTo(map);
  
  map.on('warpedmapadded', (event) => {
    console.log(event.mapId, wml_l.getBounds())
    // console.log(event.mapId, wml_r.getBounds())
    map.fitBounds(wml_l.getBounds());
  })
  
  sideBySide = L.control.sideBySide(wml_l, wml_r)
  sideBySide.addTo(map);
});

leftbutton.addEventListener("click", (event) => {
    map.fitBounds(wml_l.getBounds());
});

rightbutton.addEventListener("click", (event) => {
    map.fitBounds(wml_r.getBounds());
});

// modal code
document.addEventListener('DOMContentLoaded', () => {
  // Functions to open and close a modal
  function openModal($el) {
    $el.classList.add('is-active');
  }

  function closeModal($el) {
    $el.classList.remove('is-active');
  }

  function closeAllModals() {
    (document.querySelectorAll('.modal') || []).forEach(($modal) => {
      closeModal($modal);
    });
  }

  // Add a click event on buttons to open a specific modal
  (document.querySelectorAll('.js-modal-trigger') || []).forEach(($trigger) => {
    const modal = $trigger.dataset.target;
    const $target = document.getElementById(modal);

    $trigger.addEventListener('click', () => {
      openModal($target);
    });
  });

  // Add a click event on various child elements to close the parent modal
  (document.querySelectorAll('.modal-background, .modal-close, .modal-card-head .delete, .modal-card-foot .button') || []).forEach(($close) => {
    const $target = $close.closest('.modal');

    $close.addEventListener('click', () => {
      closeModal($target);
    });
  });

  // Add a keyboard event to close all modals
  document.addEventListener('keydown', (event) => {
    if(event.key === "Escape") {
      closeAllModals();
    }
  });
});