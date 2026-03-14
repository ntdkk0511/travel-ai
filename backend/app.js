const express = require("express");
const app = express();

app.use(express.json());

const UserRoutes = require("./routes/UserRoute");
const authRoutes = require("./routes/AuthRoute");
app.use("/auth", authRoutes);
app.use("/users",UserRoutes);

app.listen(3000, () => {
  console.log("server running on 3000");
});

module.exports = app;

