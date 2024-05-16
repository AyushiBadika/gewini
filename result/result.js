const searchBarInput = document.querySelector(".searchBarInput");
const searchIcon = document.querySelector(".searchIcon");
const voiceToText = document.querySelector(".micDiv");
const wikipediaResults = document.querySelector(".wikipediaResults");
const googleResults = document.querySelector(".googleResults");
const geminiResults = document.querySelector(".geminiResults");
const searchHistory = document.querySelector(".searchHistory");
const dropdown = document.querySelector(".sortDropdown");
let wikipediaOutput = [];

// loaders
const googleLoader = document.querySelector(".googleLoader");
const wikipediaLoader = document.querySelector(".wikipediaLoader");
const geminiLoader = document.querySelector(".geminiLoader");

import { GoogleGenerativeAI } from "@google/generative-ai";
const genAI = new GoogleGenerativeAI("AIzaSyAyYrQAwObUaQOR7vghG1mJV_W3jb4qJEI");

//retriving query from url
const currentUrl = new URL(window.location.href);
const searchQuery = currentUrl.searchParams.get("query");

if (searchQuery != null || searchQuery != "") {
  wikipediaLoader.style.display = "block";
  googleLoader.style.display = "block";
  geminiLoader.style.display = "block";
  wikipediaResults.style.display = "none";
  googleResults.style.display = "none";
  geminiResults.style.display = "none";
  storeQueryInLocalStorage(searchQuery);
  searchBarInput.value = searchQuery;
  //call search apis
  fetchWikipediaResults(searchQuery);
  fetchGeminiResults(searchQuery);
  fetchGoogleResults(searchQuery);
}

async function fetchWikipediaResults(query) {
  const apiEndpoint = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${query}&format=json&origin=*`;
  const response = await fetch(apiEndpoint);
  const data = await response.json();
  wikipediaResults.innerHTML = "";
  //result

  if (data.query.search.length == 0) {
    wikipediaResults.innerHTML = `No Results found for '${query}'`;
    wikipediaResults.classList.add("noResults");
  } else {
    wikipediaResults.classList.remove("noResults");
    wikipediaOutput = data.query.search;
    wikipediaOutput.forEach((result) => {
      createWikipediaCard(
        result.title,
        `https://en.wikipedia.org/wiki/${result.title.replace(/ /g, "_")}`,
        result.timestamp.slice(0, 10),
        result.snippet
      );
    });
  }
  wikipediaLoader.style.display = "none";
  wikipediaResults.style.display = "flex";
}

function createWikipediaCard(title, link, timestamp, snippet) {
  wikipediaResults.innerHTML += `<div class="result">
  <div class="title"><a href='${link}' target='_blank'>${title} </a></div>
  <div class="dateAndTime">${timestamp}</div>
  <div class="description">
    ${snippet}
  </div>
  </div>`;
}

// STORING SEARCH HISTORY IN LS
function storeQueryInLocalStorage(query) {
  let history = localStorage.getItem("searchHistory");
  if (history != null) {
    history = history.split(",");
    let noDuplicate = new Set(history).add(query.toString().toLowerCase());
    history = [];
    noDuplicate.forEach((value) => {
      history.push(value);
    });
    localStorage.setItem("searchHistory", history.toString());
  } else {
    if (query != "") {
      history = [];
      history.push(query);
      localStorage.setItem("searchHistory", history.toString());
    }
  }
}

searchBarInput.addEventListener("focus", (e) => {
  e.preventDefault();

  searchHistory.innerHTML = "";
  searchBarInput.style.borderBottomLeftRadius = 0;
  searchBarInput.style.borderBottomRightRadius = 0;
  if (localStorage.getItem("searchHistory")) {
    searchHistoryDisplay();
  }
});

function searchHistoryDisplay() {
  const historyString = localStorage.getItem("searchHistory");
  const historyArr = historyString.split(",");

  let resulted = historyArr;
  searchBarInput.addEventListener("keyup", (e) => {
    if (e.key != "Enter" && e.key != 13) {
      searchHistory.innerHTML = "";
      const pattern = new RegExp(searchBarInput.value, "i");
      resulted = historyArr.filter((ele) => {
        return pattern.test(ele);
      });
      createHistoryDivs(resulted);
      fillingSearchBarFromHistorElement();
    } else {
      searchHistory.innerHTML = "";
    }
  });

  createHistoryDivs(resulted);
  fillingSearchBarFromHistorElement();

  searchBarInput.addEventListener("blur", (e) => {
    e.preventDefault();
    setTimeout(() => {
      searchHistory.innerHTML = "";
      searchBarInput.style.borderBottomLeftRadius = "0.5rem";
      searchBarInput.style.borderBottomRightRadius = "0.5rem";
    }, 500);
  });
}

