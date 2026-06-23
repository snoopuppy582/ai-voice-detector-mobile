from __future__ import annotations

import math
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[2]
ASSETS = ROOT / "assets"
STORE = ROOT / "store-assets"
ICON_DIR = STORE / "icons"
FEATURE_DIR = STORE / "feature_graphic"
SCREEN_DIR = STORE / "screenshots_phone"
W, H = 1080, 1920

NAVY = (17, 24, 39, 255)
INK = (17, 24, 39, 255)
MUTED = (95, 112, 130, 255)
CYAN = (0, 184, 217, 255)
BLUE = (14, 111, 255, 255)
TEAL = (23, 122, 138, 255)
VIOLET = (124, 58, 237, 255)
LIME = (163, 230, 53, 255)
CORAL = (255, 90, 95, 255)
BG = (248, 250, 252, 255)
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


def draw_ai_pulses(draw, x, y, width, height, color=VIOLET, blocks=10):
    slot = width / blocks
    for i in range(blocks):
        level = 0.25 + 0.55 * ((i * 7) % 11) / 10
        h = max(10, height * level)
        bx = x + i * slot + slot * 0.2
        draw.rounded_rectangle((bx, y + (height - h) / 2, bx + slot * 0.5, y + (height + h) / 2), radius=7, fill=color)


def draw_signal_split_mark(draw, cx, cy, scale=1.0, mono=False):
    main = (255, 255, 255, 255) if mono else (247, 253, 255, 255)
    stroke = (255, 255, 255, 255) if mono else CYAN
    accent = (255, 255, 255, 255) if mono else VIOLET
    check = (255, 255, 255, 255) if mono else LIME
    draw_wave(draw, cx - 300 * scale, cy + 118 * scale, 245 * scale, 100 * scale, color=stroke, bars=13, phase=0.45)
    draw_ai_pulses(draw, cx + 72 * scale, cy + 118 * scale, 245 * scale, 100 * scale, color=accent, blocks=9)
    draw_mic(draw, cx, cy - 34 * scale, 2.0 * scale, color=main, stroke=stroke)
    draw.line(
        (
            cx - 70 * scale,
            cy + 218 * scale,
            cx - 22 * scale,
            cy + 264 * scale,
            cx + 92 * scale,
            cy + 146 * scale,
        ),
        fill=check,
        width=int(22 * scale),
        joint="curve",
    )


def make_icon() -> None:
    size = 1024
    im = Image.new("RGBA", (size, size), NAVY)
    draw = ImageDraw.Draw(im)
    draw.ellipse((-170, -150, 480, 500), fill=(0, 184, 217, 64))
    draw.ellipse((540, 520, 1210, 1190), fill=(124, 58, 237, 66))
    draw.ellipse((700, -80, 1080, 300), fill=(255, 90, 95, 50))
    draw_signal_split_mark(draw, 512, 465, 1.0)

    out512 = im.resize((512, 512), Image.Resampling.LANCZOS)
    out512.save(ICON_DIR / "play_icon_512.png")
    im.save(ASSETS / "icon.png")
    im.save(ASSETS / "splash-icon.png")

    fg = Image.new("RGBA", (1024, 1024), (0, 0, 0, 0))
    fg_draw = ImageDraw.Draw(fg)
    draw_signal_split_mark(fg_draw, 512, 465, 1.0)
    fg.save(ASSETS / "android-icon-foreground.png")

    bg = Image.new("RGBA", (1024, 1024), NAVY)
    bg_draw = ImageDraw.Draw(bg)
    bg_draw.ellipse((-170, -150, 480, 500), fill=(0, 184, 217, 64))
    bg_draw.ellipse((540, 520, 1210, 1190), fill=(124, 58, 237, 66))
    bg_draw.ellipse((700, -80, 1080, 300), fill=(255, 90, 95, 50))
    bg.save(ASSETS / "android-icon-background.png")

    mono = Image.new("RGBA", (1024, 1024), (0, 0, 0, 0))
    m = ImageDraw.Draw(mono)
    draw_signal_split_mark(m, 512, 465, 1.0, mono=True)
    mono.save(ASSETS / "android-icon-monochrome.png")


