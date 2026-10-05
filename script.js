// --- PROJECT DEMO DATABASE ---
// Viva ke liye aap kuch sample barcodes yahan add kar sakte hain. 
// "shelfLife" ka matlab item kitne din mein kharab hoga.
const mockDatabase = {
    "8901030922881": { name: "Amul Milk", shelfLife: 2 },
    "8901262010014": { name: "Amul Butter", shelfLife: 30 },
    "8901058852337": { name: "Maggi Noodles", shelfLife: 180 },
    // Agar aap custom QR code banate hain "Bread" text ka:
    "Bread": { name: "Fresh Bread", shelfLife: 4 } 
};

// --- SCANNER LOGIC ---
const scanBtn = document.getElementById('scanBtn');
const readerDiv = document.getElementById('reader');
let html5QrcodeScanner;

scanBtn.addEventListener('click', () => {
    // Camera box show karein
    readerDiv.style.display = 'block';
    
    // Scanner initialize karein
    html5QrcodeScanner = new Html5QrcodeScanner(
        "reader", 
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false
    );
    html5QrcodeScanner.render(onScanSuccess, onScanFailure);
});

function onScanSuccess(decodedText, decodedResult) {
    // Beep sound ya alert
    console.log(`Scan result: ${decodedText}`);

    // Database mein check karein
    if (mockDatabase[decodedText]) {
        const product = mockDatabase[decodedText];
        
        // Name auto-fill
        document.getElementById('itemName').value = product.name;
        
        // Expiry Date auto-fill (Aaj ki date + shelfLife days)
        const expDate = new Date();
        expDate.setDate(expDate.getDate() + product.shelfLife);
        
        // Date ko YYYY-MM-DD format mein convert karke input mein daalna
        document.getElementById('expiryDate').value = expDate.toISOString().split('T')[0];
        
        alert(`Success! ${product.name} scanned.`);
    } else {
        // Agar barcode database mein nahi hai
        document.getElementById('itemName').value = "Unknown Item Code: " + decodedText;
        alert("Item database mein nahi mila. Kripya Expiry Date manually dalein.");
    }

    // Scan hone ke baad camera band karein
    html5QrcodeScanner.clear();
    readerDiv.style.display = 'none';
}

function onScanFailure(error) {
    // Error handle karne ke liye (silent fail hone dein warna console bhar jayega)
}

// --- AAPKA PURANA LOGIC YAHAN SE CONTINUE KAREIN ---
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
