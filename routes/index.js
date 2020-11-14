const express = require("express");
const router = express.Router();
const config = require("../config.json");

/* GET home page. */
router.get("/", (req, res, next) => {
	res.render("index", { title: config.name });
});

router.get("/admin", (req, res, next) => {
	res.render("admin", {});
});
module.exports = router;
