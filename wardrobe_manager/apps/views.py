from rest_framework import viewsets  # NOTE: import các lớp ViewSet của DRF; ModelViewSet (có sẵn CRUD) nằm trong này
from rest_framework.decorators import api_view


from django.shortcuts import render, redirect  # NOTE: render trả trang HTML; redirect chuyển người dùng sang URL khác
from django.contrib.auth import login, logout   # NOTE: login() ghi phiên đăng nhập; logout() xoá phiên
from django.contrib.auth.decorators import login_required  # NOTE: decorator ép phải đăng nhập mới vào được view
from django.contrib.auth.models import User     # NOTE: bảng auth_user mặc định của Django (lưu username + password đã băm)
from django.db import transaction               # NOTE: đảm bảo tạo User + Hồ sơ thành công cùng lúc, tránh dữ liệu mồ côi


# pyrefly: ignore [missing-import]
from .forms import (
    LoginForm,
    DangKySDTForm,
    XacThucOTPForm,
    TaoMatKhauForm,
    ThongTinCaNhanForm,
    QuenMatKhauForm,
    ThemMonDoForm,
)


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

from django.db.models import Q

# pyrefly: ignore [missing-import]
from .serializers import (           # NOTE: import các serializer đã tạo ở Bước 2 (để đổi Model <-> JSON)
    DanhMucMonDoSerializer,
    MauSacSerializer,
    MuaSerializer,
    ChatLieuSerializer,
    PhongCachSerializer,
    FormSerializer,
    HoSoNguoiDungSerializer,
    MonDoSerializer,
    TrangPhucSerializer,
    LichTrangPhucSerializer,
    ChiTietTrangPhucSerializer,
    DanhMucFormSerializer,
)

import os                                              # NOTE: thao tác đường dẫn/thư mục
import json                                            # NOTE: chuyển đổi dữ liệu sang JSON string
from PIL import Image                                  # NOTE: thư viện Pillow - convert/resize ảnh đại diện
from django.conf import settings                       # NOTE: đọc MEDIA_ROOT (nơi lưu ảnh user upload)


# ==============================================================================
# 1. VIEWSET CÁC BẢNG DANH MỤC
# ==============================================================================
# Mỗi ViewSet kế thừa ModelViewSet nên TỰ ĐỘNG có đủ 5 thao tác:
#   - list (xem danh sách) / retrieve (xem 1 bản ghi)
#   - create (thêm) / update (sửa) / destroy (xóa)
# Chỉ cần khai báo 2 thuộc tính: queryset (nguồn dữ liệu) + serializer_class.

class DanhMucMonDoViewSet(viewsets.ModelViewSet):
    """NOTE: API quản lý loại món đồ (áo, quần, giày...)."""
    queryset = DanhMucMonDo.objects.all()       # NOTE: nguồn dữ liệu = tất cả bản ghi DanhMucMonDo
    serializer_class = DanhMucMonDoSerializer   # NOTE: serializer dùng để đổi JSON


class MuaViewSet(viewsets.ModelViewSet):
    """NOTE: API quản lý mùa (xuân, hè, thu, đông)."""
    queryset = Mua.objects.all()
    serializer_class = MuaSerializer


class ChatLieuViewSet(viewsets.ModelViewSet):
    """NOTE: API quản lý chất liệu (cotton, len, kaki...)."""
    queryset = ChatLieu.objects.all()
    serializer_class = ChatLieuSerializer


class PhongCachViewSet(viewsets.ModelViewSet):
    """NOTE: API quản lý phong cách."""
    queryset = PhongCach.objects.all()
    serializer_class = PhongCachSerializer


class FormViewSet(viewsets.ModelViewSet):
    """NOTE: API quản lý form dáng."""
    queryset = Form.objects.all()
    serializer_class = FormSerializer


class DanhMucFormViewSet(viewsets.ModelViewSet):
    """NOTE: API quản lý liên kết danh mục - form dáng."""
    queryset = DanhMucForm.objects.all()
    serializer_class = DanhMucFormSerializer


class MauSacViewSet(viewsets.ModelViewSet):
    """NOTE: API quản lý màu sắc."""
    queryset = MauSac.objects.all()
    serializer_class = MauSacSerializer


# ==============================================================================
# 2. VIEWSET CÁC BẢNG THỰC THỂ CHÍNH
# ==============================================================================

class HoSoNguoiDungViewSet(viewsets.ModelViewSet):
    """NOTE: API quản lý hồ sơ người dùng (thông tin cá nhân)."""
    queryset = HoSoNguoiDung.objects.all()
    serializer_class = HoSoNguoiDungSerializer


class MonDoViewSet(viewsets.ModelViewSet):
    """NOTE: API quản lý tủ quần áo (món đồ của người dùng)."""
    queryset = MonDo.objects.all()
    serializer_class = MonDoSerializer


class TrangPhucViewSet(viewsets.ModelViewSet):
    """NOTE: API quản lý set đồ (trang phục hoàn chỉnh)."""
    queryset = TrangPhuc.objects.all()
    serializer_class = TrangPhucSerializer


class LichTrangPhucViewSet(viewsets.ModelViewSet):
    """NOTE: API quản lý lịch mặc theo ngày."""
    queryset = LichTrangPhuc.objects.all()
    serializer_class = LichTrangPhucSerializer


class ChiTietTrangPhucViewSet(viewsets.ModelViewSet):
    """NOTE: API quản lý các món đồ thành phần của một set đồ."""
    queryset = ChiTietTrangPhuc.objects.all()
    serializer_class = ChiTietTrangPhucSerializer

# @api_view(['GET','POST'])
# def mondo_list(request, format=None):
#     if request.method == 'GET':
#         mondo = MonDo.objects.all()
#         serializer = MonDoSerializer(mondo, many=True)
#         return Response(serializer.data)


# ==============================================================================
# 3. GIAO DIỆN WEB - ĐĂNG NHẬP (Chương 7: Xác thực người dùng)
# ==============================================================================
# NOTE: Dưới đây là View THƯỜNG (hàm), trả trang HTML qua template - KHÔNG dùng cho API.

