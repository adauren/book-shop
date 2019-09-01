const express = require("express");
const dbConnect = require("./config/db");

// app
const app = express();

// database connect
dbConnect();

// routes
app.get("/", (req, res) => {
  res.send("API is running");
});

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server is running on port ${port}`));
