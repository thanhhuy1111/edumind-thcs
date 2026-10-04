#!/bin/bash
# EduMind THCS - Vercel Deployment Script
# Run this after vercel login

set -e

echo "🚀 Deploying EduMind THCS to Vercel..."

# Neon PostgreSQL credentials
DATABASE_URL_POOLED="postgresql://neondb_owner:npg_zfwQIes7b9uJ@ep-sweet-band-az1o35kh-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&pgbouncer=true&connection_limit=1"
DATABASE_URL_DIRECT="postgresql://neondb_owner:npg_zfwQIes7b9uJ@ep-sweet-band-az1o35kh.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
NEXTAUTH_SECRET="edumind-thcs-secret-2026-xK9mP3qL7nR5vT1uY4wZ8jA"

echo "📦 Setting up Vercel project (linked to GitHub)..."
vercel --name edumind-thcs --yes 2>&1 | head -20 || true

echo "🔑 Setting environment variables..."
echo "$DATABASE_URL_POOLED" | vercel env add DATABASE_URL production --force
echo "$DATABASE_URL_DIRECT" | vercel env add DIRECT_URL production --force
echo "$NEXTAUTH_SECRET" | vercel env add NEXTAUTH_SECRET production --force

echo "🌐 Deploying to production..."
vercel --prod --yes

echo ""
echo "✅ Deployment complete!"
echo "📍 Your app is live on Vercel!"
