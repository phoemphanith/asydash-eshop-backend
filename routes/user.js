const express = require("express");
const router = express.Router();

const {
  getUserList,
  createUser,
  userLogin,
  countAllUser,
  getUserDetail,
  updateUser,
  deleteUser,
  userRegister,
} = require("../controllers/userController");

router.get("/", getUserList);
router.post("/", createUser);
router.post("/login", userLogin);
router.post("/register", userRegister);
router.get("/get/count", countAllUser);
router.get("/:id", getUserDetail);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

module.exports = router;
