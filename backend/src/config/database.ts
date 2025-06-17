import { Sequelize } from 'sequelize-typescript';
import { join } from 'path';
import appConfig from './app';

const modelsPath = join(__dirname, '../models');

const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST!,
  port: parseInt(process.env.DB_PORT!),
  username: process.env.DB_USER!,
  password: process.env.DB_PASSWORD!,
  database: process.env.DB_NAME!,
  models: [modelsPath],
  logging: appConfig.nodeEnv === 'development' ? console.log : false,
  pool: {
    max: 20,
    min: 5,
    acquire: 30000,
    idle: 10000
  },
  define: {
    paranoid: true,
    underscored: true,
    timestamps: true,
    defaultScope: {
      attributes: {
        exclude: ['passwordHash', 'deletedAt']
      }
    }
  }
});

export const initDB = async () => {
  try {
    await sequelize.authenticate();
    if (appConfig.nodeEnv === 'development') {
      await sequelize.sync({ alter: true });
    }
    console.log('Database connection established');
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
};

export default sequelize;