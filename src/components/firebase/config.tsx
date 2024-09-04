import { initializeApp, getApps } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAqvT0yoTZ9UyZdR4ZKkwpoC1KYbwVR8SE",
  authDomain: "keikojuliakarya.firebaseapp.com",
  projectId: "keikojuliakarya",
  storageBucket: "keikojuliakarya.appspot.com",
  messagingSenderId: "61722569099",
  appId: "1:61722569099:web:1cf83f102cac885263e78e",
  measurementId: "G-RJZ0E2YX5H",
};

const app = initializeApp(firebaseConfig);
const analytics = isSupported().then((yes) => (yes ? getAnalytics(app) : null));
let firebase_app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export { firebase_app, analytics, app };
