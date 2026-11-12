// ============================================
// CHỌN THỜI GIAN - WHEEL PICKER (THÁNG & NĂM)
// ============================================
// 2 cột lăn: tháng (1-12) và năm.
// Dùng CSS scroll-snap để các dòng "bám" vào giữa khi cuộn.
// JS đọc mục đang ở giữa (theo scrollTop) để biết giá trị được chọn.

const ITEM_H = 40; // chiều cao 1 dòng (phải khớp --wheel-item-h trong CSS)

// ====== 1. CẤU HÌNH ======
const THANG_MAC_DINH = 7;       // tháng bắt đầu
const NAM_MAC_DINH = 2026;      // năm bắt đầu
const NAM_BAT_DAU = 2015;       // năm nhỏ nhất
const NAM_KET_THUC = 2035;      // năm lớn nhất

let thangDaLuu = THANG_MAC_DINH;
let namDaLuu = NAM_MAC_DINH;

// ====== 2. LẤY CÁC PHẦN TỬ ======
const app = document.getElementById('app');
const wheelMonth = document.getElementById('wheelMonth');
const wheelYear = document.getElementById('wheelYear');
const resultText = document.getElementById('resultText');
const openPicker = document.getElementById('openPicker');
const overlay = document.getElementById('overlay');
const btnCancel = document.getElementById('btnCancel');
const btnDone = document.getElementById('btnDone');

// ====== 3. DỰNG CÁC MỤC TRONG WHEEL ======
function dungWheel(wheel, danhSach, giaTriChon) {
    let html = '<div class="wheel-pad"></div>';
    danhSach.forEach(muc => {
        html += `<div class="wheel-item" data-v="${muc.giaTri}">${muc.nhan}</div>`;
    });
    html += '<div class="wheel-pad"></div>';
    wheel.innerHTML = html;

    // Cuộn về mục được chọn (sau khi render để có chiều cao thật)
    const chiSo = danhSach.findIndex(m => m.giaTri === giaTriChon);
    if (chiSo >= 0) {
        requestAnimationFrame(() => { wheel.scrollTop = chiSo * ITEM_H; });
    }
}

function khoiTaoWheel() {
    const danhSachThang = [];
    for (let t = 1; t <= 12; t++) {
        danhSachThang.push({ giaTri: t, nhan: 'Tháng ' + t });
    }
    const danhSachNam = [];
    for (let n = NAM_BAT_DAU; n <= NAM_KET_THUC; n++) {
        danhSachNam.push({ giaTri: n, nhan: String(n) });
    }
    dungWheel(wheelMonth, danhSachThang, thangDaLuu);
    dungWheel(wheelYear, danhSachNam, namDaLuu);
}

// ====== 4. ĐỌC GIÁ TRỊ ĐANG Ở GIỮA WHEEL ======
function giaTriDangChon(wheel) {
    const items = wheel.querySelectorAll('.wheel-item');
    const i = Math.round(wheel.scrollTop / ITEM_H);
    return items[i] ? items[i].dataset.v : null;
}

// ====== 5. MỞ / ĐÓNG SHEET ======
function moSheet() {
    // Đưa wheel về giá trị đã lưu trước khi mở
    requestAnimationFrame(() => {
        wheelMonth.scrollTop = (thangDaLuu - 1) * ITEM_H;
        wheelYear.scrollTop = (namDaLuu - NAM_BAT_DAU) * ITEM_H;
    });
    app.classList.add('is-open');
}
function dongSheet() {
    app.classList.remove('is-open');
}

// ====== 6. GẮN SỰ KIỆN ======
openPicker.addEventListener('click', moSheet);
overlay.addEventListener('click', dongSheet);
btnCancel.addEventListener('click', dongSheet);

btnDone.addEventListener('click', () => {
    const t = parseInt(giaTriDangChon(wheelMonth), 10);
    const n = parseInt(giaTriDangChon(wheelYear), 10);
    if (t) thangDaLuu = t;
    if (n) namDaLuu = n;
    resultText.textContent = `tháng ${thangDaLuu} năm ${namDaLuu}`;
    dongSheet();
});

// ====== 7. KHỞI TẠO ======
khoiTaoWheel();
