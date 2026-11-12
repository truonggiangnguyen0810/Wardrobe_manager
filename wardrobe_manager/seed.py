import os
import django

# 1. Cấu hình môi trường Django (Thay 'your_project_name' bằng tên dự án của bạn)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'wardrobe_manager.settings')
django.setup()

# 2. Import các Models (Thay 'your_app_name' bằng tên app của bạn)
from apps.models import DanhMucMonDo, Form, DanhMucForm, PhongCach, ChatLieu

def seed_form_data():
    print("🧹 1. Đang tiến hành xóa dữ liệu cũ...")
    DanhMucForm.objects.all().delete()
    Form.objects.all().delete()
    print("   ✅ Đã xóa sạch dữ liệu trong bảng 'danhmucform' và 'form'!\n")

    print("⏳ 2. Đang tiến hành thêm dữ liệu Form chuẩn hóa...")

    # Bộ dữ liệu Form đã chuẩn hóa phân theo ma_danh_muc
    # 1: Áo, 2: Quần, 3: Váy/Đầm, 4: Chân váy, 5: Áo khoác
    data_form = {
        1: ["Vừa vặn", "Ôm vừa", "Ôm sát", "Rộng rãi", "Dáng hộp", "Dáng ngắn"],
        2: ["Vừa vặn", "Ôm vừa", "Ôm sát", "Ống đứng", "Ống rộng", "Ống loe", "Loe nhẹ", "Ôm dần", "Rộng rãi"],
        3: ["Ôm sát", "Chữ A", "Dáng suông", "Dáng xòe", "Dáng quấn", "Rộng rãi"],
        4: ["Chữ A", "Dáng suông", "Dáng xòe", "Bút chì", "Xếp ly", "Bất đối xứng"],
        5: ["Vừa vặn", "Ôm vừa", "Rộng rãi", "Dáng hộp", "Dáng ngắn"]
    }

    # Lưu lại bộ đếm để theo dõi
    form_cache = {}

    for ma_danh_muc, list_form in data_form.items():
        try:
            danh_muc_obj = DanhMucMonDo.objects.get(ma_danh_muc=ma_danh_muc)
            print(f"📂 Danh mục: [{danh_muc_obj.ten_danh_muc}] (ID: {ma_danh_muc})")

            for ten_form in list_form:
                # Tạo mới Form nếu chưa có trong cache/DB
                if ten_form not in form_cache:
                    form_obj = Form.objects.create(ten_form=ten_form)
                    form_cache[ten_form] = form_obj
                    print(f"   ✨ Đã tạo Form: {ten_form} (ID: {form_obj.ma_form})")
                else:
                    form_obj = form_cache[ten_form]

                # Ghi liên kết vào bảng danhmucform
                DanhMucForm.objects.create(
                    ma_danh_muc=danh_muc_obj,
                    ma_form=form_obj
                )
                print(f"   🔗 Liên kết: {danh_muc_obj.ten_danh_muc} <-> {ten_form}")

            print("-" * 50)

        except DanhMucMonDo.DoesNotExist:
            print(f"❌ Không tìm thấy DanhMucMonDo với ID = {ma_danh_muc}!")

    print("\n🎉 Hoàn tất làm sạch và ghi lại toàn bộ dữ liệu Form!")

def seed_phong_cach_chat_lieu():
    print("⏳ 3. Đang thêm dữ liệu Phong Cách và Chất Liệu...")
    
    phong_cachs = ["Casual", "Công sở", "Dự tiệc", "Thể thao", "Đường phố (Streetwear)", "Vintage", "Thanh lịch", "Tối giản (Minimalism)", "Cá tính", "Ngọt ngào"]
    for pc in phong_cachs:
        PhongCach.objects.get_or_create(ten_phong_cach=pc)
        print(f"   ✨ Đã đảm bảo Phong cách: {pc}")
        
    chat_lieus = ["Cotton", "Len", "Lụa", "Denim (Bò)", "Kaki", "Lanh (Linen)", "Polyester", "Nỉ", "Da", "Voan", "Nhung"]
    for cl in chat_lieus:
        ChatLieu.objects.get_or_create(ten_chat_lieu=cl)
        print(f"   ✨ Đã đảm bảo Chất liệu: {cl}")
        
    print("🎉 Hoàn tất thêm Phong Cách và Chất Liệu!\n")

if __name__ == '__main__':
    seed_form_data()
    seed_phong_cach_chat_lieu()