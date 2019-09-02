const express = require("express");
const dbConnect = require("./config/db");

const userRoute = require("./routes/user");
const profileRoute = require("./routes/profile");
const categoryRoute = require("./routes/category");
const productRoute = require("./routes/product");

// app
const app = express();

// database connect
dbConnect();

// middlewares
app.use(express.json({ extended: false }));

// routes middleware
app.use("/api", userRoute);
app.use("/api", profileRoute);
app.use("/api", categoryRoute);
app.use("/api", productRoute);

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server is running on port ${port}`));
