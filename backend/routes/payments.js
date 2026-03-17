const express = require("express");
const router = express.Router();

const { createPayment, fedaPayCallback } = require("../controllers/fedapayController");

router.post("/fedapay", createPayment);
router.get("/callback", fedaPayCallback);
module.exports = router;