// Datos de ejemplo para las regiones con coordenadas
const regions = [
    { name: 'Madrid, España', lat: 40.4168, lng: -3.7038 },
    { name: 'Barcelona, España', lat: 41.3851, lng: 2.1734 },
    { name: 'Valencia, España', lat: 39.4699, lng: -0.3763 },
    { name: 'Sevilla, España', lat: 37.3891, lng: -5.9845 },
    { name: 'Bilbao, España', lat: 43.2627, lng: -2.9253 },
    { name: 'Málaga, España', lat: 36.7213, lng: -4.4214 },
    { name: 'Zaragoza, España', lat: 41.6488, lng: -0.8891 },
    { name: 'Palma de Mallorca, España', lat: 39.5696, lng: 2.6502 },
    { name: 'Las Palmas, España', lat: 28.1248, lng: -15.4300 },
    { name: 'Murcia, España', lat: 37.9922, lng: -1.1307 },
    { name: 'París, Francia', lat: 48.8566, lng: 2.3522 },
    { name: 'Londres, Reino Unido', lat: 51.5074, lng: -0.1278 },
    { name: 'Roma, Italia', lat: 41.9028, lng: 12.4964 },
    { name: 'Berlín, Alemania', lat: 52.5200, lng: 13.4050 },
    { name: 'Ámsterdam, Países Bajos', lat: 52.3676, lng: 4.9041 },
    { name: 'Viena, Austria', lat: 48.2082, lng: 16.3738 },
    { name: 'Praga, República Checa', lat: 50.0755, lng: 14.4378 },
    { name: 'Budapest, Hungría', lat: 47.4979, lng: 19.0402 },
    { name: 'Varsovia, Polonia', lat: 52.2297, lng: 21.0122 },
    { name: 'Estocolmo, Suecia', lat: 59.3293, lng: 18.0686 }
];

let selectedLocation = null;
let mapMarker = null;

// Datos de ejemplo para pronósticos
const sampleForecasts = [
    { time: '09:00', temp: '22°C', description: 'Soleado', icon: '☀️' },
    { time: '12:00', temp: '25°C', description: 'Parcialmente nublado', icon: '⛅' },
    { time: '15:00', temp: '24°C', description: 'Nublado', icon: '☁️' },
    { time: '18:00', temp: '21°C', description: 'Lluvia ligera', icon: '🌦️' },
    { time: '21:00', temp: '18°C', description: 'Despejado', icon: '🌙' },
    { time: '00:00', temp: '16°C', description: 'Despejado', icon: '🌙' }
];

// Datos de ejemplo para información del clima actual
const currentWeatherData = {
    temp: '22°C',
    description: 'Parcialmente nublado',
    location: 'Madrid, España',
    visibility: '10 km',
    humidity: '65%',
    wind: '15 km/h',
    feelsLike: '24°C'
};

// Inicialización cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Establecer fecha actual por defecto
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('date-input').value = today;
    
    // Cargar pronósticos de ejemplo
    loadSampleForecasts();
    
    // Cargar información del clima actual
    loadCurrentWeather();
    
    // Configurar event listeners
    setupEventListeners();
}

function setupEventListeners() {
    // Modal de regiones
    const regionBtn = document.getElementById('region-btn');
    const modal = document.getElementById('region-modal');
    const closeBtn = document.querySelector('.close');
    const regionInput = document.getElementById('region-input');
    
    regionBtn.addEventListener('click', function() {
        modal.style.display = 'block';
        loadRegions();
    });
    
    closeBtn.addEventListener('click', function() {
        modal.style.display = 'none';
    });
    
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    // Búsqueda de regiones
    const regionSearch = document.getElementById('region-search');
    regionSearch.addEventListener('input', function() {
        const searchTerm = this.value;
        filterRegions(searchTerm);
        
        // Si hay un resultado exacto, mostrarlo en el mapa
        if (searchTerm.length > 2) {
            const exactMatch = regions.find(region => 
                region.name.toLowerCase() === searchTerm.toLowerCase()
            );
            
            if (exactMatch) {
                placeMarkerOnMap(exactMatch.lat, exactMatch.lng, exactMatch.name);
            }
        }
    });
    
    // Formulario de pronóstico
    const weatherForm = document.getElementById('weather-form');
    weatherForm.addEventListener('submit', function(e) {
        e.preventDefault();
        handleWeatherFormSubmit();
    });
    
    
}

