<<<<<<< HEAD
# 🏥 HIS Demo Project

A demo **Hospital Information System (HIS)** built with **Node.js (Express + TypeScript)** for the backend and **React (Vite + TypeScript)** for the frontend.  

The system simulates hospital workflows with multiple roles:

## ✨ Features

### 🧾 Front Desk
- Register patients with MRN and National ID
- Choose payment mode: **Auto**, **Insurance**, or **Cash**
- Check insurance **eligibility** (NPHIES mock API)
- Submit **Pre-Auth**
- Book **appointments** with doctors & assign rooms

### 👨‍⚕️ Doctor
- Secure login with hospital ID
- View daily appointment queue
- Add specialty services & lab orders
- Write patient prescriptions

### 💳 Finance
- Secure login with staff ID
- Manage invoices & insurance claims
- Submit claims to payer (mock API)
- Check claim status and reconcile

### 🛠️ IT Department
- Secure login with staff ID
- Add/remove doctors
- Manage available services and lab tests
- Configure specialties

---

## 🏗 Tech Stack
- **Backend**: Node.js, Express, TypeScript  
- **Frontend**: React, Vite, TypeScript  
- **Auth**: JWT with role-based access  
- **Mock APIs**: NPHIES (eligibility, preauth, claims)  

---

## 🚀 Getting Started

### Backend
```bash
cd HIS
npm install
npm run dev
=======
# Hospital-Management-System
>>>>>>> 59a5409 (Initial commit)
