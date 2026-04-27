#!/usr/bin/env bash
# ───────────────────────────────────────────────────────────────────────────────
# scripts/ngrok-webhook.sh
# Launch ngrok to expose localhost:3000 and display the webhook URL
# 
# Usage:
#   chmod +x scripts/ngrok-webhook.sh
#   ./scripts/ngrok-webhook.sh
#
# Prerequisites:
#   - Install ngrok: https://ngrok.com/download
#   - Or: npm install -g ngrok / snap install ngrok
# ───────────────────────────────────────────────────────────────────────────────

set -euo pipefail

PORT="${1:-3000}"

echo "🚀 Starting ngrok tunnel on port ${PORT}..."
echo ""

# Check if ngrok is installed
if ! command -v ngrok &> /dev/null; then
  echo "❌ ngrok is not installed."
  echo "   Install it from: https://ngrok.com/download"
  echo "   Or run: npm install -g ngrok"
  exit 1
fi

# Start ngrok in background
ngrok http "$PORT" --log=stdout > /tmp/ngrok.log 2>&1 &
NGROK_PID=$!

# Wait for ngrok to start
sleep 3

# Get the public URL
NGROK_URL=$(curl -s http://localhost:4040/api/tunnels | grep -oP '"public_url":"https://[^"]+' | head -1 | sed 's/"public_url":"//') || true

if [ -z "$NGROK_URL" ]; then
  echo "❌ Failed to get ngrok URL. Check if ngrok started correctly."
  echo "   Log: /tmp/ngrok.log"
  kill $NGROK_PID 2>/dev/null || true
  exit 1
fi

WEBHOOK_URL="${NGROK_URL}/api/payos/webhook"

echo "════════════════════════════════════════════════════════════════"
echo ""
echo "  ✅ ngrok is running!"
echo ""
echo "  🌐 Public URL:     ${NGROK_URL}"
echo "  🔗 Webhook URL:    ${WEBHOOK_URL}"
echo ""
echo "  📋 Copy the Webhook URL above and paste it into:"
echo "     PayOS Dashboard → Integration → Webhook URL"
echo ""
echo "  💡 Press Ctrl+C to stop ngrok"
echo ""
echo "════════════════════════════════════════════════════════════════"

# Keep running
wait $NGROK_PID
