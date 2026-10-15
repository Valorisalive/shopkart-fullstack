const router = require("express").Router();
const c = require("../controllers/cart.controller");
const { protect } = require("../middlewares/auth.middleware");
router.use(protect);
router.get("/", c.getCart);
router.post("/:productId", c.add);
router.patch("/:productId", c.update);
router.delete("/:productId", c.remove);
module.exports = router;
