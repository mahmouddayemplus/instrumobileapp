import 'dotenv/config'; // Load .env automatically

export default {
  expo: {
    name: "instrupro",
    slug: "instrupro",
    version: "1.0.1",
    orientation: "portrait",
    icon: "./assets/adaptive-icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,

    // Android config is defined later with splash settings

    ios: {
      buildNumber: "1.0.0",
      supportsTablet: true,
      icon: "./assets/icon.png",
      splash: {
        image: "./assets/splash-icon.png",
        resizeMode: "cover",
        backgroundColor: "#ffffff",
      },
    },
    

    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "cover",
      backgroundColor: "#ffffff",
    },

    androidStatusBar: {
      backgroundColor: "#ffffff",
      translucent: false,
      barStyle: "dark-content",
      hidden: false,
    },

    android: {
      package: "com.mahmoud.instrupro", // ✅ required
      versionCode: 1,
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      edgeToEdgeEnabled: true,
      splash: {
        image: "./assets/splash-icon.png",
        resizeMode: "cover",
        backgroundColor: "#ffffff",
      },
    },

    extra: {
      eas: {
        projectId: "1c920fd4-71ed-4340-8b70-8d83d7c42c98",
      },
      firebaseApiKey: process.env.FIREBASE_API_KEY,
      firebaseAuthDomain: process.env.FIREBASE_AUTH_DOMAIN,
      firebaseProjectId: process.env.FIREBASE_PROJECT_ID,
      firebaseStorageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      firebaseMessagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      firebaseAppId: process.env.FIREBASE_APP_ID,
    },

    web: {
      favicon: "./assets/favicon.png",
    },

    plugins: ["expo-sqlite",'expo-asset'],
  },
};
