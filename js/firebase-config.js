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
  apiKey: "ВСТАВЬ_СЮДА",
  authDomain: "ВСТАВЬ_СЮДА.firebaseapp.com",
  projectId: "ВСТАВЬ_СЮДА",
  storageBucket: "ВСТАВЬ_СЮДА.appspot.com",
  messagingSenderId: "ВСТАВЬ_СЮДА",
  appId: "ВСТАВЬ_СЮДА"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
