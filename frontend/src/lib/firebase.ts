import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// TODO: Replace this with the config from your Firebase Project
const firebaseConfig = {
  apiKey: "AIzaSyCIHPntKRwO3PfbG1EXC2eWvJGYCDPoYnM",
  authDomain: "cloth-store-306e5.firebaseapp.com",
  projectId: "cloth-store-306e5",
  storageBucket: "cloth-store-306e5.firebasestorage.app",
  messagingSenderId: "344138569938",
  appId: "1:344138569938:web:616e290caa56cac77e350b"
};

// Initialize Firebase only if it hasn't been initialized yet
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { app, auth };
