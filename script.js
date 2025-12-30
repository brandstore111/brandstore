// --- 1. Mock Data (بيانات وهمية) ---
const transactions = [
    { id: "TX-1001", merchant: "Starbucks Coffee", amount: 5.50, date: "2023-10-24 08:30", status: "Success", lat: 30.0444, lng: 31.2357, category: "Food" },
    { id: "TX-1002", merchant: "Uber Ride", amount: 12.00, date: "2023-10-23 18:15", status: "Pending", lat: 30.0500, lng: 31.2400, category: "Transport" },
    { id: "TX-1003", merchant: "Amazon Egypt", amount: 45.99, date: "2023-10-22 14:20", status: "Success", lat: 30.0600, lng: 31.2200, category: "Shopping" },
    { id: "TX-1004", merchant: "Vodafone Bill", amount: 20.00, date: "2023-10-21 10:00", status: "Success", lat: 30.0300, lng: 31.2500, category: "Utilities" },
    { id: "TX-1005", merchant: "Netflix Sub", amount: 15.00, date: "2023-10-20 09:00", status: "Pending", lat: 30.0550, lng: 31.2100, category: "Entertainment" },
];

let map;
let markers = [];
let currentTx = transactions[0];

// --- 2. Initialization (التهيئة) ---
document.addEventListener('DOMContentLoaded', () => {
    initMap();
    renderTransactions('All');
    loadTransactionDetails(currentTx);
    createModalsInDOM(); // إنشاء نوافذ الطباعة والمشاركة
});

// --- 3. Map Functions (وظائف الخريطة) ---
function initMap() {
    // إحداثيات افتراضية (القاهرة)
    map = L.map('map').setView([30.0444, 31.2357], 13);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);
}

function updateMapMarker(tx) {
    // حذف العلامات القديمة
    markers.forEach(m => map.removeLayer(m));
    markers = [];

    // إضافة علامة جديدة
    const marker = L.marker([tx.lat, tx.lng]).addTo(map)
        .bindPopup(`<b>${tx.merchant}</b><br>${tx.date}`)
        .openPopup();
    
    markers.push(marker);
    
    // التحريك إلى الموقع
    map.flyTo([tx.lat, tx.lng], 14, {
        animate: true,
        duration: 1.5
    });
}

// --- 4. Sidebar & List Logic (منطق القائمة) ---
function filterTransactions(status, element) {
    // تحديث شكل الأزرار (Badges)
    document.querySelectorAll('.filter-bar .badge').forEach(b => b.classList.remove('active'));
    element.classList.add('active');

    renderTransactions(status);
}

function renderTransactions(filter) {
    const listContainer = document.getElementById('transactionList');
    listContainer.innerHTML = '';

    const filtered = filter === 'All' 
        ? transactions 
        : transactions.filter(t => t.status === filter);

    filtered.forEach(tx => {
        const item = document.createElement('div');
        item.className = `tx-item ${tx.id === currentTx.id ? 'selected' : ''}`;
        item.onclick = () => selectTransaction(tx, item);

        const statusColor = tx.status === 'Success' ? '#10B981' : '#F59E0B';

        item.innerHTML = `
            <div class="tx-info">
                <h4>${tx.merchant}</h4>
                <p>${tx.id} • ${tx.date.split(' ')[0]}</p>
            </div>
            <div class="tx-price">
                <span class="status-dot" style="background:${statusColor}"></span>
                $${tx.amount.toFixed(2)}
            </div>
        `;
        listContainer.appendChild(item);
    });
}

function selectTransaction(tx, domElement) {
    currentTx = tx;
    
    // تحديث التحديد المرئي
    document.querySelectorAll('.tx-item').forEach(el => el.classList.remove('selected'));
    domElement.classList.add('selected');

    loadTransactionDetails(tx);
}

// --- 5. Detail View Logic (تحديث التفاصيل) ---
function loadTransactionDetails(tx) {
    document.getElementById('d-amount').textContent = `$${tx.amount.toFixed(2)}`;
    document.getElementById('d-merchant').textContent = tx.merchant;
    document.getElementById('d-id').textContent = tx.id;
    document.getElementById('d-date').textContent = tx.date;

    const statusEl = document.getElementById('d-status');
    statusEl.textContent = tx.status;
    statusEl.className = `status-pill ${tx.status === 'Success' ? 'pill-success' : 'pill-pending'}`;

    updateMapMarker(tx);
}