def make_feature_graphic() -> None:
    bg = Image.new("RGBA", (1024, 500), BG)
    draw = ImageDraw.Draw(bg)
    draw.ellipse((-180, -220, 440, 400), fill=(0, 184, 217, 54))
    draw.ellipse((620, 130, 1210, 720), fill=(124, 58, 237, 58))
    draw.ellipse((740, -110, 1130, 280), fill=(255, 90, 95, 46))
    draw.rounded_rectangle((556, 56, 940, 432), radius=42, fill=NAVY)
    draw_signal_split_mark(draw, 748, 218, 0.55)

    draw.text((58, 86), "Real voice or AI?", font=font(57, True), fill=INK)
    draw.text((61, 166), "Check a short voice clip", font=font(30), fill=MUTED)
    draw.rounded_rectangle((60, 244, 258, 292), radius=24, fill=(228, 248, 252, 255), outline=(174, 228, 239, 255), width=2)
    centered_text(draw, (60, 244, 258, 292), "Estimate ready", font(22, True), TEAL)
    draw.rounded_rectangle((276, 244, 438, 292), radius=24, fill=(243, 236, 255, 255), outline=(214, 196, 249, 255), width=2)
    centered_text(draw, (276, 244, 438, 292), "On device", font(22, True), VIOLET)
    draw.text((62, 354), "AI Voice Check", font=font(24, True), fill=INK)
    bg_rgb = bg.convert("RGB")
    bg_rgb.save(FEATURE_DIR / "feature_graphic_1024x500.jpg", quality=94)
    bg_rgb.save(FEATURE_DIR / "feature_graphic_1024x500.png")


def draw_phone_ui(draw, caption, mode):
    draw.rectangle((0, 0, W, H), fill=BG)
    draw.text((70, 64), caption, font=font(54, True), fill=INK)
    draw.text((72, 134), "AI voice estimate, not forensic proof", font=font(27), fill=MUTED)

    x, y, w, h = 70, 240, 940, 1510
    rounded_rect(draw, (x, y, x + w, y + h), radius=30, fill=PANEL, outline=LINE, width=2)
    draw.text((x + 46, y + 44), "AI Voice Check", font=font(38, True), fill=INK)
    draw.text((x + 48, y + 98), "On-device acoustic estimate", font=font(25, True), fill=TEAL)

    if mode == "record":
        draw.text((x + 46, y + 178), "Is this voice real or AI?", font=font(34, True), fill=INK)
        draw.text((x + 46, y + 226), "Record 3-8 seconds for an AI voice estimate.", font=font(24), fill=MUTED)
        draw_wave(draw, x + 70, y + 340, w - 140, 220, color=CYAN, bars=32, phase=0.2)
        draw.ellipse((x + 330, y + 650, x + 610, y + 930), fill=BLUE)
        draw.ellipse((x + 408, y + 728, x + 532, y + 852), fill=(255, 255, 255, 255))
        draw.text((x + 348, y + 968), "Start recording", font=font(34, True), fill=INK)
        rows = [("Processed on device", "No account required"), ("Samples clear on new recording", "Privacy-first flow")]
    elif mode == "signals":
        draw.text((x + 46, y + 176), "What changed the score?", font=font(34, True), fill=INK)
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
        draw.text((x + 46, y + 176), "Instant estimate", font=font(34, True), fill=INK)
        rounded_rect(draw, (x + 46, y + 250, x + w - 46, y + 530), radius=24, fill=(255, 246, 246, 255), outline=(244, 206, 206, 255))
        draw.text((x + 86, y + 296), "Sounds AI-like", font=font(54, True), fill=CORAL)
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
        draw.rounded_rectangle((x + 374, y + 300, x + 566, y + 560), radius=34, fill=(230, 247, 250, 255), outline=(161, 223, 236, 255), width=3)
        draw.rounded_rectangle((x + 414, y + 344, x + 526, y + 516), radius=24, fill=PANEL, outline=(161, 223, 236, 255), width=3)
        draw_wave(draw, x + 432, y + 406, 76, 48, color=CYAN, bars=7, phase=0.3)
        draw.line((x + 436, y + 474, x + 460, y + 498, x + 508, y + 444), fill=LIME, width=10, joint="curve")

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
        ("01_record_1080x1920.png", "Real or AI?", "record"),
        ("02_result_1080x1920.png", "Instant estimate", "result"),
        ("03_signals_1080x1920.png", "What changed the score?", "signals"),
        ("04_privacy_1080x1920.png", "Private by default", "privacy"),
    ]
    for filename, caption, mode in specs:
        im = Image.new("RGBA", (W, H), BG)
        draw = ImageDraw.Draw(im)
        draw_phone_ui(draw, caption, mode)
        im.convert("RGB").save(SCREEN_DIR / filename)


def write_manifest() -> None:
    (STORE / "STORE_ASSETS_MANIFEST.md").write_text(
        "\n".join(
            [
                "# AI Voice Check Store Assets Manifest",
                "",
                "Generated assets for Google Play launch preparation.",
                "",
                "## Required Play Console assets",
                "",
                "- `icons/play_icon_512.png`: 512x512 app icon",
                "- `feature_graphic/feature_graphic_1024x500.png`: 1024x500 feature graphic",
                "- `feature_graphic/feature_graphic_1024x500.jpg`: JPEG backup",
                "- `screenshots_phone/01_record_1080x1920.png`: phone screenshot 1",
                "- `screenshots_phone/02_result_1080x1920.png`: phone screenshot 2",
                "- `screenshots_phone/03_signals_1080x1920.png`: phone screenshot 3",
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
