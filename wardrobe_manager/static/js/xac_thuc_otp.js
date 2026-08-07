// ============================================
// XÁC THỰC OTP - Ô NHẬP MÃ TỰ ĐỘNG
// ============================================
// Mô phỏng đúng giao diện nhập OTP thực tế:
// - Tự focus ô đầu tiên khi mở trang
// - Gõ 1 số -> tự nhảy sang ô kế tiếp
// - Bấm Backspace ở ô trống -> lùi về ô trước đó
// - Dán (paste) cả mã -> tự chia đều vào 6 ô
// - Chỉ cho phép nhập số (bỏ chữ & ký tự lạ)

// ====== 1. LẤY DANH SÁCH 6 Ô OTP ======
const otpBoxes = Array.from(document.querySelectorAll('.otp-box'));

// ====== 2. TỰ FOCUS Ô ĐẦU TIÊN KHI TẢI TRANG ======
if (otpBoxes.length > 0) {
    otpBoxes[0].focus();
}

// ====== 3. XỬ LÝ TỪNG Ô ======
otpBoxes.forEach((box, index) => {

    // --- 3.1. KHI GÕ LIỆU ---
    box.addEventListener('input', () => {
        // Chỉ giữ lại số, tối đa 1 ký tự
        box.value = box.value.replace(/[^0-9]/g, '').slice(0, 1);

        // Đã nhập số & chưa phải ô cuối -> nhảy sang ô kế tiếp
        if (box.value !== '' && index < otpBoxes.length - 1) {
            otpBoxes[index + 1].focus();
        } else if (box.value !== '' && index === otpBoxes.length - 1) {
            // Đã nhập xong ô cuối cùng -> Tự động submit
            const maOTP = otpBoxes.map(b => b.value).join('');
            if (maOTP.length === 6) {
                otpHidden.value = maOTP;
                otpForm.submit();
            }
        }
    });

    // --- 3.2. KHI BẤM PHÍM (xử lý lùi) ---
    box.addEventListener('keydown', (e) => {
        // Backspace ô đang trống -> lùi về ô trước và xoá số ở đó
        if (e.key === 'Backspace' && box.value === '' && index > 0) {
            e.preventDefault();
            otpBoxes[index - 1].focus();
            otpBoxes[index - 1].value = '';
        }
    });

    // --- 3.3. KHI DÁN (PASTE) CẢ MÃ OTP ---
    box.addEventListener('paste', (e) => {
        e.preventDefault();
        const code = (e.clipboardData || window.clipboardData).getData('text');
        const chiSo = code.replace(/[^0-9]/g, '').slice(0, otpBoxes.length);

        // Phân bổ từng số vào các ô
        chiSo.split('').forEach((so, i) => {
            if (otpBoxes[i]) otpBoxes[i].value = so;
        });

        // Focus ô ngay sau ô cuối đã điền (hoặc ô cuối cùng)
        const viTriTiep = Math.min(chiSo.length, otpBoxes.length - 1);
        otpBoxes[viTriTiep].focus();

        if (chiSo.length === 6) {
            otpHidden.value = chiSo;
            otpForm.submit();
        }
    });

    // --- 3.4. KHI FOCUS VÀO Ô CÓ SỐ -> CHỌN HẾT ĐỂ GHI ĐÈ DỄ DÀNG ---
    box.addEventListener('focus', () => {
        box.select();
    });
});


// ====== 4. KHI BẤM "XÁC NHẬN" -> GHÉP 6 Ô THÀNH 1 MÃ OTP RỒI GỬI ======
const otpForm = document.getElementById('otp-form');
const otpHidden = document.getElementById('otp-hidden');

otpForm.addEventListener('submit', (e) => {
    // Nối giá trị 6 ô lại thành 1 chuỗi
    const maOTP = otpBoxes.map(box => box.value).join('');

    // Chưa nhập đủ 6 số -> chặn gửi, focus lại ô đầu
    if (maOTP.length !== 6) {
        e.preventDefault();
        otpBoxes[0].focus();
        return;
    }

    // Đổ mã đã ghép vào ô ẩn -> server nhận được name="otp" = "999999"
    otpHidden.value = maOTP;
});



// 5. Countdown

const countdown = document.querySelector(".countdown")
let timer;

function startCountdown() {
    let timeleft = 60;

    clearInterval(timer);

    timer = setInterval(() => {
        const minutes = Math.floor(timeleft/60);
        const second = timeleft%60;

        countdown.textContent =
            `Gửi lại sau ${String(minutes).padStart(2, "0")}:${String(second).padStart(2,"0")}`;

       if (timeleft <= 0) {
           clearInterval(timer);
           countdown.innerHTML =
                '<a href="#" id="resendCode">Gửi lại mã</a>';
           document.getElementById("resendCode").addEventListener("click", function (e) {
                e.preventDefault();

                // Gửi lại OTP (trong môi trường dev, OTP luôn là 999999)
                alert("Đã gửi lại mã OTP (Dev mode: 999999).");

                startCountdown();
            });
        }

        timeleft--;
    }, 1000);
}

// Bắt đầu đếm ngược ngay khi mở trang
startCountdown();