def login_view(request):
    """NOTE: Xử lý trang đăng nhập: GET xem form, POST kiểm tra tài khoản."""

    if request.method == 'POST':                 # NOTE: người dùng bấm "Tiếp tục" -> gửi POST
        form = LoginForm(request.POST)           # NOTE: đổ dữ liệu gửi lên (request.POST) vào form để kiểm tra
        if form.is_valid():                      # NOTE: kiểm tra form hợp lệ (vd: không để trống)
            so_dien_thoai = form.cleaned_data['so_dien_thoai']  # NOTE: lấy SĐT đã được làm sạch
            mat_khau = form.cleaned_data['mat_khau']            # NOTE: lấy mật khẩu thô người dùng gõ

            # NOTE: Đăng nhập bằng SĐT (= username). Tìm User trực tiếp trong auth_user.
            # (Trước đây tìm qua HoSoNguoiDung.so_dien_thoai, nhưng trường đó đã bị xóa -
            #  nay SĐT chỉ lưu ở auth_user.username.)
            try:
                user = User.objects.get(username=so_dien_thoai)
            except User.DoesNotExist:
                user = None                      # NOTE: không thấy tài khoản -> None để xử lý chung bên dưới

            # NOTE: kiểm tra MẬT KHẨU (đã băm) VÀ tài khoản còn hoạt động (is_active).
            if user is not None and user.check_password(mat_khau) and user.is_active:
                login(request, user)             # NOTE: ghi phiên đăng nhập -> các request sau có request.user = user
                return redirect('trang_chu')     # NOTE: đăng nhập ok -> chuyển về trang chủ
            else:
                # NOTE: add_error(None,...) = lỗi KHÔNG thuộc 1 trường cụ thể -> hiện ở đầu form, tránh lộ "SĐT nào sai".
                form.add_error(None, "Số điện thoại hoặc mật khẩu không đúng.")
    else:                                        # NOTE: GET (mở trang) -> tạo form rỗng để hiển thị
        form = LoginForm()

    # NOTE: render trả trang HTML 'accounts/login.html', truyền 'form' để template vẽ ô nhập.
    return render(request, 'html/dang_nhap.html', {'form': form})


def logout_view(request):
    """NOTE: Đăng xuất - xoá phiên rồi chuyển về trang đăng nhập."""
    logout(request)                              # NOTE: xoá dữ liệu phiên (session) của user hiện tại
    return redirect('login')                     # NOTE: quay về trang đăng nhập


@login_required(login_url='login')               # NOTE: chưa đăng nhập -> tự chuyển về /login/
def trang_chu(request):
    """NOTE: Trang chủ sau khi đăng nhập (chỉ người đã đăng nhập mới xem được)."""
    # NOTE: pop() đọc rồi xoá cờ => popup chỉ hiện đúng 1 lần (sau đăng ký HOẶC sau quên mật khẩu).
    show_popup = False
    popup_title = ''
    popup_sub = ''
    if request.session.pop('dang_ky_thanh_cong', False):
        show_popup = True
        popup_title = 'Bạn đã đăng ký thành công'
        popup_sub = 'Hãy xây dựng tủ đồ trực tuyến của bạn'
    elif request.session.pop('quen_mk_thanh_cong', False):
        show_popup = True
        popup_title = 'Cập nhật mật khẩu thành công'
        popup_sub = 'Tiếp tục xây dựng tủ đồ của mình nào!'
    elif request.session.pop('cap_nhat_thanh_cong', False):
        show_popup = True
        popup_title = 'Cập nhật thành công'
        popup_sub = 'Thông tin của bạn đã được lưu lại!'
    # NOTE: món đồ gần đây của CHÍNH user đang đăng nhập (đổ thật lên trang chủ, không còn ảnh cứng).
    mon_do_gan_day = MonDo.objects.filter(nguoi_dung=request.user).order_by('-ma_mon_do')[:10]
    return render(request, 'html/trang_chu.html', {
        'show_popup': show_popup,
        'popup_title': popup_title,
        'popup_sub': popup_sub,
        'mon_do_gan_day': mon_do_gan_day,
    })


@login_required(login_url='login')
def dang_phat_trien(request):
    """NOTE: Placeholder cho các tính năng chưa hoàn thiện (Thử đồ ảo, Thống kê phong cách, Tìm mảnh ghép...).

    Nhận ?ten=<tên tính năng> qua query string để hiển thị cụ thể.
    """
    ten_tinh_nang = request.GET.get('ten', 'Tính năng này')  # NOTE: tên tính năng truyền qua URL (?ten=)
    return render(request, 'html/dang_phat_trien.html', {'ten_tinh_nang': ten_tinh_nang})


@login_required(login_url='login')
def tu_do(request):
    """NOTE: Trang Tủ đồ - hiển thị danh sách món đồ của CHÍNH user đang đăng nhập."""
    danh_muc_chon = request.GET.get('ma_danh_muc')
    mon_do_list = MonDo.objects.filter(nguoi_dung=request.user).order_by('-ma_mon_do')
    
    if danh_muc_chon:
        mon_do_list = mon_do_list.filter(ma_danh_muc_id=danh_muc_chon)
        
    # --- Logic lọc nâng cao (từ popup) ---
    chat_lieu_ids = request.GET.getlist('chat_lieu')
    phong_cach_ids = request.GET.getlist('phong_cach')
    mua_ids = request.GET.getlist('mua')
    mau_sac_ids = request.GET.getlist('mau_sac')
    form_dang_ids = request.GET.getlist('form_dang')
    danh_gia_filter = request.GET.get('danh_gia')
    
    if chat_lieu_ids:
        mon_do_list = mon_do_list.filter(chat_lieu__in=chat_lieu_ids)
    if phong_cach_ids:
        mon_do_list = mon_do_list.filter(phong_cach__in=phong_cach_ids)
    if mua_ids:
        mon_do_list = mon_do_list.filter(mua__in=mua_ids)
    if mau_sac_ids:
        mon_do_list = mon_do_list.filter(mau_sac__in=mau_sac_ids)
    if form_dang_ids:
        mon_do_list = mon_do_list.filter(form_dang__in=form_dang_ids)
    if danh_gia_filter and danh_gia_filter.isdigit():
        danh_gia_val = int(danh_gia_filter)
        if danh_gia_val > 0:
            mon_do_list = mon_do_list.filter(danh_gia__gte=danh_gia_val)
        
    # Đảm bảo kết quả không bị trùng lặp do ManyToMany
    if any([chat_lieu_ids, phong_cach_ids, mua_ids, mau_sac_ids, form_dang_ids]):
        mon_do_list = mon_do_list.distinct()
        
    # --- Lấy dữ liệu cho các bộ lọc ---

    from django.db.models import Q
    # pyrefly: ignore [missing-import]
    from .models import ChatLieu, PhongCach, Mua, MauSac, Form
    
    # Lọc thuộc tính: lấy giá trị chung (null) và giá trị của riêng user này
    user_filter = Q(nguoi_dung__isnull=True) | Q(nguoi_dung=request.user)
    
    danh_muc_list = DanhMucMonDo.objects.filter(user_filter)
    
    # Chuyển đổi các danh sách ID sang chuỗi an toàn (JSON) để dùng bên Javascript
    import json
    
    them_thanh_cong = request.session.pop('them_thanh_cong', False)
    cap_nhat_thanh_cong = request.session.pop('cap_nhat_thanh_cong', False)
    
    return render(request, 'html/tu_do.html', {
        'them_thanh_cong': them_thanh_cong,
        'cap_nhat_thanh_cong': cap_nhat_thanh_cong,
        'mon_do_list': mon_do_list,
        'danh_muc_list': danh_muc_list,
        'danh_muc_chon': danh_muc_chon,
        # Danh sách cho popup bộ lọc
        'chatlieu_list': ChatLieu.objects.filter(user_filter),
        'phongcach_list': PhongCach.objects.filter(user_filter),
        'mua_list': Mua.objects.filter(user_filter),
        'mausac_list': MauSac.objects.filter(user_filter),
        'formdang_list': Form.objects.filter(user_filter),
        # Danh sách đã chọn (dùng cho JS)
        'selected_chat_lieu': json.dumps(chat_lieu_ids),
        'selected_phong_cach': json.dumps(phong_cach_ids),
        'selected_mua': json.dumps(mua_ids),
        'selected_mau_sac': json.dumps(mau_sac_ids),
        'selected_form_dang': json.dumps(form_dang_ids),
        'selected_danh_gia': danh_gia_filter or "0",
        'hien_thi_sao': True,
        'hien_thi_chat_lieu': True,
        'hien_thi_phong_cach': True,
        'hien_thi_mua': True,
        'hien_thi_mau_sac': True,
        'hien_thi_form_dang': True,
    })


