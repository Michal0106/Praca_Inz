#!/bin/bash

echo "🚀 Training Analytics App - Starting..."
echo "======================================"
echo ""

check_postgres() {
    if ! command -v psql &> /dev/null; then
        echo "❌ PostgreSQL nie jest zainstalowany!"
        echo "   Zainstaluj: brew install postgresql@14"
        exit 1
    fi
    
    if ! psql -U postgres -c '\q' 2>/dev/null; then
        echo "⚠️  PostgreSQL nie jest uruchomiony!"
        echo "   Uruchom: brew services start postgresql@14"
        echo "   Lub sprawdź czy używasz innego użytkownika"
    fi
}

check_database() {
    if ! psql -U postgres -lqt | cut -d \| -f 1 | grep -qw training_db; then
        echo "❌ Baza danych 'training_db' nie istnieje!"
        echo "   Tworzę bazę danych..."
        createdb training_db 2>/dev/null || createdb -U postgres training_db
        echo "✅ Baza danych utworzona!"
    fi
}

check_backend_deps() {
    if [ ! -d "backend/node_modules" ]; then
        echo "📦 Instaluję zależności backendu..."
        cd backend
        npm install
        cd ..
    fi
}

check_frontend_deps() {
    if [ ! -d "frontend/node_modules" ]; then
        echo "📦 Instaluję zależności frontendu..."
        cd frontend
        npm install
        cd ..
    fi
}

check_prisma() {
    if [ ! -d "backend/node_modules/.prisma" ]; then
        echo "🔧 Konfiguruję Prisma..."
        cd backend
        npx prisma generate
        npx prisma migrate deploy 2>/dev/null || npx prisma migrate dev --name init
        npx prisma db seed
        cd ..
    fi
}

echo "🔍 Sprawdzam wymagania..."
check_postgres
check_database
check_backend_deps
check_frontend_deps
check_prisma

echo ""
echo "✅ Wszystko gotowe!"
echo ""
echo "🌐 Uruchamiam aplikację..."
echo ""
echo "   Backend:  http://localhost:5000"
echo "   Frontend: http://localhost:3000"
echo ""
echo "   Aby zatrzymać: Ctrl+C"
echo ""
echo "================================================"
echo ""

trap 'kill $(jobs -p) 2>/dev/null' EXIT

cd backend && npm run dev &
BACKEND_PID=$!

sleep 3

cd frontend && npm run dev &
FRONTEND_PID=$!

wait
