//doc elements
const getWeatherButton = document.getElementById("get-weather-btn");
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
         if(res.ok)
         {
            const data = await res.json();
            return data;
         }
         else
         {
            alert("Something went wrong, please try again later");
            return;
         }
    } catch(err) {
        console.error(err);
        return;
    }
}

async function showWeather(city)
{
    const data = await getWeather(city);
    if (data)
    {
        await updateWeatherHTML(data);
    }
    return;
}

async function updateWeatherHTML(data)
{
    weatherDisplay.innerHTML = ``;
    const wIconHTML = `<img src="${data.weather[0].icon}" alt="weather-icon" id="weather-icon" width="60" height="60"/>`;
    const mainTempHTML = `<span id="main-temperature">Main Temp: ${data.main.temp ? data.main.temp + ' C' : 'N/A'}</span>`;
    const feelsLikeHTML = `<span id="feels-like">Feels Like: ${data.main.feels_like ? data.main.feels_like + ' C' : 'N/A'}</span>`;
    const humidityHTML = `<span id="humidity">Humidity: ${data.main.humidity ? data.main.humidity + '%' : 'N/A'}</span>`;
    const windSpeedHTML = `<span id="wind">Wind Speed: ${data.wind.speed ? data.wind.speed + ' m/s' : 'N/A'}</span>`;
    const windGustHTML = `<span id="wind-gust">Wind Gust: ${data.wind.gust ? data.wind.gust + ' m/s' : 'N/A'}</span>`;
    const weatherMainHTML = `<span id="weather-main">Weather Conditions: ${data.weather[0].description ? data.weather[0].description : 'N/A'}</span>`;
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