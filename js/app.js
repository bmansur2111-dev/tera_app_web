import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, getDoc, updateDoc, collection, addDoc, getDocs, query, where, orderBy, arrayUnion } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Ваша конфигурация Firebase (автоматически подтягивается из firebase-config.js если вы вынесли, либо вставьте свой объект):
const firebaseConfig = window.firebaseConfig || {
  apiKey: "YOUR_API_KEY",
  authDomain: "tera-eco-app.firebaseapp.com",
  projectId: "tera-eco-app",
  storageBucket: "tera-eco-app.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Проверка авторизации и роли
export function requireAuth(expectedRole, callback) {
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      window.location.href = "../auth/login.html";
      return;
    }

    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (!userDoc.exists()) {
        alert("Профиль не найден в базе!");
        window.location.href = "../auth/login.html";
        return;
      }

      const userData = userDoc.data();
      userData.uid = user.uid;

      if (expectedRole && userData.role !== expectedRole) {
        alert("У вас нет доступа к этой странице!");
        window.location.href = "../auth/login.html";
        return;
      }

      callback(userData);
    } catch (e) {
      console.error("Ошибка авторизации:", e);
    }
  });
}

// Выход из системы
export function logout() {
  signOut(auth).then(() => {
    window.location.href = "../auth/login.html";
  });
}

// --- КВЕСТЫ ---
export async function createQuest(questData) {
  const user = auth.currentUser;
  if (!user) throw new Error("Не авторизован");

  return await addDoc(collection(db, "quests"), {
    ...questData,
    ownerId: user.uid,
    createdAt: new Date().toISOString(),
    status: "open"
  });
}

export async function loadQuests(ownerId = null) {
  let q;
  if (ownerId) {
    q = query(collection(db, "quests"), where("ownerId", "==", ownerId));
  } else {
    q = query(collection(db, "quests"));
  }
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// --- КУПОНЫ И МАГАЗИН ---
export async function createCoupon(couponData) {
  const user = auth.currentUser;
  if (!user) throw new Error("Не авторизован");

  return await addDoc(collection(db, "coupons"), {
    ...couponData,
    cost: Number(couponData.cost),
    ownerId: user.uid,
    createdAt: new Date().toISOString()
  });
}

export async function loadCoupons(ownerId = null) {
  let q;
  if (ownerId) {
    q = query(collection(db, "coupons"), where("ownerId", "==", ownerId));
  } else {
    q = query(collection(db, "coupons"));
  }
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// Покупка купона волонтером
export async function buyCoupon(userProfile, coupon) {
  const currentXP = userProfile.xp !== undefined ? userProfile.xp : 500; // по умолчанию 500 XP для тестов

  if (currentXP < coupon.cost) {
    alert(`Недостаточно XP! У вас: ${currentXP} XP, а стоимость купона: ${coupon.cost} XP.`);
    return false;
  }

  const newXP = currentXP - coupon.cost;
  const userRef = doc(db, "users", userProfile.uid);

  const purchasedItem = {
    couponId: coupon.id,
    title: coupon.title,
    code: coupon.code || "ПРОМОКОД: TERA-50-SPECIAL",
    boughtAt: new Date().toLocaleString()
  };

  await updateDoc(userRef, {
    xp: newXP,
    purchasedCoupons: arrayUnion(purchasedItem)
  });

  alert(`🎉 Успешно! Вы приобрели купон "${coupon.title}". Промокод/QR доступен в вашем профиле!`);
  return true;
}

// --- РЕДАКТИРОВАНИЕ ПРОФИЛЯ ---
export async function updateUserProfile(uid, data) {
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, data);
  alert("Профиль успешно обновлен!");
}