function loadRegions() {
    const regionsList = document.getElementById('regions-list');
    regionsList.innerHTML = '';
    
    regions.forEach(region => {
        const regionItem = document.createElement('div');
        regionItem.className = 'region-item';
        regionItem.textContent = region.name;
        regionItem.addEventListener('click', function() {
            selectRegionFromList(region);
        });
        regionsList.appendChild(regionItem);
    });
    
    // Configurar el mapa
    setupMap();
}

function filterRegions(searchTerm) {
    const regionItems = document.querySelectorAll('.region-item');
    const filteredRegions = regions.filter(region => 
        region.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    regionItems.forEach((item, index) => {
        if (index < filteredRegions.length) {
            item.textContent = filteredRegions[index].name;
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

function selectRegion(region) {
    document.getElementById('region-input').value = region;
    document.getElementById('region-modal').style.display = 'none';
    
    // Actualizar información del clima actual
    updateCurrentWeather(region);
}

function selectRegionFromList(region) {
    selectRegion(region.name);
    placeMarkerOnMap(region.lat, region.lng, region.name);
}

function setupMap() {
    const map = document.getElementById('map');
    
    // Agregar event listener para clics en el mapa
    map.addEventListener('click', function(event) {
        const rect = map.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        // Convertir coordenadas del mapa a lat/lng aproximadas
        const lat = 90 - (y / rect.height) * 180;
        const lng = (x / rect.width) * 360 - 180;
        
        // Buscar la región más cercana
        const closestRegion = findClosestRegion(lat, lng);
        
        if (closestRegion) {
            selectRegion(closestRegion.name);
            placeMarkerOnMap(lat, lng, closestRegion.name);
        }
    });
}

function placeMarkerOnMap(lat, lng, regionName) {
    // Remover marcador anterior si existe
    if (mapMarker) {
        mapMarker.remove();
    }
    
    // Crear nuevo marcador
    mapMarker = document.createElement('div');
    mapMarker.className = 'map-marker';
    
    // Posicionar el marcador en el mapa
    const map = document.getElementById('map');
    const rect = map.getBoundingClientRect();
    
    // Convertir lat/lng a coordenadas del mapa
    const x = ((lng + 180) / 360) * rect.width;
    const y = ((90 - lat) / 180) * rect.height;
    
    mapMarker.style.left = x + 'px';
    mapMarker.style.top = y + 'px';
    
    map.appendChild(mapMarker);
    
    // Actualizar información de ubicación seleccionada
    const selectedLocationDiv = document.getElementById('selected-location');
    selectedLocationDiv.innerHTML = `
        <i class="fas fa-map-marker-alt"></i>
        <span>${regionName}</span>
        <button onclick="confirmLocation()" style="margin-left: auto; background: #74b9ff; color: white; border: none; padding: 0.5rem 1rem; border-radius: 5px; cursor: pointer;">Confirmar</button>
    `;
    
    selectedLocation = { lat, lng, name: regionName };
}

function findClosestRegion(lat, lng) {
    let closestRegion = null;
    let minDistance = Infinity;
    
    regions.forEach(region => {
        const distance = Math.sqrt(
            Math.pow(region.lat - lat, 2) + Math.pow(region.lng - lng, 2)
        );
        
        if (distance < minDistance) {
            minDistance = distance;
            closestRegion = region;
        }
    });
    
    return closestRegion;
}

function confirmLocation() {
    if (selectedLocation) {
        selectRegion(selectedLocation.name);
        // El mini mapa se actualizará automáticamente en selectRegion
    }
}

function getWeatherTypeFromDescription(description) {
    const desc = description.toLowerCase();
    
    if (desc.includes('soleado') || desc.includes('despejado')) {
        return 'soleado';
    } else if (desc.includes('parcialmente') || desc.includes('nubes')) {
        return 'parcialmente_nublado';
    } else if (desc.includes('nublado')) {
        return 'nublado';
    } else if (desc.includes('lluvia') && !desc.includes('intensa')) {
        return 'lluvia_ligera';
    } else if (desc.includes('lluvia') && desc.includes('intensa')) {
        return 'lluvia_intensa';
    } else if (desc.includes('nieve')) {
        return 'nieve';
    } else if (desc.includes('tormenta') || desc.includes('rayos')) {
        return 'tormenta';
    } else if (desc.includes('niebla')) {
        return 'niebla';
    } else if (desc.includes('amanecer')) {
        return 'amanecer';
    } else if (desc.includes('atardecer')) {
        return 'atardecer';
    } else if (desc.includes('noche') || desc.includes('estrellado')) {
        return 'noche_estrellada';
    } else if (desc.includes('arcoíris') || desc.includes('arcoiris')) {
        return 'arcoiris';
    } else {
        return 'soleado'; // Por defecto
    }
}

function updateCurrentWeather(region) {
    console.log('updateCurrentWeather llamada con región:', region);
    
    // Simular datos diferentes según la región
    const weatherVariations = [
        { temp: '25°C', description: 'Soleado', icon: '☀️' },
        { temp: '22°C', description: 'Parcialmente nublado', icon: '⛅' },
        { temp: '20°C', description: 'Nublado', icon: '☁️' },
        { temp: '18°C', description: 'Lluvia ligera', icon: '🌦️' },
        { temp: '15°C', description: 'Lluvia intensa', icon: '🌧️' },
        { temp: '12°C', description: 'Tormenta', icon: '⛈️' },
        { temp: '8°C', description: 'Nieve', icon: '❄️' },
        { temp: '16°C', description: 'Niebla', icon: '🌫️' },
        { temp: '24°C', description: 'Amanecer', icon: '🌅' },
        { temp: '26°C', description: 'Atardecer', icon: '🌇' },
        { temp: '14°C', description: 'Noche estrellada', icon: '🌌' },
        { temp: '21°C', description: 'Arcoíris', icon: '🌈' }
    ];
    
    const randomWeather = weatherVariations[Math.floor(Math.random() * weatherVariations.length)];
    console.log('Clima aleatorio seleccionado:', randomWeather);
    
    // Usar la función con animación de fade
    changeWeatherWithFade(randomWeather, region);
}

function loadSampleForecasts() {
    const forecastCards = document.getElementById('forecast-cards');
    forecastCards.innerHTML = '';
    
    sampleForecasts.forEach(forecast => {
        const card = createForecastCard(forecast);
        forecastCards.appendChild(card);
    });
}

function createForecastCard(forecast) {
    const card = document.createElement('div');
    card.className = 'forecast-card';
    
    card.innerHTML = `
        <div class="time">${forecast.time}</div>
        <div class="icon">${forecast.icon}</div>
        <div class="temp">${forecast.temp}</div>
        <div class="description">${forecast.description}</div>
    `;
    
    return card;
}

function loadCurrentWeather() {
    document.getElementById('current-temp').textContent = currentWeatherData.temp;
    document.getElementById('weather-description').textContent = currentWeatherData.description;
    document.getElementById('location').textContent = currentWeatherData.location;
    
    // Actualizar detalles del clima
    const detailItems = document.querySelectorAll('.detail-item span');
    detailItems[0].textContent = `Visibilidad: ${currentWeatherData.visibility}`;
    detailItems[1].textContent = `Humedad: ${currentWeatherData.humidity}`;
    detailItems[2].textContent = `Viento: ${currentWeatherData.wind}`;
    detailItems[3].textContent = `Sensación: ${currentWeatherData.feelsLike}`;
    
    // Aplicar imagen de fondo inicial
    const initialImage = 'images/Soleado.jpg';
    const leftPanel = document.querySelector('.left-panel');
    leftPanel.style.backgroundImage = `url(${initialImage})`;
    leftPanel.style.backgroundSize = 'cover';
    leftPanel.style.backgroundPosition = 'center';
    leftPanel.style.backgroundRepeat = 'no-repeat';
}

function handleWeatherFormSubmit() {
    const date = document.getElementById('date-input').value;
    const region = document.getElementById('region-input').value;
    
    if (!region) {
        alert('Por favor, selecciona una región');
        return;
    }
    
    // Actualizar el clima actual y la imagen de fondo
    updateCurrentWeather(region);
    
    // Simular carga de pronóstico
    showLoadingState();
    
    setTimeout(() => {
        loadWeatherForecast(date, region);
        hideLoadingState();
    }, 1500);
}

function showLoadingState() {
    const forecastCards = document.getElementById('forecast-cards');
    forecastCards.innerHTML = '<div style="text-align: center; padding: 2rem; color: #74b9ff;">Cargando pronóstico...</div>';
}

function hideLoadingState() {
    // El estado de carga se oculta cuando se cargan los nuevos pronósticos
}

function loadWeatherForecast(date, region) {
    // Generar pronósticos simulados basados en la fecha y región
    const forecasts = generateSimulatedForecasts(date, region);
    
    const forecastCards = document.getElementById('forecast-cards');
    forecastCards.innerHTML = '';
    
    forecasts.forEach(forecast => {
        const card = createForecastCard(forecast);
        forecastCards.appendChild(card);
    });
}

function generateSimulatedForecasts(date, region) {
    // Simular diferentes pronósticos según la región y fecha
    const baseForecasts = [
        { time: '09:00', temp: '22°C', description: 'Soleado', icon: '☀️' },
        { time: '12:00', temp: '25°C', description: 'Parcialmente nublado', icon: '⛅' },
        { time: '15:00', temp: '24°C', description: 'Nublado', icon: '☁️' },
        { time: '18:00', temp: '21°C', description: 'Lluvia ligera', icon: '🌦️' },
        { time: '21:00', temp: '18°C', description: 'Despejado', icon: '🌙' },
        { time: '00:00', temp: '16°C', description: 'Despejado', icon: '🌙' }
    ];
    
    // Ajustar temperaturas según la región
    const regionAdjustments = {
        'Madrid, España': 0,
        'Barcelona, España': 2,
        'Valencia, España': 3,
        'Sevilla, España': 5,
        'Bilbao, España': -2,
        'Málaga, España': 4,
        'París, Francia': -3,
        'Londres, Reino Unido': -5,
        'Roma, Italia': 1,
        'Berlín, Alemania': -4
    };
    
    const adjustment = regionAdjustments[region] || 0;
    
    return baseForecasts.map(forecast => {
        const temp = parseInt(forecast.temp) + adjustment;
        return {
            ...forecast,
            temp: `${temp}°C`
        };
    });
}

// Función para actualizar la fecha automáticamente
function updateDateInput() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('date-input').value = today;
}

// Actualizar la fecha cada día a medianoche
setInterval(updateDateInput, 24 * 60 * 60 * 1000);

// Función genérica para cambiar clima con animación de desvanecimiento
function changeWeatherWithFade(weatherData, region = 'Madrid, España') {
    console.log('=== CAMBIO DE CLIMA CON DESVANECIMIENTO ===');
    console.log('Datos del clima:', weatherData);
    console.log('Región:', region);
    
    const leftPanel = document.querySelector('.left-panel');
    if (!leftPanel) {
        console.error('No se encontró el panel izquierdo');
        return;
    }
    
    // Mapeo de tipos de clima a imágenes locales
    const weatherImageMap = {
        'soleado': 'images/Soleado.jpg',
        'parcialmente_nublado': 'images/parcialmente_nublado.jpg',
        'nublado': 'images/nublado.jpg',
        'lluvia_ligera': 'images/lluvia_ligera.jpg',
        'lluvia_intensa': 'images/lluvia_intensa.jpg',
        'nieve': 'images/nieve.jpg',
        'tormenta': 'images/tormenta.jpg',
        'niebla': 'images/niebla.jpg',
        'amanecer': 'images/amanecer.jpg',
        'atardecer': 'images/atardecer.jpg',
        'noche_estrellada': 'images/noche_estrellada.jpg',
        'arcoiris': 'images/arcoiris.jpg'
    };
    
    // Obtener imagen basada en la descripción del clima
    const weatherType = getWeatherTypeFromDescription(weatherData.description);
    const weatherImage = weatherImageMap[weatherType] || weatherImageMap['soleado'];
    console.log('Tipo de clima detectado:', weatherType);
    console.log('Imagen correspondiente:', weatherImage);
    
    // PASO 1: Iniciar desvanecimiento (fade out)
    leftPanel.classList.add('weather-fade-out');
    console.log('Iniciando fade out...');
    
    // PASO 2: Después del fade out, cambiar el contenido
    setTimeout(() => {
        console.log('Cambiando contenido durante fade out...');
        
        // Actualizar información del clima
        document.getElementById('current-temp').textContent = weatherData.temp;
        document.getElementById('weather-description').textContent = weatherData.description;
        document.getElementById('location').textContent = region;
        
        // Actualizar imagen del elemento img
        const weatherImageElement = document.getElementById('weather-icon');
        if (weatherImageElement) {
            weatherImageElement.src = weatherImage;
        }
        
        // Actualizar imagen de fondo
        leftPanel.style.setProperty('background-image', `url(${weatherImage})`, 'important');
        leftPanel.style.setProperty('background-size', 'cover', 'important');
        leftPanel.style.setProperty('background-position', 'center', 'important');
        leftPanel.style.setProperty('background-repeat', 'no-repeat', 'important');
        
        // Remover clase de fade out y agregar fade in
        leftPanel.classList.remove('weather-fade-out');
        leftPanel.classList.add('weather-fade-in');
        console.log('Iniciando fade in...');
        
        // PASO 3: Remover clase de fade in después de la animación
        setTimeout(() => {
            leftPanel.classList.remove('weather-fade-in');
            console.log('Animación de desvanecimiento completada');
        }, 600);
        
    }, 600); // Esperar a que termine el fade out
}