@login_required(login_url='login')
def them_mon_do(request):
    """NOTE: Trang thêm/sửa món đồ - GET hiển thị form, POST lưu/cập nhật DB."""
    next_url = request.GET.get('next', '') or request.POST.get('next', '')
    source = request.GET.get('source', '')
    mon_do_id = request.GET.get('id') or request.POST.get('mon_do_id')
    if mon_do_id == 'None':
        mon_do_id = ''

    if request.method == 'POST':
        ten_mon_do = request.POST.get('ten_mon_do', '').strip() or "Món đồ mới"

        # 1. Xử lý Danh mục
        ma_danh_muc = request.POST.get('ma_danh_muc')
        danh_muc_obj = None
        if ma_danh_muc == 'khac':
            danh_muc_khac = request.POST.get('danh_muc_khac', '').strip()
            if danh_muc_khac:
                danh_muc_obj, _ = DanhMucMonDo.objects.get_or_create(ten_danh_muc=danh_muc_khac, nguoi_dung=request.user)
        elif ma_danh_muc:
            danh_muc_obj = DanhMucMonDo.objects.filter(pk=ma_danh_muc).first()

        danh_gia_str = request.POST.get('danh_gia', '0')
        try:
            danh_gia = int(danh_gia_str)
        except ValueError:
            danh_gia = 0

        # Tìm để cập nhật hoặc Tạo mới MonDo
        mon = None
        if mon_do_id:
            mon = MonDo.objects.filter(pk=mon_do_id, nguoi_dung=request.user).first()
            if mon:
                mon.ten_mon_do = ten_mon_do
                mon.ma_danh_muc = danh_muc_obj
                mon.danh_gia = danh_gia
                mon.save()
        if not mon:
            mon = MonDo.objects.create(
                nguoi_dung=request.user,
                ten_mon_do=ten_mon_do,
                ma_danh_muc=danh_muc_obj,
                danh_gia=danh_gia,
            )

        # 2. Xử lý Màu sắc
        mau_sac_ids = request.POST.getlist('mau_sac')
        mau_sac_valid = [i for i in mau_sac_ids if i and i != 'khac']
        mau_sac_objs = list(MauSac.objects.filter(pk__in=mau_sac_valid))
        if 'khac' in mau_sac_ids:
            mau_sac_khac = request.POST.get('mau_sac_khac', '').strip()
            if mau_sac_khac:
                m_obj, _ = MauSac.objects.get_or_create(ten_mau_sac=mau_sac_khac, nguoi_dung=request.user)
                mau_sac_objs.append(m_obj)
        mon.mau_sac.set(mau_sac_objs)

        # 3. Xử lý Chất liệu
        chat_lieu_ids = request.POST.getlist('chat_lieu')
        chat_lieu_valid = [i for i in chat_lieu_ids if i and i != 'khac']
        chat_lieu_objs = list(ChatLieu.objects.filter(pk__in=chat_lieu_valid))
        if 'khac' in chat_lieu_ids:
            chat_lieu_khac = request.POST.get('chat_lieu_khac', '').strip()
            if chat_lieu_khac:
                c_obj, _ = ChatLieu.objects.get_or_create(ten_chat_lieu=chat_lieu_khac, nguoi_dung=request.user)
                chat_lieu_objs.append(c_obj)
        mon.chat_lieu.set(chat_lieu_objs)

        # 4. Xử lý Mùa
        mua_ids = request.POST.getlist('mua')
        mua_valid = [i for i in mua_ids if i and i != 'khac']
        mua_objs = list(Mua.objects.filter(pk__in=mua_valid))
        if 'khac' in mua_ids:
            mua_khac = request.POST.get('mua_khac', '').strip()
            if mua_khac:
                mua_obj, _ = Mua.objects.get_or_create(ten_mua=mua_khac, nguoi_dung=request.user)
                mua_objs.append(mua_obj)
        mon.mua.set(mua_objs)

        # 5. Xử lý Phong cách
        phong_cach_ids = request.POST.getlist('phong_cach')
        phong_cach_valid = [i for i in phong_cach_ids if i and i != 'khac']
        phong_cach_objs = list(PhongCach.objects.filter(pk__in=phong_cach_valid))
        if 'khac' in phong_cach_ids:
            phong_cach_khac = request.POST.get('phong_cach_khac', '').strip()
            if phong_cach_khac:
                pc_obj, _ = PhongCach.objects.get_or_create(ten_phong_cach=phong_cach_khac, nguoi_dung=request.user)
                phong_cach_objs.append(pc_obj)
        mon.phong_cach.set(phong_cach_objs)

        # 6. Xử lý Form dáng
        form_ids = request.POST.getlist('form_dang')
        form_valid = [i for i in form_ids if i and i != 'khac']
        form_objs = list(Form.objects.filter(pk__in=form_valid))
        if 'khac' in form_ids:
            form_khac = request.POST.get('form_khac', '').strip()
            if form_khac:
                f_obj, _ = Form.objects.get_or_create(ten_form=form_khac, nguoi_dung=request.user)
                form_objs.append(f_obj)
                if danh_muc_obj:
                    DanhMucForm.objects.get_or_create(ma_danh_muc=danh_muc_obj, ma_form=f_obj)
        mon.form_dang.set(form_objs)

        # 7. Xử lý Ảnh
        anh = request.FILES.get('hinh_anh')
        if anh:
            duong_dan = luu_anh_mon_do(anh, request.user.id, mon.ma_mon_do)
            mon.hinh_anh_trang_phuc = duong_dan
            mon.save()

        if mon_do_id:
            request.session['cap_nhat_thanh_cong'] = True
        else:
            request.session['them_thanh_cong'] = True

        if next_url:
            return redirect(next_url)
            
        return redirect('tu_do')

    # GET
    from django.db.models import Q
    user_filter = Q(nguoi_dung__isnull=True) | Q(nguoi_dung=request.user)
    
    danh_muc_list = DanhMucMonDo.objects.filter(user_filter)
    form_list = Form.objects.filter(user_filter)
    phong_cach_list = PhongCach.objects.filter(user_filter)
    mau_sac_list = MauSac.objects.filter(user_filter)
    chat_lieu_list = ChatLieu.objects.filter(user_filter)
    mua_list = Mua.objects.filter(user_filter)
    danh_muc_form_list = json.dumps(list(DanhMucForm.objects.values('ma_danh_muc_id', 'ma_form_id')))

    # Chuẩn bị dữ liệu nếu đang ở chế độ chỉnh sửa
    mon_do_data = None
    if mon_do_id:
        mon = MonDo.objects.filter(pk=mon_do_id, nguoi_dung=request.user).first()
        if mon:
            mon_do_data = json.dumps({
                'id': mon.ma_mon_do,
                'ten_mon_do': mon.ten_mon_do,
                'image_url': mon.image_url,
                'ma_danh_muc': mon.ma_danh_muc.pk if mon.ma_danh_muc else '',
                'form_dang': [f.pk for f in mon.form_dang.all()] if mon.form_dang.exists() else '',
                'phong_cach': [p.pk for p in mon.phong_cach.all()] if mon.phong_cach.exists() else '',
                'mau_sac': [m.pk for m in mon.mau_sac.all()] if mon.mau_sac.exists() else '',
                'chat_lieu': [c.pk for c in mon.chat_lieu.all()] if mon.chat_lieu.exists() else '',
                'mua': [m.pk for m in mon.mua.all()] if mon.mua.exists() else '',
                'danh_gia': mon.danh_gia,
            })

    context = {
        'next_url': next_url,
        'source': source,
        'mon_do_id': mon_do_id,
        'mon_do_data': mon_do_data,
        'danh_muc_list': danh_muc_list,
        'form_list': form_list,
        'phong_cach_list': phong_cach_list,
        'mau_sac_list': mau_sac_list,
        'chat_lieu_list': chat_lieu_list,
        'mua_list': mua_list,
        'danh_muc_form_list': danh_muc_form_list,
    }
    return render(request, 'html/them_mon_do.html', context)



