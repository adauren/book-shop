const express = require("express");
const dbConnect = require("./config/db");

const userRoute = require("./routes/user");

// app
const app = express();

// database connect
dbConnect();

// middlewares
app.use(express.json({ extended: false }));

// routes middleware
app.use("/api", userRoute);

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server is running on port ${port}`));
