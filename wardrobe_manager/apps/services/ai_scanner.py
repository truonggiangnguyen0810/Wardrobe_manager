"""
Tích hợp trực tiếp mô hình Segformer và Qwen3-VL vào Django.
Sử dụng lazy-load để chỉ nạp mô hình vào RAM 1 lần duy nhất khi có request đầu tiên.
"""
from __future__ import annotations

import os
from django.conf import settings

# Thiết lập đường dẫn tới thư mục chứa models (service-api) TRƯỚC khi import thư viện AI.
hf_home_path = os.path.join(settings.BASE_DIR, 'service-api')
os.environ.setdefault("HF_HOME", hf_home_path)
os.environ["HF_HUB_OFFLINE"] = "1"
os.environ["TRANSFORMERS_OFFLINE"] = "1"

import json
import logging
import re
from typing import Optional, List
import numpy as np
import torch
import torch.nn.functional as F
from PIL import Image, ImageFilter
from transformers import (
    AutoProcessor,
    BitsAndBytesConfig,
    Qwen3VLForConditionalGeneration,
    AutoModelForSemanticSegmentation,
    SegformerImageProcessor
)

logger = logging.getLogger(__name__)

_device = "cuda" if torch.cuda.is_available() else "cpu"

# ---------------------------------------------------------
# CẤU HÌNH SEGFORMER (Tách nền)
# ---------------------------------------------------------
SEG_MODEL_NAME = "mattmdjaga/segformer_b2_clothes"

_seg_processor = None
_seg_model = None

DEFAULT_CLOTHING_LABELS = [
    "Hat", "Upper-clothes", "Skirt", "Pants", "Dress", "Belt",
    "Left-shoe", "Right-shoe", "Bag", "Scarf",
]

def load_segformer():
    global _seg_processor, _seg_model
    if _seg_processor is None or _seg_model is None:
        logger.info(f"Đang tải Segformer lên {_device}...")
        _seg_processor = SegformerImageProcessor.from_pretrained(SEG_MODEL_NAME)
        _seg_model = AutoModelForSemanticSegmentation.from_pretrained(SEG_MODEL_NAME)
        _seg_model.to(_device)
        _seg_model.eval()
        logger.info("Segformer đã sẵn sàng.")
    return _seg_processor, _seg_model


def normalize_label(label: str) -> str:
    return label.strip().lower().replace("_", "-").replace(" ", "-")


def find_target_ids(id2label: dict, selected_labels: List[str]) -> List[int]:
    selected = {normalize_label(label) for label in selected_labels}
    target_ids = []
    for raw_id, raw_label in id2label.items():
        label = str(raw_label)
        label_norm = normalize_label(label)
        if label_norm in selected:
            target_ids.append(int(raw_id))
    return target_ids


def build_rgba_cutout(image: Image.Image, pred_seg: np.ndarray, target_ids: List[int]) -> Image.Image:
    mask = np.isin(pred_seg, target_ids).astype(np.uint8) * 255
    mask_img = Image.fromarray(mask, mode="L")
    # Làm mịn mask nhẹ
    mask_img = mask_img.filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.MinFilter(3))

    rgba = image.convert("RGBA")
    rgba.putalpha(mask_img)

    # Cắt sát vùng có quần áo
    bbox = mask_img.getbbox()
    if bbox:
        rgba = rgba.crop(bbox)

    return rgba

def cutout_clothing(image: Image.Image, selected_labels: List[str] = None) -> Image.Image:
    """Chạy SegFormer tách quần áo khỏi nền, trả về ảnh RGBA (PNG trong suốt)."""
    if selected_labels is None:
        selected_labels = DEFAULT_CLOTHING_LABELS

    processor, model = load_segformer()
    id2label = model.config.id2label
    target_ids = find_target_ids(id2label, selected_labels)

    if not target_ids:
        # Nếu không có nhãn mặc định, lấy tất cả các nhãn ngoài nền
        target_ids = [int(k) for k in id2label.keys() if id2label[k] != 'Background']

    inputs = processor(images=image, return_tensors="pt").to(_device)
    with torch.no_grad():
        outputs = model(**inputs)

    upsampled_logits = F.interpolate(
        outputs.logits,
        size=image.size[::-1],
        mode="bilinear",
        align_corners=False,
    )
    pred_seg = upsampled_logits.argmax(dim=1)[0].detach().cpu().numpy()

    cutout = build_rgba_cutout(image, pred_seg, target_ids)
    return cutout


# ---------------------------------------------------------
# CẤU HÌNH QWEN3-VL (Nhận diện 6 thuộc tính)
# ---------------------------------------------------------
VLM_MODEL_NAME = "Qwen/Qwen3-VL-2B-Instruct"

_vlm_processor = None
_vlm_model = None

# Mảng từ vựng 6 thuộc tính dựa theo database
VALID_TYPES = [
    "áo thun", "áo polo", "áo sơ mi", "áo len", "áo khoác", "vest", "blazer",
    "hoodie", "áo nỉ", "áo tanktop", "quần jeans", "quần tây", "quần short",
    "quần jogger", "quần kaki", "chân váy", "đầm", "giày sneaker", "giày da",
    "dép", "sandal", "boot", "túi", "mũ", "khăn", "thắt lưng", "ô",
]
VALID_COLORS = [
    "đen", "trắng", "xám", "be", "kem", "nâu", "đỏ", "hồng", "cam", "vàng",
    "xanh dương", "xanh navy", "xanh lá", "tím", "bordeaux", "nhiều màu",
]
VALID_MATERIALS = [
    "cotton", "denim", "da", "len", "polyester", "lụa", "lanh", "dệt kim",
    "nỉ", "da lộn", "vải pha", "canvas", "lông", "ren",
]
VALID_FORMS = [
    "ôm sát", "vừa vặn", "rộng rãi", "oversize", "suông", "cắt eo", "croptop"
]
VALID_STYLES = [
    "thể thao", "công sở", "dạo phố", "tiệc tùng", "vintage", "trẻ trung",
    "cá tính", "thanh lịch", "đơn giản", "streetwear"
]
VALID_SEASONS = [
    "xuân", "hạ", "thu", "đông", "4 mùa"
]

