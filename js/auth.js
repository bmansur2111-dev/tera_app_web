import { auth, db } from "./firebase-config.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  doc, setDoc, getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ---------- Переключатель роли (используется на странице регистрации) ----------
export function initRoleToggle(containerId, onChange) {
  const wrap = document.getElementById(containerId);
  if (!wrap) return;
  const buttons = wrap.querySelectorAll("button");
  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      buttons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      onChange(btn.dataset.role);
    });
  });
}

// ---------- Регистрация ----------
export async function registerUser({ name, email, password, role }) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await setDoc(doc(db, "users", cred.user.uid), {
    name,
    email,
    role, // "volunteer" | "partner"
    createdAt: new Date().toISOString(),
    points: 0
  });
  return { uid: cred.user.uid, role };
}

// ---------- Вход ----------
export async function loginUser({ email, password }) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  const snap = await getDoc(doc(db, "users", cred.user.uid));
  const profile = snap.exists() ? snap.data() : null;
  return { uid: cred.user.uid, profile };
}

// ---------- Редирект в нужный кабинет по роли ----------
export function redirectByRole(role) {
  if (role === "partner") {
    window.location.href = "../app/dashboard-partner.html";
  } else {
    window.location.href = "../app/dashboard-volunteer.html";
  }
}

// ---------- Перевод ошибок Firebase на понятный язык ----------
export function friendlyError(code) {
  const map = {
    "auth/email-already-in-use": "Этот email уже зарегистрирован.",
    "auth/invalid-email": "Некорректный email.",
    "auth/weak-password": "Пароль должен быть не менее 6 символов.",
    "auth/user-not-found": "Пользователь с таким email не найден.",
    "auth/wrong-password": "Неверный пароль.",
    "auth/invalid-credential": "Неверный email или пароль."
  };
  return map[code] || "Что-то пошло не так. Попробуйте ещё раз.";
}
