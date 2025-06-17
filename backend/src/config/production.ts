export default {
  db: {
    url: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: '1d'
  },
  admin: {
    url: process.env.ADMIN_PANEL_URL
  },
  cors: {
    origin: [
      process.env.FRONTEND_URL,
      process.env.ADMIN_PANEL_URL
    ]
  },
  redis: {
    url: process.env.REDIS_URL
  }
};