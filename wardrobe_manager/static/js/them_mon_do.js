document.addEventListener('DOMContentLoaded', () => {
    const itemForm = document.getElementById('itemForm');
    const btnSave = document.getElementById('btnSave');
    const btnDelete = document.getElementById('btnDelete');
    const previewImg = document.getElementById('previewImg');
    const fileInput = document.getElementById('hinh_anh');
    
    // Inputs
    const monDoId = document.getElementById('mon_do_id');
    const tenMonDo = document.getElementById('ten_mon_do');
    const danhMuc = document.getElementById('ma_danh_muc');
    const mua = document.getElementById('mua');
    const phongCach = document.getElementById('phong_cach');
    const mauSac = document.getElementById('mau_sac');
    const chatLieu = document.getElementById('chat_lieu');

    // Utility: dataURL to File
    function dataURLtoFile(dataurl, filename) {
        var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
        while(n--){
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], filename, {type:mime});
    }

    // ACCORDION & SELECTION LOGIC
    window.toggleAccordion = function(id) {
        const acc = document.getElementById(id);
        if (acc.style.display === 'none') {
            acc.style.display = 'block';
        } else {
            acc.style.display = 'none';
        }
    };

    // ===== TÍNH NĂNG "KHÁC" =====
    // Map: prefix -> tên trường hidden checkbox/radio, tên hidden value, text summary id
    const khacConfig = {
        'dm':  { type: 'radio',    cbId: 'dm_khac_radio', valId: 'dm_khac_val',  textId: 'dm_text',  cbName: 'ma_danh_muc' },
        'mua': { type: 'checkbox', cbId: 'mua_khac_cb',   valId: 'mua_khac_val', textId: 'mua_text', cbName: 'mua' },
        'form':{ type: 'checkbox', cbId: 'form_khac_cb',  valId: 'form_khac_val',textId: 'form_text',cbName: 'form_dang' },
        'pc':  { type: 'checkbox', cbId: 'pc_khac_cb',    valId: 'pc_khac_val',  textId: 'pc_text',  cbName: 'phong_cach' },
        'ms':  { type: 'checkbox', cbId: 'ms_khac_cb',    valId: 'ms_khac_val',  textId: 'ms_text',  cbName: 'mau_sac' },
        'cl':  { type: 'checkbox', cbId: 'cl_khac_cb',    valId: 'cl_khac_val',  textId: 'cl_text',  cbName: 'chat_lieu' },
    };

    // Hiện ô nhập khi bấm "Khác"
    window.showKhacInput = function(prefix) {
        const wrap = document.getElementById(`${prefix}_khac_input_wrap`);
        const input = document.getElementById(`${prefix}_khac_input`);
        if (!wrap || !input) return;
        wrap.style.display = 'block';
        input.focus();
    };

    // Xác nhận giá trị Khác khi nhấn Enter
    window.confirmKhac = function(prefix, type) {
        const cfg = khacConfig[prefix];
        if (!cfg) return;

        const input = document.getElementById(`${prefix}_khac_input`);
        const val = input ? input.value.trim() : '';
        if (!val) return;

        // Gán giá trị vào hidden input để backend nhận
        const valEl = document.getElementById(cfg.valId);
        if (valEl) valEl.value = val;

        // Check hidden checkbox/radio để backend biết cần tạo mới
        const cbEl = document.getElementById(cfg.cbId);
        if (cbEl) cbEl.checked = true;

        // Ẩn ô nhập + xoá input để không nhập thêm
        const wrap = document.getElementById(`${prefix}_khac_input_wrap`);
        if (wrap) wrap.style.display = 'none';
        if (input) input.value = '';

        // Tạo chip hiển thị trên giao diện
        const chipsDiv = document.getElementById(`${prefix}_chips`);
        const existingChip = document.getElementById(`${prefix}_khac_confirmed`);
        if (existingChip) existingChip.remove(); // xoá chip cũ nếu có

        const chip = document.createElement('label');
        chip.className = 'filter-chip selected';
        chip.id = `${prefix}_khac_confirmed`;
        chip.innerHTML = `<span>${val}</span> <button type="button" onclick="clearKhac('${prefix}')" style="background:none;border:none;cursor:pointer;font-size:14px;padding:0 0 0 4px;color:inherit;">×</button>`;
        // Chèn chip ngay trước chip "Khác"
        const khacChip = document.getElementById(`${prefix}_khac_chip`);
        if (chipsDiv && khacChip) chipsDiv.insertBefore(chip, khacChip);

        // Cập nhật text summary
        const textSpan = document.getElementById(cfg.textId);
        if (textSpan) {
            if (cfg.type === 'radio') {
                // Deselect radio khác trước
                document.querySelectorAll(`input[name="${cfg.cbName}"]`).forEach(r => {
                    r.parentElement && r.parentElement.classList.remove('selected');
                });
                textSpan.textContent = val;
            } else {
                // Thêm vào danh sách checkbox
                const existing = textSpan.textContent === 'Trống' ? [] : textSpan.textContent.split(', ');
                existing.push(val);
                textSpan.textContent = existing.join(', ');
            }
        }
    };

    // Xoá chip Khác
    window.clearKhac = function(prefix) {
        const cfg = khacConfig[prefix];
        if (!cfg) return;

        // Xoá chip
        const chip = document.getElementById(`${prefix}_khac_confirmed`);
        if (chip) chip.remove();

        // Uncheck + clear hidden value
        const cbEl = document.getElementById(cfg.cbId);
        if (cbEl) cbEl.checked = false;
        const valEl = document.getElementById(cfg.valId);
        if (valEl) valEl.value = '';

        // Cập nhật lại text summary
        const textSpan = document.getElementById(cfg.textId);
        if (!textSpan) return;
        if (cfg.type === 'radio') {
            const checked = document.querySelector(`input[name="${cfg.cbName}"]:checked`);
            textSpan.textContent = checked ? checked.getAttribute('data-text') || checked.value : 'Chọn danh mục';
        } else {
            // Rebuild từ các checkbox đang check (trừ 'khac')
            const checked = document.querySelectorAll(`input[name="${cfg.cbName}"]:checked`);
            const texts = Array.from(checked)
                .filter(cb => cb.value !== 'khac')
                .map(cb => cb.getAttribute('data-text') || cb.value);
            textSpan.textContent = texts.length ? texts.join(', ') : 'Trống';
        }
    };


    window.updateCheckboxSelection = function(name, textId) {
        const checkboxes = document.querySelectorAll(`input[name="${name}"]:checked`);
        const textSpan = document.getElementById(textId);
        
        // Update chip styles
        document.querySelectorAll(`input[name="${name}"]`).forEach(cb => {
            cb.parentElement.classList.toggle('selected', cb.checked);
        });

        if (checkboxes.length === 0) {
            textSpan.textContent = 'Trống';
        } else if (checkboxes.length === 1) {
            textSpan.textContent = checkboxes[0].getAttribute('data-text');
        } else {
            const texts = Array.from(checkboxes).map(cb => cb.getAttribute('data-text'));
            textSpan.textContent = texts.join(', ');
        }
    };

    window.updateRadioSelection = function(name, textId) {
        const checked = document.querySelector(`input[name="${name}"]:checked`);
        const textSpan = document.getElementById(textId);
        
        document.querySelectorAll(`input[name="${name}"]`).forEach(rd => {
            rd.parentElement.classList.toggle('selected', rd.checked);
        });

        if (checked) {
            textSpan.textContent = checked.getAttribute('data-text');
        }
    };

    // STAR RATING LOGIC
    const stars = document.querySelectorAll('#itemStarRating .star');
    const hiddenRating = document.getElementById('hiddenItemRating');
    let currentRating = 0;

    function updateStars(rating) {
        stars.forEach(star => {
            const val = parseInt(star.getAttribute('data-value'));
            if (val <= rating) {
                star.style.color = '#ffc107'; // Vàng
                star.setAttribute('fill', '#ffc107');
            } else {
                star.style.color = '#cccccc'; // Xám
                star.setAttribute('fill', 'none');
            }
        });
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

    // === BIẾN TRẠNG THÁI TÁCH NẪN (khai báo sớm để dùng được ở mọi nơi bên dưới) ===
    let originalImageUrl = null;
    let scannedImageUrl = null;
    let showingScanned = false;
    let currentFile = null;

    // Tham chiếu nút (khai báo sớm, element đã có trong DOM khi DOMContentLoaded)
    const btnToggleScanned = document.getElementById('btnToggleScanned');
    const btnScanImage = document.getElementById('btnScanImage');
    const scanActions = document.getElementById('scanActions');
    const imgPlaceholderEl = document.getElementById('imgPlaceholder');

    // Hàm helper: hiện khu vực nút scan + set ảnh gốc
    function initScanState(imgUrl) {
        originalImageUrl = imgUrl;
        scannedImageUrl = null;
        showingScanned = false;
        scanActions.style.display = 'flex';
        if (btnToggleScanned) btnToggleScanned.textContent = 'Ảnh sau tách nền';
        if (btnScanImage) {
            btnScanImage.textContent = 'Tách nền';
            btnScanImage.style.opacity = '1';
            btnScanImage.style.cursor = 'pointer';
            btnScanImage.disabled = false;
        }
    }

    // Tiền xử lý dữ liệu (Ưu tiên Sửa > Thêm mới)
    if (window.MON_DO_DATA && window.MON_DO_DATA.id) {
        // CHẾ ĐỘ SỬA
        const data = window.MON_DO_DATA;
        monDoId.value = data.id;
        tenMonDo.value = data.ten_mon_do;
        if(data.image_url) {
            previewImg.src = data.image_url;
            if(imgPlaceholderEl) imgPlaceholderEl.style.display = 'none';
            // KHÔNG hiện 3 nút AI scan ở chế độ GET dữ liệu
            if(scanActions) scanActions.style.display = 'none';
        }
        
        if (data.ma_danh_muc) {
            const rd = document.querySelector(`input[name="ma_danh_muc"][value="${data.ma_danh_muc}"]`);
            if(rd) { rd.checked = true; updateRadioSelection('ma_danh_muc', 'dm_text'); }
        }
        
        // Multi-selects via checkboxes
        const setMulti = (name, values, textId) => {
            if(!values) return;
            values.forEach(val => {
                const cb = document.querySelector(`input[name="${name}"][value="${val}"]`);
                if(cb) cb.checked = true;
            });
            updateCheckboxSelection(name, textId);
        };
        setMulti('mua', data.mua, 'mua_text');
        setMulti('form_dang', data.form_dang, 'form_text');
        setMulti('phong_cach', data.phong_cach, 'pc_text');
        setMulti('mau_sac', data.mau_sac, 'ms_text');
        setMulti('chat_lieu', data.chat_lieu, 'cl_text');
        
        if (data.danh_gia) {
            currentRating = data.danh_gia;
            hiddenRating.value = currentRating;
            updateStars(currentRating);
        }

    } else {
        // CHẾ ĐỘ THÊM MỚI (đọc từ sessionStorage nếu có ảnh từ Tủ Đồ truyền sang)
        const newImgBase64 = sessionStorage.getItem('new_item_image_base64');

        if (newImgBase64) {
            previewImg.src = newImgBase64;
            if(imgPlaceholderEl) imgPlaceholderEl.style.display = 'none';
            // Gán vào input file bằng DataTransfer
            try {
                const file = dataURLtoFile(newImgBase64, 'selected_image.png');
                const dt = new DataTransfer();
                dt.items.add(file);
                fileInput.files = dt.files;
                // Gán currentFile và hiện scan actions
                currentFile = file;
                initScanState(newImgBase64);
            } catch(e) { console.error("Cannot set file input:", e); }
        }
    }

    // Xóa session để F5 không lấy lại ảnh cũ
    sessionStorage.removeItem('new_item_image_base64');

    // Lưu thay đổi
    if (btnSave) {
        btnSave.addEventListener('click', () => {
            const noiDungCu = btnSave.innerHTML;
            btnSave.disabled = true;
            btnSave.style.opacity = '0.7';
            btnSave.innerHTML = 'Đang lưu...';
            itemForm.submit();
        });
    }

    // Hoàn tác (Trở về Tủ đồ)
    const btnUndo = document.getElementById('btnDelete');
    if (btnUndo) {
        btnUndo.addEventListener('click', () => {
            window.location.href = '/tu-do/';
        });
    }

    document.getElementById('imgContainer').addEventListener('click', () => {
        fileInput.click();
    });

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

    // Loading overlay
    function showLoading() {
        const loading = document.createElement('div');
        loading.id = 'aiLoading';
        loading.style = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.8);z-index:9999;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff;font-family:inherit;';
        loading.innerHTML = '<div style="width:40px;height:40px;border:4px solid #fff;border-top-color:transparent;border-radius:50%;animation:spin 1s linear infinite;margin-bottom:16px;"></div><style>@keyframes spin{to{transform:rotate(360deg);}}</style><h3 style="margin:0;font-size:18px;">AI đang phân tích...</h3><p style="margin:8px 0 0;font-size:14px;color:#aaa;">Vui lòng đợi vài giây</p>';
        document.body.appendChild(loading);
    }

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if(!file) return;

        currentFile = file;
        const url = URL.createObjectURL(file);
        previewImg.src = url;
        if(imgPlaceholderEl) imgPlaceholderEl.style.display = 'none';
        initScanState(url);
    });

    // Toggle: đổi luân phiên giữa ảnh gốc và ảnh đã tách nền
    btnToggleScanned.addEventListener('click', () => {
        if (!scannedImageUrl) {
            // Chưa tách nền - không làm gì cả (hoặc có thể hiện hint nhẹ)
            return;
        }
        showingScanned = !showingScanned;
        if (showingScanned) {
            previewImg.src = scannedImageUrl;
            btnToggleScanned.textContent = 'Ảnh gốc';
        } else {
            previewImg.src = originalImageUrl;
            btnToggleScanned.textContent = 'Ảnh sau tách nền';
        }
    });

    // Tách nền: gọi API /api/quet-anh/
    btnScanImage.addEventListener('click', async () => {
        if (!currentFile) {
            alert('Vui lòng chọn ảnh trước.');
            return;
        }
        if (btnScanImage.disabled) return;

        showLoading();
        try {
            const formData = new FormData();
            formData.append('hinh_anh', currentFile);
            
            const cutoutReq = await fetch('/api/quet-anh/', { method: 'POST', body: formData, headers: {'X-CSRFToken': getCookie('csrftoken')} });
            if(!cutoutReq.ok) throw new Error('API failed');

            const blob = await cutoutReq.blob();
            scannedImageUrl = URL.createObjectURL(blob);
            
            // Tự động hiển thị ảnh đã tách nền
            previewImg.src = scannedImageUrl;
            showingScanned = true;
            btnToggleScanned.textContent = 'Ảnh gốc';
            
            // Làm mờ nút Tách nền -> Đã tách nền
            btnScanImage.textContent = 'Đã tách nền';
            btnScanImage.style.opacity = '0.5';
            btnScanImage.style.cursor = 'not-allowed';
            btnScanImage.disabled = true;

            // Gán ảnh đã tách nền vào file input để submit form
            const newFile = new File([blob], "ai_cutout.png", { type: "image/png" });
            const dt = new DataTransfer();
            dt.items.add(newFile);
            fileInput.files = dt.files;

        } catch (err) {
            console.error(err);
            alert('Có lỗi xảy ra khi tách nền.');
        } finally {
            const loading = document.getElementById('aiLoading');
            if(loading) loading.remove();
        }
    });

    btnGetInfo.addEventListener('click', async () => {
        if (!currentFile) {
            alert('Vui lòng chọn ảnh trước.');
            return;
        }
        showLoading();
        try {
            const formData = new FormData();
            formData.append('hinh_anh', currentFile);
            
            const tagsReq = await fetch('/api/lay-thong-tin/', { method: 'POST', body: formData, headers: {'X-CSRFToken': getCookie('csrftoken')} });
            if(!tagsReq.ok) throw new Error('API failed');

            const tags = await tagsReq.json();
            console.log("AI Tags:", tags);
            alert('Đã lấy thông tin thành công (xem console).');
            // Tùy thuộc vào cấu trúc JSON để fill vào form ở đây

        } catch (err) {
            console.error(err);
            alert('Có lỗi xảy ra khi lấy thông tin.');
        } finally {
            const loading = document.getElementById('aiLoading');
            if(loading) loading.remove();
        }
    });
});
