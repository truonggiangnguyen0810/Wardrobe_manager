// ============================================
// XEM TRANG PHỤC - ĐÁNH GIÁ SAO
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
        const soSaoDuocChon = viTri + 1;
        if (soSaoHienTai === soSaoDuocChon) {
            capNhat(0);
        } else {
            capNhat(soSaoDuocChon);
        }
    });
});

// ====== 4. TRẠNG THÁI BAN ĐẦU: 0 SAO ======
capNhat(0);
