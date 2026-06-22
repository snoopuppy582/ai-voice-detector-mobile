from __future__ import annotations

import math
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont


ROOT = Path(__file__).resolve().parents[2]
ASSETS = ROOT / "assets"
STORE = ROOT / "store-assets"
ICON_DIR = STORE / "icons"
FEATURE_DIR = STORE / "feature_graphic"
SCREEN_DIR = STORE / "screenshots_phone"
SOURCE_DIR = STORE / "source"

W, H = 1080, 1920

NAVY = (14, 28, 47, 255)
INK = (16, 25, 38, 255)
MUTED = (95, 112, 130, 255)
CYAN = (0, 166, 214, 255)
BLUE = (14, 111, 255, 255)
TEAL = (23, 122, 138, 255)
LIME = (153, 220, 78, 255)
CORAL = (214, 69, 69, 255)
BG = (247, 250, 252, 255)
PANEL = (255, 255, 255, 255)
LINE = (220, 230, 238, 255)


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    candidates = [
        "C:/Windows/Fonts/arialbd.ttf" if bold else "C:/Windows/Fonts/arial.ttf",
        "C:/Windows/Fonts/segoeuib.ttf" if bold else "C:/Windows/Fonts/segoeui.ttf",
        "C:/Windows/Fonts/malgunbd.ttf" if bold else "C:/Windows/Fonts/malgun.ttf",
    ]
    for path in candidates:
        if Path(path).exists():
            return ImageFont.truetype(path, size)
    return ImageFont.load_default()


def ensure_dirs() -> None:
    for directory in [ICON_DIR, FEATURE_DIR, SCREEN_DIR, ASSETS]:
        directory.mkdir(parents=True, exist_ok=True)


def rounded_rect(draw: ImageDraw.ImageDraw, box, radius=22, fill=PANEL, outline=None, width=1):
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)


def centered_text(draw, box, text, fnt, fill, spacing=0):
    x1, y1, x2, y2 = box
    lines = text.split("\n")
    sizes = [draw.textbbox((0, 0), line, font=fnt) for line in lines]
    heights = [bbox[3] - bbox[1] for bbox in sizes]
    total_h = sum(heights) + spacing * (len(lines) - 1)
    y = y1 + ((y2 - y1) - total_h) / 2
    for line, bbox, h in zip(lines, sizes, heights):
        tw = bbox[2] - bbox[0]
        draw.text((x1 + ((x2 - x1) - tw) / 2, y), line, font=fnt, fill=fill)
        y += h + spacing


def draw_wave(draw, x, y, width, height, color=CYAN, bars=32, phase=0.0):
    slot = width / bars
    for i in range(bars):
        value = 0.25 + 0.65 * abs(math.sin(i * 0.62 + phase)) * (0.75 + 0.25 * math.sin(i * 0.21))
        h = max(8, height * value)
        bx = x + i * slot + slot * 0.25
        draw.rounded_rectangle((bx, y + (height - h) / 2, bx + slot * 0.42, y + (height + h) / 2), radius=5, fill=color)


def draw_mic(draw, cx, cy, scale=1.0, color=(255, 255, 255, 255), stroke=CYAN):
    w, h = 74 * scale, 122 * scale
    draw.rounded_rectangle((cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2), radius=int(32 * scale), fill=color)
    draw.rounded_rectangle((cx - w / 2 + 10 * scale, cy - h / 2 + 8 * scale, cx + w / 2 - 10 * scale, cy + 4 * scale), radius=int(22 * scale), fill=(217, 247, 253, 255))
    draw.arc((cx - 78 * scale, cy - 20 * scale, cx + 78 * scale, cy + 138 * scale), 0, 180, fill=stroke, width=int(9 * scale))
    draw.line((cx, cy + h / 2, cx, cy + 96 * scale), fill=stroke, width=int(9 * scale))
    draw.rounded_rectangle((cx - 48 * scale, cy + 91 * scale, cx + 48 * scale, cy + 104 * scale), radius=int(6 * scale), fill=stroke)


