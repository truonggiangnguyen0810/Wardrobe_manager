// ============================================
// LỊCH TRANG PHỤC - LỊCH ĐỘNG
// ============================================
// - Vẽ lưới ngày theo tháng/năm.
// - Lướt ngang đổi tháng (trái: tháng sau, phải: tháng trước).
// - Bấm chọn ngày, bôi đậm ngày hôm nay, ô số trang phục.

// ====== 1. TRẠNG THÁI ======
const NAM_BAT_DAU = 2015;
const NAM_KET_THUC = 2035;

let thoiGianThuc = new Date();
let namThuc = thoiGianThuc.getFullYear();
let thangThuc = thoiGianThuc.getMonth() + 1;
let ngayThuc = thoiGianThuc.getDate();

let thangHienTai = thangThuc;    // tháng đang xem
let namHienTai = namThuc;   // năm đang xem



const datesGrid = document.querySelector('.dates-grid');
const lichThang = document.getElementById('lichThang');

const ITEM_H = 40; // chiều cao 1 dòng wheel (khớp CSS)

// Phần tử popup chọn tháng/năm
const app = document.querySelector('.app-container');
const monthBtn = document.getElementById('monthBtn');
const tpOverlay = document.getElementById('tpOverlay');
const tpCancel = document.getElementById('tpCancel');
const tpConfirm = document.getElementById('tpConfirm');
const wheelMonth = document.getElementById('tpWheelMonth');
const wheelYear = document.getElementById('tpWheelYear');

// Cập nhật nhãn "Tháng X – Y" ở header
function capNhatNhan() {
    lichThang.textContent = 'Tháng ' + thangHienTai + ' – ' + namHienTai;
}

// ====== 2. TÍNH TOÁN NGÀY THÁNG ======
function soNgayTrongThang(nam, thang) {
    return new Date(nam, thang, 0).getDate();
}
function chiSoThuCuaNgayDau(nam, thang) {
    // 0=Thứ 2 ... 6=Chủ nhật (lưới bắt đầu bằng Thứ 2)
    const g = new Date(nam, thang - 1, 1).getDay();
    return (g + 6) % 7;
}

// ====== 3. VẼ LẠI LƯỚI NGÀY ======
function veLaiLich() {
    const soNgay = soNgayTrongThang(namHienTai, thangHienTai);
    const soDau = chiSoThuCuaNgayDau(namHienTai, thangHienTai);
    const soNgayThangTruoc = soNgayTrongThang(namHienTai, thangHienTai - 1);

    let html = '';

    // Ô dẫn đầu (tháng trước)
    for (let i = soDau - 1; i >= 0; i--) {
        html += `<div class="date-cell prev-month">${soNgayThangTruoc - i}</div>`;
    }

    // Các ngày của tháng hiện tại (chỉ hiển thị, không chọn)
    for (let d = 1; d <= soNgay; d++) {
        const laHomNay = (namHienTai === namThuc && thangHienTai === thangThuc && d === ngayThuc);
        let lop = 'date-cell';
        if (laHomNay) lop += ' today';
        
        const m = String(thangHienTai).padStart(2, '0');
        const dayStr = String(d).padStart(2, '0');
        const dateStr = `${namHienTai}-${m}-${dayStr}`;
        const soTrangPhuc = window.LICH_COUNTS ? window.LICH_COUNTS[dateStr] : 0;
        
        const badge = soTrangPhuc ? `<span class="day-badge">${soTrangPhuc}</span>` : '';
        html += `<div class="${lop}" data-day="${d}">${d}${badge}</div>`;
    }

    // Ô phụ (tháng sau) - lấp đủ 6 tuần (42 ô)
    let dem = soDau + soNgay;
    let keTiep = 1;
    while (dem < 42) {
        html += `<div class="date-cell next-month">${keTiep}</div>`;
        dem++;
        keTiep++;
    }

    datesGrid.innerHTML = html;
}

