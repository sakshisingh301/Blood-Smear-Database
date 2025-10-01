const express = require("express");
const getUploadController = require("../controller/getUploadController.js");

const router = express.Router();

// Get upload by job_id
router.get("/uploads/:job_id", getUploadController.getUploadImage);
router.get("/uploads/email/:email", getUploadController.getUploadsByEmail);


module.exports = router;