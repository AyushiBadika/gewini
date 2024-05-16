const searchBtn = document.querySelector(".searchBtn");
const voiceToText = document.querySelector(".micDiv");
const searchBarInput = document.querySelector(".searchBarInput");
const searchHistory = document.querySelector(".searchHistory");
const historyElements = document.querySelectorAll(".historyElement");

searchBtn.addEventListener("click", (e) => {
  e.preventDefault();
  searchHistory.innerHTML = "";
  if (searchBarInput.value == "") return;
  window.location.href = `/gewini/result/result.html?query=${searchBarInput.value}`;
});
searchBarInput.addEventListener("keydown", (e) => {
  if (e.key == "Enter" || e.key == 13) {
    if (searchBarInput.value == "") return;
    searchHistory.innerHTML = "";
    window.location.href = `/gewini/result/result.html?query=${searchBarInput.value}`;
  }
});

// search history
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
  searchBarInput.addEventListener("keyup", () => {
    searchHistory.innerHTML = "";
    const pattern = new RegExp(searchBarInput.value, "i");
    resulted = historyArr.filter((ele) => {
      return pattern.test(ele);
    });
    createHistoryDivs(resulted);
    fillingSearchBarFromHistorElement();
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
      console.log(ele);
      e.preventDefault();

      const history = document.querySelectorAll(".history");
      searchBarInput.value = history[index].innerHTML;
      searchHistory.innerHTML = "";
    });
  });
}
// mic
var mic = document.querySelector(".mic");
mic.addEventListener("click", function () {
  mic.classList.toggle("listening");
});

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

// WEATHER INFO RETRIVING FROM LS
if (localStorage.getItem("weatherInfo") != null) {
  let weatherInfo = JSON.parse(localStorage.getItem("weatherInfo"));
  document.querySelector(".weatherType").innerHTML = weatherInfo?.weatherCity;
  document.querySelector(".weatherImage").src = weatherInfo?.weatherIconSrc;
  document.querySelector(".weatherImage").alt = weatherInfo?.weatherIconAlt;
  document.querySelector(".temperature").innerHTML = weatherInfo?.weatherTemp;
  if (Date.now() > weatherInfo?.nextReload) {
    navigator.geolocation.getCurrentPosition(success, error);

    function success(position) {
      getWeather(position.coords.latitude, position.coords.longitude);
    }

    function error() {
      console.log("error getting location");
    }
  }
} else {
  navigator.geolocation.getCurrentPosition(success, error);

  function success(position) {
    getWeather(position.coords.latitude, position.coords.longitude);
  }

  function error() {
    console.log("error getting location");
  }
}

async function getWeather(lat, long) {
  const url = `https://weatherapi-com.p.rapidapi.com/current.json?q=${lat}%2C${long}`;
  const options = {
    method: "GET",
    headers: {
      "X-RapidAPI-Key": "b22f8f85b1msh57d3ae822a05374p192b61jsn1537209eaf0a",
      "X-RapidAPI-Host": "weatherapi-com.p.rapidapi.com",
    },
  };

  try {
    const response = await fetch(url, options);
    const result = await response.json();

    document.querySelector(".weatherType").innerHTML = result?.location?.name;
    document.querySelector(".weatherImage").src =
      result?.current?.condition?.icon;
    document.querySelector(".weatherImage").alt =
      result?.current?.condition?.text;
    document.querySelector(
      ".temperature"
    ).innerHTML = `${result?.current?.temp_c}°C`;

    let weatherInfo = {
      weatherCity: result?.location?.name,
      weatherIconSrc: result?.current?.condition?.icon,
      weatherIconAlt: result?.current?.condition?.text,
      weatherTemp: `${result?.current?.temp_c}°C`,
      nextReload: Date.now() + 600000,
    };
    localStorage.setItem("weatherInfo", JSON.stringify(weatherInfo));
  } catch (error) {
    console.error(error);
  }
}

// date and time
const date = new Date();
const daysOfWeek = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const dateAndTime = document.querySelector(".dateAndTime");

dateAndTime.innerHTML = `${daysOfWeek[date.getDay()]}, ${
  months[date.getMonth()]
} ${date.getDate()}, ${date.getFullYear()}`;
