#!/bin/bash
# Development mode: красивые логи с цветами, debug уровень

export NODE_ENV=development
export LOG_LEVEL=debug

echo "🔧 Starting in DEVELOPMENT mode..."
echo "   NODE_ENV=$NODE_ENV"
echo "   LOG_LEVEL=$LOG_LEVEL"

docker compose down
docker compose up -d --build

echo "✅ Development containers started!"
echo "📋 View logs: docker compose logs -f bot"