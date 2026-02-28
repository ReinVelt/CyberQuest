#!/usr/bin/env bash
#
# CyberQuest Webhook Auto-Deploy — Setup Script
#
# Run on your Ubuntu server as root (or with sudo):
#   sudo bash scripts/setup-webhook.sh
#
# What it does:
#   1. Ensures www-data owns the repo and can git pull
#   2. Installs the systemd service
#   3. Enables & starts the service
#   4. Enables Apache proxy modules
#   5. Prints next steps (GitHub webhook URL + secret)
#
set -euo pipefail

REPO_DIR="/var/www/CyberQuest"
SERVICE_NAME="cyberquest-webhook"
SERVICE_FILE="$REPO_DIR/scripts/$SERVICE_NAME.service"
APACHE_CONF="$REPO_DIR/scripts/apache-webhook.conf"
ENV_FILE="/etc/cyberquest-webhook.env"

echo "=== CyberQuest Webhook Setup ==="
echo ""

# ---- 1. Repo ownership ----
echo "[1/5] Ensuring www-data owns $REPO_DIR …"
chown -R www-data:www-data "$REPO_DIR"
# Mark the repo as safe for git operations by any user
git config --global --add safe.directory "$REPO_DIR" 2>/dev/null || true
su -s /bin/bash www-data -c "cd $REPO_DIR && git config --global --add safe.directory $REPO_DIR" 2>/dev/null || true
echo "  ✓ Ownership set"

# ---- 2. Webhook secret ----
if [ ! -f "$ENV_FILE" ]; then
    SECRET=$(openssl rand -hex 20)
    echo "WEBHOOK_SECRET=$SECRET" > "$ENV_FILE"
    chmod 600 "$ENV_FILE"
    echo "[2/5] Generated webhook secret → $ENV_FILE"
    echo "  ✓ Secret: $SECRET  (save this for GitHub)"
else
    SECRET=$(grep -oP 'WEBHOOK_SECRET=\K.*' "$ENV_FILE" || echo "")
    echo "[2/5] Webhook secret already exists in $ENV_FILE"
    echo "  ✓ Secret: $SECRET"
fi
echo ""

# ---- 3. systemd service ----
echo "[3/5] Installing systemd service …"
cp "$SERVICE_FILE" /etc/systemd/system/
systemctl daemon-reload
systemctl enable "$SERVICE_NAME"
systemctl restart "$SERVICE_NAME"
echo "  ✓ $SERVICE_NAME.service enabled and started"
echo ""

# ---- 4. Apache proxy ----
echo "[4/5] Configuring Apache …"
a2enmod proxy proxy_http > /dev/null 2>&1 || true

# Install the webhook proxy config if not already present
WEBHOOK_CONF="/etc/apache2/conf-available/cyberquest-webhook.conf"
cp "$APACHE_CONF" "$WEBHOOK_CONF"
a2enconf cyberquest-webhook > /dev/null 2>&1 || true
systemctl reload apache2
echo "  ✓ Apache proxy /webhook → 127.0.0.1:9000"
echo ""

# ---- 5. Status & next steps ----
echo "[5/5] Service status:"
systemctl --no-pager status "$SERVICE_NAME" | head -10
echo ""
echo "════════════════════════════════════════════════════════"
echo "  SETUP COMPLETE"
echo "════════════════════════════════════════════════════════"
echo ""
echo "  Next: configure the webhook on GitHub:"
echo ""
echo "  1. Go to: https://github.com/ReinVelt/CyberQuest/settings/hooks/new"
echo "  2. Payload URL:  https://YOUR-SERVER/webhook"
echo "  3. Content type: application/json"
echo "  4. Secret:       $SECRET"
echo "  5. Events:       Just the push event"
echo "  6. Click 'Add webhook'"
echo ""
echo "  Test with: curl -s http://localhost:9000/"
echo "  Logs:      journalctl -u $SERVICE_NAME -f"
echo ""
