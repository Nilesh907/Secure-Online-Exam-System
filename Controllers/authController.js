const User = require("../models/User");
const History = require("../models/History");
const bcrypt = require("bcrypt");

// ================= SHOW LOGIN =================

exports.showLoginForm = (req, res) => {
    res.render("auth/login");
};

// ================= SHOW REGISTER =================

exports.showRegisterForm = (req, res) => {
    res.render("auth/register");
};

// ================= REGISTER =================

exports.register = async (req, res) => {

    try {

        const name = req.body.name.trim();

        // STRICT EMAIL MATCH
        const email = req.body.email.trim();

        const password = req.body.password;

        const role = req.body.role;

        // PASSWORD VALIDATION
        const passwordRegex =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

        if (!passwordRegex.test(password)) {

            return res.send(
                "Password must contain minimum 8 characters, uppercase, lowercase, number and special symbol"
            );
        }

        // CHECK EXISTING USER
        const existingUser = await User.findOne({ email });

        if (existingUser) {

            return res.send("User already exists");
        }

        // HASH PASSWORD
        const hashedPassword =
            await bcrypt.hash(password, 10);

        // CREATE USER
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            role
        });

        await newUser.save();

        // HISTORY
        await History.create({
            user: newUser._id,
            action: "Registered"
        });

        res.redirect("/auth/login");

    } catch (err) {

        console.log(err);

        res.send("Register error");
    }
};

// ================= LOGIN =================

exports.login = async (req, res) => {

    try {

        // STRICT EMAIL MATCH
        const email = req.body.email.trim();

        const password = req.body.password;

        // FIND USER
        const user = await User.findOne({ email });

        if (!user) {

            return res.send("Invalid email");
        }

        // ACCOUNT LOCK CHECK
        if (
            user.lockUntil &&
            user.lockUntil > Date.now()
        ) {

            return res.send(
                "Account locked. Try again later."
            );
        }

        // PASSWORD CHECK
        const isMatch =
            await bcrypt.compare(
                password,
                user.password
            );

        if (!isMatch) {

            user.loginAttempts += 1;

            // LOCK ACCOUNT
            if (user.loginAttempts >= 5) {

                user.lockUntil =
                    Date.now() +
                    10 * 60 * 1000;

                user.loginAttempts = 0;

                await user.save();

                return res.send(
                    "Account locked for 10 minutes"
                );
            }

            await user.save();

            return res.send(
                "Invalid password"
            );
        }

        // RESET LOGIN ATTEMPTS
        user.loginAttempts = 0;

        user.lockUntil = null;

        user.lastLogin = new Date();

        await user.save();

        // SESSION SETUP
        req.session.userId = user._id;

        req.session.role = user.role;

        req.session.name = user.name;

        // LOGIN HISTORY
        const history =
            await History.create({

                user: user._id,

                device:
                    req.headers[
                        "user-agent"
                    ]
            });

        req.session.historyId =
            history._id;

        // SAVE SESSION
        req.session.save(() => {

            console.log(
                "SESSION SAVED:",
                req.session
            );

            // ROLE REDIRECTS
            if (
                user.role === "Teacher"
            ) {

                return res.redirect(
                    "/papers"
                );
            }

            if (
                user.role === "Reviewer"
            ) {

                return res.redirect(
                    "/reviewers"
                );
            }

            if (
                user.role === "Student"
            ) {

                return res.redirect(
                    "/papers"
                );
            }

            if (
                user.role === "Admin"
            ) {

                return res.redirect(
                    "/papers"
                );
            }

            res.redirect("/");
        });

    } catch (err) {

        console.log(err);

        res.send("Login error");
    }
};

// ================= LOGOUT =================

exports.logout = async (req, res) => {

    try {

        if (!req.session.userId) {

            return res.send(
                "Not logged in"
            );
        }

        // UPDATE LOGOUT TIME
        await History.findByIdAndUpdate(

            req.session.historyId,

            {
                logoutTime:
                    new Date()
            }
        );

        // DESTROY SESSION
        req.session.destroy(err => {

            if (err) {

                console.log(err);

                return res.send(
                    "Logout failed"
                );
            }

            res.redirect(
                "/auth/login"
            );
        });

    } catch (err) {

        console.log(err);

        res.send("Logout error");
    }
};

// ================= HISTORY =================

exports.getHistory = async (req, res) => {

    try {

        if (!req.session.userId) {

            return res.send(
                "Please login first"
            );
        }

        const history =
            await History.find({

                user:
                    req.session.userId
            })

            .sort({
                loginTime: -1
            })

            .populate("user");

        res.render(
            "history/index",
            { history }
        );

    } catch (err) {

        console.log(err);

        res.send("History error");
    }
};

