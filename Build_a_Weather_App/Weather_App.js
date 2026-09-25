//doc elements
const getWeatherButton = document.getElementById("get-weather-button");
const options = document.getElementById("city-options");
const weatherIcon = document.getElementById("weather-icon");
const mainTemp = document.getElementById("main-temperature");
const feelsLike = document.getElementById("feels-like");
const humidity = document.getElementById("humidity");
const wind = document.getElementById("wind");
const windGust = document.getElementById("wind-gust");
const mainWeather = document.getElementById("weather-main");
const loc = document.getElementById("location");

//URLs
const weatherInfo = "https://weather-proxy.freecodecamp.rocks/api/city/<CITY>";

//functions

async function getWeather(city)
{
    //get weather info
}

async function showWeather(city)
{
    //show weather info
    getWeather(city);
}

//event listeners
getWeatherButton.addEventListener("click", (e) => {
    e.preventDefault();
    showWeather();
});
