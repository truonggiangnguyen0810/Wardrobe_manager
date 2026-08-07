// ============================================
// ĐÁP ÁN AI - ĐÁNH GIÁ SAO
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

// ====== 5. AVATAR DROPDOWN TOGGLE ======
document.addEventListener('click', (e) => {
    const toggle = e.target.closest('.avatar-toggle');
    const dropdown = document.querySelector('.avatar-dropdown-menu');
    if (toggle && dropdown) {
        dropdown.classList.toggle('show');
    } else if (dropdown && !e.target.closest('.avatar-dropdown-wrap')) {
        dropdown.classList.remove('show');
    }
});
