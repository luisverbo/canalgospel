import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'br.com.canalgospel.app',
  appName: 'Canal Gospel',
  webDir: 'out',
  server: {
    androidScheme: 'https',
    // Fallback for any URL Capacitor cannot serve from the static bundle.
    // The page saves the original path to sessionStorage and redirects to
    // the correct pre-generated shell so the client-side router can recover.
    errorPath: '/_fallback.html',
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
