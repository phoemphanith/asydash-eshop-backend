const express = require("express");
const { Order } = require("../model/order");
const router = express.Router();
const {
  getOrderList,
  createOrder,
  countAllOrder,
  countTotalSale,
  getUserOrderList,
  updateOrderStatus,
  deleteOrder,
  getOrderDetail,
  countUserOrder,
} = require("../controllers/orderController");

router.get("/", getOrderList);
router.post("/", createOrder);
router.get("/get/totalsales", countTotalSale);
router.get("/get/count", countAllOrder);
router.get("/get/userorders/:userId", getUserOrderList);
router.get("/get/userorders/:userId/count", countUserOrder);
router.get("/:id", getOrderDetail);
router.put("/:id", updateOrderStatus);
router.delete("/:id", deleteOrder);

module.exports = router;