TAG_PROMPT = (
    "Bạn là trợ lý phân tích quần áo. Nhìn ảnh một món đồ và trả về "
    "ĐÚNG 6 thuộc tính dạng JSON:\n"
    '- "type": loại item. Chọn 1 từ: ' + ", ".join(VALID_TYPES) + ".\n"
    '- "form": form dáng. Chọn 1 từ: ' + ", ".join(VALID_FORMS) + ".\n"
    '- "style": phong cách. Chọn 1 từ: ' + ", ".join(VALID_STYLES) + ".\n"
    '- "color": màu CHÍNH. Chọn 1 từ: ' + ", ".join(VALID_COLORS) + ".\n"
    '- "material": chất liệu CHÍNH. Chọn 1 từ: ' + ", ".join(VALID_MATERIALS) + ".\n"
    '- "season": mùa phù hợp nhất. Chọn 1 từ: ' + ", ".join(VALID_SEASONS) + ".\n\n"
    "Quy tắc: chỉ trả JSON thuần, không giải thích, không dùng markdown.\n"
    'Ví dụ: {"type":"áo thun","form":"oversize","style":"trẻ trung","color":"trắng","material":"cotton","season":"hạ"}'
)

def load_vlm():
    global _vlm_processor, _vlm_model
    if _vlm_model is None:
        try:
            import accelerate
            from accelerate import utils as accelerate_utils
            # Monkey-patch để đánh lừa transformers rằng chúng ta KHÔNG ở trong context manager (lỗi do Django Thread)
            accelerate_utils.is_torch_device_context = lambda: False
            logger.info(f"Accelerate version: {accelerate.__version__}")
        except Exception as e:
            logger.error(f"LỖI IMPORT ACCELERATE: {e}")
            raise RuntimeError(f"Thiếu hoặc lỗi thư viện accelerate: {e}")
            
        logger.info(f"Đang tải Qwen3-VL-2B (4-bit) lên {_device}...")
        bnb_config = BitsAndBytesConfig(
            load_in_4bit=True,
            bnb_4bit_compute_dtype=torch.float16,
            bnb_4bit_quant_type="nf4",
            bnb_4bit_use_double_quant=True,
        )

        # Chặn lỗi torch.device != cpu
        if hasattr(torch, 'set_default_device'):
            try:
                torch.set_default_device('cpu')
            except Exception:
                pass

        _vlm_model = Qwen3VLForConditionalGeneration.from_pretrained(
            VLM_MODEL_NAME,
            quantization_config=bnb_config,
            device_map="auto",
        )
        _vlm_model.eval()
        _vlm_processor = AutoProcessor.from_pretrained(VLM_MODEL_NAME)
        logger.info("Qwen3-VL đã sẵn sàng.")
    return _vlm_processor, _vlm_model

def _to_rgb_on_white(image: Image.Image) -> Image.Image:
    if image.mode == "RGB":
        return image
    rgba = image.convert("RGBA")
    bg = Image.new("RGBA", rgba.size, (255, 255, 255, 255))
    return Image.alpha_composite(bg, rgba).convert("RGB")

def _extract_json(text: str) -> Optional[dict]:
    match = re.search(r"\{.*?\}", text, re.DOTALL)
    if not match:
        return None
    try:
        return json.loads(match.group(0))
    except json.JSONDecodeError:
        return None

def _nearest(value: Optional[str], vocab: list[str]) -> str:
    if not value:
        return vocab[0]
    v = value.strip().lower()
    for word in vocab:
        if v == word or word in v or v in word:
            return word
    return value.strip()

def tag_clothing(image: Image.Image) -> dict:
    """Nhận 1 ảnh quần áo -> JSON {type, form, style, color, material, season}"""
    processor, model = load_vlm()
    rgb = _to_rgb_on_white(image)

    messages = [
        {
            "role": "user",
            "content": [
                {"type": "image", "image": rgb},
                {"type": "text", "text": TAG_PROMPT},
            ],
        }
    ]

    inputs = processor.apply_chat_template(
        messages,
        tokenize=True,
        add_generation_prompt=True,
        return_dict=True,
        return_tensors="pt",
    ).to(_device)

    prompt_len = inputs["input_ids"].shape[-1]

    with torch.no_grad():
        out = model.generate(
            **inputs,
            max_new_tokens=128,
            do_sample=False,
        )

    answer = processor.batch_decode(
        out[:, prompt_len:], skip_special_tokens=True
    )[0].strip()
    
    logger.debug(f"Qwen3-VL raw: {answer}")

    data = _extract_json(answer) or {}
    return {
        "type": _nearest(data.get("type"), VALID_TYPES),
        "form": _nearest(data.get("form"), VALID_FORMS),
        "style": _nearest(data.get("style"), VALID_STYLES),
        "color": _nearest(data.get("color"), VALID_COLORS),
        "material": _nearest(data.get("material"), VALID_MATERIALS),
        "season": _nearest(data.get("season"), VALID_SEASONS),
        "raw": answer,
    }

