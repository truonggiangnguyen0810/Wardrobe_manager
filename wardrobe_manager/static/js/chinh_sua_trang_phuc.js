// ============================================
// CHỈNH SỬA TRANG PHỤC - ĐÁNH GIÁ SAO
// ============================================
// - 5 ngôi sao (thang 0-5)
// - Bấm ngôi sao thứ N (từ trái qua) -> bôi vàng N sao + hiện số N ở ô bên trái
// - Bấm lại đúng ngôi sao đang ở mức cao nhất -> đặt lại về 0

// ====== 1. LẤY CÁC NGÔI SAO & Ô SỐ SAO ======
const cacSao = Array.from(document.querySelectorAll('.rating-stars .star'));
const oSoSao = document.querySelector('.rating-count');
let soSaoHienTai = 0;

// ====== 2. HÀM CẬP NHẬT TRẠNG THÁI SAO ======
function capNhat(soSao) {
    soSaoHienTai = soSao;
    cacSao.forEach((sao, viTri) => {
        // Các sao từ 0 đến (soSao-1) được bôi vàng
        if (viTri < soSao) {
            sao.classList.add('active');
        } else {
            sao.classList.remove('active');
        }
    });
    if (oSoSao) oSoSao.textContent = soSao;
    
    const ratingInput = document.getElementById('rating_input');
    if (ratingInput) ratingInput.value = soSao;
}

// ====== 3. GẮN SỰ KIỆN BẤM CHO TỪNG NGÔI SAO ======
cacSao.forEach((sao, viTri) => {
    sao.addEventListener('click', () => {
        const soSaoDuocChon = viTri + 1; // ngôi sao thứ (viTri + 1)
        // Đang ở mức này rồi -> bấm lại thì về 0
        if (soSaoHienTai === soSaoDuocChon) {
            capNhat(0);
        } else {
            capNhat(soSaoDuocChon);
        }
    });
});

// ====== 4. TRẠNG THÁI BAN ĐẦU: 0 SAO ======
capNhat(0);

// ====== ACCORDION & CHIP SELECTION LOGIC ======
window.toggleAccordion = function(id) {
    const acc = document.getElementById(id);
    if (acc) {
        if (acc.style.display === 'none' || !acc.style.display) {
            acc.style.display = 'block';
        } else {
            acc.style.display = 'none';
        }
    }
};

window.updateCheckboxSelection = function(inputName, textId) {
    const checkboxes = document.querySelectorAll(`input[name="${inputName}"]:checked`);
    const textEl = document.getElementById(textId);
    if (!textEl) return;
    
    if (checkboxes.length === 0) {
        textEl.textContent = inputName === 'form_dang' ? 'Thêm form dáng' : 'Thêm mùa';
    } else {
        const selectedTexts = Array.from(checkboxes).map(cb => cb.getAttribute('data-text') || cb.value);
        textEl.textContent = selectedTexts.join(', ');
    }
};

window.showKhacInput = function(prefix) {
    const wrap = document.getElementById(prefix + '_khac_input_wrap');
    const chip = document.getElementById(prefix + '_khac_chip');
    if(wrap && chip) {
        wrap.style.display = 'block';
        chip.style.display = 'none';
        document.getElementById(prefix + '_khac_input').focus();
    }
};

window.confirmKhac = function(prefix) {
    const inputEl = document.getElementById(prefix + '_khac_input');
    const val = inputEl.value.trim();
    const wrap = document.getElementById(prefix + '_khac_input_wrap');
    const chip = document.getElementById(prefix + '_khac_chip');
    const hiddenCb = document.getElementById(prefix + '_khac_cb');
    const hiddenVal = document.getElementById(prefix + '_khac_val');

    if(val !== '') {
        hiddenCb.checked = true;
        hiddenVal.value = val;
        
        chip.textContent = val;
        chip.style.borderStyle = 'solid';
        chip.classList.add('selected');
        chip.onclick = function() {
            if (chip.classList.contains('selected')) {
                chip.classList.remove('selected');
                hiddenCb.checked = false;
            } else {
                chip.classList.add('selected');
                hiddenCb.checked = true;
            }
        };
        
        wrap.style.display = 'none';
        chip.style.display = 'inline-flex';
    } else {
        wrap.style.display = 'none';
        chip.style.display = 'inline-flex';
    }
};

// ====== 5. LOGIC MỞ POPUP CHỌN MÓN ĐỒ ======
const btnOpenWardrobe = document.getElementById('btnOpenWardrobe');
const wardrobeSheetOverlay = document.getElementById('wardrobeSheetOverlay');
const wardrobeActionSheet = document.getElementById('wardrobeActionSheet');
const closeWardrobeSheetBtn = document.getElementById('closeWardrobeSheet');
const clothingGrid = document.getElementById('clothingGrid');

