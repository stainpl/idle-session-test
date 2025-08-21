---

# Idle Logout Test App

This is a simple **Express.js test application** demonstrating authentication with an idle logout/session timeout feature.
It provides a `/api/login` endpoint and is built for testing authentication + inactivity logout logic.

---

## 🚀 Features

* Basic **Express.js API server**
* `/api/login` endpoint for authentication
* Idle timeout session management
* JSON-based responses
* Easy to extend for testing authentication & session flows

---

## 📦 Package Used

This app uses the [**express**](https://www.npmjs.com/package/express) package as the web framework.
Other key dependencies:

* **cors** – Handle cross-origin requests
* **dotenv** – Manage environment variables
* **body-parser** – Parse request body JSON

---

## ⚙️ Installation & Setup

Clone the repository and install dependencies:

```bash
git clone <your_repo_url>
cd idle-logout-test/server
npm install
```

---

## ▶️ Running the App

Start the server:

```bash
node index.js
```

By default, it will run on:

```
http://localhost:4000
```

---

## 📡 API Endpoints

### `POST /api/login`

Login endpoint to authenticate users.

#### Request

```json
{
  "email": "demo@demo.com",
  "password": "demo"
}
```

#### Response

```json
{
  "message": "Login successful",
  "token": "your-jwt-or-session-id"
}
```

---

## 🔒 Idle Logout

* The app automatically expires sessions after a set **idle time**.
* You can configure this in the source (default: e.g., 5 minutes).

---

## 🛠️ Development Notes

* Code entry point: **index.js**
* Authentication logic: inside `/api/login` route
* Can be extended with JWT, MongoDB, or Redis for persistent sessions.

---
