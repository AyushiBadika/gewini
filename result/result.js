const searchBarInput = document.querySelector(".searchBarInput");
const searchIcon = document.querySelector(".searchIcon");
const voiceToText = document.querySelector(".micDiv");
const wikipediaResults = document.querySelector(".wikipediaResults");
const googleResults = document.querySelector(".googleResults");
const geminiResults = document.querySelector(".geminiResults");
const searchHistory = document.querySelector(".searchHistory");

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
    data.query.search.forEach((result) => {
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
    let noDuplicate = new Set(history).add(query);
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
});
document.querySelector(".wikipediaTab").addEventListener("click", () => {
  document.querySelector(".googleTab").classList.remove("selectedTab");
  document.querySelector(".wikipediaTab").classList.add("selectedTab");
  document.querySelector(".geminiTab").classList.remove("selectedTab");

  document.querySelector(".googleSection").style.display = "none";
  document.querySelector(".wikipediaSection").style.display = "flex";
  document.querySelector(".geminiSection").style.display = "none";
});
document.querySelector(".geminiTab").addEventListener("click", () => {
  document.querySelector(".googleTab").classList.remove("selectedTab");
  document.querySelector(".wikipediaTab").classList.remove("selectedTab");
  document.querySelector(".geminiTab").classList.add("selectedTab");

  document.querySelector(".googleSection").style.display = "none";
  document.querySelector(".wikipediaSection").style.display = "none";
  document.querySelector(".geminiSection").style.display = "flex";
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

const obj = {
  search_term: "football",
  knowledge_panel: {
    name: "NFL",
    label: "League",
    description: {
      text: "The National Football League is a professional American football league that consists of 32 teams, divided equally between the American Football Conference and the National Football Conference.",
      url: "https://en.wikipedia.org/wiki/National_Football_League",
      site: "Wikipedia",
    },
    image: {
      url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:-HmtpTOH5MCDmM",
      width: 179,
      height: 246,
      page_url: "https://en.wikipedia.org/wiki/National_Football_League",
    },
    info: [
      {
        title: "Commissioner",
        labels: ["Roger Goodell"],
      },
      {
        title: "First season",
        labels: ["1920"],
      },
      {
        title: "Founded",
        labels: ["September 17, 1920; 103 years ago; Canton, Ohio, U.S."],
      },
      {
        title: "Most titles",
        labels: ["Green Bay Packers; (13 titles)"],
      },
      {
        title: "Sport",
        labels: ["American football"],
      },
    ],
  },
  results: [
    {
      position: 1,
      url: "https://www.nfl.com/",
      title: "NFL.com | Official Site of the National Football League",
      description:
        "The official source for NFL News, NFL video highlights, Fantasy Football, game-day coverage, NFL schedules, stats, scores & more.",
    },
    {
      position: 2,
      url: "https://en.wikipedia.org/wiki/Football",
      title: "Football - Wikipedia",
      description:
        "Football is a family of team sports that involve, to varying degrees, kicking a ball to score a goal. Unqualified, the word football normally means the form ...",
    },
    {
      position: 3,
      url: "https://www.aljazeera.com/sports/liveblog/2024/5/12/live-manchester-united-vs-arsenal-english-premier-league-football",
      title:
        "LIVE: Manchester United vs Arsenal – English Premier League football",
      description:
        "Arsenal beat Manchester United 1-0 to move back to the top of the Premier League. Leandro Trossard gave the Gunners the lead after 20 ...",
    },
    {
      position: 4,
      url: "https://usafootball.com/",
      title: "USA Football | The Sport's Governing Body",
      description:
        "USA Football's here to lead, strengthen and grow the game alongside you as the sport's governing body through education, events and the U.S. National Team ...",
    },
    {
      position: 5,
      url: "https://en.wikipedia.org/wiki/American_football",
      title: "American football - Wikipedia",
      description:
        "American football also known as gridiron football, is a team sport played by two teams of eleven players on a rectangular field with goalposts at each end.",
    },
    {
      position: 6,
      url: "https://www.espn.com/nfl/",
      title: "NFL on ESPN - Scores, Stats and Highlights",
      description:
        "Visit ESPN for NFL live scores, video highlights and latest news. Stream Monday Night Football on ESPN+ and play Fantasy Football.",
    },
    {
      position: 7,
      url: "https://www.espn.com/college-football/",
      title: "NCAA on ESPN - College Football Scores, Stats and Highlights",
      description:
        "Visit ESPN for NCAA live scores, video highlights and latest news. Stream exclusive college football games on ESPN+ and play College Pick'em.",
    },
    {
      position: 8,
      url: "https://www.youtube.com/watch?v=RCd2dxzOkg4",
      title: "Football is the GREATEST team game there is   - YouTube",
      description:
        "MicdUp #KevinStefanski #BrownsRookieMinicamp SUBSCRIBE: https://www.youtube.com/c ...",
    },
    {
      position: 9,
      url: "https://www.britannica.com/sports/football-soccer",
      title: "Football (soccer) | History, Game, Rules, & Significant Players",
      description:
        "Football, also called soccer, is a game in which two teams of 11 players, using any part of their bodies except their hands and arms, try to maneuver the ...",
    },
    {
      position: 10,
      url: "https://www.cbssports.com/nfl/",
      title: "NFL Football - News, Scores, Stats, Standings, and Rumors",
      description:
        "CBS Sports has the latest NFL Football news, live scores, player stats, standings, fantasy games, and projections.",
    },
  ],
  related_keywords: {
    spelling_suggestion_html: null,
    spelling_suggestion: null,
    keywords: [
      {
        position: 1,
        knowledge: null,
        keyword_html: "football<b> games today</b>",
        keyword: "football games today",
      },
      {
        position: 2,
        knowledge: null,
        keyword_html: "football",
        keyword: "football",
      },
      {
        position: 3,
        knowledge: null,
        keyword_html: "football<b> today</b>",
        keyword: "football today",
      },
      {
        position: 4,
        knowledge: null,
        keyword_html: "football<b> games</b>",
        keyword: "football games",
      },
      {
        position: 5,
        knowledge: null,
        keyword_html: "football<b> schedule</b>",
        keyword: "football schedule",
      },
      {
        position: 6,
        knowledge: null,
        keyword_html: "football<b> scores</b>",
        keyword: "football scores",
      },
      {
        position: 7,
        knowledge: null,
        keyword_html: "football<b> games this weekend</b>",
        keyword: "football games this weekend",
      },
      {
        position: 8,
        knowledge: null,
        keyword_html: "football<b> tonight</b>",
        keyword: "football tonight",
      },
      {
        position: 9,
        knowledge: null,
        keyword_html: "football<b> playoffs</b>",
        keyword: "football playoffs",
      },
      {
        position: 10,
        knowledge: null,
        keyword_html: "football<b> cleats</b>",
        keyword: "football cleats",
      },
    ],
  },
};

// GEMINI API
const md = markdownit({
  html: true,
  linkify: true,
  typographer: true,
});

async function fetchGeminiResults(prompt) {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  const result = await model.generateContent(prompt);
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
  const apiEndpoint = `https://www.googleapis.com/customsearch/v1?key=AIzaSyCrxkJNYYAFzWqYT3tL2g23lg0c1IIPy-U&cx=832c9a23ff2784c5a&q=${query}`;
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
