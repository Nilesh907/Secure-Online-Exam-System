const express = require("express");
const app = express();
const port = process.env.PORT || 8080;

const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const session = require("express-session");
const ejsMate = require("ejs-mate");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const compression = require("compression");

const MongoStore = require("connect-mongo").default;

const deviceFingerprint = require("./middleware/fingerprint");

// ================= DB =================

mongoose.connect(process.env.MONGO_URL, {
  maxPoolSize: 50,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000
})
  .then(() => console.log("connection successful"))
  .catch(err => console.log(err));

// ================= MIDDLEWARE =================

app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: "1mb" }));

// Device fingerprint middleware
app.use(deviceFingerprint);

// ================= SESSION =================

app.use(session({
  name: "paper.sid",
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,

  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URL,
    ttl: 60 * 60
  }),

  cookie: {
    maxAge: 1000 * 60 * 60,   // 1 Hour
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict"
}
}));



app.use((req, res, next) => {

    console.log("\n========== SESSION DEBUG ==========");

    console.log("Session ID :", req.sessionID);

    console.log("Session :", req.session);

    console.log("===================================\n");

    next();

});

// ================= SECURITY =================

app.use(helmet({
  contentSecurityPolicy: false
}));

// ================= RATE LIMIT (GLOBAL SAFETY LAYER) =================

app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500, // global safe limit
  standardHeaders: true,
  legacyHeaders: false
}));

// ================= VIEW LOCALS =================

app.use((req, res, next) => {
  res.locals.currentUser = req.session.userId;
  res.locals.currentRole = req.session.role;
  res.locals.currentName = req.session.name;
  next();
});

// ================= VIEW ENGINE =================

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ================= STATIC =================

app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static("uploads"));
app.use("/temp", express.static("temp"));

app.use(compression());

// ================= ROUTES =================

const paperRoutes = require("./routes/paperRoutes");
const userRoutes = require("./routes/userRoutes");
const teacherRoutes = require("./routes/teacherRoutes");
const reviewerRoutes = require("./routes/reviewerRoutes");
const studentRoutes = require("./routes/studentRoutes");
const authRoutes = require("./routes/authRoutes");
const homeRoutes = require("./routes/homeRoutes");
const examRoutes = require("./routes/examRoutes");
const adminRoutes = require("./routes/adminRoutes");

app.use(methodOverride("_method"));

app.use("/auth", authRoutes);
app.use("/", homeRoutes);
app.use("/exam", examRoutes);
app.use("/admin", adminRoutes);

app.use("/papers", paperRoutes);
app.use("/users", userRoutes);
app.use("/teachers", teacherRoutes);
app.use("/reviewers", reviewerRoutes);
app.use("/students", studentRoutes);

// ================= TEST =================

app.get("/test-device", (req, res) => {
  res.send({
    deviceId: req.deviceId
  });
});

// ================= BLOCK STORAGE =================

app.use("/storage", (req, res) => {
  res.status(403).send("Forbidden");
});

// ================= SERVER =================

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});





























































































































































