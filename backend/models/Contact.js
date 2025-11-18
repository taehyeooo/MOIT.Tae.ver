const mongoose = require("mongoose");

const contactSchema = mongoose.Schema({
  name: {
    type: String,
    maxlength: 50,
  },
  email: {
    type: String,
    trim: true,
    unique: 1,
  },
  message: {
    type: String,
    minlength: 5,
  },
});

const Contact = mongoose.model("Contact", contactSchema);

module.exports = { Contact };