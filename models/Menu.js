const mongoose = require("mongoose");

var Schema = mongoose.Schema;

var MenuSchema = new Schema({
	name: { type: String, unique: true },
	description: String,
	price: String,
});

global.MenuSchema = global.MenuSchema || mongoose.model("Menu", MenuSchema);
module.exports = global.MenuSchema;
