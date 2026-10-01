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

        // Color Logic
        if (daysDiff < 0) {
            statusText = "Expired!";
            rowClass = 'expiring-soon'; // Red
        } else if (daysDiff >= 0 && daysDiff <= 2) {
            statusText = "Expiring Soon! Use it today.";
            rowClass = 'expiring-soon'; // Red
        } else if (daysDiff > 2 && daysDiff <= 5) {
            rowClass = 'expiring-medium'; // Yellow
        } else if (daysDiff > 5) {
            rowClass = 'expiring-safe'; // Green
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