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
    let seeAgain = document.querySelector("#seeAgain");
    let form = document.querySelector("#form");
    let mapGallery = document.querySelector(".mapGallery");
    let previousCorrect = [];
    let count = 0;
    let mapsLabel = document.querySelector(".mapsLabel");
    let mapsLabelHeader = document.querySelector(".mapsLabelHeader");
    let mapImg = document.querySelector(".map");

    // define variables and function that are
    // used to calculate map gallery columns

    let totalL = Array.from({ length: 350 }, (_, i) => i + 1);
    let totalM = Array.from({ length: 350 }, (_, i) => i + 1);
    let totalR = Array.from({ length: 350 }, (_, i) => i + 1);
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

    // this function retrieves metadata from
    // a random map in digital collections
    // based on user input

    function getTownMap(name) {
      // get json from search API

      $.ajax({
        url:
          "https://collections.leventhalmap.org/search.json?per_page=100&q=massachusetts+AND+" +
          name +
          "&search_field=exemplary_image_ss",
        type: "Get",
        dataType: "json",
        success: function (response) {
          // define variables to hold some metadata elements
          // and API endpoint data

          let mapImg = document.querySelector(".map");
          let mapImgTiny = document.querySelector(".mapGallery");
          let link = document.querySelector(".collectionsLink");
          let totalResults = response.response.docs.length;
          let randomImg = Math.floor(Math.random() * totalResults);
          let wordsName = name.split(" ");

          // capitalize town name

          for (let i = 0; i < wordsName.length; i++) {
            wordsName[i] =
              wordsName[i][0].toUpperCase() + wordsName[i].substr(1);
          }
          let nameCap = wordsName.join(" ");

          // handle instances where no maps are found
          // so far just aquinnah...

          let logo =
            "https://iiif.digitalcommonwealth.org/iiif/2/commonwealth:4455c2369/3526,1259,412,419/pct:20/0/default.jpg";
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
          }

          // proceed to instances where maps are found
          else {
            // define more metadata variables now that the map is found
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
            let allmapsCallback =
              "https://editor.allmaps.org/#/collection?url=https://collections.leventhalmap.org/search/" +
              arkId +
              "/manifest" +
              "&callback=https%3A%2F%2Fcollections.leventhalmap.org/search/" +
              arkId;
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

            // redefine blue LMEC logo as map image
            mapImg.src = urlSmall;
            // small crop for map gallery
            mapImgTiny = urlTiny;

            link.setAttribute("href", "");
            link.href = backlink;

            // capitalize town name
            let wordsName = name.split(" ");
            for (let i = 0; i < wordsName.length; i++) {
              wordsName[i] =
                wordsName[i][0].toUpperCase() + wordsName[i].substr(1);
            }
            let nameCap = wordsName.join(" ");
            let firsthit = `<b>Here's a random hit from our <a href="https://collections.leventhalmap.org" target="blank">collections</a> for the search term <i>"Massachusetts AND ${name}"</i>: </b>`;
            // populate the text in the left-hand display
            // to include map name and author
            // but first handle cases where
            // authorship is inconsistent
            if (author != undefined) {
              mapsLabelHeader.innerHTML = firsthit;
              mapsLabel.innerHTML =
                `
              <p><i>${mapName}</i>, by ${author}</p><br>
              ` + buttons;
            } else if (creator != undefined) {
              mapsLabelHeader.innerHTML = firsthit;
              mapsLabel.innerHTML =
                `
              <p><i>${mapName}</i>, by ${creator}</p><br>
              ` + buttons;
            } else if (pub != undefined && pub != "*s.n*") {
              mapsLabelHeader.innerHTML = firsthit;
              mapsLabel.innerHTML =
                `
              <p><i>${mapName}</i>, by ${pub}</p><br>
              ` + buttons;
            } else {
              mapsLabelHeader.innerHTML = firsthit;
              mapsLabel.innerHTML =
                `
              <p><i>${mapName}</i>, unknown author</p><br>
              ` + buttons;
            }

            // add crop of map image & metadata to gallery
            // by using includes method on current total correct count
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
                    data-search="${name}"
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
                    data-search="${name}"
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
                    data-search="${name}"
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
                    data-search="${name}"
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

    // handle cases with wrong answer
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

          mapsLabelHeader.innerHTML = "";
          mapsLabel.innerHTML = `<p>That's not a town - try again!</p><br>`;
          mapImg.src =
            "https://pagesix.com/wp-content/uploads/sites/3/2021/01/ben-affleck-delivery-dunkin-7.jpg?quality=80&strip=all&w=1024";
        }, 1);
        input.value = "";
      }
      input.value = "";
    }

    // handle cases with correct answer
    function townIsCorrect(townCorrect) {
      if (!previousCorrect.includes(townCorrect)) {
        // push correct town to array as string
        previousCorrect.push(townCorrect);
        getTownMap(townCorrect);
        count++;
        seeAgain.innerHTML = `<b><i>Click on any of the maps in the gallery to</i> view them again</b>`;
        score.innerHTML = `
        <b>Score: ${count}/351</b>
        `;
      } else {
        // handle cases where town was already entered
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
          mapsLabelHeader.innerHTML = "";
          mapsLabel.innerHTML = `
            <p>You have already named <i>${nameCap}</i> - try again!</p><br>
            `;
          mapImg.src =
            "https://media.vanityfair.com/photos/600f1d6e5113527c871818a7/master/w_2560%2Cc_limit/ben-affleck-packages-and-coffee-lede.jpg";
        }, 1);
      }
    }

    // event listener to trigger wrong answers
    btn.addEventListener("click", checktown);
    // event listener to send maps to gallery
    mapGallery.addEventListener("click", showMap);
    // event listener to make enter key == button click
    input.addEventListener("keypress", function (event) {
      if (event.key === "Enter") {
        event.preventDefault();
        document.getElementById("btn").click();
      }
    });

    // function for clicking on a map in the gallery
    // to view it again in the left side panel
    function showMap(d) {
      let image =
        d.srcElement.dataset.image.slice(0, 66) + "/full/pct:20/0/default.jpg";
      let backlink = d.srcElement.dataset.backlink;
      let callback = d.srcElement.dataset.callback;
      let mapname = d.srcElement.dataset.name;
      let author = d.srcElement.dataset.author;
      let creator = d.srcElement.dataset.creator;
      let pub = d.srcElement.dataset.pub;
      let name = d.srcElement.dataset.search;

      // reset map image
      mapImg.src = image;

      // define buttons again
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
      let firsthit = `<b>Here's a random hit in our <a href="https://collections.leventhalmap.org" target="blank">collections</a> for the search term <i>"Massachusetts AND ${name}"</i>: </b>`;
      // add text and buttons to panel using new metadata vars
      if (author != undefined) {
        mapsLabelHeader.innerHTML = firsthit;
        mapsLabel.innerHTML =
          `
              <p><i>${mapname}</i>, by ${author}</p><br>
              ` + buttons;
      } else if (creator != undefined) {
        mapsLabelHeader.innerHTML = firsthit;
        mapsLabel.innerHTML =
          `
              <p><i>${mapname}</i>, by ${creator}</p><br>
              ` + buttons;
      } else if (pub != undefined && pub != "*s.n*") {
        mapsLabelHeader.innerHTML = firsthit;
        mapsLabel.innerHTML =
          `
              <p><i>${mapname}</i>, by ${pub}</p><br>
              ` + buttons;
      } else {
        mapsLabelHeader.innerHTML = firsthit;
        mapsLabel.innerHTML =
          `
              <p><i>${mapname}</i>, unknown author</p><br>
              ` + buttons;
      }
    }
    // }
  });
});
