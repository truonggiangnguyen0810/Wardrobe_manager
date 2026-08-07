document.addEventListener('DOMContentLoaded', () => {
    // 1. Xử lý mở/đóng Action Sheet (chọn nguồn ảnh)
    const btnEditAvatar = document.getElementById('btnEditAvatar');
    const sheetOverlay = document.getElementById('sheetOverlay');
    const actionSheet = document.getElementById('actionSheet');
    const optCancel = document.getElementById('optCancel');

    function openSheet() {
        sheetOverlay.removeAttribute('hidden');
        actionSheet.removeAttribute('hidden');
        // Kích hoạt transition bằng cách thêm class (nếu có CSS)
        setTimeout(() => {
            sheetOverlay.classList.add('show');
            actionSheet.classList.add('show');
        }, 10);
    }

    function closeSheet() {
        sheetOverlay.classList.remove('show');
        actionSheet.classList.remove('show');
        setTimeout(() => {
            sheetOverlay.setAttribute('hidden', '');
            actionSheet.setAttribute('hidden', '');
        }, 200); 
    }

    if(btnEditAvatar) btnEditAvatar.addEventListener('click', openSheet);
    if(optCancel) optCancel.addEventListener('click', closeSheet);
    if(sheetOverlay) sheetOverlay.addEventListener('click', closeSheet);

    // 2. Kích hoạt input file
    const anhInput = document.getElementById('anhInput');
    const optCamera = document.getElementById('optCamera');
    const optLibrary = document.getElementById('optLibrary');

    if(optCamera) {
        optCamera.addEventListener('click', () => {
            anhInput.setAttribute('capture', 'environment'); // Mở camera
            anhInput.click();
            closeSheet();
        });
    }

    if(optLibrary) {
        optLibrary.addEventListener('click', () => {
            anhInput.removeAttribute('capture'); // Chọn từ thư viện
            anhInput.click();
            closeSheet();
        });
    }

    // 3. Hiển thị Preview ảnh sau khi chọn
    const avatarPreview = document.getElementById('avatarPreview');
    if(anhInput) {
        anhInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const url = URL.createObjectURL(file);
                avatarPreview.src = url;
                avatarPreview.onload = () => {
                    URL.revokeObjectURL(url); // Giải phóng bộ nhớ
                }
            }
        });
    }

    // 4. Xử lý phần Cài đặt gợi ý (Mở rộng / Thu gọn)
    const btnCaiDatGoiY = document.getElementById('btnCaiDatGoiY');
    const goiYSection = document.getElementById('goiYSection');

    if(btnCaiDatGoiY && goiYSection) {
        btnCaiDatGoiY.addEventListener('click', () => {
            const isExpanded = btnCaiDatGoiY.getAttribute('aria-expanded') === 'true';
            if (isExpanded) {
                btnCaiDatGoiY.setAttribute('aria-expanded', 'false');
                goiYSection.setAttribute('hidden', '');
            } else {
                btnCaiDatGoiY.setAttribute('aria-expanded', 'true');
                goiYSection.removeAttribute('hidden');
            }
        });
    }

    // 5. Đếm số ký tự cho textarea
    const quyDinhPhoiDo = document.getElementById('quyDinhPhoiDo');
    const goiYCount = document.getElementById('goiYCount');
    
    if(quyDinhPhoiDo && goiYCount) {
        function updateCharCount() {
            const currentLength = quyDinhPhoiDo.value.length;
            goiYCount.textContent = `${currentLength}/500`;
            if (currentLength >= 500) {
                goiYCount.classList.add('max-reached');
            } else {
                goiYCount.classList.remove('max-reached');
            }
        }
        quyDinhPhoiDo.addEventListener('input', updateCharCount);
        updateCharCount(); // Cập nhật ngay khi load
    }
});
