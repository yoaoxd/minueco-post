#!/bin/bash
# 🚨 ALERTA PRESIDENCIAL - The Minuecus Post
# Uso: ./send-alert.sh "Título de la noticia" "Descripción breve"

CHANNEL="minuecus-alertas"
TITLE="${1:-🚨 ALERTA PRESIDENCIAL}"
MESSAGE="${2:-Nueva actualización en The Minuecus Post}"
PRIORITY="${3:-high}"

# Enviar notificación
curl -s \
  -H "Title: $TITLE" \
  -H "Priority: $PRIORITY" \
  -H "Tags: newspaper,flag-mq" \
  -H "Click: https://yoaoxd.github.io/minueco-post/" \
  -H "Actions: view, Leer Post, https://yoaoxd.github.io/minueco-post/; view, Leer Times, https://yoaoxd.github.io/minueco-post/times.html" \
  -d "$MESSAGE" \
  "https://ntfy.sh/$CHANNEL"

echo ""
echo "✅ Alerta enviada al canal: $CHANNEL"
echo "📰 Título: $TITLE"
echo "📝 Mensaje: $MESSAGE"
echo ""
echo "🔗 Los lectores pueden suscribirse en: https://ntfy.sh/$CHANNEL"
