#!/usr/bin/env python3
"""
Ajusta as cores do Ipê Amarelo para um amarelo ouro solar vibrante e vivo (49°-52°),
eliminando o tom ocre/alaranjado/apagado e mantendo o tronco e o livro marrom nobre intactos.
"""

from PIL import Image
import colorsys
import os

def realcar_amarelo(img: Image.Image, alvo_hue_min=47.0, alvo_hue_max=52.0) -> Image.Image:
    img = img.convert("RGBA")
    w, h = img.size
    pix = img.load()
    out = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    out_pix = out.load()

    for y in range(h):
        for x in range(w):
            r, g, b, a = pix[x, y]
            if a < 5:
                out_pix[x, y] = (r, g, b, a)
                continue

            h_val, s_val, v_val = colorsys.rgb_to_hsv(r / 255.0, g / 255.0, b / 255.0)
            deg = h_val * 360.0

            # Pétalas e copa amarelas/âmbar (evitando o marrom escuro do tronco onde v_val < 0.35 ou deg < 24)
            if 25.0 <= deg <= 68.0 and v_val >= 0.42 and s_val >= 0.28:
                # Transforma matiz para amarelo solar vivo (47° - 52°)
                new_deg = alvo_hue_min + (deg - 25.0) * ((alvo_hue_max - alvo_hue_min) / 38.0)
                new_h = min(new_deg / 360.0, 54.0 / 360.0)
                # Saturação vívida e brilho solar radiante
                new_s = min(1.0, s_val * 1.05)
                new_v = min(1.0, v_val * 1.08)
                nr, ng, nb = colorsys.hsv_to_rgb(new_h, new_s, new_v)
                out_pix[x, y] = (int(nr * 255), int(ng * 255), int(nb * 255), a)
            elif 23.0 <= deg <= 42.0 and v_val >= 0.35 and s_val >= 0.38:
                # Pétalas em sombra sutil da copa
                new_deg = 40.0 + (deg - 23.0) * (8.0 / 19.0)
                new_h = new_deg / 360.0
                new_s = min(1.0, s_val * 1.04)
                new_v = min(1.0, v_val * 1.10)
                nr, ng, nb = colorsys.hsv_to_rgb(new_h, new_s, new_v)
                out_pix[x, y] = (int(nr * 255), int(ng * 255), int(nb * 255), a)
            else:
                out_pix[x, y] = (r, g, b, a)

    return out

def processar():
    raiz = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    medalhao_path = os.path.join(raiz, "src/view/assets/ipe-medalhao.png")
    
    print("▶ Realçando amarelo do ipe-medalhao.png...")
    img = Image.open(medalhao_path)
    novo_medalhao = realcar_amarelo(img)
    novo_medalhao.save(medalhao_path, "PNG", optimize=True)

    # Atualiza logo-clean e splash-icon
    logo_clean = os.path.join(raiz, "assets/logo-clean.png")
    splash_icon = os.path.join(raiz, "assets/splash-icon.png")
    if os.path.exists(logo_clean):
        novo_medalhao.save(logo_clean, "PNG", optimize=True)
    if os.path.exists(splash_icon):
        novo_medalhao.save(splash_icon, "PNG", optimize=True)

    # Atualiza icon.png
    icon_path = os.path.join(raiz, "assets/icon.png")
    if os.path.exists(icon_path):
        bg_rgb = (252, 239, 203)
        icon = Image.new("RGB", (1024, 1024), bg_rgb)
        scale_icon = novo_medalhao.resize((768, 768), Image.Resampling.LANCZOS)
        offset = (1024 - 768) // 2
        icon.paste(scale_icon, (offset, offset), scale_icon)
        icon.save(icon_path, "PNG", optimize=True)

    # Atualiza android-icon-foreground.png
    android_fg_path = os.path.join(raiz, "assets/android-icon-foreground.png")
    if os.path.exists(android_fg_path):
        android_fg = Image.new("RGBA", (512, 512), (0, 0, 0, 0))
        scale_fg = novo_medalhao.resize((320, 320), Image.Resampling.LANCZOS)
        fg_offset = (512 - 320) // 2
        android_fg.paste(scale_fg, (fg_offset, fg_offset), scale_fg)
        android_fg.save(android_fg_path, "PNG", optimize=True)

    # Pétalas individuais e flor
    for petala in ["ipe-flor-blossom.png", "ipe-petala-1.png", "ipe-petala-2.png", "ipe-petala-natural.png"]:
        p_path = os.path.join(raiz, "src/view/assets", petala)
        if os.path.exists(p_path):
            print(f"▶ Realçando amarelo de {petala}...")
            p_img = Image.open(p_path)
            novo_p = realcar_amarelo(p_img, alvo_hue_min=48.0, alvo_hue_max=53.0)
            novo_p.save(p_path, "PNG", optimize=True)

    print("✔ Todas as artes do Ipê foram atualizadas para o amarelo solar vivo!")

if __name__ == "__main__":
    processar()