// ====== 4. LƯỚT NGANG ĐỔI THÁNG ======
function chayHieuUng(huong) {
    datesGrid.classList.remove('anim-next', 'anim-prev');
    void datesGrid.offsetWidth; // ép render lại để chạy lại animation
    datesGrid.classList.add(huong === 'next' ? 'anim-next' : 'anim-prev');
}
function thangTruoc() {
    if (thangHienTai === 1 && namHienTai === NAM_BAT_DAU) return;
    thangHienTai--;
    if (thangHienTai < 1) { thangHienTai = 12; namHienTai--; }
    capNhatNhan();
    veLaiLich();
    chayHieuUng('prev');
}
function thangTiep() {
    if (thangHienTai === 12 && namHienTai === NAM_KET_THUC) return;
    thangHienTai++;
    if (thangHienTai > 12) { thangHienTai = 1; namHienTai++; }
    capNhatNhan();
    veLaiLich();
    chayHieuUng('next');
}

const swipeTarget = document.querySelector('.calendar-body');
let startX = 0, startY = 0, dangLuot = false;

swipeTarget.addEventListener('pointerdown', (e) => {
    if (app.classList.contains('tp-open')) { dangLuot = false; return; } // đang mở popup -> bỏ qua
    startX = e.clientX;
    startY = e.clientY;
    dangLuot = true;
});
swipeTarget.addEventListener('pointerup', (e) => {
    if (!dangLuot) return;
    dangLuot = false;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
        if (dx < 0) thangTiep();   // lướt trái  -> tháng sau
        else thangTruoc();         // lướt phải  -> tháng trước
    }
});

// ====== 5. POPUP CHỌN THÁNG & NĂM (WHEEL) ======
function dungWheel(wheel, danhSach, giaTriChon) {
    let html = '<div class="tp-wheel-pad"></div>';
    danhSach.forEach(muc => {
        html += `<div class="tp-wheel-item" data-v="${muc.giaTri}">${muc.nhan}</div>`;
    });
    html += '<div class="tp-wheel-pad"></div>';
    wheel.innerHTML = html;
    const chiSo = danhSach.findIndex(m => m.giaTri === giaTriChon);
    if (chiSo >= 0) {
        requestAnimationFrame(() => { wheel.scrollTop = chiSo * ITEM_H; });
    }
}

function giaTriDangChon(wheel) {
    const items = wheel.querySelectorAll('.tp-wheel-item');
    const i = Math.round(wheel.scrollTop / ITEM_H);
    return items[i] ? items[i].dataset.v : null;
}

function moPopup() {
    requestAnimationFrame(() => {
        wheelMonth.scrollTop = (thangHienTai - 1) * ITEM_H;
        wheelYear.scrollTop = (namHienTai - NAM_BAT_DAU) * ITEM_H;
    });
    app.classList.add('tp-open');
}
function dongPopup() {
    app.classList.remove('tp-open');
}

monthBtn.addEventListener('click', moPopup);
tpOverlay.addEventListener('click', dongPopup);
tpCancel.addEventListener('click', dongPopup);

const actionSheet = document.getElementById('actionSheet');
const btnChiTiet = document.getElementById('btnChiTiet');
const btnThem = document.getElementById('btnThem');

function dongPopupAction() {
    app.classList.remove('action-open');
}

tpOverlay.addEventListener('click', dongPopupAction);

let selectedDateStr = null;
let currentSoTrangPhuc = 0;

datesGrid.addEventListener('click', (e) => {
    const cell = e.target.closest('.date-cell');
    if (!cell) return;
    if (cell.classList.contains('prev-month') || cell.classList.contains('next-month')) return;

    const d = parseInt(cell.dataset.day, 10);
    const m = String(thangHienTai).padStart(2, '0');
    const dayStr = String(d).padStart(2, '0');
    selectedDateStr = `${namHienTai}-${m}-${dayStr}`;
    
    currentSoTrangPhuc = window.LICH_COUNTS ? (window.LICH_COUNTS[selectedDateStr] || 0) : 0;

    if (currentSoTrangPhuc === 0) {
        btnChiTiet.disabled = true;
        btnChiTiet.classList.add('disabled');
        btnChiTiet.style.opacity = '0.5';
    } else {
        btnChiTiet.disabled = false;
        btnChiTiet.classList.remove('disabled');
        btnChiTiet.style.opacity = '1';
    }

    // Show action popup
    app.classList.add('action-open');
});

