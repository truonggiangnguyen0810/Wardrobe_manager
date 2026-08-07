# NOTE (file): apps/urls.py - Bộ URL cho các TRANG WEB (trả HTML).
# NOTE: Khác DRF router (trả JSON ở /api/), phần này dẫn tới các hàm view trả trang HTML.

from django.urls import path  # NOTE: path() ánh xạ 1 đường dẫn URL -> 1 hàm view
from . import views           # NOTE: import các hàm view từ apps/views.py

urlpatterns = [
    # NOTE: --- Đăng nhập / Đăng xuất ---
    path('', views.login_view, name='login'),             # NOTE: trang đăng nhập ===========MẶC ĐỊNH
    path('dang-xuat/', views.logout_view, name='logout'),          # NOTE: đăng xuất

    # NOTE: --- Đăng ký tài khoản (luồng 5 bước) ---
    path('dang-ky/', views.dang_ky_sdt, name='dang_ky_sdt'),                    # NOTE: Bước 1 - nhập SĐT
    path('xac-thuc-otp/', views.xac_thuc_otp, name='xac_thuc_otp'),            # NOTE: Bước 2 - xác thực OTP
    path('tao-mat-khau/', views.tao_mat_khau, name='tao_mat_khau'),            # NOTE: Bước 3 - tạo mật khẩu
    path('thong-tin-ca-nhan/', views.dang_ky_thong_tin, name='dang_ky_thong_tin'),  # NOTE: Bước 4 - thông tin cá nhân

    # NOTE: --- Quên mật khẩu (luồng 3 bước: SĐT -> OTP -> MK mới) ---
    path('quen-mat-khau/', views.quen_mat_khau, name='quen_mat_khau'),                       # NOTE: Bước 1 - nhập SĐT đã đăng ký
    path('quen-mat-khau/otp/', views.quen_mk_xac_thuc_otp, name='quen_mk_xac_thuc_otp'),     # NOTE: Bước 2 - xác thực OTP
    path('quen-mat-khau/mat-khau/', views.quen_mk_mat_khau, name='quen_mk_mat_khau'),        # NOTE: Bước 3 - đặt mật khẩu mới

    # NOTE: --- Trang chủ (sau khi đăng nhập) ---
    path('trang-chu/', views.trang_chu, name='trang_chu'),      # NOTE: trang chủ (thay dashboard tạm)

    # NOTE: --- Tủ đồ (danh sách món đồ của user) ---
    path('tu-do/', views.tu_do, name='tu_do'),                  # NOTE: trang tủ đồ (lưới món đồ + lọc danh mục)
    path('them-mon-do/', views.them_mon_do, name='them_mon_do'), # NOTE: trang thêm món đồ mới

    #SÁCH TRANG PHỤC
    path('sach_trang_phuc/', views.sach_trang_phuc, name='sach_trang_phuc'),
    path('chinh-sua-trang-phuc/', views.chinh_sua_trang_phuc, name='chinh_sua_trang_phuc'),

    # LỊCH TRANG PHỤC
    path('lich-trang-phuc/', views.lich_trang_phuc, name='lich_trang_phuc'),
    path('api/them-lich-trang-phuc/', views.api_them_lich_trang_phuc, name='api_them_lich_trang_phuc'),

    # NOTE: --- AI Endpoints ---
    path('api/quet-anh/', views.api_quet_anh, name='api_quet_anh'),
    path('api/lay-thong-tin/', views.api_lay_thong_tin, name='api_lay_thong_tin'),
    path('api/luu-trang-phuc/', views.api_luu_trang_phuc, name='api_luu_trang_phuc'),
    path('api/xoa-trang-phuc/', views.api_xoa_trang_phuc, name='api_xoa_trang_phuc'),
    path('api/xoa-mon-do/', views.api_xoa_mon_do, name='api_xoa_mon_do'),

    # NOTE: --- Trang cá nhân ---
    path('trang-ca-nhan/', views.quan_li_trang_ca_nhan, name='quan_li_trang_ca_nhan'),
    path('trang-ca-nhan/cap-nhat-mat-khau/', views.cap_nhat_mat_khau, name='cap_nhat_mat_khau'),

    # NOTE: --- Placeholder: tính năng đang phát triển ---
    path('dang-phat-trien/', views.dang_phat_trien, name='dang_phat_trien'),  # NOTE: "đang phát triển" (Thử đồ ảo, Thống kê, Tìm mảnh ghép...)
]
