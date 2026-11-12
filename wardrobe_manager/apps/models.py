from django.db import models
from django.conf import settings

# ==============================================================================
# 1. CÁC BẢNG DANH MỤC
# ==============================================================================

class DanhMucMonDo(models.Model):
    ma_danh_muc = models.AutoField(primary_key=True, verbose_name="Mã danh mục")
    ten_danh_muc = models.CharField(max_length=255, verbose_name="Tên danh mục")
    nguoi_dung = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True, blank=True, verbose_name="Người dùng")

    def __str__(self):
        return self.ten_danh_muc


class MauSac(models.Model):
    ma_mau_sac = models.AutoField(primary_key=True, verbose_name="Mã màu sắc")
    ten_mau_sac = models.CharField(max_length=255, verbose_name="Tên màu sắc")
    nguoi_dung = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True, blank=True, verbose_name="Người dùng")

    def __str__(self):
        return self.ten_mau_sac


class Mua(models.Model):
    ma_mua = models.AutoField(primary_key=True, verbose_name="Mã mùa")
    ten_mua = models.CharField(max_length=255, verbose_name="Tên mùa")
    nguoi_dung = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True, blank=True, verbose_name="Người dùng")

    def __str__(self):
        return self.ten_mua


class ChatLieu(models.Model):
    ma_chat_lieu = models.AutoField(primary_key=True, verbose_name="Mã chất liệu")
    ten_chat_lieu = models.CharField(max_length=255, verbose_name="Tên chất liệu")
    nguoi_dung = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True, blank=True, verbose_name="Người dùng")

    def __str__(self):
        return self.ten_chat_lieu


class PhongCach(models.Model):
    ma_phong_cach = models.AutoField(primary_key=True, verbose_name="Mã phong cách")
    ten_phong_cach = models.CharField(max_length=255, verbose_name="Tên phong cách")
    nguoi_dung = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True, blank=True, verbose_name="Người dùng")

    def __str__(self):
        return self.ten_phong_cach


class Form(models.Model):
    ma_form = models.AutoField(primary_key=True, verbose_name="Mã form")
    ten_form = models.CharField(max_length=255, verbose_name="Tên form")
    nguoi_dung = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True, blank=True, verbose_name="Người dùng")

    def __str__(self):
        return self.ten_form


# ==============================================================================
# 2. CÁC BẢNG THỰC THỂ CHÍNH (MAIN MODELS)
# ==============================================================================

class HoSoNguoiDung(models.Model):
    """
    Bảng HoSoNguoiDung: Quản lý thông tin cá nhân và thiết lập của người dùng.
    """
    ma_ho_so = models.AutoField(primary_key=True, verbose_name="Mã hồ sơ")
    nguoi_dung = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='ho_so',
        verbose_name="Người dùng"
    )
    ho_ten = models.CharField(max_length=255, verbose_name="Họ và tên")
    gioi_tinh = models.CharField(max_length=10, blank=True, null=True, verbose_name="Giới tính")
    anh_dai_dien = models.CharField(max_length=255, blank=True, null=True, verbose_name="Ảnh đại diện")
    ngay_cap_nhat = models.DateTimeField(auto_now=True, verbose_name="Ngày cập nhật")
    quy_dinh_phoi_do = models.TextField(blank=True, null=True, verbose_name="Quy định phối đồ")

    def __str__(self):
        return self.ho_ten


class MonDo(models.Model):
    """
    Bảng MonDo: Quản lý "Tủ quần áo số" của người dùng.
    """
    ma_mon_do = models.AutoField(primary_key=True, verbose_name="Mã món đồ")
    nguoi_dung = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        verbose_name="Người dùng sở hữu"
    )
    ma_danh_muc = models.ForeignKey(DanhMucMonDo, on_delete=models.SET_NULL, null=True, verbose_name="Loại món đồ")

    ten_mon_do = models.CharField(max_length=255, verbose_name="Tên món đồ")
    hinh_anh_trang_phuc = models.CharField(max_length=255, blank=True, null=True, verbose_name="Đường dẫn hình ảnh")
    danh_gia = models.IntegerField(default=0, verbose_name="Đánh giá món đồ")

    # Đã thêm Phong cách và Form dáng theo yêu cầu, xóa Dịp sử dụng
    mau_sac = models.ManyToManyField(MauSac, blank=True, verbose_name="Màu sắc")
    chat_lieu = models.ManyToManyField(ChatLieu, blank=True, verbose_name="Chất liệu")
    mua = models.ManyToManyField(Mua, blank=True, verbose_name="Mùa thích hợp")
    phong_cach = models.ManyToManyField(PhongCach, blank=True, verbose_name="Phong cách")
    form_dang = models.ManyToManyField(Form, blank=True, verbose_name="Form dáng")

    def __str__(self):
        return self.ten_mon_do

    @property
    def image_url(self):
        """
        NOTE: Trả về URL đầy đủ của ảnh món đồ.
        """
        from django.conf import settings
        if self.hinh_anh_trang_phuc:
            return f"{settings.MEDIA_URL}{self.nguoi_dung_id}/{self.hinh_anh_trang_phuc}"
        return f"{settings.STATIC_URL}img/base-avatar.svg"


