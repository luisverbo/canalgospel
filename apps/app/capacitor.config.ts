import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'br.com.canalgospel.app',
  appName: 'Canal Gospel',
  webDir: 'out',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#2E2860',
      showSpinner: false,
    },
    AdMob: {
      // App ID is declared in AndroidManifest.xml meta-data (required by Google SDK).
      // initializeForTesting must be false in production builds.
      initializeForTesting: false,
    },
  },
}

export default config
