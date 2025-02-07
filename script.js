// Configuration
const collegeLocation = {
    lat: 23.333,
    lon: 86.366,
    radius: 0.2 // in km
};

const adminPassword = "AbhiShree";

const translations = {
    en: {
        title: "Purulia Polytechnic Attendance",
        namePlaceholder: "Full Name",
        rollPlaceholder: "Roll Number",
        tradePlaceholder: "Select Trade",
        yearPlaceholder: "Select Year",
        markAttendance: "📅 Mark Attendance",
        admin: "🔒 Admin",
        attendanceTitle: "Attendance Records",
        searchPlaceholder: "Search...",
        calculatePercentage: "📊 Calculate Percentage",
        studentRollPlaceholder: "Enter Roll Number",
        successMessage: "✅ Attendance marked successfully!",
        errorMessage: "❌ All fields are required!",
        warningMessage: "📍 Locating your position..."
    },
    bn: {
        title: "পুরুলিয়া পলিটেকনিক উপস্থিতি",
        namePlaceholder: "পুরো নাম",
        rollPlaceholder: "রোল নম্বর",
        tradePlaceholder: "ট্রেড নির্বাচন করুন",
        yearPlaceholder: "বছর নির্বাচন করুন",
        markAttendance: "📅 উপস্থিতি চিহ্নিত করুন",
        admin: "🔒 অ্যাডমিন",
        attendanceTitle: "উপস্থিতির রেকর্ড",
        searchPlaceholder: "অনুসন্ধান করুন...",
        calculatePercentage: "📊 শতাংশ গণনা করুন",
        studentRollPlaceholder: "রোল নম্বর লিখুন",
        successMessage: "✅ উপস্থিতি সফলভাবে চিহ্নিত হয়েছে!",
        errorMessage: "❌ সমস্ত ক্ষেত্র পূর্ণ করতে হবে!",
        warningMessage: "📍 আপনার অবস্থান চিহ্নিত করা হচ্ছে..."
    }
};

let currentLanguage = 'en';

// Function to toggle language
function toggleLanguage() {
    currentLanguage = currentLanguage === 'en' ? 'bn' : 'en';

    document.getElementById('title').textContent = translations[currentLanguage].title;
    document.getElementById('name').placeholder = translations[currentLanguage].namePlaceholder;
    document.getElementById('roll').placeholder = translations[currentLanguage].rollPlaceholder;
    document.getElementById('trade').placeholder = translations[currentLanguage].tradePlaceholder;
    document.getElementById('year').placeholder = translations[currentLanguage].yearPlaceholder;
    document.querySelector('button[onclick="markAttendance()"]').textContent = translations[currentLanguage].markAttendance;
    document.querySelector('button[onclick="showAdminPanel()"]').textContent = translations[currentLanguage].admin;
    document.getElementById('attendanceTitle').textContent = translations[currentLanguage].attendanceTitle;
    document.getElementById('search').placeholder = translations[currentLanguage].searchPlaceholder;
    document.querySelector('button[onclick="calculatePercentage()"]').textContent = translations[currentLanguage].calculatePercentage;
    document.getElementById('studentRoll').placeholder = translations[currentLanguage].studentRollPlaceholder;
}

// Show status message based on type
function showStatus(message, type) {
    const statusEl = document.getElementById('status');
    statusEl.textContent = message;
    statusEl.className = `status-message ${type}`;
}

// Sample function to update the table after marking attendance
function updateTable() {
    const records = JSON.parse(localStorage.getItem('attendance') || '[]');
    const tbody = document.getElementById('attendanceTable');
    tbody.innerHTML = records.map(record => `
        <tr>
            <td>${record.name}</td>
            <td>${record.roll}</td>
            <td>${record.trade}</td>
            <td>${record.year}</td>
            <td>${record.status}</td>
            <td>${record.timestamp}</td>
        </tr>
    `).join('');
}

// Mark attendance function
async function markAttendance() {
    const name = document.getElementById('name').value.trim();
    const roll = document.getElementById('roll').value.trim();
    const trade = document.getElementById('trade').value;
    const year = document.getElementById('year').value;

    if (!name || !roll || !trade || !year) {
        showStatus(translations[currentLanguage].errorMessage, 'error');
        return;
    }

    try {
        // Add visual feedback during geolocation check
        showStatus(translations[currentLanguage].warningMessage, 'warning');
        const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            });
        });
        const userCoords = position.coords;
        const distance = getDistance(userCoords.latitude, userCoords.longitude, collegeLocation.lat, collegeLocation.lon);
        updateLocationInfo(distance);

        if (distance > collegeLocation.radius) {
            showStatus('📍 You are outside the college premises', 'error');
            return;
        }

        const record = {
            name,
            roll,
            trade,
            year,
            status: 'Present',
            timestamp: new Date().toLocaleString()
        };

        const records = JSON.parse(localStorage.getItem('attendance') || '[]');
        records.push(record);
        localStorage.setItem('attendance', JSON.stringify(records));
        updateTable();
        showStatus(translations[currentLanguage].successMessage, 'success');

        document.getElementById('name').value = '';
        document.getElementById('roll').value = '';
    } catch (error) {
        showStatus(`❌ ${error.message}`, 'error');
    }
}

// Geolocation distance calculation function
function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))); // Distance in km
}

// Update location info display
function updateLocationInfo(distance) {
    const locationInfo = document.getElementById('locationInfo');
    locationInfo.textContent = `Distance from college: ${distance.toFixed(2)} km`;
}

// Dark mode toggle
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
}

// Admin panel function
function showAdminPanel() {
    const password = prompt("Enter admin password:");
    if (password === adminPassword) {
        // Show admin controls (for example, clear data)
        const clearData = confirm("Clear all attendance data?");
        if (clearData) {
            localStorage.clear();
            updateTable();
            showStatus("All data cleared successfully", 'success');
        }
    } else {
        showStatus("Invalid admin password", 'error');
    }
}

// Initialize the app on page load
window.addEventListener('DOMContentLoaded', () => {
    updateTable();
});
