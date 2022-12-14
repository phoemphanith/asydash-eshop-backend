const { Order } = require("../model/order");
const { OrderItem } = require("../model/order-item");

exports.getOrderList = async (req, res) => {
  const orders = await Order.find({})
    .populate("user", "name")
    .sort({ dateOrdered: -1 });

  if (!orders) {
    return res
      .status(500)
      .json({ success: false, message: "Get order list failed" });
  }

  res.json({ success: true, result: orders });
};

exports.countTotalSale = async (req, res) => {
  const totalSales = await Order.aggregate([
    { $group: { _id: null, totalSales: { $sum: "$totalPrice" } } },
  ]);

  if (!totalSales) {
    return res
      .status(400)
      .json({ success: false, message: "Get total sales is failed" });
  }

  if (totalSales.length <= 0) {
    return res.json({ success: true, result: { totalSales: 0 } });
  }

  res.json({
    success: true,
    result: { totalSales: totalSales.pop().totalSales },
  });
};

exports.countAllOrder = async (req, res) => {
  const orderCount = await Order.countDocuments();

  if (!orderCount) {
    return res
      .status(400)
      .json({ success: false, message: "Get count order is failed" });
  }

  res.json({ success: true, result: { count: orderCount } });
};

exports.getUserOrderList = async (req, res) => {
  let queryOrder = {
    user: req.params.userId,
  };

  if (req.query.orderId) {
    queryOrder = { ...queryOrder, _id: req.query.orderId };
  }

  if (req.query.status && req.query.status != "-1") {
    queryOrder = { ...queryOrder, status: req.query.status };
  }

  const orders = await Order.find(queryOrder).sort({
    dateOrdered: -1,
  });

  if (!orders) {
    return res
      .status(400)
      .json({ success: false, message: "Get user oder list is failed" });
  }

  res.json({ success: true, result: orders });
};

exports.countUserOrder = async (req, res) => {
  const countPending = await Order.countDocuments({
    user: req.params.userId,
    status: 0,
  });
  const countConfirm = await Order.countDocuments({
    user: req.params.userId,
    status: 1,
  });
  const countShipping = await Order.countDocuments({
    user: req.params.userId,
    status: 2,
  });
  const countComplete = await Order.countDocuments({
    user: req.params.userId,
    status: 3,
  });

  res.json({
    success: true,
    result: {
      countPending: countPending,
      countConfirm: countConfirm,
      countShipping: countShipping,
      countComplete: countComplete,
    },
  });
};

exports.getOrderDetail = async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate({
      path: "orderItems",
      populate: { path: "product", populate: { path: "category" } },
    })
    .populate("user", "name");

  if (!order) {
    return res.status(404).json({
      success: false,
      message: "The order that given by the ID was not found",
    });
  }

  res.json({ success: true, result: order });
};

exports.createOrder = async (req, res) => {
  const orderItemIds = Promise.all(
    req.body.orderItems.map(async (item) => {
      let newItem = new OrderItem({
        quantity: item.quantity,
        product: item.product,
      });
      newItem = await newItem.save();
      return newItem._id;
    })
  );

  const totalPrice = Promise.all(
    (await orderItemIds).map(async (itemId) => {
      const orderItem = await OrderItem.findById(itemId).populate(
        "product",
        "price"
      );
      const totalPrice = orderItem.product.price * orderItem.quantity;
      return totalPrice;
    })
  );

  let order = new Order({
    orderItems: await orderItemIds,
    shippingAddress1: req.body.shippingAddress1,
    shippingAddress2: req.body.shippingAddress2,
    city: req.body.city,
    zip: req.body.zip,
    country: req.body.country,
    phone: req.body.phone,
    totalPrice: (await totalPrice).reduce((a, b) => a + b, 0),
    user: req.body.user,
  });

  order = await order.save();

  if (!order) {
    return res
      .status(400)
      .json({ success: false, message: "Create new order is failed" });
  }

  res.json({ success: true, result: order });
};

exports.updateOrderStatus = async (req, res) => {
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { new: true }
  );

  if (!order) {
    return res.status(404).json({
      success: false,
      message: "The order that given by ID was not found",
    });
  }

  res.json({ success: true, result: order });
};

exports.deleteOrder = (req, res) => {
  Order.findByIdAndRemove(req.params.id)
    .then(async (order) => {
      if (!order) {
        return res.status(404).json({
          success: false,
          message: "The order that given by the ID was not found",
        });
      }
      await order.orderItems.map(async (item) => {
        await OrderItem.findByIdAndRemove(item._id);
      });
      res.json({ success: true, message: "The order delete success" });
    })
    .catch((err) => res.status(500).json({ success: false, error: err }));
};
