// Bỏ block default của thẻ danh mục để thẻ a href hoạt động bình thường

document.addEventListener('DOMContentLoaded', () => {
    // 1. FILTER MODAL
    const btnFilter = document.querySelector('.btn-filter');
    const filterOverlay = document.getElementById('filterOverlay');
    const filterSheet = document.getElementById('filterSheet');
    const btnCancelFilter = document.getElementById('btnCancelFilter');

    function openFilter() {
        filterOverlay.removeAttribute('hidden');
        filterSheet.removeAttribute('hidden');
        setTimeout(() => {
            filterOverlay.classList.add('show');
            filterSheet.classList.add('show');
        }, 10);
    }
    function closeFilter() {
        filterOverlay.classList.remove('show');
        filterSheet.classList.remove('show');
        setTimeout(() => {
            filterOverlay.setAttribute('hidden', '');
            filterSheet.setAttribute('hidden', '');
        }, 300);
    }

    if(btnFilter) btnFilter.addEventListener('click', openFilter);
    if(btnCancelFilter) btnCancelFilter.addEventListener('click', closeFilter);
    if(filterOverlay) filterOverlay.addEventListener('click', closeFilter);

    // 2. CHUYỂN HƯỚNG THÊM MÓN ĐỒ
    const btnFab = document.getElementById('openFabSheet');
    const btnCreate = document.getElementById('openCreateCard');

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

    if(btnFab) btnFab.addEventListener('click', openActionSheet);
    if(btnCreate) btnCreate.addEventListener('click', openActionSheet);
    if(optCancel) optCancel.addEventListener('click', closeActionSheet);
    if(sheetOverlay) sheetOverlay.addEventListener('click', closeActionSheet);

    const optCamera = document.getElementById('optCamera');
    const optLibrary = document.getElementById('optLibrary');
    const fileInput = document.getElementById('fileInputLibrary');

    // Mở input file (chọn từ thư viện)
    if(optLibrary) {
        optLibrary.addEventListener('click', () => {
            closeActionSheet();
            fileInput.removeAttribute('capture');
            fileInput.click();
        });
    }

    // Mở input file (chụp ảnh) - Dùng native capture trên mobile
    if(optCamera) {
        optCamera.addEventListener('click', () => {
            closeActionSheet();
            fileInput.setAttribute('capture', 'environment');
            fileInput.click();
        });
    }

    // Xử lý khi chọn xong file
    if(fileInput) {
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if(file) {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onloadend = () => {
                    sessionStorage.setItem('new_item_image_base64', reader.result);
                    window.location.href = '/them-mon-do/';
                };
            }
        });
    }

    // Hàm tiện ích lấy cookie (cho CSRF)
    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    // 3. XỬ LÝ ĐÁNH GIÁ (RATING WIDGET)
    const stars = document.querySelectorAll('#filterStarRating .star');
    const hiddenRating = document.getElementById('hiddenFilterRating');
    const displayRating = document.getElementById('filterRatingValue');
    let currentRating = 0;

    function updateStars(rating) {
        stars.forEach(star => {
            const val = parseInt(star.getAttribute('data-value'));
            if (val <= rating) {
                star.style.color = '#ffc107'; // Vàng
                star.setAttribute('fill', '#ffc107');
            } else {
                star.style.color = 'var(--xamdam)'; // Xám
                star.setAttribute('fill', 'none');
            }
        });
        displayRating.textContent = rating;
    }

    stars.forEach(star => {
        star.addEventListener('mouseover', function() {
            updateStars(parseInt(this.getAttribute('data-value')));
        });
        
        star.addEventListener('mouseout', function() {
            updateStars(currentRating);
        });

        star.addEventListener('click', function() {
            currentRating = parseInt(this.getAttribute('data-value'));
            hiddenRating.value = currentRating;
            updateStars(currentRating);
        });
    });

    // Tự động khôi phục dữ liệu bộ lọc từ URL (nếu có)
    const urlParams = new URLSearchParams(window.location.search);
    if(urlParams.has('danh_gia')) {
        const urlRating = parseInt(urlParams.get('danh_gia'));
        if(!isNaN(urlRating) && urlRating > 0 && urlRating <= 5) {
            currentRating = urlRating;
            hiddenRating.value = urlRating;
            updateStars(urlRating);
        }
    }
    
    // Tự động check các checkbox
    ['mua', 'phong_cach', 'form_dang', 'mau_sac', 'chat_lieu'].forEach(param => {
        const values = urlParams.getAll(param);
        if (values.length > 0) {
            values.forEach(val => {
                const cb = document.querySelector(`input[name="${param}"][value="${val}"]`);
                if(cb) {
                    cb.checked = true;
                    cb.parentElement.classList.add('selected');
                }
            });
        }
    });

    // 4. TÌM KIẾM TRỰC TIẾP TẠI TRANG (LIVE SEARCH)
    const searchInput = document.querySelector('.search-box input');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase().trim();
            const productCards = document.querySelectorAll('.product-grid .product-card');
            
            productCards.forEach(card => {
                const productNameEl = card.querySelector('.product-name');
                if (productNameEl) {
                    const name = productNameEl.textContent.toLowerCase();
                    if (name.includes(searchTerm)) {
                        card.style.display = 'flex'; // Trả về display mặc định (trong css là flex)
                    } else {
                        card.style.display = 'none';
                    }
                }
            });
        });
    }

    // 5. CHẾ ĐỘ XÓA MÓN ĐỒ (LONG PRESS)
    let isSelectionMode = false;
    let selectedItems = new Set();
    const deletionBar = document.getElementById('deletionBar');
    const deleteCountText = document.getElementById('deleteCountText');
    const btnCancelDelete = document.getElementById('btnCancelDelete');
    const btnConfirmDelete = document.getElementById('btnConfirmDelete');
    
    const selectableCards = document.querySelectorAll('.selectable-card');

    function updateDeleteUI() {
        if (isSelectionMode) {
            deletionBar.style.visibility = 'visible';
            deletionBar.style.transform = 'translateY(0)';
            deleteCountText.textContent = `Đã chọn ${selectedItems.size}`;
            selectableCards.forEach(card => card.classList.add('in-selection-mode'));
        } else {
            deletionBar.style.transform = 'translateY(100%)';
            setTimeout(() => { deletionBar.style.visibility = 'hidden'; }, 300);
            selectedItems.clear();
            selectableCards.forEach(card => {
                card.classList.remove('in-selection-mode', 'is-selected');
            });
        }
    }

    function toggleCardSelection(card) {
        const id = card.dataset.id;
        if (selectedItems.has(id)) {
            selectedItems.delete(id);
            card.classList.remove('is-selected');
        } else {
            selectedItems.add(id);
            card.classList.add('is-selected');
        }
    }

    selectableCards.forEach(card => {
        let pressTimer;
        let isMoved = false;
        let ignoreClick = false;

        const startPress = (e) => {
            isMoved = false;
            ignoreClick = false;
            if (isSelectionMode) return; 
            pressTimer = setTimeout(() => {
                if (!isMoved) {
                    isSelectionMode = true;
                    ignoreClick = true;
                    toggleCardSelection(card);
                    updateDeleteUI();
                }
            }, 500);
        };
        const cancelPress = () => {
            clearTimeout(pressTimer);
        };
        const onMove = () => {
            isMoved = true;
            clearTimeout(pressTimer);
        };

        // Mobile touch events
        card.addEventListener('touchstart', startPress, {passive: true});
        card.addEventListener('touchend', cancelPress);
        card.addEventListener('touchmove', onMove, {passive: true});
        
        // Desktop mouse events
        card.addEventListener('mousedown', startPress);
        card.addEventListener('mouseup', cancelPress);
        card.addEventListener('mouseleave', cancelPress);
        card.addEventListener('mousemove', onMove);

        // Xử lý Click
        card.addEventListener('contextmenu', (e) => {
            e.preventDefault(); // Chống hiện menu mặc định khi nhấn giữ
        });
        
        card.addEventListener('click', (e) => {
            if (ignoreClick) {
                e.preventDefault();
                e.stopPropagation();
                ignoreClick = false;
                return;
            }
            if (isSelectionMode) {
                e.preventDefault();
                e.stopPropagation();
                toggleCardSelection(card);
                updateDeleteUI();
            } else {
                // Điều hướng bình thường
                window.location.href = card.dataset.url;
            }
        });
    });

    if (btnCancelDelete) {
        btnCancelDelete.addEventListener('click', () => {
            isSelectionMode = false;
            updateDeleteUI();
        });
    }

    const confirmDeleteModal = document.getElementById('confirmDeleteModal');
    const btnCancelModal = document.getElementById('btnCancelModal');
    const btnConfirmModal = document.getElementById('btnConfirmModal');

    if (btnConfirmDelete) {
        btnConfirmDelete.addEventListener('click', () => {
            if (selectedItems.size === 0) return;
            if (confirmDeleteModal) confirmDeleteModal.style.display = 'flex';
        });
    }

    if (btnCancelModal) {
        btnCancelModal.addEventListener('click', () => {
            if (confirmDeleteModal) confirmDeleteModal.style.display = 'none';
        });
    }

    if (btnConfirmModal) {
        btnConfirmModal.addEventListener('click', async () => {
            if (selectedItems.size === 0) return;
            
            btnConfirmModal.textContent = 'Đang xóa...';
            btnConfirmModal.style.opacity = '0.7';
            btnConfirmModal.style.pointerEvents = 'none';

            try {
                const response = await fetch('/api/xoa-mon-do/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': getCookie('csrftoken')
                    },
                    body: JSON.stringify({ ids: Array.from(selectedItems) })
                });

                if (response.ok) {
                    sessionStorage.setItem('successPopupMsg', 'Đã xóa món đồ thành công!');
                    window.location.reload();
                } else {
                    const data = await response.json();
                    alert(data.error || 'Có lỗi xảy ra khi xóa món đồ.');
                    btnConfirmModal.textContent = 'Xác nhận';
                    btnConfirmModal.style.opacity = '1';
                    btnConfirmModal.style.pointerEvents = 'auto';
                }
            } catch (err) {
                console.error(err);
                alert('Lỗi kết nối.');
                btnConfirmModal.textContent = 'Xác nhận';
                btnConfirmModal.style.opacity = '1';
                btnConfirmModal.style.pointerEvents = 'auto';
            }
        });
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
