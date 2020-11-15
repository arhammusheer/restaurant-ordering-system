const mongoose = require("mongoose");

var Schema = mongoose.Schema;

var BillSchema = new Schema({
	tableCode: String,
	totalAmount: String,
	Order: Array,
	paymentMethod: String,
});

global.BillSchema = global.BillSchema || mongoose.model("Bill", BillSchema);
module.exports = global.BillSchema;
