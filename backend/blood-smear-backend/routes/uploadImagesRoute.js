const express = require("express");

const multer = require("multer");

const uploadController = require("../controller/uploadController.js");

const router = express.Router();
const upload = multer();

router.post("/upload/admin", upload.any(), uploadController.uploadImage);
module.exports = router;