# ==============================================================================
# 4. ĐĂNG KÝ TÀI KHOẢN (luồng 5 bước: SĐT -> OTP -> Mật khẩu -> Thông tin -> Trang chủ)
# ==============================================================================
# NOTE: Mỗi bước LƯU dữ liệu vào session rồi redirect() sang bước kế.
# NOTE: OTP cố định = 999999 trong môi trường dev (chưa tích hợp gửi SMS thật).

OTP_MAC_DINH = '999999'  # NOTE: mã OTP giả lập cho dev (sau này thay bằng gửi SMS)


def dang_ky_sdt(request):
    """NOTE (Bước 1): Nhập SĐT -> kiểm tra hợp lệ + chưa tồn tại -> sinh OTP -> redirect bước OTP."""
    if request.method == 'POST':
        form = DangKySDTForm(request.POST)
        if form.is_valid():
            sdt = form.cleaned_data['so_dien_thoai']
            request.session['dang_ky_sdt'] = sdt          # NOTE: LƯU SĐT vào session (Bước 2 sẽ đọc)
            request.session['dang_ky_otp'] = OTP_MAC_DINH  # NOTE: LƯU OTP vào session (Bước 2 sẽ so sánh)
            return redirect('xac_thuc_otp')
    else:
        form = DangKySDTForm()
    return render(request, 'html/tao_tai_khoan.html', {'form': form})


def xac_thuc_otp(request):
    """NOTE (Bước 2): Nhập OTP -> so với session -> đúng thì cho qua bước tạo mật khẩu."""
    # NOTE (bảo mật): chưa qua Bước 1 (không có SĐT trong session) -> đá về Bước 1
    sdt = request.session.get('dang_ky_sdt')
    if not sdt:
        return redirect('dang_ky_sdt')

    if request.method == 'POST':
        form = XacThucOTPForm(request.POST)
        if form.is_valid():
            otp_nhap = form.cleaned_data['otp']
            otp_dung = request.session.get('dang_ky_otp')
            if otp_nhap == otp_dung:
                request.session['dang_ky_da_xac_thuc'] = True  # NOTE: đánh dấu đã xác thực OTP
                return redirect('tao_mat_khau')
            else:
                form.add_error(None, "Mã OTP không đúng. (Dev: mã là 999999)")
    else:
        form = XacThucOTPForm()
    return render(request, 'html/xac_thuc_otp.html', {'form': form, 'so_dien_thoai': sdt})


def tao_mat_khau(request):
    """NOTE (Bước 3): Nhập mật khẩu + xác nhận -> lưu session -> redirect bước thông tin."""
    # NOTE (bảo mật): chưa xác thực OTP -> đá về Bước 1
    if not request.session.get('dang_ky_da_xac_thuc'):
        return redirect('dang_ky_sdt')

    if request.method == 'POST':
        form = TaoMatKhauForm(request.POST)
        if form.is_valid():
            request.session['dang_ky_mat_khau'] = form.cleaned_data['mat_khau']  # NOTE: LƯU mật khẩu vào session
            return redirect('dang_ky_thong_tin')
    else:
        form = TaoMatKhauForm()
    return render(request, 'html/cap_nhat_mat_khau.html', {'form': form})


def luu_anh_dai_dien(file_upload, user_id):
    """NOTE: Lưu ảnh đại diện vào media/{user_id}/avatar.jpg (convert JPEG + resize tối đa 512px)."""
    thu_muc = settings.MEDIA_ROOT / str(user_id)     # NOTE: thư mục riêng từng user -> media/{user_id}/
    thu_muc.mkdir(parents=True, exist_ok=True)       # NOTE: tạo thư mục nếu chưa có
    duong_dan = thu_muc / "avatar.jpg"               # NOTE: tên cố định avatar.jpg -> đổi avatar sẽ ghi đè

    # NOTE: ghép nền trắng trước khi sang JPEG (tránh lỗi nền đen với ảnh PNG trong suốt).
    img = Image.open(file_upload).convert('RGBA')
    nen_trang = Image.new('RGBA', img.size, (255, 255, 255, 255))
    nen_trang.paste(img, mask=img.split()[3])        # NOTE: dán ảnh lên nền trắng theo kênh alpha
    img = nen_trang.convert('RGB')

    img.thumbnail((512, 512))                        # NOTE: thu nhỏ giữ tỉ lệ, tối đa 512x512 (tối ưu mobile)
    img.save(duong_dan, 'JPEG', quality=85)          # NOTE: lưu dạng JPEG

    return f"{user_id}/avatar.jpg"                   # NOTE: trả đường dẫn RELATIVE để cất vào DB


