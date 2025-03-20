// Initialize sensor data object
let sensorData = {
    temperature: 25,
    humidity: 65,
    soilMoisture: 40,
    timestamp: new Date().toISOString()
};

// Crop recommendations database with updated criteria
const recommendations = [
    { 
        name: "Rice", 
        confidence: 95, 
        expectedYield: "5-6 tons/hectare", 
        idealConditions: { 
            temperature: "24-30°C", 
            humidity: "60-80%",
            soilMoisture: "60-80%" 
        } 
    },
    { 
        name: "Maize", 
        confidence: 85, 
        expectedYield: "8-10 tons/hectare", 
        idealConditions: { 
            temperature: "20-30°C", 
            humidity: "50-80%",
            soilMoisture: "40-60%" 
        } 
    },
    { 
        name: "Soybeans", 
        confidence: 75, 
        expectedYield: "2.5-3.5 tons/hectare", 
        idealConditions: { 
            temperature: "20-30°C", 
            humidity: "60-70%",
            soilMoisture: "50-70%" 
        } 
    },
    { 
        name: "Wheat", 
        confidence: 80, 
        expectedYield: "3-4 tons/hectare", 
        idealConditions: { 
            temperature: "15-24°C", 
            humidity: "40-60%",
            soilMoisture: "40-60%" 
        } 
    },
    { 
        name: "Cotton", 
        confidence: 70, 
        expectedYield: "2-3 tons/hectare", 
        idealConditions: { 
            temperature: "20-35°C", 
            humidity: "50-60%",
            soilMoisture: "50-65%" 
        } 
    }
];

// Function to update sensor displays
function updateSensorDisplays() {
    document.getElementById('temperature').textContent = `${sensorData.temperature.toFixed(1)}°C`;
    document.getElementById('humidity').textContent = `${sensorData.humidity.toFixed(1)}%`;
    document.getElementById('soilMoisture').textContent = `${sensorData.soilMoisture.toFixed(1)}%`;
    document.getElementById('lastUpdated').textContent = `Last updated: ${new Date(sensorData.timestamp).toLocaleTimeString()}`;
}

// Function to handle user input submission
function handleUserInput() {
    // Get values from input fields
    const temperatureInput = parseFloat(document.getElementById('temperatureInput').value);
    const humidityInput = parseFloat(document.getElementById('humidityInput').value);
    const soilMoistureInput = parseFloat(document.getElementById('soilMoistureInput').value);
    
    // Validate inputs
    if (isNaN(temperatureInput) || isNaN(humidityInput) || isNaN(soilMoistureInput)) {
        alert("Please enter valid numbers for all fields");
        return;
    }
    
    if (humidityInput < 0 || humidityInput > 100 || soilMoistureInput < 0 || soilMoistureInput > 100) {
        alert("Humidity and soil moisture must be between 0% and 100%");
        return;
    }
    
    if (temperatureInput < -50 || temperatureInput > 60) {
        alert("Temperature must be between -50°C and 60°C");
        return;
    }
    
    // Update sensor data with user input
    sensorData = {
        temperature: temperatureInput,
        humidity: humidityInput,
        soilMoisture: soilMoistureInput,
        timestamp: new Date().toISOString()
    };
    
    // Update displays
    updateSensorDisplays();
    
    // Update recommendations
    updateRecommendations();
}

// Function to calculate suitability score for each crop
function calculateSuitability(crop, temp, humidity, soilMoisture) {
    // Parse ideal temperature range
    const tempRange = crop.idealConditions.temperature.match(/(\d+)-(\d+)/);
    const minTemp = parseInt(tempRange[1]);
    const maxTemp = parseInt(tempRange[2]);
    
    // Parse ideal humidity range
    const humidityRange = crop.idealConditions.humidity.match(/(\d+)-(\d+)/);
    const minHumidity = parseInt(humidityRange[1]);
    const maxHumidity = parseInt(humidityRange[2]);
    
    // Parse ideal soil moisture range
    const soilMoistureRange = crop.idealConditions.soilMoisture.match(/(\d+)-(\d+)/);
    const minSoilMoisture = parseInt(soilMoistureRange[1]);
    const maxSoilMoisture = parseInt(soilMoistureRange[2]);
    
    // Calculate temperature match (0-100%)
    let tempScore = 100;
    if (temp < minTemp) {
        tempScore = 100 - ((minTemp - temp) * 5); // Reduce score by 5% per degree below minimum
    } else if (temp > maxTemp) {
        tempScore = 100 - ((temp - maxTemp) * 5); // Reduce score by 5% per degree above maximum
    }
    
    // Calculate humidity match (0-100%)
    let humidityScore = 100;
    if (humidity < minHumidity) {
        humidityScore = 100 - ((minHumidity - humidity) * 2); // Reduce score by 2% per % below minimum
    } else if (humidity > maxHumidity) {
        humidityScore = 100 - ((humidity - maxHumidity) * 2); // Reduce score by 2% per % above maximum
    }
    
    // Calculate soil moisture match (0-100%)
    let soilMoistureScore = 100;
    if (soilMoisture < minSoilMoisture) {
        soilMoistureScore = 100 - ((minSoilMoisture - soilMoisture) * 2);
    } else if (soilMoisture > maxSoilMoisture) {
        soilMoistureScore = 100 - ((soilMoisture - maxSoilMoisture) * 2);
    }
    
    // Ensure scores don't go below 0
    tempScore = Math.max(0, tempScore);
    humidityScore = Math.max(0, humidityScore);
    soilMoistureScore = Math.max(0, soilMoistureScore);
    
    // Calculate overall suitability (average of temperature, humidity, and soil moisture scores)
    return (tempScore + humidityScore + soilMoistureScore) / 3;
}

