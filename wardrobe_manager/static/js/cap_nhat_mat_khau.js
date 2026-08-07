document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');
    const matKhauInput = document.querySelector('input[name="mat_khau"]');
    const xacNhanInput = document.querySelector('input[name="xac_nhan_mat_khau"]');
    const submitBtn = document.querySelector('.btn-submit');

    // Remove old error msg if typing
    [matKhauInput, xacNhanInput].forEach(input => {
        if(input) {
            input.addEventListener('input', () => {
                const errorMsg = document.querySelector('.error-msg');
                if (errorMsg) errorMsg.remove();
            });
        }
    });

    if(form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            let hopLe = true;
            let errorMessage = '';

            const mk = matKhauInput.value;
            const xm = xacNhanInput.value;

            if (mk === '' || xm === '') {
                errorMessage = 'Vui lòng điền đầy đủ 2 ô mật khẩu';
                hopLe = false;
            } else if (mk.length < 6) {
                errorMessage = 'Mật khẩu tối thiểu 6 ký tự';
                hopLe = false;
            } else if (mk !== xm) {
                errorMessage = 'Hai mật khẩu không khớp';
                hopLe = false;
            }

            if (!hopLe) {
                // Hiển thị lỗi tổng trên cùng
                let errorDiv = document.querySelector('.error-msg');
                if (!errorDiv) {
                    errorDiv = document.createElement('div');
                    errorDiv.className = 'error-msg';
                    errorDiv.style = 'color:#e53936;margin-bottom:12px;text-align:center';
                    const pageTitle = document.querySelector('.page-title');
                    pageTitle.parentNode.insertBefore(errorDiv, form);
                }
                errorDiv.textContent = errorMessage;
            } else {
                const noiDungCu = submitBtn.innerHTML;
                submitBtn.disabled = true;
                submitBtn.style.opacity = '0.7';
                submitBtn.innerHTML = 'Đang xử lý...';
                setTimeout(() => {
                    form.submit();
                }, 1000);
            }
        });
    }
});
