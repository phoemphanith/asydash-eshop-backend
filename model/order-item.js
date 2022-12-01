const mongoose = require("mongoose");

const orderItemSchema = mongoose.Schema({
  quantity: {
    type: Number,
    required: true,
  },
  product: {
    type: mongoose.Types.ObjectId,
    ref: "product",
    required: true,
  },
});

exports.OrderItem = mongoose.model("orderItem", orderItemSchema);
