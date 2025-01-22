var express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const app = express();
const { connect: DbConnect } = require("mongoose");

const PORT = process.env.PORT || 8080;
const MONGO_DB_CONNECTION_URL = process.env.MONGO_DB_CONNECTION_URL;

const userRouter = require("./routes/users");
const taskRouter = require("./routes/tasks");
const aiRouter = require("./routes/ai");
DbConnect(MONGO_DB_CONNECTION_URL).then((e) =>
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
    origin: ["https://assignment-frontend-956747381510.asia-south1.run.app"],
    methods: ["GET", "POST", "PUT", "DELETE"],
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