def luu_anh_mon_do(file_upload, user_id, mon_do_id):
    """NOTE: Lưu ảnh món đồ vào media/{user_id}/{mon_do_id}.{ext} (convert JPEG + resize tối đa 800px).
    Trả về tên file (kèm extension) để lưu vào trường hinh_anh_trang_phuc."""
    import os
    from django.conf import settings
    from PIL import Image

    # Lấy extension từ tên file gốc, mặc định .jpg
    filename = getattr(file_upload, 'name', '')
    ext = os.path.splitext(filename)[1]
    if not ext:
        ext = '.jpg'
    ext = ext.lower()
    # Đảm bảo extension hợp lệ
    if ext not in ['.jpg', '.jpeg', '.png', '.webp', '.bmp', '.gif']:
        ext = '.jpg'

    # Đường dẫn lưu: media/{user_id}/{mon_do_id}{ext}
    thu_muc = settings.MEDIA_ROOT / str(user_id)
    thu_muc.mkdir(parents=True, exist_ok=True)
    ten_file = f"{mon_do_id}{ext}"
    duong_dan = thu_muc / ten_file

    img = Image.open(file_upload).convert('RGBA')
    nen_trang = Image.new('RGBA', img.size, (255, 255, 255, 255))
    nen_trang.paste(img, mask=img.split()[3])
    img = nen_trang.convert('RGB')

    # Resize tối đa 800px giữ tỉ lệ
    img.thumbnail((800, 800))
    img.save(duong_dan, 'JPEG' if ext in ['.jpg', '.jpeg'] else ext.upper().lstrip('.'), quality=85)

    # Trả về tên file (kèm extension) để lưu vào DB
    return ten_file


def dang_ky_thong_tin(request):
    """NOTE (Bước 4): Nhập thông tin cá nhân -> tạo User + HoSoNguoiDung -> login -> trang chủ."""
    # NOTE (bảo mật): chưa xác thực OTP -> đá về Bước 1
    if not request.session.get('dang_ky_da_xac_thuc'):
        return redirect('dang_ky_sdt')

    if request.method == 'POST':
        form = ThongTinCaNhanForm(request.POST, request.FILES)  # NOTE: thêm request.FILES để nhận ảnh upload
        if form.is_valid():
            sdt = request.session.get('dang_ky_sdt')
            mat_khau = request.session.get('dang_ky_mat_khau')
            ho_ten = form.cleaned_data['ho_ten']
            gioi_tinh = form.cleaned_data['gioi_tinh']
            anh = form.cleaned_data.get('anh_dai_dien')  # NOTE: ảnh người dùng chọn (có thể rỗng)
            # NOTE: Lấy "cài đặt gợi ý" nhập trực tiếp trên trang (ô textarea nội tuyến, không chuyển trang).
            quy_dinh_phoi_do = request.POST.get('quy_dinh_phoi_do', '').strip()

            # NOTE: Tạo User trong auth_user (username = SĐT, mật khẩu tự băm qua create_user).
            user = User.objects.create_user(username=sdt, password=mat_khau)

            # NOTE: Nếu có tải ảnh lên -> lưu thành avatars/{user.id}.jpg rồi cất đường dẫn (string).
            anh_dai_dien = luu_anh_dai_dien(anh, user.id) if anh else ''

            # NOTE: Tạo hồ sơ người dùng liên kết 1-1 với User vừa tạo.
            # (SĐT không lưu ở hồ sơ nữa - đã lấy qua user.username.)
            HoSoNguoiDung.objects.create(
                nguoi_dung=user,
                ho_ten=ho_ten,
                gioi_tinh=gioi_tinh,
                anh_dai_dien=anh_dai_dien,           # NOTE: lưu đường dẫn ảnh (string) - rỗng nếu chưa có ảnh
                quy_dinh_phoi_do=quy_dinh_phoi_do or None,  # NOTE: cài đặt gợi ý (rỗng -> None cho gọn)
            )

            # NOTE: Xoá toàn bộ session đăng ký (đã dùng xong, không cần nữa).
            for key in ['dang_ky_sdt', 'dang_ky_otp', 'dang_ky_da_xac_thuc', 'dang_ky_mat_khau']:
                request.session.pop(key, None)

            login(request, user)         # NOTE: tự động đăng nhập cho user mới
            request.session['dang_ky_thanh_cong'] = True  # NOTE: báo trang chủ hiện popup chúc mừng (1 lần)
            return redirect('trang_chu')
    else:
        form = ThongTinCaNhanForm()
    # NOTE: quy_dinh_phoi_do đổ lại vào ô textarea (giữ giá trị nếu form lỗi phải render lại).
    return render(request, 'html/dang_ky_thong_tin_ca_nhan.html', {
        'form': form,
        'quy_dinh_phoi_do': request.POST.get('quy_dinh_phoi_do', ''),
    })


# ==============================================================================
# 5. QUÊN MẬT KHẨU (luồng 3 bước: SĐT -> OTP -> Đặt MK mới)
# ==============================================================================
# NOTE: Dùng session key riêng "quen_mk_*" để KHÔNG đụng chạm luồng đăng ký ("dang_ky_*").
# NOTE: Tái dùng 3 template sẵn có (tao_tai_khoan / xac_thuc_otp / cap_nhat_mat_khau),
#       chỉ truyền thêm biến tiêu đề (title/subtitle/button_text) để đổi chữ cho phù hợp.

def quen_mat_khau(request):
    """NOTE (Quên MK - Bước 1): Nhập SĐT (phải ĐÃ TỒN TẠI) -> sinh OTP -> sang bước OTP."""
    if request.method == 'POST':
        form = QuenMatKhauForm(request.POST)
        if form.is_valid():
            sdt = form.cleaned_data['so_dien_thoai']
            request.session['quen_mk_sdt'] = sdt            # NOTE: LƯU SĐT vào session (Bước 2 đọc)
            request.session['quen_mk_otp'] = OTP_MAC_DINH    # NOTE: LƯU OTP vào session (Bước 2 so sánh)
            return redirect('quen_mk_xac_thuc_otp')
    else:
        form = QuenMatKhauForm()
    # NOTE: tái dùng tao_tai_khoan.html, đổi tiêu đề/phụ đề/nút cho ngữ cảnh "quên mật khẩu".
    return render(request, 'html/tao_tai_khoan.html', {
        'form': form,
        'title': 'Quên mật khẩu',
        'subtitle': 'Nhập số điện thoại đã đăng ký để đặt lại mật khẩu',
        'button_text': 'Gửi mã xác thực',
    })