function openWardrobeSheet() {
    wardrobeSheetOverlay.removeAttribute('hidden');
    wardrobeActionSheet.removeAttribute('hidden');
    setTimeout(() => {
        wardrobeSheetOverlay.style.opacity = '1';
        wardrobeSheetOverlay.style.pointerEvents = 'auto';
        wardrobeActionSheet.style.transform = 'translateY(0)';
    }, 10);
}

function closeWardrobeSheet() {
    wardrobeSheetOverlay.style.opacity = '0';
    wardrobeSheetOverlay.style.pointerEvents = 'none';
    wardrobeActionSheet.style.transform = 'translateY(100%)';
    setTimeout(() => {
        wardrobeSheetOverlay.setAttribute('hidden', '');
        wardrobeActionSheet.setAttribute('hidden', '');
    }, 300);
}

if (btnOpenWardrobe) {
    btnOpenWardrobe.addEventListener('click', openWardrobeSheet);
}
if (closeWardrobeSheetBtn) {
    closeWardrobeSheetBtn.addEventListener('click', closeWardrobeSheet);
}
if (wardrobeSheetOverlay) {
    wardrobeSheetOverlay.addEventListener('click', closeWardrobeSheet);
}

window.selectedWardrobeItems = [];

window.toggleSelectWardrobeItem = function(element, imageUrl, itemName, itemId) {
    const circle = element.querySelector('.select-circle');
    const icon = element.querySelector('.check-icon');
    
    // Kiểm tra xem đã chọn chưa
    const isSelected = circle.style.background === 'rgb(17, 17, 17)' || circle.style.background === '#111';
    
    if (isSelected) {
        // Bỏ chọn
        circle.style.background = '#fff';
        circle.style.borderColor = '#ddd';
        icon.style.opacity = '0';
        icon.style.transform = 'scale(0.5)';
        
        // Xóa khỏi mảng
        window.selectedWardrobeItems = window.selectedWardrobeItems.filter(item => item.url !== imageUrl);
    } else {
        // Chọn
        circle.style.background = '#111';
        circle.style.borderColor = '#111';
        icon.style.opacity = '1';
        icon.style.transform = 'scale(1)';
        
        // Thêm vào mảng
        window.selectedWardrobeItems.push({url: imageUrl, name: itemName, id: itemId});
    }
};

// Xử lý nút "Tiếp theo"
const btnNextWardrobe = document.getElementById('btnNextWardrobe');
if (btnNextWardrobe) {
    btnNextWardrobe.addEventListener('click', () => {
        if (window.selectedWardrobeItems.length === 0) {
            closeWardrobeSheet();
            return;
        }
        
        window.selectedWardrobeItems.forEach(item => {
            const newItem = document.createElement('div');
            newItem.className = 'clothing-item has-tap selected-outfit-item';
            if (item.id) {
                newItem.dataset.id = item.id;
            }
            newItem.innerHTML = `
                <img src="${item.url}" alt="${item.name}">
                <div class="remove-btn" style="position: absolute; top: 8px; right: 8px; width: 24px; height: 24px; background: rgba(0,0,0,0.5); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: bold; cursor: pointer; z-index: 2;">&times;</div>
            `;
            
            // Xóa item khi click vào dấu x
            const removeBtn = newItem.querySelector('.remove-btn');
            removeBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                newItem.remove();
            });

            // Chèn item mới vào TRƯỚC nút dấu +
            clothingGrid.insertBefore(newItem, btnOpenWardrobe);
        });
        
        // Reset lựa chọn
        window.selectedWardrobeItems = [];
        document.querySelectorAll('.wardrobe-item .select-circle').forEach(circle => {
            circle.style.background = '#fff';
            circle.style.borderColor = '#ddd';
        });
        document.querySelectorAll('.wardrobe-item .check-icon').forEach(icon => {
            icon.style.opacity = '0';
            icon.style.transform = 'scale(0.5)';
        });
        
        // Đóng popup
        closeWardrobeSheet();
    });
}

// Xử lý Tabs danh mục
const tabs = document.querySelectorAll('.wardrobe-tabs .tab');
const items = document.querySelectorAll('.wardrobe-item');

tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        // Cập nhật giao diện tab
        tabs.forEach(t => {
            t.classList.remove('active');
            t.style.fontWeight = '500';
            t.style.color = '#777';
            const indicator = t.querySelector('.tab-indicator');
            if (indicator) indicator.style.display = 'none';
        });
        tab.classList.add('active');
        tab.style.fontWeight = '700';
        tab.style.color = '#111';
        const indicator = tab.querySelector('.tab-indicator');
        if (indicator) indicator.style.display = 'block';

        // Lọc item
        const categoryId = tab.getAttribute('data-category');
        items.forEach(item => {
            if (categoryId === 'all' || item.getAttribute('data-category') === categoryId) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    });
});

