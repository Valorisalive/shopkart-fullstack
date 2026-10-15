const router = require("express").Router();
const c = require("../controllers/product.controller");
router.post("/", c.createProduct);
router.get("/", c.listProducts);
router.get("/:id", c.getProduct);
module.exports = router;
