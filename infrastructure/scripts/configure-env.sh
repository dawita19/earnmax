# scripts/configure-env.sh
#!/bin/bash
echo "🔐 Configuring environment variables"

# Frontend env vars (Vercel)
vercel env add DATABASE_URL preview < .env.example
vercel env add NEXT_PUBLIC_API_URL preview < .env.example
vercel env add NEXT_PUBLIC_WS_URL preview < .env.example

# Backend env vars (Railway)
railway variables set $(grep -v '^#' .env.example | xargs) --environment production

# Database configuration
echo "🗄️ Setting up PostgreSQL"
railway run -- psql -c "CREATE DATABASE earnmax_prod;"
railway run -- psql -c "CREATE USER earnmax_admin WITH PASSWORD '$(openssl rand -hex 16)';"
railway run -- psql -c "GRANT ALL PRIVILEGES ON DATABASE earnmax_prod TO earnmax_admin;"

echo "✅ Environment configuration complete!"