// Xử lý Tìm kiếm
const searchInput = document.getElementById('wardrobeSearchInput');
if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        const text = e.target.value.toLowerCase().trim();
        const activeTab = document.querySelector('.wardrobe-tabs .tab.active');
        const activeCategory = activeTab ? activeTab.getAttribute('data-category') : 'all';

        items.forEach(item => {
            const name = item.querySelector('.wardrobe-item-name').textContent.toLowerCase();
            const itemCategory = item.getAttribute('data-category');
            
            const matchesCategory = (activeCategory === 'all' || itemCategory === activeCategory);
            const matchesSearch = name.includes(text);

            if (matchesCategory && matchesSearch) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    });
}

// ====== 6. GỬI DỮ LIỆU LƯU TRANG PHỤC ======
const btnSubmitOutfit = document.getElementById('btnSubmitOutfit');
if (btnSubmitOutfit) {
    const urlParams = new URLSearchParams(window.location.search);
    const ngayMacParam = urlParams.get('ngay_mac');
    if (ngayMacParam) {
        btnSubmitOutfit.textContent = 'Thêm vào lịch trang phục';
    }

    btnSubmitOutfit.addEventListener('click', function(e) {
        e.preventDefault(); 
        
        const errorMsg = document.getElementById('outfitErrorMsg');
        if (errorMsg) errorMsg.style.display = 'none';

        // Lấy tên trang phục
        const tenTrangPhucInput = document.getElementById('ten_trang_phuc');
        const tenTrangPhuc = tenTrangPhucInput ? tenTrangPhucInput.value.trim() : "";

        // Lấy đánh giá
        const rating = parseInt(document.getElementById('rating_input').value) || 0;

        // Lấy danh sách ID món đồ từ grid (những element có class selected-outfit-item)
        const itemEls = document.querySelectorAll('.selected-outfit-item');
        const itemIds = [];
        itemEls.forEach(el => {
            if (el.dataset.id) {
                itemIds.push(parseInt(el.dataset.id));
            }
        });

        if (itemIds.length < 2) {
            if (errorMsg) {
                errorMsg.textContent = "Vui lòng chọn ít nhất 2 món đồ vào bộ trang phục.";
                errorMsg.style.display = 'block';
                errorMsg.scrollIntoView({behavior: "smooth", block: "center"});
            } else {
                alert("Vui lòng chọn ít nhất 2 món đồ vào bộ trang phục.");
            }
            return;
        }

        // Lấy danh sách Mùa
        const muaIds = [];
        document.querySelectorAll('input[name="mua"]:checked').forEach(cb => {
            if (cb.value !== 'khac') {
                muaIds.push(parseInt(cb.value));
            }
        });
        const muaKhac = document.getElementById('mua_khac_cb')?.checked ? document.getElementById('mua_khac_val').value : "";

        // Lấy danh sách Form dáng
        const formDangIds = [];
        document.querySelectorAll('input[name="form_dang"]:checked').forEach(cb => {
            if (cb.value !== 'khac') {
                formDangIds.push(parseInt(cb.value));
            }
        });
        const formDangKhac = document.getElementById('form_dang_khac_cb')?.checked ? document.getElementById('form_dang_khac_val').value : "";
        
        let trangPhucId = window.CURRENT_OUTFIT_ID || new URLSearchParams(window.location.search).get('id') || null;

        // Tạo object JSON để gửi đi
        const data = {
            trang_phuc_id: trangPhucId, // Nếu đang chỉnh sửa trang phục đã có thì truyền id vào đây
            ten_trang_phuc: tenTrangPhuc,
            rating: rating,
            item_ids: itemIds,
            mua: muaIds,
            mua_khac: muaKhac,
            form_dang: formDangIds,
            form_dang_khac: formDangKhac,
            phong_cach: [],
            phong_cach_khac: "",
            ngay_mac: ngayMacParam
        };

        // Gửi qua API
        fetch('/api/luu-trang-phuc/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]') ? document.querySelector('[name=csrfmiddlewaretoken]').value : ''
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(result => {
            if (result.error) {
                alert("Lỗi: " + result.error);
            } else {
                sessionStorage.setItem('showOutfitSuccessPopup', '1');
                if (ngayMacParam) {
                    window.location.href = '/lich-trang-phuc/';
                } else {
                    window.location.href = '/sach_trang_phuc/';
                }
            }
        })
        .catch(err => {
            console.error(err);
            alert("Đã xảy ra lỗi khi lưu trang phục.");
        });
    });
}

    // ====== INITIALIZE EDIT MODE ======
    function loadOutfitData(data) {
        if (!data) return;
        
        // Cập nhật ID ẩn nếu có
        let urlParams = new URLSearchParams(window.location.search);
        let currentUrl = new URL(window.location.href);
        if (data.id) {
            window.CURRENT_OUTFIT_ID = data.id;
            if (!urlParams.has('xem_ngay')) {
                currentUrl.searchParams.set('id', data.id);
                window.history.replaceState({}, '', currentUrl);
            }
        } else {
            window.CURRENT_OUTFIT_ID = null;
        }

        // 1. Tên trang phục
        const tenTrangPhucInput = document.getElementById('ten_trang_phuc');
        if (tenTrangPhucInput) {
            tenTrangPhucInput.value = data.ten_trang_phuc || '';
        }

        // 2. Rating
        if (typeof data.rating !== 'undefined') {
            capNhat(data.rating);
        } else {
            capNhat(0);
        }

        // 3. Hình ảnh món đồ
        const clothingGrid = document.querySelector('.clothing-grid');
        const btnOpenWardrobe = document.getElementById('btnOpenWardrobe');
        if (clothingGrid && btnOpenWardrobe) {
            // Xóa các món đồ cũ
            document.querySelectorAll('.selected-outfit-item').forEach(el => el.remove());
            
            if (data.items && data.items.length > 0) {
                data.items.forEach(item => {
                    const newItem = document.createElement('div');
                    newItem.className = 'clothing-item has-tap selected-outfit-item';
                    newItem.dataset.id = item.id;
                    newItem.innerHTML = `
                        <img src="${item.image_url}" alt="Món đồ">
                        <div class="remove-btn" style="position: absolute; top: 8px; right: 8px; width: 24px; height: 24px; background: rgba(0,0,0,0.5); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: bold; cursor: pointer; z-index: 2;">&times;</div>
                    `;
                    
                    const removeBtn = newItem.querySelector('.remove-btn');
                    removeBtn.addEventListener('click', function(e) {
                        e.stopPropagation();
                        newItem.remove();
                    });

                    clothingGrid.insertBefore(newItem, btnOpenWardrobe);
                });
            }
        }

        // Reset check boxes
        document.querySelectorAll('.filter-chip.selected input[type="checkbox"]').forEach(cb => {
            cb.checked = false;
            cb.parentElement.classList.remove('selected');
        });

        // 4. Mùa
        if (data.mua && data.mua.length > 0) {
            data.mua.forEach(ma => {
                const cb = document.querySelector(`input[name="mua"][value="${ma}"]`);
                if (cb) {
                    cb.checked = true;
                    cb.parentElement.classList.add('selected');
                }
            });
        }

        // 5. Form dáng
        if (data.form_dang && data.form_dang.length > 0) {
            data.form_dang.forEach(ma => {
                const cb = document.querySelector(`input[name="form_dang"][value="${ma}"]`);
                if (cb) {
                    cb.checked = true;
                    cb.parentElement.classList.add('selected');
                }
            });
        }
    }

    if (window.DAY_OUTFITS_DATA && window.DAY_OUTFITS_DATA.length > 0) {
        if (window.DAY_OUTFITS_DATA[0].error) {
            alert("Lỗi từ server: " + window.DAY_OUTFITS_DATA[0].error);
            return;
        }
        let currentIndex = 0;
        const total = window.DAY_OUTFITS_DATA.length;
        const screenTitle = document.getElementById('screenTitle');

        function updateView() {
            if (screenTitle) {
                screenTitle.textContent = `Trang phục ${currentIndex + 1}/${total}`;
            }
            loadOutfitData(window.DAY_OUTFITS_DATA[currentIndex]);
        }

        updateView();

        // Lướt sang trái/phải để chuyển trang phục
        let startX = 0;
        let startY = 0;
        let isSwiping = false;
        const mainContent = document.querySelector('.main-content');
        
        if (mainContent) {
            mainContent.addEventListener('pointerdown', (e) => {
                startX = e.clientX;
                startY = e.clientY;
                isSwiping = true;
            });

            mainContent.addEventListener('pointerup', (e) => {
                if (!isSwiping) return;
                isSwiping = false;
                const dx = e.clientX - startX;
                const dy = e.clientY - startY;

                if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) {
                    if (dx < 0) {
                        // Vuốt sang trái -> trang phục tiếp theo
                        if (currentIndex < total - 1) {
                            currentIndex++;
                            updateView();
                        }
                    } else {
                        // Vuốt sang phải -> trang phục trước
                        if (currentIndex > 0) {
                            currentIndex--;
                            updateView();
                        }
                    }
                }
            });
        }

    } else if (window.TRANG_PHUC_DATA) {
        loadOutfitData(window.TRANG_PHUC_DATA);
    } else {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('xem_ngay') || urlParams.has('id')) {
            alert("Lỗi: Không tải được dữ liệu trang phục từ server! TRANG_PHUC_DATA và DAY_OUTFITS_DATA đều trống.");
        }
    }
});
