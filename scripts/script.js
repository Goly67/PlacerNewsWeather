const API_KEY = '045ac4f01f984ff68820a4943e6592bd';
const locationSelect = document.getElementById('locationSelect');
const selectedLocation = document.getElementById('selectedLocation');
const stormAlert = document.getElementById('stormAlert');
const weatherIcon = document.getElementById('weatherIcon');
const temperature = document.getElementById('temperature');
const condition = document.getElementById('condition');
const humidity = document.getElementById('humidity');
const wind = document.getElementById('wind');
const feelsLike = document.getElementById('feelsLike');
const precipitation = document.getElementById('precipitation');
const forecastGrid = document.getElementById('forecastGrid');
const lastUpdated = document.getElementById('lastUpdated');
const burgerMenu = document.querySelector('.burger-menu');
const navMenu = document.querySelector('.nav-menu');
const closeMenu = document.querySelector('.close-menu');
const newsGrid = document.getElementById('newsGrid');

burgerMenu.addEventListener('click', () => {
    navMenu.classList.add('active');
});

closeMenu.addEventListener('click', () => {
    navMenu.classList.remove('active');
});

async function fetchWeatherData(location) {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${API_KEY}&units=metric`);
    const data = await response.json();
    return data;
}

async function fetchForecastData(location) {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${location}&appid=${API_KEY}&units=metric`);
    const data = await response.json();
    return data;
}

function getWeatherIcon(iconCode) {
    const iconMap = {
        '01d': '☀️', '01n': '☀️', // Changed '01n' to show sun emoji
        '02d': '⛅', '02n': '☁️',
        '03d': '☁️', '03n': '☁️',
        '04d': '☁️', '04n': '☁️',
        '09d': '🌧️', '09n': '🌧️',
        '10d': '🌦️', '10n': '🌧️',
        '11d': '⛈️', '11n': '⛈️',
        '13d': '❄️', '13n': '❄️',
        '50d': '🌫️', '50n': '🌫️'
    };
    return iconMap[iconCode] || '❓';
}


function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

async function updateWeather() {
    const location = locationSelect.value;
    const weatherData = await fetchWeatherData(location);
    const forecastData = await fetchForecastData(location);

    selectedLocation.textContent = location;
    weatherIcon.textContent = getWeatherIcon(weatherData.weather[0].icon);
    temperature.textContent = `${Math.round(weatherData.main.temp)}°C`;
    condition.textContent = capitalizeFirstLetter(weatherData.weather[0].description);
    humidity.textContent = `${weatherData.main.humidity}%`;
    wind.textContent = `${Math.round(weatherData.wind.speed * 3.6)} km/h`;
    feelsLike.textContent = `${Math.round(weatherData.main.feels_like)}°C`;
    precipitation.textContent = weatherData.rain ? `${weatherData.rain['1h']}mm` : '0mm';

    if (location === 'Manila') {
        stormAlert.innerHTML = '<span>⚠️ </span> <em><strong><span style="color: red;"> SIGNAL NO. 2</span></strong></em>';
        stormAlert.style.display = 'flex';
    } else {
        stormAlert.style.display = 'none';
    }

    const dailyForecasts = forecastData.list.filter((item, index) => index % 8 === 0).slice(0, 4);
    forecastGrid.innerHTML = dailyForecasts.map(day => `
        <div class="forecast-card">
            <div class="font-medium">${new Date(day.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' })}</div>
            <div class="text-xl">${getWeatherIcon(day.weather[0].icon)}</div>
            <div class="text-xl font-bold">${Math.round(day.main.temp)}°C</div>
            <div class="text-sm">${capitalizeFirstLetter(day.weather[0].description)}</div>
        </div>
    `).join('');

    lastUpdated.textContent = `Last updated: ${new Date().toLocaleString()}`;
}

async function updateNews() {
    const proxyUrl = 'https://octa-news.glitch.me/proxy?url=';
    const targetUrl = 'https://news.abs-cbn.com/rss';

    try {
        const response = await fetch(proxyUrl + encodeURIComponent(targetUrl));
        console.log('Response:', response); // Log the response object
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.text();
        console.log('Fetched Data:', data); // Log the raw data

        // Parse the RSS feed
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(data, 'text/xml');

        const items = xmlDoc.querySelectorAll('item');
        const newsItems = Array.from(items).map(item => ({
            title: item.querySelector('title') ? item.querySelector('title').textContent : 'No title',
            content: item.querySelector('description') ? item.querySelector('description').textContent : 'No description',
            image: item.querySelector('media\\:thumbnail') ? item.querySelector('media\\:thumbnail').getAttribute('url') : item.querySelector('image') ? item.querySelector('image').textContent : '',
            link: item.querySelector('link') ? item.querySelector('link').textContent : '#'
        }));

        // Log the news items to check if they're populated
        console.log('Parsed News Items:', newsItems);

        // Limit to only the first 6 news items
        const limitedNewsItems = newsItems.slice(0, 6);

        // Generate HTML for news items
        newsGrid.innerHTML = limitedNewsItems.map(item => `
            <div class="news-item">
                ${item.image ? `<img src="${item.image}" alt="${item.title}" class="news-item-image">` : ''}
                <div class="news-item-content">
                    <h3>${item.title}</h3>
                    <a href="${item.link}" target="_blank">Read more</a>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error fetching news:', error);
        newsGrid.innerHTML = '<p>Error fetching news.</p>';
    }
}





locationSelect.addEventListener('change', updateWeather);

// Initial update
updateWeather();
updateNews();

// Auto-refresh every 5 minutes
setInterval(updateWeather, 300000);
setInterval(updateNews, 300000);
