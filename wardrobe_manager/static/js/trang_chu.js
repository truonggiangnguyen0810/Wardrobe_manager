document.addEventListener('DOMContentLoaded', () => {
    // Popup Thêm món đồ
    const btnFab = document.getElementById('openFabSheet');
    const btnAddItem = document.getElementById('openAddItemSheet');

    const sheetOverlay = document.getElementById('sheetOverlay');
    const actionSheet = document.getElementById('actionSheet');
    const optCancel = document.getElementById('optCancel');

    function openActionSheet() {
        sheetOverlay.removeAttribute('hidden');
        actionSheet.removeAttribute('hidden');
        setTimeout(() => {
            sheetOverlay.classList.add('show');
            actionSheet.classList.add('show');
        }, 10);
    }

    function closeActionSheet() {
        sheetOverlay.classList.remove('show');
        actionSheet.classList.remove('show');
        setTimeout(() => {
            sheetOverlay.setAttribute('hidden', '');
            actionSheet.setAttribute('hidden', '');
        }, 300);
    }

    if (btnFab) btnFab.addEventListener('click', openActionSheet);
    if (btnAddItem) btnAddItem.addEventListener('click', openActionSheet);
    if (optCancel) optCancel.addEventListener('click', closeActionSheet);
    if (sheetOverlay) sheetOverlay.addEventListener('click', closeActionSheet);

    const optCamera = document.getElementById('optCamera');
    const optLibrary = document.getElementById('optLibrary');
    const fileInput = document.getElementById('fileInputLibrary');

    // Mở input file (chọn từ thư viện)
    if (optLibrary) {
        optLibrary.addEventListener('click', () => {
            closeActionSheet();
            fileInput.removeAttribute('capture');
            fileInput.click();
        });
    }

    // Mở input file (chụp ảnh) - Dùng native capture trên mobile
    if (optCamera) {
        optCamera.addEventListener('click', () => {
            closeActionSheet();
            fileInput.setAttribute('capture', 'environment');
            fileInput.click();
        });
    }

    // Xử lý khi chọn xong file
    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onloadend = () => {
                    sessionStorage.setItem('new_item_image_base64', reader.result);
                    window.location.href = '/them-mon-do/';
                };
            }
        });
    }

    // Logic cho popup Tạo trang phục
    const btnCreateOutfit = document.getElementById('openOutfitCreateSheet');
    const outfitSheetOverlay = document.getElementById('outfitSheetOverlay');
    const outfitActionSheet = document.getElementById('outfitActionSheet');
    const closeOutfitSheetBtn = document.getElementById('closeOutfitSheet');

    function openOutfitSheet() {
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
        }, 300); // 300ms transition
    }

    if (btnCreateOutfit) {
        btnCreateOutfit.addEventListener('click', openOutfitSheet);
    }
    if (closeOutfitSheetBtn) {
        closeOutfitSheetBtn.addEventListener('click', closeOutfitSheet);
    }
    if (outfitSheetOverlay) {
        outfitSheetOverlay.addEventListener('click', closeOutfitSheet);
    }

    // Avatar Dropdown Toggle
    document.addEventListener('click', (e) => {
        const toggle = e.target.closest('.avatar-toggle');
        const dropdown = document.querySelector('.avatar-dropdown-menu');
        if (toggle && dropdown) {
            dropdown.classList.toggle('show');
        } else if (dropdown && !e.target.closest('.avatar-dropdown-wrap')) {
            dropdown.classList.remove('show');
        }
    });
});
