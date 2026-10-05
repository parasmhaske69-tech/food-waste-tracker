// Mock Database Demo Barcodes ke liye
const mockDatabase = {
    "8901030922881": { name: "Amul Milk", shelfLife: 2 },
    "8901262010014": { name: "Amul Butter", shelfLife: 30 },
    "8901058852337": { name: "Maggi Noodles", shelfLife: 180 },
    "Bread": { name: "Fresh Bread", shelfLife: 4 } 
};

// Scanner Logic
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
    if (mockDatabase[decodedText]) {
        const product = mockDatabase[decodedText];
        document.getElementById('itemName').value = product.name;
        
        const expDate = new Date();
        expDate.setDate(expDate.getDate() + product.shelfLife);
        document.getElementById('expiryDate').value = expDate.toISOString().split('T')[0];
        
        alert(`Success! ${product.name} scanned.`);
    } else {
        document.getElementById('itemName').value = "Unknown Code: " + decodedText;
        alert("Item database mein nahi mila. Kripya Expiry Date manually dalein.");
    }
    html5QrcodeScanner.clear();
    readerDiv.style.display = 'none';
}

function onScanFailure(error) {
    // Background scan errors ko ignore karein
}

// App Core Logic
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

displayItems();
