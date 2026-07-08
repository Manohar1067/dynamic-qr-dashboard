const express = require("express");
const path = require("path");
require("dotenv").config();

const qrRoutes = require("./routes/qrRoutes");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static("public"));
app.use("/qr", express.static(path.join(__dirname, "public/qr")));

app.use("/api", qrRoutes);

app.get("/", (req, res) => {
    res.render("index");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on ${PORT}`);
});