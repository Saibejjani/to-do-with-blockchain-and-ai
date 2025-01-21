var express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const app = express();
const { connect: DbConnect } = require("mongoose");

const PORT = process.env.PORT || 8080;

const userRouter = require("./routes/users");
const taskRouter = require("./routes/tasks");
const aiRouter = require("./routes/ai");
DbConnect("mongodb://127.0.0.1:27017/asignment").then((e) =>
  console.log("mongoDB connected"),
);

const {
  checkForAuthenticationCookie,
} = require("./middlewares/authentication");

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5173/", "*"],
    methods: ["GET", "POST", "PUT", "DELETE", "*"],
    credentials: true,
  }),
);

//0xc2B4516535A8dE18f207a672b5e381Cc82851437

app.use("/user", userRouter);
app.use("/tasks", checkForAuthenticationCookie("token"), taskRouter);
app.use("/ai", checkForAuthenticationCookie("token"), aiRouter);
app.listen(PORT, () => {
  console.log("listening on port " + PORT);
});
