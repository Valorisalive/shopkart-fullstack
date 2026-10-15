const router = require("express").Router();
const c = require("../controllers/order.controller");
const { protect } = require("../middlewares/auth.middleware");
router.use(protect);
router.post("/create-payment-order", c.createPaymentOrder);
router.post("/verify-payment", c.verifyPayment);
router.get("/", c.listOrders);
router.get("/:id", c.getOrder);
module.exports = router;
