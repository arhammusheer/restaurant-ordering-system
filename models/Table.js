const mongoose = require("mongoose");
const shortid = require("shortid");

shortid.characters(
	"0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_-",
);

var Schema = mongoose.Schema;

var TableSchema = new Schema({
	_id: {
		type: String,
		default: shortid.generate,
	},
	number: String,
	position: String,
	occupancy: String,
});

global.TableSchema = global.TableSchema || mongoose.model("Table", TableSchema);
module.exports = global.TableSchema;