def quen_mk_xac_thuc_otp(request):
    """NOTE (Quên MK - Bước 2): Nhập OTP -> đúng thì cho qua bước đặt mật khẩu mới."""
    # NOTE (bảo mật): chưa có SĐT trong session -> đá về Bước 1.
    sdt = request.session.get('quen_mk_sdt')
    if not sdt:
        return redirect('quen_mat_khau')

    if request.method == 'POST':
        form = XacThucOTPForm(request.POST)
        if form.is_valid():
            otp_nhap = form.cleaned_data['otp']
            otp_dung = request.session.get('quen_mk_otp')
            if otp_nhap == otp_dung:
                request.session['quen_mk_da_xac_thuc'] = True   # NOTE: đánh dấu đã xác thực OTP
                return redirect('quen_mk_mat_khau')
            else:
                form.add_error(None, "Mã OTP không đúng. (Dev: mã là 999999)")
    else:
        form = XacThucOTPForm()
    # NOTE: tái dùng xac_thuc_otp.html (giao diện này đã chung cho cả 2 luồng).
    return render(request, 'html/xac_thuc_otp.html', {'form': form, 'so_dien_thoai': sdt})


def quen_mk_mat_khau(request):
    """NOTE (Quên MK - Bước 3): Đặt mật khẩu mới cho tài khoản -> về trang đăng nhập."""
    sdt = request.session.get('quen_mk_sdt')
    # NOTE (bảo mật): chưa có SĐT HOẶC chưa xác thực OTP -> đá về Bước 1.
    if not sdt or not request.session.get('quen_mk_da_xac_thuc'):
        return redirect('quen_mat_khau')

    if request.method == 'POST':
        form = TaoMatKhauForm(request.POST)        # NOTE: tái dùng form (kiểm tra khớp + tối thiểu 6 ký tự)
        if form.is_valid():
            mat_khau_moi = form.cleaned_data['mat_khau']
            user = User.objects.get(username=sdt)  # NOTE: lấy tài khoản theo SĐT (= username)
            user.set_password(mat_khau_moi)        # NOTE: đặt mật khẩu mới (tự băm)
            user.save()

            # NOTE: Xoá session quên mật khẩu (đã dùng xong).
            for key in ['quen_mk_sdt', 'quen_mk_otp', 'quen_mk_da_xac_thuc']:
                request.session.pop(key, None)

            login(request, user)                          # NOTE: tự đăng nhập luôn (giống luồng đăng ký)
            request.session['quen_mk_thanh_cong'] = True  # NOTE: báo trang chủ hiện popup (1 lần)
            return redirect('trang_chu')                  # NOTE: về trang chủ + hiện popup cập nhật MK
    else:
        form = TaoMatKhauForm()
    # NOTE: tái dùng cap_nhat_mat_khau.html, đổi tiêu đề + nút cho "đặt mật khẩu mới".
    return render(request, 'html/cap_nhat_mat_khau.html', {
        'form': form,
        'title': 'Đặt mật khẩu mới',
        'button_text': 'Đặt mật khẩu',
    })



#========= TRANG PHỤC =======#
@login_required(login_url='login')
def sach_trang_phuc(request):
    trang_phuc_list = TrangPhuc.objects.filter(nguoi_dung=request.user)

    # Xử lý lọc
    mua_filter = request.GET.get('mua')
    phong_cach_filter = request.GET.get('phong_cach')
    sao_filter = request.GET.get('sao')
    form_dang_filter = request.GET.get('form_dang')

    if mua_filter:
        trang_phuc_list = trang_phuc_list.filter(mua__pk=mua_filter)
    if phong_cach_filter:
        trang_phuc_list = trang_phuc_list.filter(phong_cach__pk=phong_cach_filter)
    if form_dang_filter:
        trang_phuc_list = trang_phuc_list.filter(chi_tiet_mon_do__mon_do__form_dang__pk=form_dang_filter)
    if sao_filter:
        try:
            sao_val = int(sao_filter)
            if sao_val >= 4:
                trang_phuc_list = trang_phuc_list.filter(danh_gia=True)
            else:
                trang_phuc_list = trang_phuc_list.filter(danh_gia=False)
        except ValueError:
            pass

    trang_phuc_list = trang_phuc_list.order_by('-ma_trang_phuc').distinct()

    from django.db.models import Q
    user_filter = Q(nguoi_dung__isnull=True) | Q(nguoi_dung=request.user)
    mua_list = Mua.objects.filter(user_filter)
    phong_cach_list = PhongCach.objects.filter(user_filter)

    import json
    return render(request, 'html/sach_trang_phuc.html', {
        'trang_phuc_list': trang_phuc_list,
        'mua_list': mua_list,
        'phongcach_list': phong_cach_list,
        'formdang_list': Form.objects.filter(user_filter),
        'selected_mua': json.dumps([mua_filter] if mua_filter else []),
        'selected_phong_cach': json.dumps([phong_cach_filter] if phong_cach_filter else []),
        'selected_form_dang': json.dumps([form_dang_filter] if form_dang_filter else []),
        'selected_sao': json.dumps([sao_filter] if sao_filter else []),
        'hien_thi_sao': True,
        'hien_thi_chat_lieu': False,
        'hien_thi_phong_cach': True,
        'hien_thi_mua': True,
        'hien_thi_mau_sac': False,
        'hien_thi_form_dang': False,
    })

