let isAuthenticatedOwner = false;
let menuItems = [];
let order = {};

document.addEventListener('DOMContentLoaded', () => {
    // Initial menu items for demonstration
    menuItems = [
        { id: 1, name: 'Dish 1', price: 100, image: '', available: true },
        { id: 2, name: 'Dish 2', price: 120, image: '', available: true },
        { id: 3, name: 'Dish 3', price: 150, image: '', available: true }
    ];

    showHomeView();
});

function toggleOwnerPassword() {
    const ownerPassword = document.getElementById('owner-password');
    ownerPassword.style.display = 'block';
}

function validatePassword() {
    const passwordInput = document.getElementById('password-input').value;
    if (passwordInput === '12345') {
        isAuthenticatedOwner = true;
        document.getElementById('owner-password').style.display = 'none';
        showOwnerView();
    } else {
        alert('Incorrect password. Please try again.');
        document.getElementById('password-input').value = '';
    }
}

function showHomeView() {
    isAuthenticatedOwner = false;
    document.getElementById('owner-view').style.display = 'none';
    document.getElementById('owner-password').style.display = 'none';
    document.getElementById('home-view').style.display = 'block';
    document.getElementById('timing').style.display = 'none';
    document.getElementById('payment').style.display = 'none';
    document.getElementById('receipt').style.display = 'none';
    displayMenu();
}

function showOwnerView() {
    document.getElementById('home-view').style.display = 'none';
    document.getElementById('owner-view').style.display = 'block';
    displayOwnerMenu();
}

function displayMenu() {
    const menuContainer = document.getElementById('menu-items');
    menuContainer.innerHTML = '';

    menuItems.forEach(item => {
        const menuItem = document.createElement('div');
        menuItem.className = 'menu-item';
        menuItem.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <h3>${item.name}</h3>
            <p>Nu. ${item.price}</p>
            ${item.available ?
                `<label for="quantity-${item.id}">Quantity:</label>
                <input type="number" id="quantity-${item.id}" min="0" max="10" value="0">
                <button onclick="addToOrder(${item.id}, '${item.name}', ${item.price})">Order</button>`
                : `<p>Not Available</p>`}
                <button onclick="cancelOrder(${item.id})">Cancel</button>`;
        menuContainer.appendChild(menuItem);
    });
}

function displayOwnerMenu() {
    const ownerMenuContainer = document.getElementById('owner-menu-items');
    ownerMenuContainer.innerHTML = '';

    menuItems.forEach(item => {
        const ownerMenuItem = document.createElement('div');
        ownerMenuItem.className = 'owner-menu-item';
        ownerMenuItem.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <h3>${item.name}</h3>
            <p>Nu. ${item.price}</p>
            <button onclick="toggleAvailability(${item.id})">${item.available ? 'Not Available' : 'Available'}</button>
            <button onclick="deleteMenuItem(${item.id})">Delete</button>
        `;
        ownerMenuContainer.appendChild(ownerMenuItem);
    });
}

function addMenuItem() {
    const foodName = document.getElementById('food-name').value;
    const foodPrice = document.getElementById('food-price').value;
    const foodImage = document.getElementById('food-image').files[0];

    if (foodName && foodPrice && foodImage) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const newItem = {
                id: menuItems.length + 1,
                name: foodName,
                price: parseFloat(foodPrice),
                image: e.target.result,
                available: true
            };
            menuItems.push(newItem);
            displayOwnerMenu();
        };
        reader.readAsDataURL(foodImage);
    } else {
        alert('Please fill in all fields.');
    }
}

function deleteMenuItem(id) {
    menuItems = menuItems.filter(item => item.id !== id);
    displayOwnerMenu();
}

function addToOrder(id, name, price) {
    const quantity = parseInt(document.getElementById(`quantity-${id}`).value);
    if (quantity > 0) {
        if (!order[id]) {
            order[id] = { name, price, quantity };
        } else {
            order[id].quantity += quantity;
        }
        updateOrderList();
    }
}

function cancelOrder(id) {
    if (order[id]) {
        delete order[id];
        updateOrderList();
    }
}

function updateOrderList() {
    const orderList = document.getElementById('order-summary');
    orderList.innerHTML = '';

    let totalAmount = 0;
    Object.values(order).forEach(item => {
        const listItem = document.createElement('li');
        listItem.textContent = `${item.name} x ${item.quantity} = Nu. ${item.price * item.quantity}`;
        orderList.appendChild(listItem);
        totalAmount += item.price * item.quantity;
    });

    document.getElementById('total-amount').textContent = totalAmount;
}

function toggleAvailability(id) {
    const menuItem = menuItems.find(item => item.id === id);
    menuItem.available = !menuItem.available;
    displayMenu();
    displayOwnerMenu();
}

function showTiming() {
    document.getElementById('home-view').style.display = 'none';
    document.getElementById('timing').style.display = 'block';
}

function showPaymentOptions() {
    document.getElementById('timing').style.display = 'none';
    document.getElementById('payment').style.display = 'block';
}

function showAccountNumberInput() {
    const bank = document.getElementById('bank').value;
    const accountNumberContainer = document.getElementById('customer-account-number');
    if (bank) {
        accountNumberContainer.style.display = 'block';
    } else {
        accountNumberContainer.style.display = 'none';
    }
}

function checkout() {
    const bank = document.getElementById('bank').value;
    const accountNumber = document.getElementById('account-number').value;
    if (bank && (bank === 'BOB' || bank === 'BNB') && accountNumber) {
        const journalNumber = generateJournalNumber();
        const arrivalDate = document.getElementById('arrival-date').value;
        const arrivalTime = document.getElementById('arrival-time').value;

        // Display receipt
        document.getElementById('journal-number').textContent = journalNumber;
        document.getElementById('receipt-date').textContent = arrivalDate;
        document.getElementById('receipt-time').textContent = arrivalTime;
        document.getElementById('receipt-total').textContent = document.getElementById('total-amount').textContent;

        const receiptOrderSummary = document.getElementById('receipt-order-summary');
        receiptOrderSummary.innerHTML = '';
        Object.values(order).forEach(item => {
            const summaryItem = document.createElement('p');
            summaryItem.textContent = `${item.name} x ${item.quantity}`;
            receiptOrderSummary.appendChild(summaryItem);
        });

        document.getElementById('payment').style.display = 'none';
        document.getElementById('receipt').style.display = 'block';

        // Generate and download receipt as PDF
        generateReceiptPDF(journalNumber, arrivalDate, arrivalTime);

        resetOrder();
    } else {
        alert('Please select a bank and provide valid account number.');
    }
}

function generateJournalNumber() {
    return Math.floor(Math.random() * 1000000) + 1;
}

function generateReceiptPDF(journalNumber, arrivalDate, arrivalTime) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    let receiptContent = `Order Receipt\nJournal Number: ${journalNumber}\nArrival Date: ${arrivalDate}\nArrival Time: ${arrivalTime}\n\nOrder Details:\n`;
    Object.values(order).forEach(item => {
        receiptContent += `${item.name} x ${item.quantity}\n`;
    });
    doc.text(receiptContent, 10, 10);
    doc.save('order_receipt.pdf');
}

function resetOrder() {
    order = {};
    updateOrderList();
    document.getElementById('timing').style.display = 'none';
    document.getElementById('home-view').style.display = 'block';
}

function resetApp() {
    document.getElementById('receipt').style.display = 'none';
    showHomeView();
}

