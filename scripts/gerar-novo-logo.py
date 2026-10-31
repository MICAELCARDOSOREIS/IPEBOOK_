#!/usr/bin/env python3
"""
Gera todos os assets da marca IpêBook a partir da nova versão da logo (2000x2000)
enviada pelo usuário em 2026-10-30.

Garante:
1. Remoção completa e precisa do padrão xadrez (checkerboard), recuperando o canal alfa
   transparente limpo com subpixel anti-aliasing e de-fringing (sem bordas cinzas/brancas).
2. Centralização geométrica perfeita e proporções balanceadas.
3. Safe-zones respeitadas para todas as plataformas:
   - Expo Splash Screen (1024x1024 RGBA)
   - Android Adaptive Icons (foreground 512x512, background 512x512, monochrome 432x432)
   - Android Notification Icon (96x96 RGBA monocromático branco)
   - Web PWA (manifest 192x192 e 512x512, favicon 48x48)
   - Web Build Dist (dist/icone-192.png, dist/icone-512.png)
   - Store Icon (1024x1024 RGB e docs/loja/imagens/icone-512.png)
   - Google Play Feature Graphic (docs/loja/imagens/destaque-1024x500.png)
   - Componentes React Native (IpeMark, ReaderCard, BrandSplashScreen, Avatar)
"""

from PIL import Image, ImageFilter
import os
import shutil

SOURCE_PATH = "/home/usermicael/.gemini/antigravity-cli/brain/5e2e9e03-ec4b-4398-9a0b-513e38d54c3c/.user_uploaded/uploaded_media_1793409848480.jpg"
BG_COLOR_RGB = (252, 239, 203) # #FCEFCB

def extrair_emblema_mestre():
    im = Image.open(SOURCE_PATH).convert("RGB")
    w, h = im.size
    print(f"Imagem de origem: {w}x{h}")

    pixels = im.load()

    # 1. Classificação do primeiro plano vs padrão xadrez
    core = Image.new("L", (w, h), 0)
    core_p = core.load()

    for y in range(h):
        for x in range(w):
            r, g, b = pixels[x, y]
            sat = max(r, g, b) - min(r, g, b)
            r_b = r - b
            r_g = r - g
            bright = (r + g + b) / 3.0

            is_yellow = (r_b > 35 and sat > 35 and r > 140 and g > 75)
            is_wood = (sat > 16 and r_b > 16 and r_g > 8 and bright < 170)

            if is_yellow or is_wood:
                core_p[x, y] = 255

    # 2. Fechamento morfológico para unir microtexturas no interior
    closed_core = core.filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.MinFilter(3))
    closed_p = closed_core.load()

    # 3. Suavização de borda para anti-aliasing cristalino
    smooth_alpha = closed_core.filter(ImageFilter.GaussianBlur(radius=1.2))
    alpha_p = smooth_alpha.load()

    # 4. Criar imagem RGBA descolorindo as bordas semi-transparentes
    emblema = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    emblema_p = emblema.load()

    for y in range(h):
        for x in range(w):
            a = alpha_p[x, y]
            if a > 0:
                r, g, b = pixels[x, y]
                if a < 250:
                    sat = max(r, g, b) - min(r, g, b)
                    if sat < 40:
                        found = False
                        for d in [1, 2, 3]:
                            for dx, dy in [(-d, 0), (d, 0), (0, -d), (0, d)]:
                                nx, ny = x + dx, y + dy
                                if 0 <= nx < w and 0 <= ny < h and closed_p[nx, ny] == 255:
                                    r, g, b = pixels[nx, ny]
                                    found = True
                                    break
                            if found:
                                break
                emblema_p[x, y] = (r, g, b, a)

    # 5. Encontrar bbox exato do emblema extraído
    bbox = emblema.getbbox()
    print(f"Bbox do emblema extraído: {bbox}")
    emb_w = bbox[2] - bbox[0]
    emb_h = bbox[3] - bbox[1]
    emb_crop = emblema.crop(bbox)

    # 6. Criar master 1024x1024 perfeitamente centralizado
    master = Image.new("RGBA", (1024, 1024), (0, 0, 0, 0))
    target_max = 860
    scale = min(target_max / emb_w, (target_max * 0.92) / emb_h)
    new_w = int(emb_w * scale)
    new_h = int(emb_h * scale)
    scaled_emb = emb_crop.resize((new_w, new_h), Image.Resampling.LANCZOS)

    offset_x = (1024 - new_w) // 2
    offset_y = (1024 - new_h) // 2
    master.paste(scaled_emb, (offset_x, offset_y), scaled_emb)

    print(f"Master 1024x1024 gerado com sucesso: bbox={master.getbbox()}")
    return master

