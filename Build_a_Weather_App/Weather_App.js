//doc elements
const getWeatherButton = document.getElementById("get-weather-button");
const options = document.getElementById("city-options");
const weatherDisplay = document.getElementById("weather-display");
const weatherSelect = document.getElementById("weather-select-container");
const weatherIcon = document.getElementById("weather-icon");
const mainTemp = document.getElementById("main-temperature");
const feelsLike = document.getElementById("feels-like");
const humidity = document.getElementById("humidity");
const wind = document.getElementById("wind");
const windGust = document.getElementById("wind-gust");
const mainWeather = document.getElementById("weather-main");
const loc = document.getElementById("location");

//URLs
const weatherInfo = "https://weather-proxy.freecodecamp.rocks/api/city/";

//functions

async function getWeather(city)
{
    const url = weatherInfo + city;
    try{ const res = await fetch(url);
         const data = await res.json();
         return data;
    } catch(err) {
        alert("Something went wrong, please try again later");
        return;
    }
}

async function showWeather(city)
{
    const data = await getWeather(city);
    await updateWeatherHTML(data);
}

async function updateWeatherHTML(data)
{
    //need to fix this, the IMG update is not working for some weird reason.
    let iconHTML = weatherIcon;
    weatherDisplay.innerHTML = "";
    const wIconHTML = `<img src="${data.weather[0].icon}" alt="${description} icon" />`;
    const mainTempHTML = `<span id="main-temperature">Main Temp: ${data.main.temp} C</span>`;
    const feelsLikeHTML = `<span id="feels-like">Feels Like: ${data.main.feelsLike} C</span>`;
    const humidityHTML = `<span id="humidity">Humidity: ${data.main.humidity}%</span>`;
    const windSpeedHTML = `<span id="wind">Wind Speed: ${data.wind.speed} m/s</span>`;
    const windGustHTML = `<span id="wind-gust">Wind Gust: ${data.wind.gust} m/s</span>`;
    const weatherMainHTML = `<span id="weather-main">Weather Conditions: ${data.weather[0].description}</span>`;
    const locationHTML = `<span id="location">Location: ${data.name}</span>`;

    weatherDisplay.innerHTML += wIconHTML + mainTempHTML + feelsLikeHTML + humidityHTML + windSpeedHTML +
                               windGustHTML + weatherMainHTML + locationHTML;
    return;
}

//event listeners
getWeatherButton.addEventListener("click", (e) => {
    e.preventDefault();
    if (options.value === "")
    {
      alert("Please select a location");
      return;
    }
    showWeather(options.value);
});

/* weather output format:
{
  "weather": [
    {
      "main": "Clear",
      "description": "clear sky",
      "icon": "https://cdn.freecodecamp.org/weather-icons/01n.png" // icon representing the weather
    }
  ],
  "main": {
    "temp": 2.62, // temperature in C
    "feels_like": 0.84, // temperature in C
    "temp_min": 1.72, // min temperature of the day in C
    "temp_max": 3.49, // max temperature of the day in C
    "pressure": 1010, // atmospheric pressure in hPa
    "humidity": 81 // humidity in %
  },
  "visibility": 10000, // distance in meters
  "wind": {
    "speed": 1.79, // speed of the wind in m/s
    "deg": 285, // orientation of the wind in degrees
    "gust": 3.13 // gust speed in m/s
  },
  "name": "London"
}
*/
