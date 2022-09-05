const User = require('../models/user')

exports.getLogin = (req, res, next) => {
  const isLoggedIn = req.get("Cookie").split(";")[0].trim().split("=")[1];
  console.log(isLoggedIn);
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    isAuthenticated: req.isLoggedIn,
  });
};

exports.postLogin = (req, res, next) => {
  User.findById("6315f78471565b078ca09418").then((user) => {
    req.session.isLoggedIn = true;
    req.session.user = user;
    req.session.save(()=>{
      res.redirect("/");
    })
  });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect("/");
  });
};
