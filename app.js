function WeatherApp(apiKey) {
    this.apiKey = apiKey;
    this.apiUrl = "https://api.openweathermap.org/data/2.5/weather";
    this.forecastUrl = "https://api.openweathermap.org/data/2.5/forecast";

    this.searchBtn = document.getElementById("search-btn");
    this.cityInput = document.getElementById("city-input");
    this.weatherDisplay = document.getElementById("weather-display");

    this.recentSection =
        document.getElementById("recent-searches-section");
    this.recentContainer =
        document.getElementById("recent-searches-container");

    this.recentSearches = [];
    this.maxRecent = 5;

    this.init();
}

/* INIT */
WeatherApp.prototype.init = function () {
    this.searchBtn.addEventListener(
        "click",
        this.handleSearch.bind(this)
    );

    this.cityInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") this.handleSearch();
    });

    this.loadRecentSearches();
    this.showWelcome();
};

/* Welcome */
WeatherApp.prototype.showWelcome = function () {
    this.weatherDisplay.innerHTML =
        `<p>Search a city to see weather.</p>`;
};

/* Search */
WeatherApp.prototype.handleSearch = function () {
    const city = this.cityInput.value.trim();
    if (!city) return;
    this.getWeather(city);
    this.cityInput.value = "";
};

/* Loading */
WeatherApp.prototype.showLoading = function () {
    this.weatherDisplay.innerHTML =
        `<div class="spinner"></div><p>Loading...</p>`;
};

/* Error */
WeatherApp.prototype.showError = function (msg) {
    this.weatherDisplay.innerHTML =
        `<div class="error-message">${msg}</div>`;
};

/* Weather */
WeatherApp.prototype.getWeather = async function (city) {
    this.showLoading();

    const currentUrl =
        `${this.apiUrl}?q=${city}&appid=${this.apiKey}&units=metric`;

    try {
        const [currentWeather, forecastData] =
            await Promise.all([
                axios.get(currentUrl),
                this.getForecast(city)
            ]);

        this.displayWeather(currentWeather.data);
        this.displayForecast(forecastData);

        this.saveRecentSearch(city);
    }
    catch {
        this.showError("City not found");
    }
};

/* Forecast Fetch */
WeatherApp.prototype.getForecast = async function (city) {
    const url =
        `${this.forecastUrl}?q=${city}&appid=${this.apiKey}&units=metric`;
    const res = await axios.get(url);
    return res.data;
};

/* Display Weather */
WeatherApp.prototype.displayWeather = function (data) {
    const icon =
        `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

    this.weatherDisplay.innerHTML = `
        <h2>${data.name}</h2>
        <img src="${icon}" class="weather-icon"/>
        <div class="temperature">${Math.round(data.main.temp)}°C</div>
        <p>${data.weather[0].description}</p>
    `;
};

/* Forecast */
WeatherApp.prototype.displayForecast = function (data) {
    const days = data.list.filter(i =>
        i.dt_txt.includes("12:00:00")
    ).slice(0,5);

    const html = days.map(day => {
        const date = new Date(day.dt * 1000);
        const name = date.toLocaleDateString("en-US",{weekday:"short"});
        const icon =
            `https://openweathermap.org/img/wn/${day.weather[0].icon}.png`;

        return `
            <div class="forecast-card">
                <h4>${name}</h4>
                <img src="${icon}">
                <div>${Math.round(day.main.temp)}°C</div>
            </div>`;
    }).join("");

    this.weatherDisplay.innerHTML +=
        `<div class="forecast-container">${html}</div>`;
};

/* Recent Searches */
WeatherApp.prototype.loadRecentSearches = function () {
    const saved =
        localStorage.getItem("recentSearches");

    if (saved)
        this.recentSearches = JSON.parse(saved);

    this.displayRecentSearches();
};

WeatherApp.prototype.saveRecentSearch = function (city) {
    const name =
        city.charAt(0).toUpperCase() +
        city.slice(1).toLowerCase();

    this.recentSearches =
        this.recentSearches.filter(c => c !== name);

    this.recentSearches.unshift(name);

    if (this.recentSearches.length > this.maxRecent)
        this.recentSearches.pop();

    localStorage.setItem(
        "recentSearches",
        JSON.stringify(this.recentSearches)
    );

    this.displayRecentSearches();
};

WeatherApp.prototype.displayRecentSearches = function () {
    this.recentContainer.innerHTML = "";

    if (this.recentSearches.length === 0) {
        this.recentSection.style.display = "none";
        return;
    }

    this.recentSection.style.display = "block";

    this.recentSearches.forEach(city => {
        const btn = document.createElement("button");
        btn.className = "recent-search-btn";
        btn.textContent = city;

        btn.onclick = () => this.getWeather(city);

        this.recentContainer.appendChild(btn);
    });
};

/* Start App */
const app = new WeatherApp("2fb931f9dbaa264b9c1e9b714e66f642");
