from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import numpy as np
import easyocr
from deepface import DeepFace

app = Flask(__name__)
CORS(app)

reader = easyocr.Reader(['en'])

@app.get("/")
def home():
    return jsonify({"message": "AI service running"})

@app.post("/verify")
def verify():
    if "document" not in request.files or "selfie" not in request.files:
        return jsonify({"error": "document and selfie required"}), 400

    doc_file = request.files["document"]
    selfie_file = request.files["selfie"]

    doc_bytes = np.frombuffer(doc_file.read(), np.uint8)
    selfie_bytes = np.frombuffer(selfie_file.read(), np.uint8)

    doc_img = cv2.imdecode(doc_bytes, cv2.IMREAD_COLOR)
    selfie_img = cv2.imdecode(selfie_bytes, cv2.IMREAD_COLOR)

    # OCR
    ocr_results = reader.readtext(doc_img)
    extracted_text = " ".join([t[1] for t in ocr_results])

    # Face match
    try:
        result = DeepFace.verify(selfie_img, doc_img, enforce_detection=False)
        verified = bool(result.get("verified", False))
        distance = float(result.get("distance", 1.0))
    except Exception:
        verified = False
        distance = 1.0

    # Risk score (simple)
    risk = 0
    if not verified:
        risk += 60
    if len(extracted_text.strip()) < 10:
        risk += 20

    status = "Verified" if risk < 50 else "Rejected"

    return jsonify({
        "status": status,
        "risk_score": risk,
        "ocr_text": extracted_text[:500],
        "face_verified": verified,
        "face_distance": distance
    })

if __name__ == "__main__":
    app.run(port=8000, debug=True)
