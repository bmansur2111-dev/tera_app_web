// ============================================
// FIREBASE CONFIG
// ============================================
// 1. Зайди на https://console.firebase.google.com
// 2. Создай новый проект (например "tera-app")
// 3. В настройках проекта (⚙️ Project settings) → "Add app" → Web (</>) 
// 4. Скопируй объект firebaseConfig и вставь вместо значений ниже
// 5. В разделе Build → Authentication → включи "Email/Password"
// 6. В разделе Build → Firestore Database → создай базу (start in test mode для MVP)

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBqEJD4eyR9_z_h2X_XkpGUYc8wOV6h5Og",
  authDomain: "tera-eco-app.firebaseapp.com",
  projectId: "tera-eco-app",
  storageBucket: "tera-eco-app.firebasestorage.app",
  messagingSenderId: "128530104831",
  appId: "1:128530104831:web:058edd0853cb7c701827ca",
  measurementId: "G-KMS58TKF87"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
