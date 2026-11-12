# NOTE (file): apps/forms.py - Các form HTML cho GIAO DIỆN WEB (không phải API).
# NOTE: Dùng thư viện Django Forms (Chương 4 - LTW) để nhận & kiểm tra dữ liệu từ người dùng.

from django import forms  # NOTE: import thư viện Form của Django
from django.contrib.auth.models import User  # NOTE: bảng auth_user - nguồn sự thật của username (SĐT)

from .models import HoSoNguoiDung, DanhMucMonDo, MauSac, ChatLieu, Mua, PhongCach, Form


class LoginForm(forms.Form):
    """NOTE: Form đăng nhập: Số điện thoại + Mật khẩu."""

    so_dien_thoai = forms.CharField(   # NOTE: ô nhập số điện thoại
        label="Số điện thoại",         # NOTE: nhãn hiển thị bên cạnh ô
        max_length=10,                 # NOTE: tối đa 10 ký tự (đúng độ dài SĐT Việt Nam)
    )
    mat_khau = forms.CharField(        # NOTE: ô nhập mật khẩu
        label="Mật khẩu",
        widget=forms.PasswordInput,    # NOTE: PasswordInput -> ẩn ký tự khi gõ (hiện dấu chấm đen)
    )


# ==============================================================================
# ĐĂNG KÝ TÀI KHOẢN (luồng 5 bước: SĐT -> OTP -> Mật khẩu -> Thông tin -> Trang chủ)
# ==============================================================================

class DangKySDTForm(forms.Form):
    """NOTE (Bước 1): Form nhập số điện thoại để bắt đầu đăng ký."""

    so_dien_thoai = forms.CharField(
        label="Số điện thoại",
        max_length=10,
    )

    def clean_so_dien_thoai(self):
        """NOTE: Kiểm tra SĐT đúng định dạng (10 số, bắt đầu 0) VÀ chưa tồn tại trong DB."""
        sdt = self.cleaned_data['so_dien_thoai']
        if not sdt.isdigit() or len(sdt) != 10 or not sdt.startswith('0'):
            raise forms.ValidationError("Số điện thoại không hợp lệ (10 số, bắt đầu bằng 0).")
        # NOTE: kiểm tra TRỰC TIẾP auth_user (username = SĐT) để bắt cả User mồ côi
        # (có User nhưng chưa có Hồ sơ). Trước đây chỉ check HoSoNguoiDung nên bỏ sót.
        if User.objects.filter(username=sdt).exists():
            raise forms.ValidationError("Số điện thoại này đã được đăng ký.")
        return sdt


class XacThucOTPForm(forms.Form):
    """NOTE (Bước 2): Form nhập mã OTP 6 số."""

    otp = forms.CharField(
        label="Mã OTP",
        max_length=6,
    )

    def clean_otp(self):
        """NOTE: Kiểm tra OTP có đúng 6 chữ số hay không (việc so sánh với session làm ở view)."""
        otp = self.cleaned_data['otp']
        if not otp.isdigit() or len(otp) != 6:
            raise forms.ValidationError("Mã OTP phải có đúng 6 chữ số.")
        return otp


class TaoMatKhauForm(forms.Form):
    """NOTE (Bước 3): Form tạo mật khẩu + xác nhận mật khẩu."""

    mat_khau = forms.CharField(
        label="Mật khẩu",
        widget=forms.PasswordInput,    # NOTE: ẩn ký tự
    )
    xac_nhan_mat_khau = forms.CharField(
        label="Nhập lại mật khẩu",
        widget=forms.PasswordInput,
    )

    def clean(self):
        """NOTE: Kiểm tra 2 ô mật khẩu khớp nhau VÀ tối thiểu 6 ký tự."""
        cleaned = super().clean()
        mk1 = cleaned.get('mat_khau')
        mk2 = cleaned.get('xac_nhan_mat_khau')
        if mk1 and mk2 and mk1 != mk2:
            raise forms.ValidationError("Hai mật khẩu không khớp.")
        if mk1 and len(mk1) < 6:
            raise forms.ValidationError("Mật khẩu tối thiểu 6 ký tự.")
        return cleaned


class ThongTinCaNhanForm(forms.Form):
    """NOTE (Bước 4): Form nhập thông tin cá nhân (họ tên + giới tính)."""

    ho_ten = forms.CharField(
        label="Họ và tên",
        max_length=255,
    )
    gioi_tinh = forms.ChoiceField(
        label="Giới tính",
        choices=[('', '--- Chọn ---'), ('nam', 'Nam'), ('nu', 'Nữ'), ('khac', 'Khác')],
        required=False,
    )
    anh_dai_dien = forms.ImageField(required=False)  # NOTE: ảnh đại diện (tùy chọn) - nhận qua request.FILES


class QuenMatKhauForm(forms.Form):
    """NOTE (Quên mật khẩu - Bước 1): Nhập SĐT ĐÃ ĐĂNG KÝ để đặt lại mật khẩu."""

    so_dien_thoai = forms.CharField(
        label="Số điện thoại",
        max_length=10,
    )

    def clean_so_dien_thoai(self):
        """NOTE: Kiểm tra SĐT hợp lệ VÀ ĐÃ TỒN TẠI trong auth_user (ngược với đăng ký)."""
        sdt = self.cleaned_data['so_dien_thoai']
        if not sdt.isdigit() or len(sdt) != 10 or not sdt.startswith('0'):
            raise forms.ValidationError("Số điện thoại không hợp lệ (10 số, bắt đầu bằng 0).")
        if not User.objects.filter(username=sdt).exists():
            raise forms.ValidationError("Số điện thoại này chưa được đăng ký.")
        return sdt


class ThemMonDoForm(forms.Form):
    """Form thêm món đồ: tên, danh mục, ảnh, màu, chất liệu, mùa, dịp."""
    ten_mon_do = forms.CharField(
        label="Tên món đồ",
        max_length=255,
    )
    ma_danh_muc = forms.ModelChoiceField(
        label="Loại món đồ",
        queryset=DanhMucMonDo.objects.all(),
        empty_label="--- Chọn loại ---",
        required=False,
    )
    hinh_anh = forms.ImageField(
        label="Ảnh món đồ",
        required=False,
    )
    mau_sac = forms.ModelMultipleChoiceField(
        label="Màu sắc",
        queryset=MauSac.objects.all(),
        required=False,
        widget=forms.CheckboxSelectMultiple,
    )
    chat_lieu = forms.ModelMultipleChoiceField(
        label="Chất liệu",
        queryset=ChatLieu.objects.all(),
        required=False,
        widget=forms.CheckboxSelectMultiple,
    )
    mua = forms.ModelMultipleChoiceField(
        label="Mùa",
        queryset=Mua.objects.all(),
        required=False,
        widget=forms.CheckboxSelectMultiple,
    )
    phong_cach = forms.ModelMultipleChoiceField(
        label="Phong cách",
        queryset=PhongCach.objects.all(),
        required=False,
        widget=forms.CheckboxSelectMultiple,
    )
    form_dang = forms.ModelMultipleChoiceField(
        label="Form dáng",
        queryset=Form.objects.all(),
        required=False,
        widget=forms.CheckboxSelectMultiple,
    )
