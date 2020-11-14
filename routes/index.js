const express = require("express");
const router = express.Router();
const config = require("../config.json");
const TableSchema = require("../models/Table");
const MenuSchema = require("../models/Menu");
const QRcode = require("qrcode");

/* GET home page. */
router.get("/", (req, res, next) => {
	res.render("index", { name: config.name });
});

//Admin routes
router.get("/admin", async (req, res, next) => {
	_tables = await TableSchema.find({});
	res.render("admin", { name: config.name, tables: _tables });
});

//Table Admin
router.get("/table", (req, res, next) => {
	TableSchema.exists({ _id: req.query.table_code }, (err, _table) => {
		if (err) res.redirect("/");
		if (!_table) {
			return res.render("message", {
				message: {
					title: "Table Code does not exist",
					description:
						"The table code you entered is either expired or incorrect.",
				},
			});
		}
		if (_table) {
			res.render("menu");
		}
	});
});

router.get("/admin/table/new", (req, res, next) => {
	res.render("newTable");
});

router.post("/admin/table/new", (req, res, next) => {
	TableSchema.create(
		{
			position: req.body.position,
			occupancy: req.body.occupancy,
			number: req.body.number,
		},
		(err, _table) => {
			if (err) {
				return res.render("message", {
					message: {
						title: "An error occured",
						description:
							"We could not add your table due to a database error. Please try again.",
					},
				});
			}
			return res.redirect("/admin");
		},
	);
});

router.get("/admin/table/:table_code", (req, res, next) => {
	TableSchema.findById(req.params.table_code, (err, _table) => {
		if (err)
			return res.render("message", {
				message: {
					title: "An error occured",
					description:
						"We could not find your table due to a database error. Please try again.",
				},
			});
		if (!_table) {
			return res.render("message", {
				message: {
					title: "Table does not exist",
					description: "The table code you have requested does not exist.",
				},
			});
		}
		var qrCode = undefined;
		QRcode.toDataURL(
			`http://${req.headers.host}/table/${_table._id}`,
			{ type: "terminal" },
			(err, url) => {
				if (err) console.log(err);
				return res.render("viewTable", {
					name: config.name,
					table: _table,
					qrcode: url,
					deleteURL: `${req.url}/delete`,
				});
			},
		);
	});
});

router.get("/admin/table/:table_code/delete", (req, res, next) => {
	TableSchema.findByIdAndDelete(req.params.table_code, (err, docs) => {
		if (err)
			return res.render("message", {
				message: {
					title: "An error occured",
					description:
						"We could not delete your table due to a database error. Please try again.",
				},
			});
		return res.render("message", {
			message: {
				title: "Table Deleted",
				description: `Table code ${req.params.table_code} has successfully been deleted`,
			},
		});
	});
});

//Menu Admin
router.get("/admin/menu/new", (req, res, next) => {
	res.render("newMenu");
})

router.post("/admin/menu/new", (req, res, next) => {
	MenuSchema.create(
		{
			name: req.body.name,
			description: req.body.description,
			price: req.body.price,
		},
		(err, _menu) => {
			if (err) {
				if (err.code === 11000) {
					return res.render("message", {
						message: {
							title: "Already Exists",
							description:
								"We could not add your menu item as the item with the same name already exists.",
						},
					});
				}
				return res.render("message", {
					message: {
						title: "An error occured",
						description:
							"We could not add your menu item due to a database error. Please try again.",
					},
				});
			}
			res.redirect("/admin")
		},
	);
});

module.exports = router;