def make_icon() -> None:
    size = 1024
    im = Image.new("RGBA", (size, size), (6, 18, 34, 255))
    draw = ImageDraw.Draw(im)
    for r in range(0, size, 6):
        alpha = int(120 * (1 - r / size))
        draw.ellipse((size / 2 - r, size / 2 - r, size / 2 + r, size / 2 + r), outline=(0, 166, 214, max(alpha, 0)), width=2)

    shield = [(512, 142), (762, 244), (720, 690), (512, 866), (304, 690), (262, 244)]
    draw.polygon(shield, fill=(13, 72, 103, 255), outline=(0, 207, 255, 255))
    draw.line(shield + [shield[0]], fill=(105, 229, 255, 255), width=16, joint="curve")
    draw_mic(draw, 512, 420, 2.2, color=(236, 251, 255, 255), stroke=(0, 207, 255, 255))
    draw_wave(draw, 215, 610, 594, 110, color=(153, 220, 78, 255), bars=22, phase=0.4)

    out512 = im.resize((512, 512), Image.Resampling.LANCZOS)
    out512.save(ICON_DIR / "play_icon_512.png")
    im.save(ASSETS / "icon.png")
    im.save(ASSETS / "splash-icon.png")

    fg = Image.new("RGBA", (1024, 1024), (0, 0, 0, 0))
    fg_draw = ImageDraw.Draw(fg)
    fg_draw.polygon(shield, fill=(13, 72, 103, 255), outline=(0, 207, 255, 255))
    fg_draw.line(shield + [shield[0]], fill=(105, 229, 255, 255), width=16, joint="curve")
    draw_mic(fg_draw, 512, 420, 2.2, color=(236, 251, 255, 255), stroke=(0, 207, 255, 255))
    draw_wave(fg_draw, 215, 610, 594, 110, color=(153, 220, 78, 255), bars=22, phase=0.4)
    fg.save(ASSETS / "android-icon-foreground.png")

    bg = Image.new("RGBA", (1024, 1024), (6, 18, 34, 255))
    bg_draw = ImageDraw.Draw(bg)
    for r in range(80, 1300, 32):
        bg_draw.ellipse((512 - r, 512 - r, 512 + r, 512 + r), outline=(0, 107, 140, 60), width=4)
    bg.save(ASSETS / "android-icon-background.png")

    mono = Image.new("RGBA", (1024, 1024), (0, 0, 0, 0))
    m = ImageDraw.Draw(mono)
    m.polygon(shield, fill=(255, 255, 255, 255))
    draw_mic(m, 512, 420, 2.2, color=(0, 0, 0, 255), stroke=(0, 0, 0, 255))
    mono.save(ASSETS / "android-icon-monochrome.png")