@login_required(login_url='login')
def chinh_sua_trang_phuc(request):
    """NOTE: Trang chỉnh sửa trang phục (phối đồ tự do)."""
    trang_phuc_id = request.GET.get('id')
    trang_phuc_data = None
    
    if trang_phuc_id:
        import json
        tp = TrangPhuc.objects.filter(pk=trang_phuc_id, nguoi_dung=request.user).first()
        if tp:
            items = []
            for ct in tp.chitiettrangphuc_set.all():
                mon = ct.ma_mon_do
                items.append({
                    'id': mon.ma_mon_do,
                    'image_url': mon.image_url
                })
            
            trang_phuc_data = json.dumps({
                'id': tp.ma_trang_phuc,
                'ten_trang_phuc': tp.ten_trang_phuc,
                'rating': 5 if tp.danh_gia else 0,
                'items': items,
                'mua': [m.pk for m in tp.mua.all()] if tp.mua.exists() else [],
                'phong_cach': [p.pk for p in tp.phong_cach.all()] if tp.phong_cach.exists() else []
            })
    
    xem_ngay = request.GET.get('xem_ngay')
    ngay_dang_xem_str = None
    day_outfits_data = []

    if xem_ngay and not trang_phuc_id:
        import json
        from datetime import datetime
        try:
            ngay_obj = datetime.strptime(xem_ngay, '%Y-%m-%d').date()
            ngay_dang_xem_str = ngay_obj.strftime("%d/%m/%Y")
            lich_list = LichTrangPhuc.objects.filter(nguoi_dung=request.user, ngay_mac=ngay_obj)
            
            for lich in lich_list:
                tp = lich.ma_trang_phuc
                items = []
                for ct in tp.chitiettrangphuc_set.all():
                    mon = ct.ma_mon_do
                    items.append({
                        'id': mon.ma_mon_do,
                        'image_url': mon.image_url
                    })
                
                day_outfits_data.append({
                    'id': tp.ma_trang_phuc,
                    'ten_trang_phuc': tp.ten_trang_phuc,
                    'rating': 5 if tp.danh_gia else 0,
                    'items': items,
                    'mua': [m.pk for m in tp.mua.all()] if tp.mua.exists() else [],
                    'phong_cach': [p.pk for p in tp.phong_cach.all()] if tp.phong_cach.exists() else []
                })
        except Exception as e:
            pass
            
    mon_do_list = MonDo.objects.filter(nguoi_dung=request.user).order_by('-ma_mon_do')
    from django.db.models import Q
    user_filter = Q(nguoi_dung__isnull=True) | Q(nguoi_dung=request.user)
    danh_muc_list = DanhMucMonDo.objects.filter(user_filter)
    mua_list = Mua.objects.filter(user_filter)
    phong_cach_list = PhongCach.objects.filter(user_filter)
    
    return render(request, 'html/chinh_sua_trang_phuc.html', {
        'mon_do_list': mon_do_list,
        'danh_muc_list': danh_muc_list,
        'mua_list': mua_list,
        'phong_cach_list': phong_cach_list,
        'trang_phuc_data': trang_phuc_data,
        'trang_phuc_id': trang_phuc_id,
        'day_outfits_data': json.dumps(day_outfits_data) if day_outfits_data else 'null',
        'ngay_dang_xem_str': ngay_dang_xem_str,
    })
# ==============================================================================
# AI API ENDPOINTS
# ==============================================================================
from django.http import HttpResponse, JsonResponse
import io
# pyrefly: ignore [missing-import]
from apps.services import ai_scanner
from PIL import Image
from rest_framework.decorators import api_view

@api_view(['POST'])
def api_quet_anh(request):
    """API: Tách nền bằng Segformer, trả về ảnh PNG"""
    file = request.FILES.get('hinh_anh')
    if not file:
        return JsonResponse({"error": "Không có ảnh được tải lên."}, status=400)
    
    try:
        image = Image.open(file).convert("RGB")
        cutout = ai_scanner.cutout_clothing(image)
        
        output = io.BytesIO()
        cutout.save(output, format="PNG")
        
        return HttpResponse(output.getvalue(), content_type="image/png")
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@api_view(['POST'])
def api_lay_thong_tin(request):
    """API: Lấy thông tin 6 thuộc tính bằng Qwen-VL, trả về JSON"""
    file = request.FILES.get('hinh_anh')
    if not file:
        return JsonResponse({"error": "Không có ảnh được tải lên."}, status=400)
    
    try:
        image = Image.open(file).convert("RGB")
        info = ai_scanner.tag_clothing(image)
        return JsonResponse(info)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@login_required
def api_luu_trang_phuc(request):
    """API lưu bộ trang phục mới do người dùng mix (AJAX)"""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            trang_phuc_id = data.get('trang_phuc_id')
            ten_trang_phuc = data.get('ten_trang_phuc', '').strip()
            rating = int(data.get('rating', 0))
            item_ids = data.get('item_ids', [])

            if not item_ids:
                return JsonResponse({"error": "Vui lòng chọn ít nhất 1 món đồ"}, status=400)

            # Đánh giá >= 4 sao thì coi là Tốt (True)
            danh_gia_boolean = rating >= 4

            if trang_phuc_id and trang_phuc_id != "None" and trang_phuc_id != "":
                trang_phuc = TrangPhuc.objects.filter(pk=trang_phuc_id, nguoi_dung=request.user).first()
                if not trang_phuc:
                    return JsonResponse({"error": "Không tìm thấy trang phục"}, status=404)
                trang_phuc.ten_trang_phuc = ten_trang_phuc
                trang_phuc.danh_gia = danh_gia_boolean
                trang_phuc.save()
                
                # Xóa chi tiết cũ để lưu lại
                ChiTietTrangPhuc.objects.filter(ma_trang_phuc=trang_phuc).delete()
            else:
                trang_phuc = TrangPhuc.objects.create(
                    nguoi_dung=request.user,
                    ten_trang_phuc=ten_trang_phuc,
                    danh_gia=danh_gia_boolean,
                    kieu_tao="Thủ công"
                )

            # 2. Lưu vào bảng ChiTietTrangPhuc
            for item_id in item_ids:
                mon_do = MonDo.objects.filter(ma_mon_do=item_id, nguoi_dung=request.user).first()
                if mon_do:
                    ChiTietTrangPhuc.objects.create(
                        ma_trang_phuc=trang_phuc,
                        ma_mon_do=mon_do
                    )

            # 3. Lưu Mùa và Phong cách
            mua_ids = data.get('mua', [])
            phong_cach_ids = data.get('phong_cach', [])
            
            if mua_ids:
                mua_objs = list(Mua.objects.filter(pk__in=mua_ids))
                trang_phuc.mua.set(mua_objs)
            else:
                trang_phuc.mua.clear()
                
            if phong_cach_ids:
                pc_objs = list(PhongCach.objects.filter(pk__in=phong_cach_ids))
                trang_phuc.phong_cach.set(pc_objs)
            else:
                trang_phuc.phong_cach.clear()

            # 4. Nếu đến từ trang Lịch, tự động thêm vào LichTrangPhuc
            ngay_mac_str = data.get('ngay_mac')
            if ngay_mac_str:
                from datetime import datetime
                ngay_mac = datetime.strptime(ngay_mac_str, '%Y-%m-%d').date()
                LichTrangPhuc.objects.create(
                    nguoi_dung=request.user,
                    ma_trang_phuc=trang_phuc,
                    ngay_mac=ngay_mac
                )

            return JsonResponse({"message": "Lưu trang phục thành công!", "ma_trang_phuc": trang_phuc.ma_trang_phuc}, status=200)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    return JsonResponse({"error": "Method not allowed"}, status=405)


@login_required
def api_xoa_trang_phuc(request):
    """API xóa trang phục (AJAX)"""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            trang_phuc_ids = data.get('ids', [])
            
            if not trang_phuc_ids:
                return JsonResponse({"error": "Không có trang phục nào được chọn"}, status=400)
                
            # Xóa các trang phục có id trong list và thuộc về user hiện tại
            TrangPhuc.objects.filter(pk__in=trang_phuc_ids, nguoi_dung=request.user).delete()
            
            return JsonResponse({"message": "Đã xóa thành công"}, status=200)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    return JsonResponse({"error": "Method not allowed"}, status=405)


