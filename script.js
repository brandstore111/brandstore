// --- 1. قاعدة البيانات (وهمية) ---
const transactions = [
    { id: 101, merchant: "ستاربكس - التجمع", price: "- 145.00 EGP", date: "منذ 10 دقائق", icon: "fa-mug-hot", lat: 30.0305, lng: 31.4080, type: "out" },
    { id: 102, merchant: "إيداع بنكي CIB", price: "+ 5,000 EGP", date: "منذ ساعة", icon: "fa-building-columns", lat: 30.0444, lng: 31.2357, type: "in" },
    { id: 103, merchant: "أوبر - رحلة", price: "- 65.50 EGP", date: "أمس, 9:00 م", icon: "fa-car", lat: 30.0131, lng: 31.2089, type: "out" },
    { id: 104, merchant: "كارفور المعادي", price: "- 1,200 EGP", date: "28 ديسمبر", icon: "fa-cart-shopping", lat: 29.9668, lng: 31.2489, type: "out" },
    { id: 105, merchant: "ماكدونالدز سان ستيفانو", price: "- 210.00 EGP", date: "27 ديسمبر", icon: "fa-burger", lat: 31.2447, lng: 29.9642, type: "out" }
];

// --- 2. تهيئة الخريطة ---
// توسيط الخريطة على القاهرة
const map = L.map('map').setView([30.0444, 31.2357], 12);

// إضافة طبقة الصور من OpenStreetMap
L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    attribution: '© OpenStreetMap Contributors'
}).addTo(map);

let currentMarker = null;

// --- 3. دالة بناء القائمة ---
const container = document.getElementById('transactions-container');

transactions.forEach((tx, index) => {
    // إنشاء العنصر
    const el = document.createElement('div');
    el.className = 't-row';
    if(index === 0) el.classList.add('active'); // تفعيل العنصر الأول

    // تحديد اللون (أخضر للوارد، أسود للصادر)
    const color = tx.type === 'in' ? 'var(--green)' : 'var(--text-main)';
    
    // تعبئة البيانات
    el.innerHTML = `
        <div class="t-data">
            <div class="t-icon"><i class="fa-solid ${tx.icon}"></i></div>
            <div class="t-details">
                <h4>${tx.merchant}</h4>
                <small>${tx.date}</small>
            </div>
        </div>
        <div class="t-price" style="color: ${color}">${tx.price}</div>
    `;

    // إضافة حدث النقر
    el.addEventListener('click', () => {
        // إزالة التفعيل من الجميع
        document.querySelectorAll('.t-row').forEach(r => r.classList.remove('active'));
        // تفعيل العنصر المختار
        el.classList.add('active');
        // تحديث الخريطة
        updateDashboard(tx);
    });

    container.appendChild(el);
});

// --- 4. دالة تحديث اللوحة ---
function updateDashboard(tx) {
    // تحديث النصوص في الكارت العائم
    document.getElementById('ov-price').innerText = tx.price;
    document.getElementById('ov-price').style.color = tx.type === 'in' ? 'var(--green)' : 'var(--primary)';
    document.getElementById('ov-merchant').innerText = tx.merchant;
    document.getElementById('ov-date').innerText = tx.date;

    // التحرك إلى الموقع على الخريطة
    map.flyTo([tx.lat, tx.lng], 14, { duration: 1.5 });

    // تحريك الدبوس
    if(currentMarker) map.removeLayer(currentMarker);
    currentMarker = L.marker([tx.lat, tx.lng]).addTo(map)
        .bindPopup(`<b>${tx.merchant}</b><br>${tx.price}`)
        .openPopup();
}

// تشغيل الدالة لأول عنصر عند فتح الصفحة
updateDashboard(transactions[0]);
