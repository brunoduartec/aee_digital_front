const mongoose = require("mongoose");
const { Schema } = mongoose;

const passSchema = new Schema({
  user: {
    type: String,
    require: true,
  },
  pass: {
    type: String,
    require: true,
  },
  groups: [
    {
      type: String,
      require: true,
    },
  ],
  scope_id: {
    type: String,
    require: true,
  },
});

module.exports = {
  model: mongoose.model("pass", passSchema),
  schema: passSchema,
};
