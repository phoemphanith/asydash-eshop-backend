const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const mongoose = require("mongoose");
const productRoutes = require("./routes/product");
const categoryRoutes = require("./routes/category");
const userRoutes = require("./routes/user");
const orderRoutes = require("./routes/order");
const authJWT = require("./helper/jwt");
const errorHandler = require("./helper/error-handler");
const cors = require("cors");
const app = express();

require("dotenv/config");
const apiUrl = process.env.APP_URL;

app.use(cors());
app.options("*", cors());

//Middleware
app.use(bodyParser.json());
app.use("/public/uploads", express.static(__dirname + "/public/uploads"));
app.use(morgan("tiny"));
app.use(authJWT());
app.use(errorHandler);

app.get(apiUrl, (req, res) => {
  res.send("hello api");
});

app.use(`${apiUrl}/products`, productRoutes);
app.use(`${apiUrl}/categories`, categoryRoutes);
app.use(`${apiUrl}/users`, userRoutes);
app.use(`${apiUrl}/orders`, orderRoutes);

//Database Connection
mongoose
  .connect(process.env.DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: "eshop-database",
  })
  .then(() => console.log("DB connect successfully"))
  .catch((err) => console.log(err));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () =>
  console.log(`Server is running on http://localhost:3000${apiUrl}`)
);