def make_feature_graphic() -> None:
    bg_path = SOURCE_DIR / "feature_bg_imagegen.png"
    if bg_path.exists():
        bg = Image.open(bg_path).convert("RGBA").resize((1024, 500), Image.Resampling.LANCZOS)
    else:
        bg = Image.new("RGBA", (1024, 500), (5, 18, 34, 255))
    overlay = Image.new("RGBA", (1024, 500), (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay)
    od.rectangle((0, 0, 1024, 500), fill=(3, 10, 22, 88))
    od.rectangle((0, 0, 540, 500), fill=(3, 10, 22, 145))
    bg.alpha_composite(overlay)
    draw = ImageDraw.Draw(bg)

    draw.text((58, 80), "AI voice estimate", font=font(54, True), fill=(255, 255, 255, 255))
    draw.text((60, 154), "Pitch, cepstral and spectral cues.", font=font(25), fill=(197, 225, 237, 255))
    chips = [("HNR", CYAN), ("F0 Var", TEAL), ("Flatness", LIME)]
    x = 60
    for label, color in chips:
        w = int(draw.textlength(label, font=font(21, True))) + 34
        draw.rounded_rectangle((x, 220, x + w, 260), radius=20, fill=(7, 22, 38, 255), outline=color, width=2)
        centered_text(draw, (x, 220, x + w, 260), label, font(21, True), (255, 255, 255, 255))
        x += w + 14

    rounded_rect(draw, (585, 78, 938, 386), radius=30, fill=(247, 250, 252, 242), outline=(137, 221, 240, 180), width=2)
    draw.text((615, 112), "AI Voice Scam Detector", font=font(23, True), fill=INK)
    draw_wave(draw, 615, 170, 292, 86, color=CYAN, bars=24, phase=1.0)
    rounded_rect(draw, (615, 282, 755, 344), radius=16, fill=(230, 247, 250, 255), outline=(189, 226, 234, 255))
    rounded_rect(draw, (772, 282, 912, 344), radius=16, fill=(241, 248, 237, 255), outline=(213, 235, 197, 255))
    draw.text((635, 297), "Likely AI", font=font(19, True), fill=CORAL)
    draw.text((792, 297), "78%", font=font(22, True), fill=INK)
    bg_rgb = bg.convert("RGB")
    bg_rgb.save(FEATURE_DIR / "feature_graphic_1024x500.jpg", quality=94)
    bg_rgb.save(FEATURE_DIR / "feature_graphic_1024x500.png")


def draw_phone_ui(draw, title, caption, mode):
    draw.rectangle((0, 0, W, H), fill=BG)
    draw.text((70, 64), caption, font=font(54, True), fill=INK)
    draw.text((72, 134), "AI voice estimate, not forensic proof", font=font(27), fill=MUTED)

    x, y, w, h = 70, 240, 940, 1510
    rounded_rect(draw, (x, y, x + w, y + h), radius=30, fill=PANEL, outline=LINE, width=2)
    draw.text((x + 46, y + 44), "AI Voice Scam Detector", font=font(38, True), fill=INK)
    draw.text((x + 48, y + 98), "On-device acoustic estimate", font=font(25, True), fill=TEAL)

    if mode == "record":
        draw.text((x + 46, y + 178), "Is this voice real or AI?", font=font(34, True), fill=INK)
        draw.text((x + 46, y + 226), "Record 3-8 seconds to check scam risk.", font=font(24), fill=MUTED)
        draw_wave(draw, x + 70, y + 340, w - 140, 220, color=CYAN, bars=32, phase=0.2)
        draw.ellipse((x + 330, y + 650, x + 610, y + 930), fill=BLUE)
        draw.ellipse((x + 408, y + 728, x + 532, y + 852), fill=(255, 255, 255, 255))
        draw.text((x + 348, y + 968), "Start recording", font=font(34, True), fill=INK)
        rows = [("Processed on device", "No account required"), ("Samples clear on new recording", "Privacy-first flow")]
    elif mode == "signals":
        draw.text((x + 46, y + 176), "Check voice notes and samples", font=font(34, True), fill=INK)
        draw_wave(draw, x + 70, y + 250, w - 140, 170, color=CYAN, bars=36, phase=1.2)
        metrics = [
            ("HNR", "11.8 dB", CYAN),
            ("HF Ratio", "0.39", TEAL),
            ("CPPS", "9.4 dB", LIME),
            ("F0 Var", "18.5 Hz", CYAN),
            ("Voiced", "86%", TEAL),
            ("Flatness", "0.27", LIME),
        ]
        px = x + 46
        py = y + 490
        for label, value, color in metrics:
            rounded_rect(draw, (px, py, px + 265, py + 128), radius=22, fill=(248, 251, 253, 255), outline=LINE)
            draw.text((px + 24, py + 22), label, font=font(23, True), fill=MUTED)
            draw.text((px + 24, py + 62), value, font=font(32, True), fill=INK)
            px += 287
            if px + 265 > x + w - 46:
                px = x + 46
                py += 150
        rows = [("Pitch and periodicity", "F0 variation, HNR, and CPPS-style cues"), ("Spectrum and noise cues", "HF ratio and flatness support the estimate")]
    elif mode == "result":
        draw.text((x + 46, y + 176), "See a clear confidence score", font=font(34, True), fill=INK)
        rounded_rect(draw, (x + 46, y + 250, x + w - 46, y + 530), radius=24, fill=(255, 246, 246, 255), outline=(244, 206, 206, 255))
        draw.text((x + 86, y + 296), "Likely AI voice", font=font(54, True), fill=CORAL)
        draw.text((x + 88, y + 370), "Confidence 78%", font=font(30, True), fill=INK)
        draw.rounded_rectangle((x + 86, y + 438, x + w - 86, y + 472), radius=17, fill=(235, 240, 245, 255))
        draw.rounded_rectangle((x + 86, y + 438, x + 86 + int((w - 172) * 0.78), y + 472), radius=17, fill=CORAL)
        metrics = [("HNR", "11.8 dB"), ("F0 Var", "18.5 Hz"), ("HF Ratio", "0.39"), ("Flatness", "0.27")]
        px = x + 46
        py = y + 610
        for label, value in metrics:
            rounded_rect(draw, (px, py, px + 408, py + 126), radius=22, fill=(248, 251, 253, 255), outline=LINE)
            draw.text((px + 22, py + 21), label, font=font(23, True), fill=MUTED)
            draw.text((px + 22, py + 62), value, font=font(32, True), fill=INK)
            px += 430
            if px + 408 > x + w - 46:
                px = x + 46
                py += 148
        rows = [("Estimate only", "May be incorrect"), ("Verify another way", "Call the person through a trusted channel")]
    else:
        draw.text((x + 46, y + 176), "Private by design", font=font(34, True), fill=INK)
        rows = [
            ("On-device processing", "Audio signals are analyzed locally"),
            ("No account required", "Use the detector without login"),
            ("Samples clear on new recording", "Start a new recording to clear samples"),
            ("Estimate only", "Not legal, medical, or security proof"),
        ]
        draw.rounded_rectangle((x + 358, y + 310, x + 582, y + 534), radius=34, fill=(230, 247, 250, 255), outline=(161, 223, 236, 255), width=3)
        draw.rounded_rectangle((x + 432, y + 410, x + 508, y + 482), radius=12, fill=TEAL)
        draw.arc((x + 420, y + 348, x + 520, y + 454), 200, -20, fill=TEAL, width=12)

    yy = y + 1080 if mode == "record" else y + 840
    if mode == "result":
        yy = y + 1130
    if mode == "privacy":
        yy = y + 650
    for heading, body in rows:
        rounded_rect(draw, (x + 46, yy, x + w - 46, yy + 116), radius=20, fill=(248, 251, 253, 255), outline=LINE)
        draw.ellipse((x + 78, yy + 34, x + 126, yy + 82), fill=(230, 247, 250, 255), outline=TEAL, width=3)
        draw.text((x + 150, yy + 24), heading, font=font(27, True), fill=INK)
        draw.text((x + 150, yy + 62), body, font=font(22), fill=MUTED)
        yy += 138

    draw.text((86, 1816), "This result is an acoustic estimate and may be incorrect.", font=font(25), fill=MUTED)


def make_screenshots() -> None:
    specs = [
        ("01_record_1080x1920.png", "Is this voice real or AI?", "record"),
        ("02_signals_1080x1920.png", "Check voice notes and samples", "signals"),
        ("03_result_1080x1920.png", "See a clear confidence score", "result"),
        ("04_privacy_1080x1920.png", "Private by design", "privacy"),
    ]
    for filename, caption, mode in specs:
        im = Image.new("RGBA", (W, H), BG)
        draw = ImageDraw.Draw(im)
        draw_phone_ui(draw, "AI Voice Scam Detector", caption, mode)
        im.convert("RGB").save(SCREEN_DIR / filename)


def write_manifest() -> None:
    (STORE / "STORE_ASSETS_MANIFEST.md").write_text(
        "\n".join(
            [
                "# AI Voice Scam Detector Store Assets Manifest",
                "",
                "Generated assets for Google Play launch preparation.",
                "",
                "## Required Play Console assets",
                "",
                "- `icons/play_icon_512.png`: 512x512 app icon",
                "- `feature_graphic/feature_graphic_1024x500.png`: 1024x500 feature graphic",
                "- `feature_graphic/feature_graphic_1024x500.jpg`: JPEG backup",
                "- `screenshots_phone/01_record_1080x1920.png`: phone screenshot 1",
                "- `screenshots_phone/02_signals_1080x1920.png`: phone screenshot 2",
                "- `screenshots_phone/03_result_1080x1920.png`: phone screenshot 3",
                "- `screenshots_phone/04_privacy_1080x1920.png`: phone screenshot 4",
                "",
                "## App assets replaced",
                "",
                "- `assets/icon.png`",
                "- `assets/splash-icon.png`",
                "- `assets/android-icon-foreground.png`",
                "- `assets/android-icon-background.png`",
                "- `assets/android-icon-monochrome.png`",
                "",
                "Feature graphic background source: `store-assets/source/feature_bg_imagegen.png`.",
                "",
            ]
        ),
        encoding="utf-8",
    )


def main() -> None:
    ensure_dirs()
    make_icon()
    make_feature_graphic()
    make_screenshots()
    write_manifest()


if __name__ == "__main__":
    main()
