const express = require("express");
const router = express.Router();
const upload = require("../middleware/multer"); 
const { uploadDocument } = require("../controllers/uploadController");
const { createAcademic, getAcademic, updateAcademic } = require("../controllers/AcademicController");

// 🔹 Upload Academic Documents
router.post("/upload-document", upload.single("document"), uploadDocument);

// 🔹 Other Academic Routes
router.post("/add-academic-details", createAcademic);
router.get("/get-academic-details/:userid", getAcademic);
router.put("/update-academic/:userid", updateAcademic); // Fixed from update() to put()

module.exports = router;
