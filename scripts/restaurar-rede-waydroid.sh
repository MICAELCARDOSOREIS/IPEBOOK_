#!/usr/bin/env bash
# Restaura a rede do Waydroid para as configurações padrão originais (DHCP automático)
set -e

echo "=== Restaurando Rede Padrão do Waydroid ==="

# 1. Parar sessão atual do Waydroid se estiver rodando
echo "1. Parando sessão atual do Waydroid..."
waydroid session stop 2>/dev/null || true

# 2. Reiniciar o serviço container do Waydroid para recriar a ponte waydroid0 limpa
echo "2. Reiniciando serviço waydroid-container..."
sudo systemctl restart waydroid-container

# 3. Garantir que o firewall do host não bloqueie a ponte padrão
if command -v ufw >/dev/null 2>&1; then
  if sudo ufw status 2>/dev/null | grep -q "Status: active"; then
    echo "3. Liberando rota da interface waydroid0 no UFW..."
    sudo ufw allow in on waydroid0 >/dev/null 2>&1 || true
    sudo ufw route allow in on waydroid0 >/dev/null 2>&1 || true
    sudo ufw reload >/dev/null 2>&1 || true
  fi
fi

# 4. Habilitar encaminhamento IPv4 padrão
echo "4. Garantindo ip_forward ativo no kernel..."
sudo sysctl -w net.ipv4.ip_forward=1 >/dev/null 2>&1 || true

echo ""
echo "✔ Rede padrão do Waydroid restaurada com sucesso!"
echo "Agora você pode abrir o Waydroid normalmente (ele pegará IP e DNS automáticos via DHCP)."
