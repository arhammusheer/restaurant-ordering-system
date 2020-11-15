const mongoose = require("mongoose");

var Schema = mongoose.Schema;

var MenuSchema = new Schema({
	_id: mongoose.SchemaTypes.ObjectId,
	name: String,
	price: String,
	image: String,
});

var OrderSchema = new Schema(
	{
		tableCode: String,
		menuItemId: MenuSchema,
		status: String,
		billed: { type: Boolean, default: false },
	},
	{ timestamps: true },
);

global.OrderSchema = global.OrderSchema || mongoose.model("Order", OrderSchema);
module.exports = global.OrderSchema;
