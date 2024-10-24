const userTab = document.querySelector("[data-userWeather]");
const searchTab = document.querySelector("[data-searchWeather]");
const userContainer = document.querySelector(".main-container");

//?  main containers UI's
const grantAccessContainer = document.querySelector(
  ".grant-location-container"
);
const searchForm = document.querySelector("[data-searchForm]");
const loadingScreen = document.querySelector(".loading-container");
const userInfoContainer = document.querySelector(".user-info-container");
const notFoundContainer = document.querySelector("[data-notFound]");

//? buttons
const grantAccessBtn = document.querySelector("[data-grantAccess]");

//? initial values
let oldTab = userTab;
const API_KEY = "056259df00ef0f0d79c65c2c6952f61a";
oldTab.classList.add("current-tab");
// if coordinates already present
getFromSessionStorage();

//? switch tab function
function switchTab(newTab) {
  if (newTab != oldTab) {
    oldTab.classList.remove("current-tab");
    oldTab = newTab;
    oldTab.classList.add("current-tab");

    if (!searchForm.classList.contains("active")) {
      userInfoContainer.classList.remove("active");
      grantAccessContainer.classList.remove("active");
      searchForm.classList.add("active");
    } else {
      // means iam at search tab now -> main phele search wale tab pr tha
      searchForm.classList.remove("active");
      userInfoContainer.classList.remove("active");
      getFromSessionStorage();
    }
  }
}

userTab.addEventListener("click", () => {
  // pass the current tab as parameter
  switchTab(userTab);
});

searchTab.addEventListener("click", () => {
  // pass the current tab as parameter
  switchTab(searchTab);
});

//todo check whether co-ordinates saved in session storage
function getFromSessionStorage() {
  const localCoordinates = sessionStorage.getItem("user-coordinates");
  if (!localCoordinates) {
    // if we dont have the coordinates then get the coordinates
    grantAccessContainer.classList.add("active");
  } else {
    // if we have the coordinates
    const coordinates = JSON.parse(localCoordinates);
    fetchUserWeatherInfo(coordinates);
  }
}

async function fetchUserWeatherInfo(coordinates) {
  const { lat, lon } = coordinates;
  // make grant contianer invisible
  grantAccessContainer.classList.remove("active");
  // make loading screen visible
  loadingScreen.classList.add("active");
  notFoundContainer.classList.remove("active");
  // API CALL
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
    );
    const data = await response.json();
    // we got the data remove the loading
    loadingScreen.classList.remove("active");
    // show the userinfo container
    userInfoContainer.classList.add("active");
    // SHOW IN UI
    renderWeatherInfo(data);
  } catch (err) {
    loadingScreen.classList.remove("active");
    userInfoContainer.classList.remove("active");
    notFoundContainer.classList.add("active");
  }
}

function renderWeatherInfo(weatherInfo) {
  notFoundContainer.classList.remove("active");
  // we need to fetch the elements
  const cityName = document.querySelector("[data-cityName]");
  const countryIcon = document.querySelector("[data-countryIcon]");
  const desc = document.querySelector("[data-weatherDesc]");
  const weatherIcon = document.querySelector("[data-weatherIcon]");
  const temp = document.querySelector("[data-temp]");
  const windspeed = document.querySelector("[data-windspeed]");
  const humidity = document.querySelector("[data-humidity]");
  const cloudiness = document.querySelector("[data-cloudiness]");

  // fetch values from weatherInfo obj and display in UI
  cityName.innerText = weatherInfo?.name;
  countryIcon.src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;
  desc.innerText = weatherInfo?.weather?.[0]?.description;
  weatherIcon.src = `http://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;
  temp.innerText = `${weatherInfo?.main?.temp} °C`;
  windspeed.innerText = `${weatherInfo?.wind?.speed}m/s`;
  humidity.innerText = `${weatherInfo?.main?.humidity}%`;
  cloudiness.innerText = ` ${weatherInfo?.clouds?.all}%`;
}

// ? Grant Acess btn

function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition);
  } else {
    alert("GeoLocation is not supported.");
    console.log("GeoLocation is not supported.");
  }
}
function showPosition(position) {
  const userCoordinates = {
    lat: position.coords.latitude,
    lon: position.coords.longitude,
  };
  sessionStorage.setItem("user-coordinates", JSON.stringify(userCoordinates));
  fetchUserWeatherInfo(userCoordinates);
}
grantAccessBtn.addEventListener("click", getLocation);

// todo search tab functionality
const searchInput = document.querySelector("[data-searchInput]");

searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  let cityName = searchInput.value;

  if (cityName === "") {
    return;
  } else {
    fetchSearchWeatherInfo(cityName);
  }
});

async function fetchSearchWeatherInfo(city) {
  loadingScreen.classList.add("active");
  userInfoContainer.classList.remove("active");
  grantAccessContainer.classList.remove("active");

  // API CALL

  try {
    let response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
    );
    let data = await response.json();
    loadingScreen.classList.remove("active");
    userInfoContainer.classList.add("active");
    if (city.toLowerCase() === data?.name.toLowerCase()) {
      notFoundContainer.classList.remove("active");
      renderWeatherInfo(data);
    }
  } catch (err) {
    loadingScreen.classList.remove("active");
    userInfoContainer.classList.remove("active");
    notFoundContainer.classList.add("active");
  }
}
