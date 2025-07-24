// glitches

const projects = [
  ["birds-eye-cards", "Visualize repetitive landscapes"],
  ["building-blocks-building-text", "Urban atlas-style lettering on repeat"],
  ["coloring-book-generator", "Make any map into a coloring book"],
  ["covid-casualties", "Mapping loss during COVID"],
  ["election-night-boston", "Live updates from Boston's 2021 mayoral race"],
  ["every-different-district", "Explore congressional districts by social variables"],
  ["lmec-dv-starter", "A basic starter kit for LMEC data viz projects"],
  ["map-remix", "Remix a map from LMEC's environmental justice exhibition"],
  ["march-lions-lambs",  "Do sayings stack up against data?"],
  ["massachusetts-library-spider-map", "Walk across libraries with a funny spider"],
  ["neighbors-in-name-only", "Look at Boston’s neighborhoods in name only"],
  ["allmaps-compare",  "Use Allmaps to compare maps"],
  ["massachusetts-district-lookup", "Explore political boundaries in Massachusetts"],
  ["towns-challenge",  "Test your Massachusetts town name knowledge"],
  ["town-after-town", "Where do New England towns share the same name?"]
];

const colors = [
  "#FFD1BA",
  "#FFB3AB",
  "#FFC9DE",
  "#E1CFFF",
  "#CDE7FF",
  "#B3E5FF",
  "#B9FBC0",
  "#D9F8C4",
  "#E8F99A",
  "#FFF6B7",
  "#FFE6A7",
  "#EBD6F5",
  "#D0F4F5",
  "#F7DAD9",
  "#EDF2F4" 
];

function random(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

const container = document.getElementById("projects");

projects
  .slice()
  .sort((a, b) => a[0].localeCompare(b[0]))
  .forEach(([name, description]) => {
    const color = colors[random(0, colors.length)];
    
    const column = document.createElement("div");

    column.className = `column is-one-third custom-bg`;

    const wrapper = document.createElement("div");
    wrapper.className = `project-tile`;
    wrapper.style.backgroundColor = color;

    const githubLink = document.createElement("a");
    githubLink.className = `github-link mx-4`
    githubLink.href = `https://github.com/bplmaps/glitches-at-lmec/tree/main/${name}`;
    githubLink.target = "_blank";
    githubLink.innerHTML = `<i class="fab fa-github fa-lg"</i>`;
    githubLink.style.backgroundColor = color;

    const link = document.createElement("a");
    link.href = name;
    link.target = "_blank";
    link.textContent = name;

    const desc = document.createElement("div");
    desc.className = "project-description";
    desc.textContent = description || "";

    wrapper.appendChild(link);
    wrapper.appendChild(desc);
    column.appendChild(githubLink)
    column.appendChild(wrapper);
    container.appendChild(column);
  });

// modal

const helpBtn = document.getElementById("help");
const modal = document.getElementById("help-modal");
const modalClose = modal.querySelector(".modal-close");
const modalBg = modal.querySelector(".modal-background");

function openModal() {
  modal.classList.add("is-active");
}

function closeModal() {
  modal.classList.remove("is-active");
}

helpBtn.addEventListener("click", openModal);
modalClose.addEventListener("click", closeModal);
modalBg.addEventListener("click", closeModal);