// Function to update recommendations based on current sensor data
function updateRecommendations() {
    const recommendationsContainer = document.getElementById('recommendations');
    recommendationsContainer.innerHTML = ''; // Clear previous recommendations
    
    // Calculate suitability for each crop
    const suitableCrops = recommendations.map(crop => {
        const suitability = calculateSuitability(
            crop, 
            sensorData.temperature, 
            sensorData.humidity,
            sensorData.soilMoisture
        );
        return {
            ...crop,
            suitability: suitability
        };
    });
    
    // Sort by suitability score (highest first)
    suitableCrops.sort((a, b) => b.suitability - a.suitability);
    
    // Display each recommendation
    suitableCrops.forEach(crop => {
        const cropElement = document.createElement('div');
        cropElement.className = 'crop-recommendation';
        
        // Determine recommendation status based on suitability
        let statusClass, statusText;
        if (crop.suitability >= 80) {
            statusClass = 'optimal';
            statusText = 'Optimal conditions';
        } else if (crop.suitability >= 60) {
            statusClass = 'suitable';
            statusText = 'Suitable conditions';
        } else if (crop.suitability >= 40) {
            statusClass = 'marginal';
            statusText = 'Marginal conditions';
        } else {
            statusClass = 'unsuitable';
            statusText = 'Unsuitable conditions';
        }
        
        cropElement.innerHTML = `
            <h3>${crop.name}</h3>
            <div class="suitability ${statusClass}">
                <div class="suitability-bar" style="width: ${crop.suitability}%"></div>
                <span>${Math.round(crop.suitability)}% - ${statusText}</span>
            </div>
            <p><strong>Expected Yield:</strong> ${crop.expectedYield}</p>
            <p><strong>Ideal Temperature:</strong> ${crop.idealConditions.temperature}</p>
            <p><strong>Ideal Humidity:</strong> ${crop.idealConditions.humidity}</p>
            <p><strong>Ideal Soil Moisture:</strong> ${crop.idealConditions.soilMoisture}</p>
        `;
        
        recommendationsContainer.appendChild(cropElement);
    });
}

// Function to connect to Bluetooth
async function connectToBluetooth() {
    try {
        console.log('Requesting Bluetooth Device...');
        const device = await navigator.bluetooth.requestDevice({
            acceptAllDevices: true,
            // ESP32's Bluetooth service uses a different UUID
            optionalServices: ['0000181a-0000-1000-8000-00805f9b34fb']
        });

        console.log('Connecting to GATT Server...');
        const server = await device.gatt.connect();

        console.log('Getting Service...');
        const service = await server.getPrimaryService('0000181a-0000-1000-8000-00805f9b34fb');

        console.log('Getting Characteristic...');
        const characteristic = await service.getCharacteristic('00002a6e-0000-1000-8000-00805f9b34fb');
        
        // Set up notifications for incoming data
        await characteristic.startNotifications();
        characteristic.addEventListener('characteristicvaluechanged', (event) => {
            const value = event.target.value;
            const decoder = new TextDecoder('utf-8');
            const data = decoder.decode(value);
            
            // Parse the comma-separated values
            const [temperature, humidity, soilMoisture] = data.split(',').map(parseFloat);
            
            // Update the sensor data
            sensorData = {
                temperature: temperature,
                humidity: humidity,
                soilMoisture: soilMoisture,
                timestamp: new Date().toISOString()
            };
            
            updateSensorDisplays();
            updateRecommendations();
            document.getElementById('dataDisplay').innerText = 'Sensor Data Updated';
        });
        
        document.getElementById('dataDisplay').innerText = 'Connected to sensor';
    } catch (error) {
        console.error('Bluetooth Error:', error);
        document.getElementById('dataDisplay').innerText = 'Failed to connect to sensor: ' + error.message;
    }
}

// Set event listeners when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    updateSensorDisplays();
    updateRecommendations();
    
    document.getElementById('connectButton').addEventListener('click', connectToBluetooth);
    document.getElementById('updateButton').addEventListener('click', handleUserInput);
});


async function connectToBluetooth() {
    try {
        console.log('Requesting Bluetooth Device...');
        const device = await navigator.bluetooth.requestDevice({
            acceptAllDevices: true,
            // ESP32's Bluetooth service uses a different UUID
            optionalServices: ['0000181a-0000-1000-8000-00805f9b34fb']
        });

        console.log('Connecting to GATT Server...');
        const server = await device.gatt.connect();

        console.log('Getting Service...');
        const service = await server.getPrimaryService('0000181a-0000-1000-8000-00805f9b34fb');

        console.log('Getting Characteristic...');
        const characteristic = await service.getCharacteristic('00002a6e-0000-1000-8000-00805f9b34fb');
        
        // Set up notifications for incoming data
        await characteristic.startNotifications();
        characteristic.addEventListener('characteristicvaluechanged', (event) => {
            const value = event.target.value;
            const decoder = new TextDecoder('utf-8');
            const data = decoder.decode(value);
            
            // Parse the comma-separated values
            const [temperature, humidity, soilMoisture] = data.split(',').map(parseFloat);
            
            // Update the sensor data
            sensorData = {
                temperature: temperature,
                humidity: humidity,
                soilMoisture: soilMoisture, // New property
                timestamp: new Date().toISOString()
            };
            
            updateSensorDisplays();
            updateRecommendations();
            document.getElementById('dataDisplay').innerText = 'Sensor Data Updated';
        });
        
        document.getElementById('dataDisplay').innerText = 'Connected to sensor';
    } catch (error) {
        console.error('Bluetooth Error:', error);
        document.getElementById('dataDisplay').innerText = 'Failed to connect to sensor: ' + error.message;
    }
}


document.addEventListener('DOMContentLoaded', function() {
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', function() {
            logoutUser();
        });
    }
});
