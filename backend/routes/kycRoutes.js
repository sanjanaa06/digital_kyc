const express = require("express");
const multer = require("multer");
const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");

const KycRequest = require("../models/KycRequest");

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + "-" + file.originalname);
  },
});

const upload = multer({ storage });

router.post(
  "/submit",
  upload.fields([
    { name: "document", maxCount: 1 },
    { name: "selfie", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { fullName, email, documentType } = req.body;

      const documentFile = req.files?.document?.[0];
      const selfieFile = req.files?.selfie?.[0];

      if (!fullName || !email) {
        return res.status(400).json({ error: "fullName and email required" });
      }

      if (!documentFile || !selfieFile) {
        return res.status(400).json({ error: "document and selfie required" });
      }

      // 1) save request
      const newReq = await KycRequest.create({
        fullName,
        email,
        documentType: documentType || "PAN",
        documentImagePath: documentFile.path,
        selfieImagePath: selfieFile.path,
        status: "Pending",
      });

      // 2) call AI service
      const form = new FormData();
      form.append("document", fs.createReadStream(documentFile.path));
      form.append("selfie", fs.createReadStream(selfieFile.path));

      const aiRes = await axios.post(
        `${process.env.AI_SERVICE_URL}/verify`,
        form,
        { headers: form.getHeaders() }
      );

      const ai = aiRes.data;

      // 3) update with AI result
      newReq.aiResult = {
        riskScore: ai.risk_score,
        ocrText: ai.ocr_text,
        faceVerified: ai.face_verified,
        faceDistance: ai.face_distance,
      };

      newReq.status = ai.status === "Verified" ? "Verified" : "Rejected";
      await newReq.save();

      res.json({ message: "KYC processed", kyc: newReq });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  }
);

// Admin list
router.get("/all", async (req, res) => {
  try {
    const list = await KycRequest.find().sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
