// 1. Initialize the Map
const map = L.map('map').setView([53.3498, -6.2603], 13); // Dublin Center

// Add the Map Skin (OpenStreetMap)
L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// 2. Load Pins from your stops.js file
// (The variable 'allStops' comes from stops.js)
console.log("Loading stops...", allStops.length);

// We define a simple icon
const busIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});

// Loop through stops and add markers
// PERFORMANCE NOTE: Adding 4000 markers might be slow. 
// For now, we will just load the first 500 to test.
allStops.slice(0, 500).forEach(stop => {
    const marker = L.marker([stop.lat, stop.lng], { icon: busIcon }).addTo(map);
    
    // When a pin is clicked
    marker.on('click', () => {
        openDrawer(stop);
    });
});

// 3. Drawer Functions
const drawer = document.getElementById('drawer');
const stopNameEl = document.getElementById('stopName');
const stopCodeEl = document.getElementById('stopCode');
const contentEl = document.getElementById('drawerContent');

function openDrawer(stop) {
    // Update text
    stopNameEl.innerText = stop.name;
    stopCodeEl.innerText = `Stop #${stop.code}`;
    
    // Slide up
    drawer.classList.add('open');
    
    // Fetch Data
    fetchLiveTimes(stop.id);
}

function closeDrawer() {
    drawer.classList.remove('open');
}

// 4. API Fetching
async function fetchLiveTimes(stopId) {
    contentEl.innerHTML = '<p>Loading times...</p>';
    
    try {
        const res = await fetch(`https://busdepart.sampatton176.workers.dev/?stopId=${stopId}`);
        const data = await res.json();
        
        // RENDER THE DATA
        // Since I don't know your exact API format yet, I'm guessing "buses" is the array.
        // If the screen shows "undefined", we will fix this part.
        
        if (data && data.length > 0) { // Assuming data is an array
             let html = '';
             data.forEach(bus => {
                 // Adjust these names (bus.route, bus.destination) to match your API JSON
                 html += `
                    <div class="bus-card">
                        <div class="bus-route">${bus.route || '?'}</div>
                        <div class="bus-dest">${bus.destination || 'Unknown'}</div>
                        <div class="bus-time">${bus.dueIn || bus.time || 'Due'}</div>
                    </div>
                 `;
             });
             contentEl.innerHTML = html;
        } else {
            contentEl.innerHTML = '<p>No buses found right now.</p><pre>' + JSON.stringify(data, null, 2) + '</pre>';
        }

    } catch (err) {
        console.error(err);
        contentEl.innerHTML = '<p style="color:red">Error loading data.</p>';
    }
}

// 5. Search Function
function searchStop() {
    const term = document.getElementById('searchInput').value.toLowerCase();
    
    const found = allStops.find(s => s.code == term || s.name.toLowerCase().includes(term));
    
    if (found) {
        map.setView([found.lat, found.lng], 16);
        openDrawer(found);
    } else {
        alert("Stop not found!");
    }
}
