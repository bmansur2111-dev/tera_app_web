# Tera — сайт (MVP)

## Структура проекта
```
tera-app-web/
├── index.html              # Главная / лендинг
├── partners.html            # Страница для партнёров
├── contacts.html             # Контакты
├── auth/
│   ├── register.html         # Регистрация (волонтёр / партнёр)
│   └── login.html             # Вход
├── app/
│   ├── dashboard-volunteer.html   # Кабинет волонтёра — лента квестов
│   └── dashboard-partner.html     # Кабинет партнёра — создание квестов
├── css/style.css
└── js/
    ├── firebase-config.js   # Ключи Firebase (нужно заполнить)
    ├── auth.js              # Регистрация / вход / роли
    └── app.js               # Защита кабинета, работа с квестами
```

## Шаг 1 — настрой Firebase (5 минут)
1. Зайди на https://console.firebase.google.com и создай новый проект.
2. В меню слева: **Build → Authentication → Get started → Sign-in method → Email/Password → включить**.
3. В меню слева: **Build → Firestore Database → Create database → Start in test mode** (для MVP этого достаточно; перед реальным запуском нужно будет настроить правила безопасности).
4. В настройках проекта (⚙️ иконка сверху → Project settings) в разделе "Your apps" нажми **Web (`</>`)**, зарегистрируй приложение и скопируй объект `firebaseConfig`.
5. Открой `js/firebase-config.js` и вставь свои значения вместо `"ВСТАВЬ_СЮДА"`.

## Шаг 2 — запусти сайт локально
Т.к. используются ES-модули (`import`), открывать `index.html` напрямую двойным кликом не получится — браузер заблокирует модули по CORS-политике для `file://`. Нужен локальный сервер:

**Вариант А — расширение VS Code:**
Установи расширение **Live Server**, открой `index.html` → правой кнопкой → "Open with Live Server".

**Вариант Б — через Node.js:**
```bash
npx serve .
```

## Шаг 3 — залей на GitHub
```bash
git add .
git commit -m "MVP: лендинг, регистрация/вход, кабинеты волонтёра и партнёра"
git push -u origin main
```

## Что уже готово
- Адаптивный лендинг с описанием проекта, для волонтёров и партнёров
- Регистрация и вход с разделением ролей (волонтёр / партнёр) через Firebase
- Кабинет волонтёра — лента открытых квестов из Firestore
- Кабинет партнёра — публикация новых квестов, список своих квестов

## Обнови правила безопасности Firestore

Раз у нас появились права по ролям, замени правила в **Firestore → Rules** на такие — они разрешают создавать квесты только партнёрам с правом `permissions.quests`:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function userDoc() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data;
    }

    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }

    match /quests/{questId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null
                    && userDoc().role == 'partner'
                    && userDoc().permissions.quests == true;
      allow update, delete: if request.auth != null && resource.data.ownerUid == request.auth.uid;
    }
  }
}
```

Не забудь нажать **Publish** после вставки.

## Как заводить аккаунты партнёров

Публичная регистрация (`auth/register.html`) теперь доступна **только волонтёрам**. Партнёры (организации, кофейни и т.д.) не регистрируются сами — их аккаунты заводит администратор вручную через Firebase Console, с нужным набором прав. Это позволяет гибко разделять доступы:
- организация → может публиковать квесты
- кофейня/бизнес → может управлять только купонами
- некоторые → и то, и другое

### Как создать аккаунт партнёра (2 минуты)

1. **Firebase Console → Authentication → Users → Add user**
   Введи email партнёра и временный пароль (потом можно попросить сменить). Нажми **Add user**.
2. Скопируй **User UID**, который появится в списке пользователей.
3. **Firebase Console → Firestore Database → Data → коллекция `users` → Add document**
   - **Document ID**: вставь скопированный UID (важно — именно как ID документа, не как поле)
   - Добавь поля:
     | Поле | Тип | Значение |
     |---|---|---|
     | `name` | string | Название организации, например "Skuratov Coffee" |
     | `email` | string | Email партнёра |
     | `role` | string | `partner` |
     | `permissions` | map | внутри два поля: `quests` (boolean), `coupons` (boolean) |
     | `createdAt` | string | текущая дата |

   Примеры `permissions` для разных типов партнёров:
   - Волонтёрская организация → `{ quests: true, coupons: false }`
   - Кофейня → `{ quests: false, coupons: true }`
   - И то, и другое → `{ quests: true, coupons: true }`

4. Отправь партнёру email + временный пароль — он сможет войти через `auth/login.html`, и увидит в кабинете только те разделы, на которые есть права.

> Купоны пока не реализованы (ждём макет страницы «Магазин»), поэтому право `coupons` сейчас просто показывает заглушку "в разработке" — сама логика добавится, когда пришлёшь дизайн.

## Что предстоит доделать (когда будут готовы макеты)
- Страница **"Магазин"** — витрина купонов + логика "потратить баллы/выполненный квест на купон"
- Страница **"Квесты"** — детальная карточка квеста, кнопка "Выполнил", подтверждение партнёром
- Страница **"Чаты"** — общая группа + личные чаты (потребует Firestore-коллекцию сообщений или Firebase Realtime Database)
- Страница **"Профиль"** — аватар, статистика, история купонов

Пришли скриншоты/параметры этих страниц из Figma — подгоним верстку под готовый дизайн, сохранив уже собранную логику (Firebase, роли, роутинг).

## Хостинг (когда будет готово показывать партнёрам)
Проще всего — **Firebase Hosting** (бесплатно, тот же проект что и база данных):
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```
Либо Vercel/Netlify — просто перетащить папку проекта на их сайт.