def main():
    print("▶ Extraindo nova logo a partir de uploaded_media_1793409848480.jpg...")
    master = extrair_emblema_mestre()

    # 1. assets/logo-clean.png, src/view/assets/ipe-medalhao.png e assets/splash-icon.png
    print("▶ Salvando assets com fundo transparente (1024x1024)...")
    master.save("assets/logo-clean.png", "PNG", optimize=True)
    master.save("src/view/assets/ipe-medalhao.png", "PNG", optimize=True)
    master.save("assets/splash-icon.png", "PNG", optimize=True)

    # 2. assets/icon.png (1024x1024, fundo #FCEFCB)
    print("▶ Gerando icon.png (1024x1024)...")
    icon = Image.new("RGB", (1024, 1024), BG_COLOR_RGB)
    scale_icon = master.resize((768, 768), Image.Resampling.LANCZOS)
    icon_offset = (1024 - 768) // 2
    icon.paste(scale_icon, (icon_offset, icon_offset), scale_icon)
    icon.save("assets/icon.png", "PNG", optimize=True)

    # 3. assets/android-icon-foreground.png (512x512, seguro para adaptive icon)
    print("▶ Gerando android-icon-foreground.png (512x512)...")
    android_fg = Image.new("RGBA", (512, 512), (0, 0, 0, 0))
    fg_size = 320
    scaled_fg = master.resize((fg_size, fg_size), Image.Resampling.LANCZOS)
    fg_offset = (512 - fg_size) // 2
    android_fg.paste(scaled_fg, (fg_offset, fg_offset), scaled_fg)
    android_fg.save("assets/android-icon-foreground.png", "PNG", optimize=True)

    # 4. assets/android-icon-background.png (512x512 sólido #FCEFCB)
    print("▶ Gerando android-icon-background.png (512x512)...")
    android_bg = Image.new("RGBA", (512, 512), (*BG_COLOR_RGB, 255))
    android_bg.save("assets/android-icon-background.png", "PNG", optimize=True)

    # 5. assets/android-icon-monochrome.png (432x432, branco com transparência para Material You)
    print("▶ Gerando android-icon-monochrome.png (432x432 para Android 13+)...")
    mono_size = 270
    scaled_for_mono = master.resize((mono_size, mono_size), Image.Resampling.LANCZOS)
    android_mono = Image.new("RGBA", (432, 432), (0, 0, 0, 0))
    mono_offset = (432 - mono_size) // 2
    alpha_mono = scaled_for_mono.split()[3]
    white_img = Image.new("RGBA", (mono_size, mono_size), (255, 255, 255, 255))
    android_mono.paste(white_img, (mono_offset, mono_offset), alpha_mono)
    android_mono.save("assets/android-icon-monochrome.png", "PNG", optimize=True)

    # 6. assets/notificacao-icone.png (96x96, ícone da barra de status em branco monocromático)
    print("▶ Gerando notificacao-icone.png (96x96)...")
    notif = Image.new("RGBA", (96, 96), (0, 0, 0, 0))
    notif_size = 76
    scaled_notif = master.resize((notif_size, notif_size), Image.Resampling.LANCZOS)
    notif_offset = (96 - notif_size) // 2
    alpha_notif = scaled_notif.split()[3]
    white_notif = Image.new("RGBA", (notif_size, notif_size), (255, 255, 255, 255))
    notif.paste(white_notif, (notif_offset, notif_offset), alpha_notif)
    notif.save("assets/notificacao-icone.png", "PNG", optimize=True)

    # 7. assets/favicon.png (48x48)
    print("▶ Gerando favicon.png (48x48)...")
    fav = Image.new("RGBA", (48, 48), (*BG_COLOR_RGB, 255))
    fav_emblem = master.resize((38, 38), Image.Resampling.LANCZOS)
    fav.paste(fav_emblem, (5, 5), fav_emblem)
    fav.save("assets/favicon.png", "PNG", optimize=True)

    # 8. public/icone-192.png e public/icone-512.png (para PWA manifest)
    print("▶ Gerando public/icone-192.png e public/icone-512.png...")
    pwa192 = Image.new("RGB", (192, 192), BG_COLOR_RGB)
    sc192 = master.resize((144, 144), Image.Resampling.LANCZOS)
    pwa192.paste(sc192, (24, 24), sc192)
    pwa192.save("public/icone-192.png", "PNG", optimize=True)

    pwa512 = Image.new("RGB", (512, 512), BG_COLOR_RGB)
    sc512 = master.resize((384, 384), Image.Resampling.LANCZOS)
    pwa512.paste(sc512, (64, 64), sc512)
    pwa512.save("public/icone-512.png", "PNG", optimize=True)

    # 9. dist/icone-192.png e dist/icone-512.png
    if os.path.exists("dist"):
        print("▶ Atualizando dist/icone-192.png e dist/icone-512.png...")
        shutil.copyfile("public/icone-192.png", "dist/icone-192.png")
        shutil.copyfile("public/icone-512.png", "dist/icone-512.png")

    # 10. docs/loja/imagens/icone-512.png
    if os.path.exists("docs/loja/imagens"):
        print("▶ Atualizando docs/loja/imagens/icone-512.png...")
        shutil.copyfile("public/icone-512.png", "docs/loja/imagens/icone-512.png")

        # 11. docs/loja/imagens/destaque-1024x500.png (Banner de destaque da Play Store)
        destaque_path = "docs/loja/imagens/destaque-1024x500.png"
        if os.path.exists(destaque_path):
            print("▶ Atualizando docs/loja/imagens/destaque-1024x500.png com a nova logo...")
            dest = Image.open(destaque_path).convert("RGBA")
            bg_surface = dest.getpixel((10, 10))
            # Limpa o lado direito (x >= 490) com a cor de fundo original
            blank_right = Image.new("RGBA", (534, 500), bg_surface)
            dest.paste(blank_right, (490, 0))

            # Posiciona o novo emblema com proporção equilibrada no centro do quadrante direito
            logo_h = 400
            logo_w = int(master.width * (logo_h / master.height))
            scaled_logo = master.resize((logo_w, logo_h), Image.Resampling.LANCZOS)
            dest_x = 490 + (534 - logo_w) // 2
            dest_y = (500 - logo_h) // 2
            dest.paste(scaled_logo, (dest_x, dest_y), scaled_logo)
            dest.save(destaque_path, "PNG", optimize=True)

    print("✔ Todos os assets foram gerados e sincronizados com sucesso!")

if __name__ == "__main__":
    main()
