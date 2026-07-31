import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
  getFirestore, 
  doc, 
  getDoc, 
  updateDoc, 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  arrayUnion, 
  deleteDoc 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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

// Проверка авторизации и роли пользователя
export function requireAuth(expectedRole, callback) {
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      window.location.href = "../auth/login.html";
      return;
    }

    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (!userDoc.exists()) {
        alert("Профиль не найден в базе данных!");
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
    maxVolunteers: (questData.maxVolunteers !== null && questData.maxVolunteers !== undefined && questData.maxVolunteers !== "") 
      ? Number(questData.maxVolunteers) 
      : null,
    registeredCount: 0,
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

export async function deleteQuest(questId) {
  await deleteDoc(doc(db, "quests", questId));
}

// --- КУПОНЫ И МАГАЗИН ---
export async function createCoupon(couponData) {
  const user = auth.currentUser;
  if (!user) throw new Error("Не авторизован");

  return await addDoc(collection(db, "coupons"), {
    ...couponData,
    cost: Number(couponData.cost),
    maxQuantity: (couponData.maxQuantity !== null && couponData.maxQuantity !== undefined && couponData.maxQuantity !== "") 
      ? Number(couponData.maxQuantity) 
      : null,
    claimedCount: 0,
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

export async function deleteCoupon(couponId) {
  await deleteDoc(doc(db, "coupons", couponId));
}

// Покупка купона волонтёром
export async function buyCoupon(userProfile, coupon) {
  const currentXP = userProfile.xp !== undefined && userProfile.xp !== null ? Number(userProfile.xp) : 0;

  // 1. Проверяем баланс XP
  if (currentXP < coupon.cost) {
    alert(`Недостаточно XP! У вас: ${currentXP} XP, а стоимость: ${coupon.cost} XP.`);
    return false;
  }

  // 2. Проверяем наличие купонов
  const claimed = coupon.claimedCount || 0;
  if (coupon.maxQuantity !== null && coupon.maxQuantity !== undefined && claimed >= coupon.maxQuantity) {
    alert("К сожалению, эти купоны закончились!");
    return false;
  }

  const newXP = currentXP - coupon.cost;
  const userRef = doc(db, "users", userProfile.uid);
  const couponRef = doc(db, "coupons", coupon.id);

  const purchasedItem = {
    couponId: coupon.id,
    title: coupon.title,
    code: coupon.code || "ПРОМОКОД: TERA-SPECIAL",
    cost: coupon.cost,
    boughtAt: new Date().toLocaleString("ru-RU")
  };

  // Обновляем XP и список купленных купонов
  await updateDoc(userRef, {
    xp: newXP,
    purchasedCoupons: arrayUnion(purchasedItem)
  });

  // Увеличиваем счетчик забранных купонов
  await updateDoc(couponRef, {
    claimedCount: claimed + 1
  });

  alert(`🎉 Успешно! Вы приобрели купон "${coupon.title}". Промокод сохранен во вкладке "Профиль"!`);
  return true;
}

// Редактирование профиля (имя, аватар)
export async function updateUserProfile(uid, data) {
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, data);
  alert("Профиль успешно обновлён!");
}