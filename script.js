// 1. Map Initialization
var map = L.map('map').setView([40.7128, -74.0060], 13);
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap'
}).addTo(map);

var currentMarker;
let activeTransaction = null; // Store currently selected tx

// 2. Data
const transactions = [
    { id: "TXN-8821", merchant: "Starbucks Coffee", amount: "$15.50", date: "Dec 30, 2025 - 08:30 AM", status: "Success", lat: 40.7580, lng: -73.9855 },
    { id: "TXN-8822", merchant: "Apple Store", amount: "$1,299.00", date: "Dec 29, 2025 - 02:15 PM", status: "Success", lat: 40.7638, lng: -73.9723 },
    { id: "TXN-8823", merchant: "Uber Ride", amount: "$45.20", date: "Dec 28, 2025 - 11:45 PM", status: "Success", lat: 40.7484, lng: -73.9857 },
    { id: "TXN-8824", merchant: "Walmart Supercenter", amount: "$210.85", date: "Dec 28, 2025 - 06:10 PM", status: "Pending", lat: 40.7300, lng: -74.0600 },
    { id: "TXN-8825", merchant: "Amazon Refund", amount: "+ $50.00", date: "Dec 27, 2025 - 10:00 AM", status: "Success", lat: 40.7400, lng: -74.0000 },
];

const listContainer = document.getElementById('transactionList');

// 3. Render List (with Filtering)
function renderList(filterType = 'All') {
    listContainer.innerHTML = ''; // Clear list
    
    const filteredData = transactions.filter(tx => filterType === 'All' || tx.status === filterType);

    if(filteredData.length === 0) {
        listContainer.innerHTML = '<div style="padding:20px; text-align:center; color:#999;">No transactions found.</div>';
        return;
    }

    filteredData.forEach((tx, index) => {
        const item = document.createElement('div');
        item.className = 'transaction-item';
        
        // Text color class based on status
        const statusClass = tx.status === 'Success' ? 'status-success' : 'status-pending';

        item.innerHTML = `
            <div class="t-info">
                <h4>${tx.merchant}</h4>
                <p>${tx.date}</p>
            </div>
            <div class="t-right">
                <div class="t-amount">${tx.amount}</div>
                <div class="t-status ${statusClass}">${tx.status}</div>
            </div>
        `;
        
        // Click Event
        item.addEventListener('click', () => {
            document.querySelectorAll('.transaction-item').forEach(el => el.classList.remove('selected'));
            item.classList.add('selected');
            updateDashboard(tx);
        });

        listContainer.appendChild(item);
    });

    // Select first item automatically if list not empty
    if(filteredData.length > 0) {
        document.querySelector('.transaction-item').classList.add('selected');
        updateDashboard(filteredData[0]);
    }
}

// 4. Update Dashboard View
function updateDashboard(tx) {
    activeTransaction = tx; // Save for print/share

    // Update Text
    document.getElementById('d-amount').innerText = tx.amount;
    document.getElementById('d-merchant').innerText = tx.merchant;
    document.getElementById('d-id').innerText = tx.id;
    document.getElementById('d-date').innerText = tx.date;
    
    // Update Status Pill style
    const statusEl = document.getElementById('d-status');
    statusEl.innerText = tx.status;
    statusEl.className = 'status-pill'; // reset
    if(tx.status === 'Success') statusEl.classList.add('pill-success');
    else statusEl.classList.add('pill-pending');

    // Update Map
    if (currentMarker) map.removeLayer(currentMarker);
    map.flyTo([tx.lat, tx.lng], 15, { duration: 1.0 });
    currentMarker = L.marker([tx.lat, tx.lng]).addTo(map)
        .bindPopup(`<b>${tx.merchant}</b><br>${tx.amount}`)
        .openPopup();
}

// 5. Filter Button Logic
function filterTransactions(type, btnElement) {
    // Update UI Badges
    document.querySelectorAll('.badge').forEach(b => b.classList.remove('active'));
    btnElement.classList.add('active');
    // Re-render list
    renderList(type);
}

// 6. Print Function
function printReceipt() {
    if(!activeTransaction) return;
    const printWin = window.open('', '', 'width=400,height=600');
    printWin.document.write(`
        <html>
        <head>
            <title>Receipt ${activeTransaction.id}</title>
            <style>
                body { font-family: 'Courier New', monospace; padding: 20px; text-align: center; }
                .header { border-bottom: 1px dashed #000; padding-bottom: 10px; margin-bottom: 20px; }
                .row { display: flex; justify-content: space-between; margin-bottom: 10px; }
                .total { font-size: 20px; font-weight: bold; margin-top: 20px; border-top: 1px solid #000; padding-top: 10px; }
            </style>
        </head>
        <body>
            <div class="header">
                <h2>PAYTRACK</h2>
                <p>Transaction Receipt</p>
            </div>
            <div class="content">
                <p><strong>${activeTransaction.merchant}</strong></p>
                <p>${activeTransaction.date}</p>
                <br>
                <div class="row"><span>ID:</span> <span>${activeTransaction.id}</span></div>
                <div class="row"><span>Status:</span> <span>${activeTransaction.status}</span></div>
                <div class="total">
                    <span>TOTAL:</span> <span>${activeTransaction.amount}</span>
                </div>
            </div>
            <script>window.print();<\/script>
        </body>
        </html>
    `);
    printWin.document.close();
}

// 7. Share Function
function shareTransaction() {
    if(!activeTransaction) return;
    const text = `Payment of ${activeTransaction.amount} to ${activeTransaction.merchant} was ${activeTransaction.status}. ID: ${activeTransaction.id}`;
    
    if (navigator.share) {
        navigator.share({
            title: 'Transaction Details',
            text: text,
            url: window.location.href
        });
    } else {
        navigator.clipboard.writeText(text);
        alert('Transaction details copied to clipboard!');
    }
}

// Initialize
renderList('All');
