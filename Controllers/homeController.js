const History = require("../models/History");

exports.home = async (req, res) => {
    try {
        const loggedIn = !!req.session.userId;
        const role = req.session.role || null;

        // Optional: fetch last 5 history items for logged-in user
        let recentHistory = [];
        if (loggedIn) {
            recentHistory = await History.find({ user: req.session.userId })
                                         .sort({ timestamp: -1 })
                                         .limit(5);
        }

        res.render("index", { loggedIn, role, recentHistory });
    } catch (err) {
        console.log("Error in homeController:", err);
        res.send("Something went wrong");
    }
};