let inputField = document.getElementById("url-input");
let imageSection = document.getElementById("image-section");
let imageHolder = document.getElementById("image-holder");
let fullDownload = document.getElementById("download-full-res");
let medDownload = document.getElementById("download-med-res");



let debounce = (func, wait, immediate) => {
  var timeout;

  return function executedFunction() {
    var context = this;
    var args = arguments;

    var later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };

    var callNow = immediate && !timeout;

    clearTimeout(timeout);

    timeout = setTimeout(later, wait);

    if (callNow) func.apply(context, args);
  };
};

let processUrl = debounce(function() {
  inputField.disabled = true;
  let f = inputField.value.search("commonwealth:");

  if (f === -1) {
    window.alert("That doesn't seem to be a valid collections URL");
    inputField.disabled = false;
    return;
  } else {
    let identifier = inputField.value.substr(f, f + 22);

    fetch(
      `https://www.digitalcommonwealth.org/search/${identifier}/manifest.json`
    )
      .then(r => r.json())
      .then(d => {
        let manifest = d.sequences[0].canvases[0].images[0].resource.service['@id'];
        let thumbnailUrl = `${manifest}/full/1600,/0/bitonal.jpg`;

        
        imageHolder.innerHTML = "";
        
        fullDownload.setAttribute("href", `${manifest}/full/full/0/bitonal.jpg`);
        medDownload.setAttribute("href", `${manifest}/full/1600,/0/bitonal.jpg`);

        
        let thumbnailImage = document.createElement("img");
        thumbnailImage.src = thumbnailUrl;
        imageHolder.appendChild(thumbnailImage);
        imageSection.classList.remove('is-hidden');
        inputField.disabled = false;
    })
      .catch(() => {
        window.alert("Something went wrong fetching this object.");
        inputField.disabled = false;
      });
  }
}, 200);

inputField.addEventListener("input", processUrl);