btnChiTiet.addEventListener('click', () => {
    if (currentSoTrangPhuc === 0) return;
    dongPopupAction();
    if (selectedDateStr) {
        window.location.href = `/chinh-sua-trang-phuc/?xem_ngay=${selectedDateStr}`;
    }
});

const outfitSheetOverlay = document.getElementById('outfitSheetOverlay');
const outfitActionSheet = document.getElementById('outfitActionSheet');
const closeOutfitSheetBtn = document.getElementById('closeOutfitSheet');

function openOutfitSheet() {
    dongPopupAction();
    if (!outfitSheetOverlay || !outfitActionSheet) return;
    outfitSheetOverlay.removeAttribute('hidden');
    outfitActionSheet.removeAttribute('hidden');
    setTimeout(() => {
        outfitSheetOverlay.classList.add('show');
        outfitActionSheet.classList.add('show');
    }, 10);
}

function closeOutfitSheet() {
    if (!outfitSheetOverlay || !outfitActionSheet) return;
    outfitSheetOverlay.classList.remove('show');
    outfitActionSheet.classList.remove('show');
    setTimeout(() => {
        outfitSheetOverlay.setAttribute('hidden', '');
        outfitActionSheet.setAttribute('hidden', '');
    }, 300);
}

btnThem.addEventListener('click', () => {
    openOutfitSheet();
});

if (closeOutfitSheetBtn) closeOutfitSheetBtn.addEventListener('click', closeOutfitSheet);
if (outfitSheetOverlay) outfitSheetOverlay.addEventListener('click', closeOutfitSheet);

const btnThemTuDo = document.getElementById('btnThemTuDo');
const btnChonTuSach = document.getElementById('btnChonTuSach');

if (btnThemTuDo) {
    btnThemTuDo.addEventListener('click', () => {
        if (selectedDateStr) window.location.href = `/chinh-sua-trang-phuc/?ngay_mac=${selectedDateStr}`;
    });
}
if (btnChonTuSach) {
    btnChonTuSach.addEventListener('click', () => {
        if (selectedDateStr) window.location.href = `/sach_trang_phuc/?ngay_mac=${selectedDateStr}`;
    });
}

tpConfirm.addEventListener('click', () => {
    const t = parseInt(giaTriDangChon(wheelMonth), 10);
    const n = parseInt(giaTriDangChon(wheelYear), 10);
    if (t) thangHienTai = t;
    if (n) namHienTai = n;
    capNhatNhan();
    veLaiLich();
    dongPopup();
});

// ====== 6. KHỞI TẠO ======
(function khoiTao() {
    const thang = [];
    for (let t = 1; t <= 12; t++) thang.push({ giaTri: t, nhan: 'Tháng ' + t });
    const nam = [];
    for (let n = NAM_BAT_DAU; n <= NAM_KET_THUC; n++) nam.push({ giaTri: n, nhan: String(n) });
    dungWheel(wheelMonth, thang, thangHienTai);
    dungWheel(wheelYear, nam, namHienTai);
    capNhatNhan();
    veLaiLich();
})();

// ====== 7. AVATAR DROPDOWN TOGGLE ======
document.addEventListener('click', (e) => {
    const toggle = e.target.closest('.avatar-toggle');
    const dropdown = document.querySelector('.avatar-dropdown-menu');
    if (toggle && dropdown) {
        dropdown.classList.toggle('show');
    } else if (dropdown && !e.target.closest('.avatar-dropdown-wrap')) {
        dropdown.classList.remove('show');
    }
});

// ====== 8. HIỂN THỊ THÔNG BÁO THÀNH CÔNG ======
document.addEventListener('DOMContentLoaded', () => {
    const showPopup = sessionStorage.getItem('showOutfitSuccessPopup');
    if (showPopup === '1') {
        sessionStorage.removeItem('showOutfitSuccessPopup');
        
        const successPopup = document.getElementById('successPopup');
        if (successPopup) {
            const sub = successPopup.querySelector('p');
            if (sub) sub.textContent = 'Bộ trang phục đã được thêm vào lịch thành công!';
            successPopup.style.display = 'flex';
            setTimeout(() => {
                successPopup.style.display = 'none';
            }, 3000);
        }
    }
});
