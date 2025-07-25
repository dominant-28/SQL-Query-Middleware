# 🚀 Smart_Query_Proxy

**Smart_Query_Proxy** is a **full-stack developer tool** that acts as a **secure middleware proxy** between your application and your **MySQL** database.

It helps developers **analyze, monitor, and optimize SQL queries in real-time** during development — **without modifying production database logic**.

---

## ⚙️ How it Works

- **Connect Your Database:**  
  Provide your DB configuration. The app connects securely on your behalf.

- **Query Proxy:**  
  All SQL queries flow through **Smart_Query_Proxy** instead of directly hitting your database.

- **Analyze & Log:**  
  Every query is analyzed for execution time and sent to a **Flask microservice** (powered by **Gemini 2.5 Pro**) for real-time feedback and optimization tips.

- **Dashboard:**  
  - Run queries directly from the UI.
  - See instant results.
  - View logs and performance analytics.

- **API Key:**  
  Generate an API key and use it as a secure middle layer during development.

---

## 🧩 Tech Stack

| Layer | Technology |
|-------|-------------|
| **Frontend** | React |
| **Backend** | Node.js + Express |
| **Microservice** | Flask (Python) |
| **Database** | MySQL (target) + MongoDB (auth & config) |
| **Auth** | JWT + Cookies |
| **Deployment** | Vercel (Frontend), Render (Backend & Microservice) |

---

## 🧑‍💻 Features

✅ **Secure user authentication**  
✅ **Per-user DB configuration**  
✅ **Query execution & real-time results**  
✅ **AI-powered query feedback (Gemini 2.5 Pro)**  
✅ **Query logs & suspicious query detection**  
✅ **Detailed analytics dashboard**  
✅ **API key generation for secure proxying**  
✅ **Acts as a trusted middleware between your app & DB**

---

## 📊 Example Use Case

- **Connect Local or Remote MySQL**  
  Save connection settings once.

- **Run Queries in the App**  
  Get results & feedback instantly.

- **Use API Key for Proxying**  
  Route your dev app through **Smart_Query_Proxy** to analyze and log queries in real-time.

---

## 🌐 Deployed URLs

- **Frontend (React)** → [Smart Query Proxy UI](https://smart-query-proxy.vercel.app)


---

## 🔐 Security

- **JWT & Cookies** for auth  
- **MongoDB** for secure user & config storage  
- **API Key** for safe integration in dev mode

---

## 🚀 Deployment

- **Frontend:** Hosted on **Vercel**
- **Backend & Flask:** Hosted on **Render**
- Easily adaptable to self-host with Docker & NGINX in the future



---

**Smart_Query_Proxy — your trusted SQL middleware for a smarter dev workflow.**
