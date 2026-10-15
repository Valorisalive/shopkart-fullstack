const router = require("express").Router();
const c = require("../controllers/wishlist.controller");
const { protect } = require("../middlewares/auth.middleware");
router.use(protect);
router.get("/", c.list);
router.post("/:productId", c.add);
router.patch("/:productId", c.toggle);
router.delete("/:productId", c.remove);
module.exports = router;
