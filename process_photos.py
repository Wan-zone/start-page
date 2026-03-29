#!/home/wan/miniconda3/bin/python
"""
Process gallery images for the start-page project and regenerate gallery.json.

Recommended interpreter:
  /home/wan/miniconda3/bin/python
"""

from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable

from PIL import Image, ImageOps


# =========================
# Config
# =========================

PROJECT_ROOT = Path("/home/wan/my-little-projects/start-page")
SOURCE_DIR = PROJECT_ROOT / "assets" / "gallery"
MANIFEST_PATH = PROJECT_ROOT / "data" / "gallery.json"

SUPPORTED_SUFFIXES = {".jpg", ".jpeg", ".png", ".webp"}
MAX_LONG_EDGE = 1600
JPEG_QUALITY = 82
WEBP_QUALITY = 80
PNG_COMPRESS_LEVEL = 9
CONVERT_OPAQUE_PNG_TO_JPG = True
VERBOSE = True


@dataclass
class ProcessResult:
    source: Path
    output: Path
    original_bytes: int
    output_bytes: int
    action: str


def iter_images(root: Path) -> Iterable[Path]:
    for path in sorted(root.iterdir()):
      if path.is_file() and path.suffix.lower() in SUPPORTED_SUFFIXES:
        yield path


def has_alpha(img: Image.Image) -> bool:
    if img.mode in {"RGBA", "LA"}:
        alpha = img.getchannel("A")
        extrema = alpha.getextrema()
        return extrema[0] < 255
    if img.mode == "P" and "transparency" in img.info:
        return True
    return False


def resize_if_needed(img: Image.Image) -> Image.Image:
    width, height = img.size
    long_edge = max(width, height)
    if long_edge <= MAX_LONG_EDGE:
        return img

    scale = MAX_LONG_EDGE / long_edge
    new_size = (max(1, round(width * scale)), max(1, round(height * scale)))
    return img.resize(new_size, Image.Resampling.LANCZOS)


def save_jpg(img: Image.Image, output_path: Path) -> None:
    img.convert("RGB").save(
        output_path,
        format="JPEG",
        quality=JPEG_QUALITY,
        optimize=True,
        progressive=True,
    )


def save_webp(img: Image.Image, output_path: Path) -> None:
    img.convert("RGB").save(
        output_path,
        format="WEBP",
        quality=WEBP_QUALITY,
        method=6,
    )


def save_png(img: Image.Image, output_path: Path) -> None:
    img.save(
        output_path,
        format="PNG",
        optimize=True,
        compress_level=PNG_COMPRESS_LEVEL,
    )


def process_one(path: Path) -> ProcessResult:
    original_bytes = path.stat().st_size

    with Image.open(path) as raw_img:
        img = ImageOps.exif_transpose(raw_img)
        img.load()

    img = resize_if_needed(img)
    suffix = path.suffix.lower()

    if suffix in {".jpg", ".jpeg"}:
        save_jpg(img, path)
        output = path
        action = "resize/jpg"
    elif suffix == ".webp":
        save_webp(img, path)
        output = path
        action = "resize/webp"
    elif suffix == ".png":
        if CONVERT_OPAQUE_PNG_TO_JPG and not has_alpha(img):
            output = path.with_suffix(".jpg")
            save_jpg(img, output)
            path.unlink()
            action = "png->jpg"
        else:
            save_png(img, path)
            output = path
            action = "resize/png"
    else:
        raise ValueError(f"Unsupported suffix: {suffix}")

    output_bytes = output.stat().st_size
    return ProcessResult(
        source=path,
        output=output,
        original_bytes=original_bytes,
        output_bytes=output_bytes,
        action=action,
    )


def format_size(num_bytes: int) -> str:
    size = float(num_bytes)
    units = ["B", "KB", "MB", "GB"]
    for unit in units:
        if size < 1024 or unit == units[-1]:
            return f"{size:.1f}{unit}"
        size /= 1024
    return f"{num_bytes}B"


def build_caption(path: Path) -> str:
    stem = path.stem.replace("_", " ").replace("-", " ").strip()
    return stem or path.name


def build_manifest(images: list[Path]) -> list[dict[str, str]]:
    manifest: list[dict[str, str]] = []
    for image in images:
        manifest.append(
            {
                "src": image.name,
                "alt": build_caption(image),
                "caption": build_caption(image),
            }
        )
    return manifest


def write_manifest(images: list[Path]) -> None:
    manifest = build_manifest(images)
    MANIFEST_PATH.write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )


def main() -> None:
    if not SOURCE_DIR.exists():
        raise SystemExit(f"Source directory not found: {SOURCE_DIR}")
    if not SOURCE_DIR.is_dir():
        raise SystemExit(f"Source path is not a directory: {SOURCE_DIR}")

    images = list(iter_images(SOURCE_DIR))
    if not images:
        raise SystemExit(f"No supported images found in: {SOURCE_DIR}")

    total_before = 0
    total_after = 0
    outputs: list[Path] = []

    for path in images:
        result = process_one(path)
        outputs.append(result.output)
        total_before += result.original_bytes
        total_after += result.output_bytes
        if VERBOSE:
            print(
                f"[{result.action}] {result.source.name} -> {result.output.name} | "
                f"{format_size(result.original_bytes)} -> {format_size(result.output_bytes)}"
            )

    outputs = sorted(set(outputs), key=lambda item: item.name.lower())
    write_manifest(outputs)

    saved = total_before - total_after
    print("")
    print(f"Processed directory: {SOURCE_DIR}")
    print(f"Gallery manifest : {MANIFEST_PATH}")
    print(f"Total before: {format_size(total_before)}")
    print(f"Total after : {format_size(total_after)}")
    print(f"Saved       : {format_size(saved)}")


if __name__ == "__main__":
    main()
