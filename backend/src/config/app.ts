import { load } from 'dotenv-flow';
import { join } from 'path';

load({ path: join(__dirname, '../../env') });

interface AppConfig {
  nodeEnv: 'development' | 'production' | 'test';
  port: number;
  appName: string;
  adminPanelEnabled: boolean;
  roundRobinAdmins: number;
}

const appConfig: AppConfig = {
  nodeEnv: process.env.NODE_ENV as AppConfig['nodeEnv'] || 'development',
  port: parseInt(process.env.PORT || '3000'),
  appName: 'EarnMax Elite',
  adminPanelEnabled: process.env.ADMIN_PANEL_ENABLED === 'true',
  roundRobinAdmins: parseInt(process.env.ROUND_ROBIN_ADMINS || '10')
};

export default appConfig;