// ==========================================
// 1. BARCODE & QR SCANNER LOGIC (Smart Router)
// ==========================================
const scanBtn = document.getElementById('scanBtn');
const readerDiv = document.getElementById('reader');
let html5QrcodeScanner;

scanBtn.addEventListener('click', () => {
    readerDiv.style.display = 'block';
    html5QrcodeScanner = new Html5QrcodeScanner(
        "reader", 
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false
    );
    html5QrcodeScanner.render(onScanSuccess, onScanFailure);
});

function onScanSuccess(decodedText, decodedResult) {
    // 1. Scan hote hi camera band karein
    html5QrcodeScanner.clear();
    readerDiv.style.display = 'none';

    // Helper Function: Normal Barcode ke liye API call
    const fetchFromAPI = (barcodeNumber) => {
        document.getElementById('itemName').value = "Searching API...";
        fetch(`https://world.openfoodfacts.org/api/v0/product/${barcodeNumber}.json`)
            .then(response => response.json())
            .then(data => {
                if (data.status === 1) {
                    let productName = data.product.product_name || "Unknown Item";
                    document.getElementById('itemName').value = productName;
                    alert(`Product Found: ${productName}!\n\nKripya packet par dekh kar Expiry Date select karein.`);
                    document.getElementById('expiryDate').focus(); 
                } else {
                    document.getElementById('itemName').value = barcodeNumber; 
                    alert("Yeh item global database mein nahi mila. Kripya naam manually bharein.");
                }
            })
            .catch(error => {
                document.getElementById('itemName').value = barcodeNumber;
                alert("Internet error. Kripya manual entry karein.");
            });
    };

    // --- SMART ROUTER ---

    // TYPE A: JSON QR Code (Agar curly brackets {} se start/end ho)
    if (decodedText.trim().startsWith("{") && decodedText.trim().endsWith("}")) {
        try {
            let jsonData = JSON.parse(decodedText);
            let itemName = jsonData.name || jsonData.itemName || jsonData.product || jsonData.barcode || "Local Item";
            document.getElementById('itemName').value = itemName;
            
            if (jsonData.expiry || jsonData.date) {
                document.getElementById('expiryDate').value = jsonData.expiry || jsonData.date;
            }
            alert("Smart QR (JSON) scanned successfully!");
            return; 
        } catch (e) {
            console.log("JSON parse error", e);
        }
    }

    // TYPE B: Text QR Code with Comma (e.g., "Fresh Paneer,2026-10-15")
    if (decodedText.includes(",")) {
        let parts = decodedText.split(",");
        document.getElementById('itemName').value = parts[0].trim();
        
        let possibleDate = parts[1].trim();
        if (possibleDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
            document.getElementById('expiryDate').value = possibleDate;
        }
        alert("Smart QR (Text) scanned successfully!");
        return; 
    }

    // TYPE C: Normal Barcode (Sirf Numbers) -> Call API
    if (/^\d+$/.test(decodedText.trim())) {
        fetchFromAPI(decodedText.trim());
    } else {
        // Fallback
        document.getElementById('itemName').value = decodedText;
        alert("Custom QR Scanned. Kripya details check karein.");
    }
}

function onScanFailure(error) {
    // Ignore background errors
}

// ==========================================
// 2. CORE APP LOGIC (Storage, Dates & Colors)
// ==========================================
let foodItems = JSON.parse(localStorage.getItem('foodItems')) || [];
const form = document.getElementById('foodForm');
const foodList = document.getElementById('foodList');

form.addEventListener('submit', function(e) {
    e.preventDefault();
    const itemName = document.getElementById('itemName').value;
    const expiryDate = document.getElementById('expiryDate').value;

    const newItem = {
        id: Date.now(),
        name: itemName,
        expiry: expiryDate
    };

    foodItems.push(newItem);
    localStorage.setItem('foodItems', JSON.stringify(foodItems)); 
    form.reset();
    displayItems();
});

function displayItems() {
    foodList.innerHTML = ''; 
    const today = new Date(); 
    today.setHours(0, 0, 0, 0); 

    foodItems.forEach(item => {
        const expDate = new Date(item.expiry);
        expDate.setHours(0, 0, 0, 0);
        
        const timeDiff = expDate.getTime() - today.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)); 

        let statusText = `${daysDiff} days left`;
        let rowClass = ''; 

        // Color Logic based on Expiry
        if (daysDiff < 0) {
            statusText = "Expired!";
            rowClass = 'expiring-soon'; 
        } else if (daysDiff >= 0 && daysDiff <= 2) {
            statusText = "Expiring Soon! Use it today.";
            rowClass = 'expiring-soon'; 
        } else if (daysDiff > 2 && daysDiff <= 5) {
            rowClass = 'expiring-medium'; 
        } else if (daysDiff > 5) {
            rowClass = 'expiring-safe'; 
        }

        const tr = document.createElement('tr');
        tr.className = rowClass;
        tr.innerHTML = `
            <td>${item.name}</td>
            <td>${item.expiry}</td>
            <td>${statusText}</td>
            <td><button class="delete-btn" onclick="deleteItem(${item.id})">Consumed</button></td>
        `;
        foodList.appendChild(tr);
    });
}

function deleteItem(id) {
    foodItems = foodItems.filter(item => item.id !== id);
    localStorage.setItem('foodItems', JSON.stringify(foodItems));
    displayItems();
}

// Initialize on page load
displayItems();
