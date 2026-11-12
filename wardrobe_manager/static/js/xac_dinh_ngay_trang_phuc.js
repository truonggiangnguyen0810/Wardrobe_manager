// ============================================
// XÁC ĐỊNH NGÀY TRANG PHỤC - POPUP THỜI GIAN + LỊCH ĐỘNG
// ============================================
// - Bấm mũi tên xuống -> popup wheel (tháng/năm) trồi từ dưới lên.
// - Bấm "Xác nhận" -> đổi header + vẽ lại lưới ngày đúng tháng/năm đó.
// - Bấm vào 1 ngày -> đánh dấu chọn.

const ITEM_H = 40; // chiều cao 1 dòng wheel (khớp CSS)

// ====== 1. TRẠNG THÁI ======
const NAM_BAT_DAU = 2015;
const NAM_KET_THUC = 2035;

let thangHienTai = 7;    // tháng đang xem
let namHienTai = 2026;   // năm đang xem
let ngayDaChon = 14;     // ngày đang được chọn

// Dữ liệu mẫu: số trang phục theo ngày (demo)
const duLieuTrangPhuc = { 5: 2, 9: 1, 15: 3, 22: 1, 27: 2 };

// Ngày hôm nay thật (để bôi đậm bất kể đang chọn ngày nào)
const thoiGianThuc = new Date();
const namThuc = thoiGianThuc.getFullYear();
const thangThuc = thoiGianThuc.getMonth() + 1;
const ngayThuc = thoiGianThuc.getDate();

// ====== 2. LẤY CÁC PHẦN TỬ ======
const app = document.querySelector('.app-container');
const monthBtn = document.getElementById('monthBtn');
const monthText = document.getElementById('monthText');
const tpOverlay = document.getElementById('tpOverlay');
const tpCancel = document.getElementById('tpCancel');
const tpConfirm = document.getElementById('tpConfirm');
const wheelMonth = document.getElementById('tpWheelMonth');
const wheelYear = document.getElementById('tpWheelYear');
const datesGrid = document.querySelector('.dates-grid');

// ====== 3. WHEEL: DỰNG & ĐỌC GIÁ TRỊ ======
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

// ====== 4. TÍNH TOÁN NGÀY THÁNG ======
function soNgayTrongThang(nam, thang) {
    // thang 1..12; new Date(nam, thang, 0) = ngày cuối của tháng trước đó
    return new Date(nam, thang, 0).getDate();
}

function chiSoThuCuaNgayDau(nam, thang) {
    // Trả về 0=Thứ 2 ... 6=Chủ nhật (cho lưới bắt đầu bằng Thứ 2)
    const g = new Date(nam, thang - 1, 1).getDay(); // 0=CN .. 6=T7
    return (g + 6) % 7;
}

// ====== 5. VẼ LẠI LƯỚI NGÀY THEO THÁNG/NĂM HIỆN TẠI ======
function veLaiLich() {
    const soNgay = soNgayTrongThang(namHienTai, thangHienTai);
    const soDau = chiSoThuCuaNgayDau(namHienTai, thangHienTai);          // số ô dẫn đầu (tháng trước)
    const soNgayThangTruoc = soNgayTrongThang(namHienTai, thangHienTai - 1);

    // Nếu ngày đang chọn lớn hơn số ngày của tháng -> kẹp về ngày cuối
    if (ngayDaChon > soNgay) ngayDaChon = soNgay;

    let html = '';

    // Ô dẫn đầu (tháng trước)
    for (let i = soDau - 1; i >= 0; i--) {
        html += `<button class="date-cell prev-month has-tap">${soNgayThangTruoc - i}</button>`;
    }

    // Các ngày của tháng hiện tại
    for (let d = 1; d <= soNgay; d++) {
        const laNgayChon = (d === ngayDaChon);
        const laHomNay = (namHienTai === namThuc && thangHienTai === thangThuc && d === ngayThuc);
        let lop = laNgayChon ? 'date-cell selected' : 'date-cell has-tap';
        if (laHomNay) lop += ' today'; // bôi đậm ngày hôm nay
        const soTrangPhuc = duLieuTrangPhuc[d];
        const badge = soTrangPhuc ? `<span class="day-badge">${soTrangPhuc}</span>` : '';
        html += `<button class="${lop}" data-day="${d}">${d}${badge}</button>`;
    }

    // Ô phụ (tháng sau) - luôn lấp đủ 6 tuần (42 ô) để lịch cao đều
    let dem = soDau + soNgay;
    let keTiep = 1;
    while (dem < 42) {
        html += `<button class="date-cell next-month has-tap">${keTiep}</button>`;
        dem++;
        keTiep++;
    }

    datesGrid.innerHTML = html;
    ganSuKienChonNgay();
}

