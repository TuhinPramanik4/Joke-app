const { Schema, model } = require("mongoose");
const creatorSchema = new Schema({
    name: String,
    youtubeLink: String,
    pictureUrl: String,
    votes: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
  });
  
  const Creator = model('Creator', creatorSchema);
  module.exports = model("Creator",creatorSchema );  