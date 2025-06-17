import { Sequelize } from 'sequelize-typescript';
import { User } from './models/user.model';
import { Admin } from './models/admin.model';
import { Suspension } from './models/suspension.model';
import { Notification } from './models/notification.model';
import { AuditLog } from './models/audit.model';
// Import other models...

const sequelize = new Sequelize({
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  dialect: 'postgres',
  models: [__dirname + '/models'],
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 20,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

// Define associations
const setupAssociations = () => {
  // Suspension associations
  Suspension.belongsTo(User, { foreignKey: 'user_id' });
  Suspension.belongsTo(Admin, { foreignKey: 'admin_id' });
  
  // Notification associations
  Notification.belongsTo(User, { foreignKey: 'user_id' });
  
  // AuditLog associations
  AuditLog.belongsTo(Admin, { foreignKey: 'admin_id' });
  AuditLog.belongsTo(User, { foreignKey: 'user_id' });
  
  // Add other associations...
};

export { sequelize, setupAssociations };