#!/bin/bash

echo "🚀 Training Analytics App - Setup Script"
echo "========================================"
echo ""

echo "📦 Installing backend dependencies..."
cd backend
npm install

echo ""
echo "🔧 Setting up Prisma..."
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed

echo ""
echo "📦 Installing frontend dependencies..."
cd ../frontend
npm install

echo ""
echo "✅ Setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Edit backend/.env with your Strava API credentials"
echo "2. Make sure PostgreSQL is running"
echo "3. Run 'npm run dev' in backend directory"
echo "4. Run 'npm run dev' in frontend directory"
echo ""
echo "🌐 App will be available at:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:5000"
