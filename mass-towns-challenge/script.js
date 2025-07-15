/* global autocomplete */
/* global d3 */

$(document).ready(function () {
  $.getJSON("towns.json", function (data) {

    // define global variables
    
    let towns = data;
    let input = document.querySelector("#town-name");
    let btn = document.querySelector("#btn");
    let listContainer = document.querySelector(".list-container");
    let correctListL = document.querySelector("#correct-list-l");
    let correctListM = document.querySelector("#correct-list-m");
    let correctListR = document.querySelector("#correct-list-r");
    let correctListFR = document.querySelector("#correct-list-fr");
    let score = document.querySelector("#score");
    let form = document.querySelector("#form");
    let mapGallery = document.querySelector(".mapGallery");
    let previousCorrect = [];
    let count = 0;
    let mapsLabel = document.querySelector(".mapsLabel");
    let mapImg = document.querySelector(".map");

    let totalL = Array.from({ length: 360 }, (_, i) => i + 1);
    let totalM = Array.from({ length: 360 }, (_, i) => i + 1);
    let totalR = Array.from({ length: 360 }, (_, i) => i + 1);

    totalM.shift();
    totalR.shift();
    totalR.shift();

    let galleryLeft = getEveryNth(totalL, 4);
    let galleryMid = getEveryNth(totalM, 4);
    let galleryRight = getEveryNth(totalR, 4);

    function getEveryNth(arr, nth) {
      let result = [];
      for (let i = 0; i < arr.length; i += nth) {
        result.push(arr[i]);
      }
      return result;
    }

    function getTownMap(name) {
      $.ajax({
        url:
          "https://collections.leventhalmap.org/search.json?per_page=100&q=massachusetts+AND+" +
          name +
          "&search_field=exemplary_image_ss",
        type: "Get",
        dataType: "json",
        success: function (response) {
          let mapImg = document.querySelector(".map");
          let mapImgTiny = document.querySelector(".mapGallery");
          let link = document.querySelector(".collectionsLink");
          let totalResults = response.response.docs.length;
          let randomImg = Math.floor(Math.random() * totalResults);
          let wordsName = name.split(" ");

          for (let i = 0; i < wordsName.length; i++) {
            wordsName[i] =
              wordsName[i][0].toUpperCase() + wordsName[i].substr(1);
          }

          let nameCap = wordsName.join(" ");
          let logo = "https://iiif.digitalcommonwealth.org/iiif/2/commonwealth:4455c2369/3526,1259,412,419/pct:20/0/default.jpg";
          
          if (totalResults == 0) {
            mapImg.src =
              "https://i.pinimg.com/736x/79/b0/f5/79b0f5ffed3ce969e75814dcc45ce400.jpg";
            mapsLabel.innerHTML = `
            <p>Unmappable - no maps of <i>${nameCap}</i> in LMEC collections!<br><br></p>
            `;
            if (galleryLeft.includes(count)) {
              correctListL.innerHTML += `
                  <img
                    class="mapGallery"
                    src=${logo}
                  />
                <li><p>${nameCap}</p></li>`;
            } else if (galleryMid.includes(count)) {
              correctListM.innerHTML += `
                  <img
                    class="mapGallery"
                    src=${logo}
                  />
                <li><p>${nameCap}</p></li>`;
            } else if (galleryRight.includes(count)) {
              correctListR.innerHTML += `
                  <img
                    class="mapGallery"
                    src=${logo}
                  />
                <li><p>${nameCap}</p></li>`;
            } else {
              correctListFR.innerHTML += `
                  <img
                    class="mapGallery"
                    src=${logo}
                  />
                <li><p>${nameCap}</p></li>`;
            }
          } else {
            let urlSmall =
              "https://iiif.digitalcommonwealth.org/iiif/2/" +
              response.response.docs[randomImg].exemplary_image_ssi +
              "/full/!800,800/0/default.jpg";
            let urlTiny =
              "https://iiif.digitalcommonwealth.org/iiif/2/" +
              response.response.docs[randomImg].exemplary_image_ssi +
              "/2699,479,899,870/pct:10/0/default.jpg";
            let url =
              "https://iiif.digitalcommonwealth.org/iiif/2/" +
              response.response.docs[randomImg].exemplary_image_ssi +
              "/full/full/0/default.jpg";

            mapImg.src = urlSmall;
            mapImgTiny = urlTiny;

            let arkId = response.response.docs[randomImg].id;
            let allmapsId = arkId.substr(13);
            let mapName =
              response.response.docs[randomImg].title_info_primary_tsi;
            let pub = response.response.docs[randomImg].publisher_tsi;
            let author = response.response.docs[randomImg].name_tsim;
            let creator = response.response.docs[randomImg].name_facet_ssim;
            let backlink =
              "https://collections.leventhalmap.org/search/" +
              response.response.docs[randomImg].id;

            link.setAttribute("href", "");
            link.href = backlink;

            let allmapsCallback =
              "https://editor.allmaps.org/#/collection?url=https://collections.leventhalmap.org/search/" +
              arkId +
              "/manifest" +
              "&callback=https%3A%2F%2Fcollections.leventhalmap.org/search/" +
              arkId;

            let wordsName = name.split(" ");

            for (let i = 0; i < wordsName.length; i++) {
              wordsName[i] =
                wordsName[i][0].toUpperCase() + wordsName[i].substr(1);
            }

            let nameCap = wordsName.join(" ");
            mapImg.src = urlSmall;

            let buttons = `
            <div class="buttons is-centered mb-2">
              <a href="${allmapsCallback}" target="blank">
                <button class="button is-primary">Georeference in Allmaps</button>
              </a>
              <a href="${backlink}" target="blank">
                <button class="button is-link">View in LMEC collections</button>
              </a>
            </div>
            `;

            if (author != undefined) {
              mapsLabel.innerHTML =
                `
              <p><i>${mapName}</i>, by ${author}</p><br>
              ` + buttons;
            } else if (creator != undefined) {
              mapsLabel.innerHTML =
                `
              <p><i>${mapName}</i>, by ${creator}</p><br>
              ` + buttons;
            } else if (pub != undefined && pub != "*s.n*") {
              mapsLabel.innerHTML =
                `
              <p><i>${mapName}</i>, by ${pub}</p><br>
              ` + buttons;
            } else {
              mapsLabel.innerHTML =
                `
              <p><i>${mapName}</i>, unknown author</p><br>
              ` + buttons;
            }

            if (galleryLeft.includes(count)) {
              correctListL.innerHTML += `
                  <img
                    class="mapGallery"
                    src=${mapImgTiny}
                    style="width: auto; height: auto"
                    data-image="${urlSmall}"
                    data-backlink="${backlink}"
                    data-callback="${allmapsCallback}"
                    data-name="${mapName}"
                    data-author="${author}"
                    data-creator="${creator}"
                    data-pub="${pub}"
                  />
                <li>${nameCap}</li>
                `;
            } else if (galleryMid.includes(count)) {
              correctListM.innerHTML += `
                  <img
                    class="mapGallery"
                    src=${mapImgTiny}
                    style="width: auto; height: auto"
                    data-image="${urlSmall}"
                    data-backlink="${backlink}"
                    data-callback="${allmapsCallback}"
                    data-name="${mapName}"
                    data-author="${author}"
                    data-creator="${creator}"
                    data-pub="${pub}"
                  />
                <li>${nameCap}</li>`;
            } else if (galleryRight.includes(count)) {
              correctListR.innerHTML += `
                  <img
                    class="mapGallery"
                    src=${mapImgTiny}
                    style="width: auto; height: auto"
                    data-image="${urlSmall}"
                    data-backlink="${backlink}"
                    data-callback="${allmapsCallback}"
                    data-name="${mapName}"
                    data-author="${author}"
                    data-creator="${creator}"
                    data-pub="${pub}"
                  />
                <li>${nameCap}</li>`;
            } else {
              correctListFR.innerHTML += `
                  <img
                    class="mapGallery"
                    src=${mapImgTiny}
                    style="width: auto; height: auto"
                    data-image="${urlSmall}"
                    data-backlink="${backlink}"
                    data-callback="${allmapsCallback}"
                    data-name="${mapName}"
                    data-author="${author}"
                    data-creator="${creator}"
                    data-pub="${pub}"
                  />
                <li>${nameCap}</li>`;
            }
          }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
          alert("Oops! something went wrong!");
        },
      });
    }

    function checktown() {
      let townGuess = input.value.toLowerCase();
      let townCorrect;
      let mapImg = document.querySelector(".map");
      let mapsLabel = document.querySelector(".mapsLabel");
      let notice = document.querySelector("#notice");

      if (notice) {
        notice.remove();
      }

      towns.forEach(function (town, i) {
        if (townGuess === town.name) {
          townCorrect = townGuess;
          townIsCorrect(townCorrect);
        }
      });

      if (!townCorrect) {
        let notice = document.createElement("div");
        notice.setAttribute("id", "notice");
        notice.setAttribute("aria-live", "polite");
        notice.setAttribute("class", "container");
        let notices = document.querySelectorAll("#notice").length;
        setTimeout(function () {
          if (notices > 1) {
            return;
          }

          mapsLabel.innerHTML = `<p>That's not a town - try again!</p><br>`;
          mapImg.src =
            "https://pagesix.com/wp-content/uploads/sites/3/2021/01/ben-affleck-delivery-dunkin-7.jpg?quality=80&strip=all&w=1024";
        }, 1);
        input.value = "";
      }
      input.value = "";
    }

    function townIsCorrect(townCorrect) {
      if (!previousCorrect.includes(townCorrect)) {
        previousCorrect.push(townCorrect);
        getTownMap(townCorrect);
        count++;
        score.innerHTML = `
        <p>Score: ${count}/351<br><br>
        <b><i>Click on any of the maps in the gallery to</i> view them again</b></p>`;

        Promise.all([
          fetch(
            "https://cdn.glitch.global/6bcd3ca3-8fd5-440e-8129-39615d80280d/mass-municipalities.geojson?v=1667246729000"
          ).then((data) => data.json()),
        ]).then(function (json) {
          // drawMap(json);
        });
      } else {
        // Create a notification
        let notice = document.createElement("div");
        notice.setAttribute("id", "notice");
        notice.setAttribute("aria-live", "polite");
        notice.setAttribute("class", "notice-style");

        let wordsName = townCorrect.split(" ");

        for (let i = 0; i < wordsName.length; i++) {
          wordsName[i] = wordsName[i][0].toUpperCase() + wordsName[i].substr(1);
        }

        let nameCap = wordsName.join(" ");

        notice.style.padding = "16px 0";

        let notices = document.querySelectorAll("#notice").length;

        setTimeout(function () {
          if (notices > 1) {
            return;
          }

          mapsLabel.innerHTML = `
            <p>You have already named <i>${nameCap}</i> - try again!</p><br>
            `;
          mapImg.src =
            "https://media.vanityfair.com/photos/600f1d6e5113527c871818a7/master/w_2560%2Cc_limit/ben-affleck-packages-and-coffee-lede.jpg";
        }, 1);
      }
    }

    btn.addEventListener("click", checktown);
    mapGallery.addEventListener("click", showMap);
    input.addEventListener("keypress", function (event) {
      if (event.key === "Enter") {
        event.preventDefault();
        document.getElementById("btn").click();
      }
    });

    function showMap(d) {
      console.log(d.path[0].currentSrc.slice(0, 66) + "/full/pct:20/0/default.jpg")
      let image =
        d.path[0].currentSrc.slice(0, 66) + "/full/pct:20/0/default.jpg";
      let backlink = d.path[0].attributes[4].nodeValue;
      let callback = d.path[0].attributes[5].nodeValue;
      let mapname = d.path[0].attributes[6].nodeValue;
      let author = d.path[0].attributes[7].nodeValue;
      let creator = d.path[0].attributes[8].nodeValue;
      let pub = d.path[0].attributes[9].nodeValue;
      mapImg.src = image;

      let buttons = `
            <div class="buttons is-centered mb-2">
              <a href="${callback}" target="blank">
                <button class="button is-primary">Georeference in Allmaps</button>
              </a>
              <a href="${backlink}" target="blank">
                <button class="button is-link">View in LMEC collections</button>
              </a>
            </div>
            `;

      if (author != undefined) {
        mapsLabel.innerHTML =
          `
              <p><i>${mapname}</i>, by ${author}</p><br>
              ` + buttons;
      } else if (creator != undefined) {
        mapsLabel.innerHTML =
          `
              <p><i>${mapname}</i>, by ${creator}</p><br>
              ` + buttons;
      } else if (pub != undefined && pub != "*s.n*") {
        mapsLabel.innerHTML =
          `
              <p><i>${mapname}</i>, by ${pub}</p><br>
              ` + buttons;
      } else {
        mapsLabel.innerHTML =
          `
              <p><i>${mapname}</i>, unknown author</p><br>
              ` + buttons;
      }
    }
  });
});
