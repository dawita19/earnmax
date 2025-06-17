# EarnMax Elite Platform

## Project Structure

- `backend/`: NestJS application
  - PostgreSQL for main data storage
  - Redis for caching and real-time features
  - Deployed on Railway

- `frontend/`: Next.js application
  - TypeScript for type safety
  - Tailwind CSS for styling
  - Deployed on Vercel

## Development Setup

1. Clone the repository
2. Install pnpm: `corepack enable && corepack prepare pnpm@latest --activate`
3. Install dependencies:
   ```bash
   cd backend && pnpm install
   cd ../frontend && pnpm install