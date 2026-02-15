# Digital KYC Verification System (HC-402)

A full-stack Digital KYC platform that verifies a user using:
- Government ID document (PAN/Aadhaar)
- Live selfie capture (liveness check)
- AI-based OCR + Face Verification
- Risk scoring and final decision (Verified / Rejected)

This project was built for an online hackathon under problem statement **HC-402**.

---

## 🚀 Features

### 👤 User Side
- Upload PAN/Aadhaar image
- Live selfie verification using webcam (head turn liveness)
- Instant KYC result:
  - Verified / Rejected
  - Risk score
  - OCR extracted text
  - Face match distance

### 🛡️ Admin Side
- Admin dashboard to view all KYC requests
- Shows status, risk score, and face verification results
- Stored KYC history in MongoDB

---

## 🧠 AI Verification

The AI service performs:
- OCR text extraction using **EasyOCR**
- Face verification using **DeepFace**
- Risk scoring based on:
  - Face match success
  - OCR quality / extracted text availability

---

## 🏗️ Tech Stack

### Frontend
- React (Vite)
- Axios
- React Router
- MediaPipe FaceMesh + react-webcam (Liveness)

### Backend
- Node.js
- Express
- MongoDB (Mongoose)
- Multer (file uploads)

### AI Service
- Python Flask
- OpenCV
- EasyOCR
- DeepFace

---

## 📂 Project Structure

digital_kyc/
backend/
frontend/
ai-service/


---

## ⚙️ Setup Instructions (Run Locally)

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/sanjanaa06/digital_kyc.git
cd digital_kyc

Backend Setup
cd backend
npm install

Create file: backend/.env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/digital_kyc
AI_SERVICE_URL=http://127.0.0.1:8000
npm run dev

Backend runs on:
http://localhost:5000

AI Service Setup
cd ai-service
python -m venv venv
venv\Scripts\activate
pip install flask flask-cors numpy opencv-python easyocr deepface tf-keras
python app.py

AI service runs on:
http://127.0.0.1:8000

cd frontend
npm install
npm run dev
http://localhost:5173

Demo Flow

User uploads PAN/Aadhaar image

User completes live selfie verification (turn left + right)

System captures selfie automatically

KYC is verified using AI

User receives Verified/Rejected + risk score

Admin dashboard shows stored verification history

Team: Byte Coders

Sanjana A.

Abhishek L R

Prathiksha Shetty

Deeksha K Naik