document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('registerForm');
    const phoneInput = document.getElementById('phone');
    const phoneError = document.getElementById('phone-error');
    const submitBtn = document.getElementById('submitBtn');

    // Chỉ cho phép nhập số
    phoneInput.addEventListener('input', () => {
        phoneInput.value = phoneInput.value.replace(/[^0-9]/g, '').slice(0, 10);
        if (phoneInput.value.length > 0) {
            phoneError.textContent = '';
        }
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const sdt = phoneInput.value.trim();
        let hopLe = true;

        if (sdt === '') {
            phoneError.textContent = 'Vui lòng nhập số điện thoại';
            hopLe = false;
        } else if (!/^0\d{9}$/.test(sdt)) {
            phoneError.textContent = 'Số điện thoại không hợp lệ (10 số, bắt đầu bằng 0)';
            hopLe = false;
        }

        if (hopLe) {
            const noiDungCu = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.style.opacity = '0.7';
            submitBtn.innerHTML = 'Đang xử lý...';
            setTimeout(() => {
                form.submit();
            }, 1000);
        }
    });
});
