function errorHandler(err, req, res, next) {
  if (err.name == "UnauthorizedError") {
    return res.status(401).json({ success: false, message: "Unauthorize" });
  }

  if (err.name == "ValidationError") {
    return res
      .status(401)
      .json({ success: false, message: "Data input invalid" });
  }

  next(err);
}

module.exports = errorHandler;
