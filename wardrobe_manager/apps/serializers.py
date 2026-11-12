# NOTE (file): apps/serializers.py - Lớp TUẦN TỰ HÓA (serializer) của toàn bộ dự án.
# Vai trò (theo Chương 5 - LTW): chuyển đổi 2 chiều giữa Model (Python) và JSON:
#   - Model -> JSON : để trả dữ liệu về cho frontend qua API.
#   - JSON  -> Model: để lưu dữ liệu khi frontend gửi lên (thêm/sửa).
# Không có serializer thì DRF không biết cách chuyển Model thành JSON.

from rest_framework import serializers  # NOTE: import thư viện serializers từ DRF (đã đăng ký ở settings.py - Bước 1)

# NOTE: import toàn bộ các model từ file models.py cùng thư mục (dấu "." = gói apps hiện tại)
# pyrefly: ignore [missing-import]
from .models import (
    DanhMucMonDo,
    MauSac,
    Mua,
    ChatLieu,
    PhongCach,
    Form,
    HoSoNguoiDung,
    MonDo,
    TrangPhuc,
    LichTrangPhuc,
    ChiTietTrangPhuc,
    DanhMucForm,
)


# ==============================================================================
# 1. SERIALIZER CÁC BẢNG DANH MỤC (đơn giản, chỉ có mã + tên)
# ==============================================================================

class DanhMucMonDoSerializer(serializers.ModelSerializer):
    """NOTE: Serializer cho bảng DanhMucMonDo (loại món đồ: áo, quần, giày...)."""

    class Meta:                    # NOTE: lớp Meta chứa phần cấu hình cho serializer
        model = DanhMucMonDo       # NOTE: liên kết serializer này với model DanhMucMonDo
        fields = "__all__"         # NOTE: lấy TẤT CẢ trường của model (ma_danh_muc, ten_danh_muc)


class MauSacSerializer(serializers.ModelSerializer):
    """NOTE: Serializer cho bảng MauSac."""

    class Meta:
        model = MauSac
        fields = "__all__"


class MuaSerializer(serializers.ModelSerializer):
    """NOTE: Serializer cho bảng Mua (mùa: xuân, hè, thu, đông)."""

    class Meta:
        model = Mua
        fields = "__all__"


class ChatLieuSerializer(serializers.ModelSerializer):
    """NOTE: Serializer cho bảng ChatLieu (cotton, len, kaki...)."""

    class Meta:
        model = ChatLieu
        fields = "__all__"


class PhongCachSerializer(serializers.ModelSerializer):
    """NOTE: Serializer cho bảng PhongCach."""

    class Meta:
        model = PhongCach
        fields = "__all__"


class FormSerializer(serializers.ModelSerializer):
    """NOTE: Serializer cho bảng Form."""

    class Meta:
        model = Form
        fields = "__all__"


class DanhMucFormSerializer(serializers.ModelSerializer):
    """NOTE: Serializer cho bảng trung gian DanhMucForm."""

    class Meta:
        model = DanhMucForm
        fields = "__all__"


# ==============================================================================
# 2. SERIALIZER CÁC BẢNG THỰC THỂ CHÍNH
# ==============================================================================
# Lưu ý: các model này có khóa ngoại (nguoi_dung) và nhiều-nhiều (mau_sac, mua...).
# Với fields="__all__", DRF sẽ:
#   - Trả khóa ngoại dạng id (ví dụ "nguoi_dung": 1).
#   - Trả quan hệ nhiều-nhiều dạng danh sách id (ví dụ "mau_sac": [1, 2]).

class HoSoNguoiDungSerializer(serializers.ModelSerializer):
    """NOTE: Serializer cho bảng HoSoNguoiDung (thông tin cá nhân người dùng)."""

    class Meta:
        model = HoSoNguoiDung
        fields = "__all__"


class MonDoSerializer(serializers.ModelSerializer):
    """NOTE: Serializer cho bảng MonDo (tủ quần áo của người dùng)."""

    class Meta:
        model = MonDo
        fields = "__all__"


class TrangPhucSerializer(serializers.ModelSerializer):
    """NOTE: Serializer cho bảng TrangPhuc (set đồ hoàn chỉnh)."""

    class Meta:
        model = TrangPhuc
        fields = "__all__"


class LichTrangPhucSerializer(serializers.ModelSerializer):
    """NOTE: Serializer cho bảng LichTrangPhuc (kế hoạch mặc theo ngày)."""

    class Meta:
        model = LichTrangPhuc
        fields = "__all__"


class ChiTietTrangPhucSerializer(serializers.ModelSerializer):
    """NOTE: Serializer cho bảng ChiTietTrangPhuc (các món đồ thành phần của một set)."""

    class Meta:
        model = ChiTietTrangPhuc
        fields = "__all__"
