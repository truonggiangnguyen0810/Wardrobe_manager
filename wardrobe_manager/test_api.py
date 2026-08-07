import requests
import json

url = "http://127.0.0.1:8000/api/luu-trang-phuc/"
data = {
    "trang_phuc_id": "",
    "ten_trang_phuc": "Test outfit",
    "rating": 5,
    "item_ids": [] # We should expect 400 error: "Vui lòng chọn ít nhất 1 món đồ"
}

try:
    response = requests.post(url, json=data)
    print("Status:", response.status_code)
    print("Response:", response.text)
except Exception as e:
    print("Error:", e)