@login_required
def api_xoa_mon_do(request):
    """API xóa món đồ (AJAX)"""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            mon_do_ids = data.get('ids', [])
            
            if not mon_do_ids:
                return JsonResponse({"error": "Không có món đồ nào được chọn"}, status=400)
                
            # Xóa các món đồ có id trong list và thuộc về user hiện tại
            MonDo.objects.filter(pk__in=mon_do_ids, nguoi_dung=request.user).delete()
            
            return JsonResponse({"message": "Đã xóa thành công"}, status=200)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    return JsonResponse({"error": "Method not allowed"}, status=405)



@login_required
def quan_li_trang_ca_nhan(request):
    """Trang quản lý thông tin cá nhân của người dùng"""
    if request.method == 'POST':
        ho_ten = request.POST.get('ho_ten', '').strip()
        gioi_tinh = request.POST.get('gioi_tinh', '')
        quy_dinh_phoi_do = request.POST.get('quy_dinh_phoi_do', '').strip()
        anh_dai_dien = request.FILES.get('anh_dai_dien')
        
        ho_so = request.user.ho_so
        if ho_ten:
            ho_so.ho_ten = ho_ten
        if gioi_tinh in ['nam', 'nu', 'khac']:
            ho_so.gioi_tinh = gioi_tinh
        ho_so.quy_dinh_phoi_do = quy_dinh_phoi_do or None
            
        if anh_dai_dien:
            # Sử dụng hàm luu_anh_dai_dien có sẵn (được định nghĩa ở phần đăng ký)
            duong_dan_anh = luu_anh_dai_dien(anh_dai_dien, request.user.id)
            if duong_dan_anh:
                ho_so.anh_dai_dien = duong_dan_anh
                
        ho_so.save()
        request.session['cap_nhat_thanh_cong'] = True
        return redirect('trang_chu')

    return render(request, 'html/quan_li_trang_ca_nhan.html')


@login_required
def cap_nhat_mat_khau(request):
    """Trang cập nhật mật khẩu từ màn hình Quản lý tài khoản cá nhân"""
    from django.contrib.auth import update_session_auth_hash
    
    if request.method == 'POST':
        mat_khau_hien_tai = request.POST.get('mat_khau_hien_tai', '')
        mat_khau = request.POST.get('mat_khau', '')
        xac_nhan = request.POST.get('xac_nhan_mat_khau', '')
        
        # NOTE: Giả lập struct form.non_field_errors cho view đơn giản
        form_errors = []
        
        if not mat_khau_hien_tai:
            form_errors.append("Vui lòng nhập mật khẩu hiện tại.")
        elif not request.user.check_password(mat_khau_hien_tai):
            form_errors.append("Mật khẩu hiện tại không đúng.")
            
        if not mat_khau or not xac_nhan:
            form_errors.append("Vui lòng nhập đầy đủ mật khẩu mới.")
        elif len(mat_khau) < 6:
            form_errors.append("Mật khẩu mới phải có ít nhất 6 ký tự.")
        elif mat_khau != xac_nhan:
            form_errors.append("Mật khẩu mới và xác nhận không khớp.")
            
        if not form_errors:
            # Hợp lệ -> Lưu mật khẩu mới
            user = request.user
            user.set_password(mat_khau)
            user.save()
            # Giữ trạng thái đăng nhập sau khi đổi mật khẩu
            update_session_auth_hash(request, user)
            
            # Quay lại trang chủ
            request.session['cap_nhat_thanh_cong'] = True
            return redirect('trang_chu')
            
        return render(request, 'html/cap_nhat_mat_khau.html', {
            'title': 'Cập nhật mật khẩu',
            'button_text': 'Cập nhật mật khẩu',
            'form': {'non_field_errors': form_errors},
            'require_current_password': True,
        })

    # GET request
    return render(request, 'html/cap_nhat_mat_khau.html', {
        'title': 'Cập nhật mật khẩu',
        'button_text': 'Cập nhật mật khẩu',
        'require_current_password': True,
    })

@login_required(login_url='login')
def lich_trang_phuc(request):
    """
    View trả về giao diện quản lý lịch trang phục
    """
    # Lấy danh sách trang phục của user để hiển thị trong popup chọn
    danh_sach_trang_phuc = TrangPhuc.objects.filter(nguoi_dung=request.user).order_by('-ma_trang_phuc')
    
    # Tính số lượng lịch trình mỗi ngày
    lich_items = LichTrangPhuc.objects.filter(nguoi_dung=request.user)
    lich_counts = {}
    for item in lich_items:
        date_str = item.ngay_mac.strftime('%Y-%m-%d')
        lich_counts[date_str] = lich_counts.get(date_str, 0) + 1
        
    import json
    lich_counts_json = json.dumps(lich_counts)
    
    
    from django.db.models import Q
    # pyrefly: ignore [missing-import]
    from .models import PhongCach, Mua, Form
    user_filter = Q(nguoi_dung__isnull=True) | Q(nguoi_dung=request.user)

    return render(request, 'html/lich_trang_phuc.html', {
        'danh_sach_trang_phuc': danh_sach_trang_phuc,
        'lich_counts_json': lich_counts_json,
        'mua_list': Mua.objects.filter(user_filter),
        'phongcach_list': PhongCach.objects.filter(user_filter),
        'formdang_list': Form.objects.filter(user_filter),
        'hien_thi_sao': True,
        'hien_thi_chat_lieu': False,
        'hien_thi_phong_cach': True,
        'hien_thi_mua': True,
        'hien_thi_mau_sac': False,
        'hien_thi_form_dang': False,
    })

@login_required(login_url='login')
# @require_POST
def api_them_lich_trang_phuc(request):
    """
    API thêm trang phục vào lịch
    """
    try:
        data = json.loads(request.body)
        ma_trang_phuc = data.get('ma_trang_phuc')
        ngay_mac_str = data.get('ngay_mac') # YYYY-MM-DD
        
        if not ma_trang_phuc or not ngay_mac_str:
            return JsonResponse({'success': False, 'message': 'Thiếu dữ liệu (ma_trang_phuc, ngay_mac).'}, status=400)
            
        trang_phuc = TrangPhuc.objects.get(ma_trang_phuc=ma_trang_phuc, nguoi_dung=request.user)
        from datetime import datetime
        ngay_mac = datetime.strptime(ngay_mac_str, '%Y-%m-%d').date()
        
        LichTrangPhuc.objects.create(
            nguoi_dung=request.user,
            ma_trang_phuc=trang_phuc,
            ngay_mac=ngay_mac
        )
        return JsonResponse({'success': True, 'message': 'Đã thêm thành công!'})
    except Exception as e:
        import traceback
        traceback.print_exc()
        return JsonResponse({'success': False, 'message': str(e)}, status=500)