function createHistoryDivs(resulted) {
  resulted.reverse().forEach((ele, index) => {
    const historyDiv = `<div class='historyElement'><i class="fa-solid fa-clock-rotate-left" style="color: #6101d3;"></i><span class='history'>${ele}</span></div>`;
    if (index < 5) searchHistory.innerHTML += historyDiv;
  });
}
function fillingSearchBarFromHistorElement() {
  const historyElements = document.querySelectorAll(".historyElement");
  historyElements.forEach((ele, index) => {
    ele.addEventListener("click", (e) => {
      e.preventDefault();

      const history = document.querySelectorAll(".history");
      searchBarInput.value = history[index].innerHTML;
      searchBarInput.focus();
      searchHistory.innerHTML = "";
    });
  });
}

document.querySelector(".googleTab").addEventListener("click", () => {
  document.querySelector(".googleTab").classList.add("selectedTab");
  document.querySelector(".wikipediaTab").classList.remove("selectedTab");
  document.querySelector(".geminiTab").classList.remove("selectedTab");

  document.querySelector(".googleSection").style.display = "flex";
  document.querySelector(".wikipediaSection").style.display = "none";
  document.querySelector(".geminiSection").style.display = "none";
  dropdown.style.display = "block";
});
document.querySelector(".wikipediaTab").addEventListener("click", () => {
  document.querySelector(".googleTab").classList.remove("selectedTab");
  document.querySelector(".wikipediaTab").classList.add("selectedTab");
  document.querySelector(".geminiTab").classList.remove("selectedTab");

  document.querySelector(".googleSection").style.display = "none";
  document.querySelector(".wikipediaSection").style.display = "flex";
  document.querySelector(".geminiSection").style.display = "none";
  dropdown.style.display = "block";
});
document.querySelector(".geminiTab").addEventListener("click", () => {
  document.querySelector(".googleTab").classList.remove("selectedTab");
  document.querySelector(".wikipediaTab").classList.remove("selectedTab");
  document.querySelector(".geminiTab").classList.add("selectedTab");

  document.querySelector(".googleSection").style.display = "none";
  document.querySelector(".wikipediaSection").style.display = "none";
  document.querySelector(".geminiSection").style.display = "flex";
  dropdown.style.display = "none";
});

//voice to text

let speech = false;
window.SpeechRecognition = window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.interimResults = true;
recognition.continuous = true;

voiceToText.addEventListener("click", function () {
  searchBarInput.focus();

  if (speech) {
    speech = false;
    recognition.abort();
  } else {
    speech = true;
    recognition.start();
    recognition.addEventListener("result", (e) => {
      const transcript = Array.from(e.results)
        .map((result) => result[0])
        .map((result) => result.transcript)
        .join("");

      searchBarInput.value = transcript;
    });
  }
});

var mic = document.querySelector(".mic");

mic.addEventListener("click", function () {
  mic.classList.toggle("listening");
});

searchIcon.addEventListener("click", (e) => {
  if (searchBarInput.value == "") return;
  searchBarInput.blur();
  wikipediaLoader.style.display = "block";
  googleLoader.style.display = "block";
  geminiLoader.style.display = "block";
  wikipediaResults.style.display = "none";
  googleResults.style.display = "none";
  geminiResults.style.display = "none";

  e.preventDefault();
  currentUrl.searchParams.set("query", searchBarInput.value);
  window.history.pushState({}, "", currentUrl.toString());
  storeQueryInLocalStorage(searchBarInput.value);
  //callSearchFunction
  fetchWikipediaResults(searchBarInput.value);
  fetchGeminiResults(searchBarInput.value);
  fetchGoogleResults(searchBarInput.value);
});
searchBarInput.addEventListener("keydown", (e) => {
  if (e.key == "Enter" || e.key == 13) {
    if (searchBarInput.value == "") return;
    e.preventDefault();
    searchBarInput.blur();
    wikipediaLoader.style.display = "block";
    googleLoader.style.display = "block";
    geminiLoader.style.display = "block";
    wikipediaResults.style.display = "none";
    googleResults.style.display = "none";
    geminiResults.style.display = "none";
    currentUrl.searchParams.set("query", searchBarInput.value);
    window.history.pushState({}, "", currentUrl.toString());
    storeQueryInLocalStorage(searchBarInput.value);
    //callSearchFunction
    fetchWikipediaResults(searchBarInput.value);
    fetchGeminiResults(searchBarInput.value);
    fetchGoogleResults(searchBarInput.value);
  }
});

