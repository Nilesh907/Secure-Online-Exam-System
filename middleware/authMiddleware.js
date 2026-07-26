exports.isLoggedIn = (req, res, next) => {
    if (!req.session.userId) {
        return res.redirect("/auth/login");
    }
    return next();
};


exports.checkRole = (allowedRoles) => {
    return (req, res, next) => {

        console.log("===== ROLE DEBUG =====");
        console.log("Session UserId:", req.session.userId);
        console.log("Session Role:", req.session.role);
        console.log("Allowed Roles:", allowedRoles);
        console.log("======================");

        if (!req.session.userId) {
            return res.send("Please login first");
        }

        if (req.session.role === "Admin") {
            return next();
        }

        if (!allowedRoles.includes(req.session.role)) {
            return res.status(403).send("Access Denied");
        }

        return next();
    };
};