// --- 6. Action Interfaces (Modals) (واجهات الأزرار) ---

// دالة لإنشاء كود الـ Modals في الصفحة
function createModalsInDOM() {
    const modalHTML = `
    <!-- Print Modal -->
    <div id="printModal" class="modal-overlay" onclick="closeModal(event, 'printModal')">
        <div class="modal">
            <div class="modal-header">
                <h3>Transaction Receipt</h3>
                <i class="fa-solid fa-xmark modal-close" onclick="document.getElementById('printModal').classList.remove('open')"></i>
            </div>
            <div id="receiptContent" class="receipt-preview">
                <!-- Content injected via JS -->
            </div>
            <button class="btn btn-primary btn-print-confirm" style="width:100%; justify-content:center" onclick="window.print()">
                Confirm Print
            </button>
        </div>
    </div>

    <!-- Share Modal -->
    <div id="shareModal" class="modal-overlay" onclick="closeModal(event, 'shareModal')">
        <div class="modal">
            <div class="modal-header">
                <h3>Share Transaction</h3>
                <i class="fa-solid fa-xmark modal-close" onclick="document.getElementById('shareModal').classList.remove('open')"></i>
            </div>
            <div class="share-grid">
                <div class="share-btn" onclick="copyLink()">
                    <i class="fa-solid fa-link"></i>
                    <span>Copy Link</span>
                </div>
                <div class="share-btn" onclick="alert('Sent to Email!')">
                    <i class="fa-solid fa-envelope"></i>
                    <span>Email</span>
                </div>
                <div class="share-btn" onclick="alert('Shared on WhatsApp!')">
                    <i class="fa-brands fa-whatsapp"></i>
                    <span>WhatsApp</span>
                </div>
                <div class="share-btn" onclick="alert('Downloaded PDF!')">
                    <i class="fa-solid fa-file-pdf"></i>
                    <span>PDF</span>
                </div>
            </div>
        </div>
    </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// --- Button Functions ---

// 1. زر الطباعة
window.printReceipt = function() {
    const receiptContent = document.getElementById('receiptContent');
    receiptContent.innerHTML = `
        <h3>PAYTRACK INC.</h3>
        <p>Official Receipt</p>
        <div class="receipt-divider"></div>
        <div class="receipt-line"><span>Merchant:</span> <span>${currentTx.merchant}</span></div>
        <div class="receipt-line"><span>Date:</span> <span>${currentTx.date}</span></div>
        <div class="receipt-line"><span>Trans ID:</span> <span>${currentTx.id}</span></div>
        <div class="receipt-divider"></div>
        <div class="receipt-line" style="font-weight:bold; font-size:1.1rem">
            <span>TOTAL:</span> <span>$${currentTx.amount.toFixed(2)}</span>
        </div>
        <div class="receipt-divider"></div>
        <p style="font-size:0.8rem">Thank you for your business!</p>
    `;
    document.getElementById('printModal').classList.add('open');
}

// 2. زر المشاركة
window.shareTransaction = function() {
    // إذا كان المتصفح يدعم المشاركة الأصلية (Mobile mostly)
    if (navigator.share) {
        navigator.share({
            title: `Transaction at ${currentTx.merchant}`,
            text: `Check out this transaction of $${currentTx.amount}`,
            url: window.location.href
        }).catch(console.error);
    } else {
        // فتح النافذة المنبثقة المخصصة
        document.getElementById('shareModal').classList.add('open');
    }
}

// أدوات مساعدة
window.closeModal = function(event, modalId) {
    if (event.target.id === modalId) {
        document.getElementById(modalId).classList.remove('open');
    }
}

window.copyLink = function() {
    navigator.clipboard.writeText(`Transaction: ${currentTx.id} - ${currentTx.merchant}`);
    const btn = event.currentTarget;
    const originalText = btn.querySelector('span').innerText;
    btn.querySelector('span').innerText = "Copied!";
    setTimeout(() => btn.querySelector('span').innerText = originalText, 2000);
}
