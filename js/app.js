import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  collection, addDoc, getDocs, doc, getDoc, query, where, orderBy, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Защищает страницу кабинета: если не залогинен — на страницу входа.
export function requireAuth(requiredRole, onReady) {
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      window.location.href = "../auth/login.html";
      return;
    }
    const snap = await getDoc(doc(db, "users", user.uid));
    const profile = snap.exists() ? snap.data() : { name: "Пользователь", role: "volunteer" };

    if (requiredRole && profile.role !== requiredRole) {
      window.location.href = profile.role === "partner"
        ? "dashboard-partner.html"
        : "dashboard-volunteer.html";
      return;
    }
    onReady({ uid: user.uid, ...profile });
  });
}

export function logout() {
  signOut(auth).then(() => window.location.href = "../index.html");
}

// ---------- КВЕСТЫ ----------
export async function createQuest({ title, category, reward, ownerUid, ownerName }) {
  await addDoc(collection(db, "quests"), {
    title,
    category,
    reward,
    ownerUid,
    ownerName,
    status: "open", // open | closed
    createdAt: serverTimestamp()
  });
}

export async function loadQuests() {
  const q = query(collection(db, "quests"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function loadPartnerQuests(ownerUid) {
  const q = query(collection(db, "quests"), where("ownerUid", "==", ownerUid));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// ---------- МАГАЗИН И КУПОНЫ ----------
export async function createCoupon({ title, category, cost, ownerUid, ownerName }) {
  await addDoc(collection(db, "coupons"), {
    title,
    category,
    cost: Number(cost),
    ownerUid,
    ownerName,
    status: "active",
    createdAt: serverTimestamp()
  });
}

export async function loadCoupons() {
  const q = query(collection(db, "coupons"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function loadPartnerCoupons(ownerUid) {
  const q = query(collection(db, "coupons"), where("ownerUid", "==", ownerUid));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}