// GEMINI API
const md = markdownit({
  html: true,
  linkify: true,
  typographer: true,
});

async function fetchGeminiResults(prompt) {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  const result = await model.generateContent(prompt).catch((err) => {
    console.log("error in gemini fetch");
    geminiResults.innerHTML =
      "Error fetching gemini results, please reload or try again later!";
    geminiLoader.style.display = "none";
    geminiResults.style.display = "flex";
  });
  const response = result.response;
  const text = response.text();

  geminiResults.innerHTML = md.render(text);

  let preStyle = document
    .querySelector(".geminiResults")
    .querySelectorAll("code");

  for (let i = 0; i < preStyle.length; i++) {
    let code = preStyle[i];
    Prism.highlightElement(code);
  }

  geminiLoader.style.display = "none";
  geminiResults.style.display = "flex";
}

// Google Api

async function fetchGoogleResults(query) {
  const sort = dropdown.value == "date" ? "date" : "";

  const apiEndpoint = `https://www.googleapis.com/customsearch/v1?q=${query}&num=10&cx=832c9a23ff2784c5a&sort=${sort}&key=AIzaSyCrxkJNYYAFzWqYT3tL2g23lg0c1IIPy-U`;
  const response = await fetch(apiEndpoint);
  const data = await response.json();
  console.log(data);
  googleResults.innerHTML = "";
  data.items.forEach((item) => {
    const thumbnail =
      item?.pagemap?.cse_thumbnail == undefined
        ? item?.pagemap?.cse_image == undefined
          ? `../assests/defaultThumbnail.svg`
          : item.pagemap?.cse_image[0].src
        : item.pagemap?.cse_thumbnail[0].src;
    const appName =
      item?.pagemap?.metatags[0]["al:android:app_name"] != undefined
        ? item?.pagemap?.metatags[0]["al:android:app_name"]
        : item?.displayLink;
    createWGoogleCard(
      item?.htmlTitle,
      item?.link,
      item?.snippet,
      thumbnail,
      appName
    );
  });
  googleLoader.style.display = "none";
  googleResults.style.display = "flex";
}

function createWGoogleCard(title, link, description, thumbnail, appName) {
  googleResults.innerHTML += `<div class="googleResult">
  <div class="metaData">
    <img src="${thumbnail}" alt="" class="thumbnail" />
    <div class="metaApp">
      <a href="${link}">${appName}</a>
      <a href="${link}" class="link">${link}</a>
    </div>
  </div>
  <div class='data'>
    <div class="title">
      <a href="${link}" target="_blank">${title}</a>
    </div>
    
    <div class="description">${description}</div>
  </div>
</div>`;
}

// sort drop down
dropdown.addEventListener("change", () => {
  if (dropdown.value == "date") {
    //sort wikipedia
    let filteredResults = [...wikipediaOutput];
    filteredResults.sort((a, b) => {
      return new Date(b.timestamp) - new Date(a.timestamp);
    });
    wikipediaResults.innerHTML = "";
    filteredResults.forEach((result) => {
      createWikipediaCard(
        result.title,
        `https://en.wikipedia.org/wiki/${result.title.replace(/ /g, "_")}`,
        result.timestamp.slice(0, 10),
        result.snippet
      );
    });

    //sort google
    fetchGoogleResults(searchBarInput.value);
  } else {
    //sort wikipedia
    wikipediaResults.innerHTML = "";
    wikipediaOutput.forEach((result) => {
      createWikipediaCard(
        result.title,
        `https://en.wikipedia.org/wiki/${result.title.replace(/ /g, "_")}`,
        result.timestamp.slice(0, 10),
        result.snippet
      );
    });

    //sort google
    fetchGoogleResults(searchBarInput.value);
  }
});
