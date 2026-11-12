#!/usr/bin/env bash
# Script para conectar o ADB e ativar internet no Waydroid no Arch / CachyOS
set -e

echo "=== Conector Waydroid / ADB / Rede IpêBook ==="

# 1. Configurar regras de firewall no Host (UFW)
if command -v ufw >/dev/null 2>&1; then
  echo "1. Verificando UFW no host..."
  if sudo ufw status 2>/dev/null | grep -q "Status: active"; then
    echo "   -> UFW ativo. Liberando tráfego e roteamento na interface waydroid0..."
    sudo ufw allow in on waydroid0 >/dev/null 2>&1 || true
    sudo ufw route allow in on waydroid0 >/dev/null 2>&1 || true
  fi
fi

# 2. Configurar IP, Gateway, DNS e ADB no container Android
echo "2. Desconectando sessões antigas e configurando ADB no Waydroid..."
adb disconnect 192.168.240.2:5555 >/dev/null 2>&1 || true

sudo waydroid shell << 'EOF'
ip addr add 192.168.240.2/24 dev eth0 2>/dev/null || true
ip link set dev eth0 up 2>/dev/null || true
ip route add default via 192.168.240.1 dev eth0 2>/dev/null || true
setprop net.dns1 8.8.8.8
setprop net.dns2 1.1.1.1
settings put global adb_enabled 1
settings put global stay_on_while_plugged_in 3
setprop service.adb.tcp.port 5555
setprop persist.adb.tcp.port 5555
stop adbd
sleep 1
start adbd
EOF

# 3. Conectar ADB com breve espera para o daemon inicializar
echo "3. Conectando ADB ao Waydroid (192.168.240.2:5555)..."
sleep 2
adb connect 192.168.240.2:5555

# 4. Testar conectividade de rede com a internet
echo "4. Testando resolução de DNS e conectividade..."
if adb shell ping -c 1 8.8.8.8 >/dev/null 2>&1; then
  echo "   ✔ Internet acessível dentro do Waydroid!"
else
  echo "   ⚠ Não foi possível pingar 8.8.8.8 ainda. Verifique se o firewall ou sysctl ip_forward está ativo."
fi

# 5. Listar dispositivos
echo "5. Dispositivos ADB:"
adb devices

echo "=== Concluído com sucesso! ==="
