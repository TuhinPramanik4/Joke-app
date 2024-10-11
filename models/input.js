const { Schema, model } = require("mongoose");

const stringSchema = new Schema({
    content: {
        type: String,
        required: true,
    }
});
module.exports = model("StringModel", stringSchema);
