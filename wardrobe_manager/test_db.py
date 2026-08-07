import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'wardrobe_manager.settings')
django.setup()

from apps.models import LichTrangPhuc, TrangPhuc, Mua, PhongCach
from django.contrib.auth import get_user_model
import json
from datetime import datetime

User = get_user_model()
try:
    user = User.objects.first()
    print(f"User: {user.username}")
    
    lich_list = LichTrangPhuc.objects.filter(nguoi_dung=user)
    print(f"Found {lich_list.count()} lich items")
    
    day_outfits_data = []
    for lich in lich_list:
        tp = lich.ma_trang_phuc
        print(f" - Lich: {lich.ngay_mac}, Outfit: {tp.ten_trang_phuc}")
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
        
    print("Serialized:")
    print(json.dumps(day_outfits_data))
    
except Exception as e:
    print(f"Error: {e}")