// ====== 6. BẤM CHỌN 1 NGÀY ======
function ganSuKienChonNgay() {
    datesGrid.querySelectorAll('.date-cell').forEach(cell => {
        if (cell.classList.contains('prev-month') || cell.classList.contains('next-month')) return;
        cell.addEventListener('click', () => {
            ngayDaChon = parseInt(cell.dataset.day, 10);
            // Bỏ selected ở ô cũ, trả lại has-tap
            datesGrid.querySelectorAll('.date-cell.selected').forEach(c => {
                c.classList.remove('selected');
                c.classList.add('has-tap');
            });
            cell.classList.add('selected');
            cell.classList.remove('has-tap');
        });
    });
}

// ====== 7. MỞ / ĐÓNG POPUP ======
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

// ====== 8. SỰ KIỆN ======
monthBtn.addEventListener('click', moPopup);
tpOverlay.addEventListener('click', dongPopup);
tpCancel.addEventListener('click', dongPopup);

tpConfirm.addEventListener('click', () => {
    const t = parseInt(giaTriDangChon(wheelMonth), 10);
    const n = parseInt(giaTriDangChon(wheelYear), 10);
    if (t) thangHienTai = t;
    if (n) namHienTai = n;
    monthText.textContent = `tháng ${thangHienTai} năm ${namHienTai}`;
    veLaiLich();       // vẽ lại lịch theo tháng/năm mới
    dongPopup();
});

// ====== 9. LƯỚT QUA 2 BÊN ĐỂ ĐỔI THÁNG ======
function chayHieuUng(huong) {
    datesGrid.classList.remove('anim-next', 'anim-prev');
    void datesGrid.offsetWidth; // ép render lại để chạy lại animation
    datesGrid.classList.add(huong === 'next' ? 'anim-next' : 'anim-prev');
}

function thangTruoc() {
    if (thangHienTai === 1 && namHienTai === NAM_BAT_DAU) return; // đúng giới hạn
    thangHienTai--;
    if (thangHienTai < 1) { thangHienTai = 12; namHienTai--; }
    monthText.textContent = `tháng ${thangHienTai} năm ${namHienTai}`;
    veLaiLich();
    chayHieuUng('prev'); // lướt phải -> tháng trước trượt từ trái vào
}
function thangTiep() {
    if (thangHienTai === 12 && namHienTai === NAM_KET_THUC) return; // đúng giới hạn
    thangHienTai++;
    if (thangHienTai > 12) { thangHienTai = 1; namHienTai++; }
    monthText.textContent = `tháng ${thangHienTai} năm ${namHienTai}`;
    veLaiLich();
    chayHieuUng('next'); // lướt trái -> tháng sau trượt từ phải vào
}

// Phát hiện lướt ngang trên vùng lịch (chuột & cảm ứng qua pointer events)
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
    // Chỉ tính lướt ngang (đủ xa & ngang trội hơn dọc)
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
        if (dx < 0) thangTiep();   // lướt sang trái  -> tháng sau
        else thangTruoc();         // lướt sang phải  -> tháng trước
    }
});

// ====== 10. KHỞI TẠO ======
(function khoiTao() {
    const thang = [];
    for (let t = 1; t <= 12; t++) thang.push({ giaTri: t, nhan: 'Tháng ' + t });
    const nam = [];
    for (let n = NAM_BAT_DAU; n <= NAM_KET_THUC; n++) nam.push({ giaTri: n, nhan: String(n) });
    dungWheel(wheelMonth, thang, thangHienTai);
    dungWheel(wheelYear, nam, namHienTai);
    veLaiLich();   // vẽ lịch ban đầu (tháng 7/2026)
})();
