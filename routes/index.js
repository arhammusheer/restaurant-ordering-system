const express = require("express");
const router = express.Router();
const config = require("../config.json");
const TableSchema = require("../models/Table");
const MenuSchema = require("../models/Menu");
const QRcode = require("qrcode");
const OrderSchema = require("../models/Order");
const friendlyTime = require("friendly-time");

/* GET home page. */
router.get("/", (req, res, next) => {
	res.render("index", { name: config.name });
});

//Table routes
router.get("/table", (req, res, next) => {
	TableSchema.exists({ _id: req.query.table_code }, async (err, _table) => {
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
			var _menu = await MenuSchema.find({});
			res.render("menu", {
				menu: _menu,
				path: req.path,
				tableCode: req.query.table_code,
				name: config.name,
			});
		}
	});
});

router.get("/table/myorders", async (req, res, next) => {
	myorders = await OrderSchema.find({
		tableCode: req.query.table_code,
		$or: [
			{ status: "ordered" },
			{ status: "preparing" },
			{ status: "delivered" },
		],
	});
	totalPrice = 0;
	for (order in myorders) {
		totalPrice = parseFloat(myorders[order].menuItemId.price) + totalPrice;
		myorders[order].createdAt = friendlyTime(new Date(`${myorders[order].createdAt}`));
	}
	res.render("myOrders", { orders: myorders, tableCode: req.query.table_code, totalPrice: totalPrice });
});

router.get("/table/:menu_id", (req, res, next) => {
	MenuSchema.findById(req.params.menu_id, (err, _menu) => {
		if (err)
			return res.render("message", {
				message: {
					title: "An error occured",
					description:
						"We could not get your menu item due to a database error. Please try again.",
				},
			});
		return res.render("viewMenuItem", {
			menu: _menu,
			tableCode: req.query.table_code,
			path: req.path,
		});
	});
});

router.get("/table/:menu_id/order", async (req, res, next) => {
	_menuItem = await MenuSchema.findById(req.params.menu_id);
	OrderSchema.create(
		{
			tableCode: req.query.table_code,
			menuItemId: _menuItem,
			status: "ordered",
		},
		(err, _order) => {
			if (err)
				return res.render("message", {
					message: {
						title: "An error occured",
						description:
							"We could not place your order due to a database error. Please try again.",
					},
				});
			return res.render("orderPlaced", {
				message: {
					title: "Your Order Has been placed",
					description: "You will be redirected back to the menu in 1s.",
				},
				tableCode: req.query.table_code,
			});
		},
	);
});

//Admin routes
router.get("/admin", async (req, res, next) => {
	_tables = await TableSchema.find({});
	_orders = await OrderSchema.find({
		$or: [
			{ status: "ordered" },
			{ status: "preparing" },
		],
	});
	_closedOrders = await OrderSchema.find({
		status: "delivered",
	}).sort("-date").limit(10);
	res.render("admin", {
		name: config.name,
		tables: _tables,
		orders: _orders,
		oldOrders: _closedOrders,
	});
});

//Table Admin
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
			`http://${req.headers.host}/table?table_code=${_table._id}`,
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
router.get("/admin/menu", async (req, res, next) => {
	menu = await MenuSchema.find({});
	res.render("viewMenu", { menu: menu, path: req.path });
});

router.get("/admin/menu/new", (req, res, next) => {
	res.render("newMenu");
});

router.post("/admin/menu/new", (req, res, next) => {
	MenuSchema.create(
		{
			name: req.body.name,
			description: req.body.description,
			price: req.body.price,
			image: req.body.image,
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
			res.redirect("/admin");
		},
	);
});

router.get("/admin/menu/:menu_id", (req, res, next) => {
	MenuSchema.findById(req.params.menu_id, (err, _menu) => {
		if (err)
			return res.render("message", {
				message: {
					title: "An error occured",
					description:
						"We could not get your menu item due to a database error. Please try again.",
				},
			});
		return res.render("viewMenuItem", { menu: _menu });
	});
});

router.get("/admin/ordered/:order_id", async (req, res, next) => {
	await OrderSchema.findByIdAndUpdate(req.params.order_id, { status: "ordered" })
	res.redirect("/admin")
})

router.get("/admin/preparing/:order_id", async (req, res, next) => {
	await OrderSchema.findByIdAndUpdate(req.params.order_id, { status: "preparing" });
	res.redirect("/admin");
});

router.get("/admin/delivered/:order_id", async (req, res, next) => {
	await OrderSchema.findByIdAndUpdate(req.params.order_id, { status: "delivered" });
	res.redirect("/admin");
});

module.exports = router;
