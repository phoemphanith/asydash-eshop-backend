const { User } = require("../model/user");
const bcrypt = require("bcryptjs");
const jsonToken = require("jsonwebtoken");
const superHeros = require("superheroes");

exports.getUserList = async (req, res) => {
  const users = await User.find({}).select("-passwordHash");

  if (!users)
    return res
      .status(500)
      .json({ success: false, message: "Cannot list users" });

  res.json({ success: true, result: users });
};

exports.getUserDetail = async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "The user that give by the ID was not found",
    });
  }

  res.json({
    success: true,
    result: user,
  });
};

exports.countAllUser = async (req, res) => {
  const userCount = await User.countDocuments();

  if (!userCount) {
    return res
      .status(500)
      .json({ success: false, message: "Get count was failed" });
  }

  res.json({ success: true, result: { count: userCount } });
};

exports.createUser = (req, res) => {
  let user = new User({
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    passwordHash: bcrypt.hashSync(req.body.password, 10),
    street: req.body.street,
    apartment: req.body.apartment,
    city: req.body.city,
    zip: req.body.zip,
    country: req.body.country,
    isAdmin: req.body.isAdmin,
  });

  user
    .save()
    .then((item) => res.json({ success: true, result: item }))
    .catch((err) => res.json({ success: false, error: err }));
};

exports.userRegister = async (req, res) => {
  const userExited = await User.findOne({ email: req.body.email });

  if (userExited) {
    return res
      .status(400)
      .json({ success: false, message: "This email already exited!" });
  }

  let user = new User({
    name: superHeros.random(),
    email: req.body.email,
    passwordHash: bcrypt.hashSync(req.body.password, 10),
  });

  user
    .save()
    .then((item) => res.json({ success: true, result: item }))
    .catch((err) => res.status(400).json({ success: false, message: err }));
};

exports.userLogin = async (req, res) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return res
      .status(400)
      .json({ success: false, message: "Email given was not exit" });
  }

  if (bcrypt.compareSync(req.body.password, user.passwordHash)) {
    const secret = process.env.TOKEN_SECRET;
    const token = jsonToken.sign(
      {
        userId: user.id,
        isAdmin: user.isAdmin,
      },
      secret,
      { expiresIn: "1d" }
    );
    res.json({ success: true, result: { email: user.email, token: token } });
  } else {
    res
      .status(400)
      .json({ success: false, message: "Email or password is incorrect" });
  }
};

exports.updateUser = async (req, res) => {
  let newPassword;
  const exitUser = await User.findById(req.params.id);

  if (!exitUser) {
    return res.status(404).json({
      success: false,
      message: "The user that given by ID was not found",
    });
  }

  if (req.body.password) {
    newPassword = bcrypt.hashSync(req.body.password, 10);
  } else {
    newPassword = exitUser.passwordHash;
  }

  User.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      email: req.body.email,
      passwordHash: newPassword,
      street: req.body.street,
      apartment: req.body.apartment,
      city: req.body.city,
      zip: req.body.zip,
      country: req.body.country,
      phone: req.body.phone,
      isAdmin: req.body.isAdmin,
    },
    { new: true }
  )
    .then((user) => {
      if (!user)
        return res.status(404).json({
          success: true,
          message: "The user that given by ID was not found",
        });
      return res.json({ success: true, result: user });
    })
    .catch((err) => res.status(500).json({ success: false, error: err }));
};

exports.deleteUser = (req, res) => {
  User.findByIdAndRemove(req.params.id)
    .then((user) => {
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "The user that given by the ID was not found",
        });
      }
      return res.json({ success: true, result: user });
    })
    .catch((err) =>
      res
        .status(400)
        .json({ success: false, message: "Delete user was failed" })
    );
};
