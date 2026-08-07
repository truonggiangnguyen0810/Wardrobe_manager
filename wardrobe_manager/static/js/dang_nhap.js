// ============================================
// ĐĂNG NHẬP - FORM THẬT
// ============================================
// - Bật/tắt hiện mật khẩu (đổi icon con mắt mở/đóng)
// - Ô số điện thoại: chỉ cho nhập số
// - Kiểm tra dữ liệu khi bấm "Tiếp tục":
//     + SĐT: không trống, đúng 10 số và bắt đầu bằng 0
//     + Mật khẩu: không trống, tối thiểu 6 ký tự
// - Hiện thông báo lỗi dưới từng ô, tự xoá khi gõ lại
// - Khi hợp lệ: nút chuyển sang "Đang xử lý..." (giả lập gửi)

// ====== 1. LẤY CÁC PHẦN TỬ CẦN DÙNG ======
const form = document.querySelector('.login-form');
const phoneInput = document.getElementById('phone');
const passwordInput = document.getElementById('password');
const toggleBtn = document.getElementById('toggle-password');

// ====== 2. BẬT/TẮT HIỆN MẬT KHẨU ======
// 2 biểu tượng: mắt mở & mắt gạch (đóng)
const iconMatMo = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>';
const iconMatDong = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>';

toggleBtn.addEventListener('click', () => {
    const dangHien = passwordInput.type === 'text';
    if (dangHien) {
        // Đang hiện -> chuyển sang ẩn
        passwordInput.type = 'password';
        toggleBtn.innerHTML = iconMatMo;
        toggleBtn.setAttribute('aria-label', 'Hiện mật khẩu');
    } else {
        // Đang ẩn -> chuyển sang hiện
        passwordInput.type = 'text';
        toggleBtn.innerHTML = iconMatDong;
        toggleBtn.setAttribute('aria-label', 'Ẩn mật khẩu');
    }
});

// ====== 3. Ô SỐ ĐIỆN THOẠI: CHỈ NHẬP SỐ ======
phoneInput.addEventListener('input', () => {
    phoneInput.value = phoneInput.value.replace(/[^0-9]/g, '').slice(0, 10);
    xoaLoi(phoneInput);
});

// Gõ lại ở ô mật khẩu -> xoá lỗi
passwordInput.addEventListener('input', () => xoaLoi(passwordInput));

// ====== 4. HÀM HIỂN THỊ / XOÁ LỖI ======
function hienLoi(input, noiDung) {
    input.classList.add('is-error');
    const thongBao = input.closest('.input-group').querySelector('.error-msg');
    if (thongBao) thongBao.textContent = noiDung;
}

function xoaLoi(input) {
    if (!input.classList.contains('is-error')) return;
    input.classList.remove('is-error');
    const thongBao = input.closest('.input-group').querySelector('.error-msg');
    if (thongBao) thongBao.textContent = '';
}

// ====== 5. KIỂM TRA KHI BẤM "TIẾP TỤC" ======
form.addEventListener('submit', (e) => {
    e.preventDefault();

    const sdt = phoneInput.value.trim();
    const mk = passwordInput.value;
    let hopLe = true;

    // --- Kiểm tra số điện thoại ---
    if (sdt === '') {
        hienLoi(phoneInput, 'Vui lòng nhập số điện thoại');
        hopLe = false;
    } else if (!/^0\d{9}$/.test(sdt)) {
        hienLoi(phoneInput, 'Số điện thoại không hợp lệ (10 số, bắt đầu bằng 0)');
        hopLe = false;
    } else {
        xoaLoi(phoneInput);
    }

    // --- Kiểm tra mật khẩu ---
    if (mk === '') {
        hienLoi(passwordInput, 'Vui lòng nhập mật khẩu');
        hopLe = false;
    } else if (mk.length < 6) {
        hienLoi(passwordInput, 'Mật khẩu tối thiểu 6 ký tự');
        hopLe = false;
    } else {
        xoaLoi(passwordInput);
    }

    // --- Hợp lệ: giả lập đang xử lý ---
    if (hopLe) {
        const nut = form.querySelector('.btn-primary');
        const noiDungCu = nut.innerHTML;
        nut.disabled = true;
        nut.style.opacity = '0.7';
        nut.innerHTML = 'Đang xử lý...';
        setTimeout(() => {
            form.submit();
        }, 1500);
    }
});
