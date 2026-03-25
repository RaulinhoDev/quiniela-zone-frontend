import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.quinielazone.app',
  appName: 'Quiniela Zone',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
