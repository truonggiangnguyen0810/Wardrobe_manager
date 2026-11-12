from django.core.management.base import BaseCommand
from apps.models import DanhMucMonDo, MauSac, Mua, ChatLieu, DipSuDung


class Command(BaseCommand):
    """NOTE: Lệnh seed dữ liệu danh mục cho tủ đồ.

    Chạy: python manage.py seed_danh_muc
    Dùng get_or_create -> chạy lại nhiều lần cũng không bị trùng dữ liệu.
    """
    help = "Seed dữ liệu danh mục (danh mục món đồ, màu, mùa, chất liệu, dịp)."

    def handle(self, *args, **options):
        # NOTE: bộ dữ liệu mẫu bằng tiếng Việt.
        danh_muc = ['Áo', 'Quần', 'Váy/Đầm', 'Chân váy', 'Áo khoác', 'Giày', 'Phụ kiện']
        mau_sac = ['Đen', 'Trắng', 'Xám', 'Be', 'Xanh navy', 'Xanh lá', 'Đỏ', 'Hồng', 'Vàng', 'Nâu', 'Tím']
        mua = ['Xuân', 'Hè', 'Thu', 'Đông']
        chat_lieu = ['Cotton', 'Len', 'Kaki', 'Jean', 'Lụa', 'Polyester', 'Linen']
        dip = ['Hàng ngày', 'Đi làm', 'Hẹn hò', 'Dự tiệc', 'Thể thao', 'Đi biển']

        # NOTE: get_or_create: có rồi thì bỏ qua, chưa có thì tạo -> an toàn chạy lại.
        for ten in danh_muc:
            DanhMucMonDo.objects.get_or_create(ten_danh_muc=ten)
        for ten in mau_sac:
            MauSac.objects.get_or_create(ten_mau_sac=ten)
        for ten in mua:
            Mua.objects.get_or_create(ten_mua=ten)
        for ten in chat_lieu:
            ChatLieu.objects.get_or_create(ten_chat_lieu=ten)
        for ten in dip:
            DipSuDung.objects.get_or_create(ten_dip=ten)

        self.stdout.write(self.style.SUCCESS(
            f"Seed xong: {DanhMucMonDo.objects.count()} danh mục, "
            f"{MauSac.objects.count()} màu, {Mua.objects.count()} mùa, "
            f"{ChatLieu.objects.count()} chất liệu, {DipSuDung.objects.count()} dịp."
        ))