class TrangPhuc(models.Model):
    """
    Bảng TrangPhuc: Quản lý các "Set đồ" hoàn chỉnh.
    """
    ma_trang_phuc = models.AutoField(primary_key=True, verbose_name="Mã trang phục (Set đồ)")
    nguoi_dung = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        verbose_name="Người dùng sở hữu"
    )

    ten_trang_phuc = models.CharField(max_length=255, verbose_name="Tên gợi nhớ của Set đồ")
    kieu_tao = models.CharField(max_length=50, blank=True, null=True, verbose_name="Cách tạo (Tự động/Thủ công)")
    danh_gia = models.IntegerField(default=0, verbose_name="Đánh giá chất lượng Set đồ")

    # Trường dip_su_dung đã được xóa bỏ khỏi bảng này
    mua = models.ManyToManyField(Mua, through='TrangPhuc_Mua', blank=True, verbose_name="Mùa thích hợp")
    phong_cach = models.ManyToManyField(PhongCach, through='TrangPhuc_PhongCach', blank=True, verbose_name="Phong cách")

    def __str__(self):
        return self.ten_trang_phuc


class LichTrangPhuc(models.Model):
    """
    Bảng LichTrangPhuc: Quản lý kế hoạch ăn mặc của người dùng.
    """
    ma_lich = models.AutoField(primary_key=True, verbose_name="Mã lịch trình")
    nguoi_dung = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        verbose_name="Người lên lịch"
    )
    ma_trang_phuc = models.ForeignKey(TrangPhuc, on_delete=models.CASCADE, verbose_name="Set đồ được chọn")

    ngay_mac = models.DateField(verbose_name="Ngày dự kiến mặc")

    def __str__(self):
        return f"Kế hoạch ngày {self.ngay_mac} - Set: {self.ma_trang_phuc.ten_trang_phuc}"


# ==============================================================================
# 3. BẢNG CHI TIẾT
# ==============================================================================

class ChiTietTrangPhuc(models.Model):
    """
    Bảng ChiTietTrangPhuc: Bảng kết nối chi tiết tạo nên Set đồ.
    """
    ma_trang_phuc = models.ForeignKey(TrangPhuc, on_delete=models.CASCADE, verbose_name="Thuộc Set đồ")
    ma_mon_do = models.ForeignKey(MonDo, on_delete=models.CASCADE, verbose_name="Món đồ thành phần")

    class Meta:
        unique_together = (('ma_trang_phuc', 'ma_mon_do'),)

    def __str__(self):
        return f"{self.ma_trang_phuc.ten_trang_phuc} - {self.ma_mon_do.ten_mon_do}"


class DanhMucForm(models.Model):
    """
    Bảng DanhMucForm: Liên kết giữa Danh mục món đồ và Form dáng.
    """
    ma_danh_muc = models.ForeignKey(DanhMucMonDo, on_delete=models.CASCADE, verbose_name="Danh mục món đồ")
    ma_form = models.ForeignKey(Form, on_delete=models.CASCADE, verbose_name="Form dáng")

    class Meta:
        unique_together = (('ma_danh_muc', 'ma_form'),)

    def __str__(self):
        return f"{self.ma_danh_muc.ten_danh_muc} - {self.ma_form.ten_form}"


class TrangPhuc_Mua(models.Model):
    """
    Bảng TrangPhuc_Mua: Bảng trung gian liên kết Trang phục và Mùa.
    """
    ma_trang_phuc = models.ForeignKey(TrangPhuc, on_delete=models.CASCADE, verbose_name="Trang phục")
    ma_mua = models.ForeignKey(Mua, on_delete=models.CASCADE, verbose_name="Mùa")

    class Meta:
        unique_together = (('ma_trang_phuc', 'ma_mua'),)
        verbose_name = "Trang phục - Mùa"
        verbose_name_plural = "Trang phục - Mùa"

    def __str__(self):
        return f"{self.ma_trang_phuc.ten_trang_phuc} - {self.ma_mua.ten_mua}"


class TrangPhuc_PhongCach(models.Model):
    """
    Bảng TrangPhuc_PhongCach: Bảng trung gian liên kết Trang phục và Phong cách.
    """
    ma_trang_phuc = models.ForeignKey(TrangPhuc, on_delete=models.CASCADE, verbose_name="Trang phục")
    ma_phong_cach = models.ForeignKey(PhongCach, on_delete=models.CASCADE, verbose_name="Phong cách")

    class Meta:
        unique_together = (('ma_trang_phuc', 'ma_phong_cach'),)
        verbose_name = "Trang phục - Phong cách"
        verbose_name_plural = "Trang phục - Phong cách"

    def __str__(self):
        return f"{self.ma_trang_phuc.ten_trang_phuc} - {self.ma_phong_cach.ten_phong_cach}"