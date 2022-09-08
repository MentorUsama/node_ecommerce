const User = require("../models/user");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const sendGridTransport = require("nodemailer-sendgrid-transport");
const crypto = require("crypto");
const { validationResult } = require("express-validator");

const transporter = nodemailer.createTransport(
  sendGridTransport({
    auth: {
      api_key: process.env.TOKEN,
    },
  })
);

exports.getLogin = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) message = message[0];
  else message = undefined;
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    errorMessage: message,
    oldInput: {
      email: "",
      password: "",
    },
    validationErrors: [],
  });
};
exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("auth/login", {
      path: "/login",
      pageTitle: "login",
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email: email,
        password: password,
      },
      validationErrors: errors.array(),
    });
  }

  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        return res.status(422).render("auth/login", {
          path: "/login",
          pageTitle: "login",
          errorMessage: "Invalid email or password.",
          oldInput: {
            email: email,
            password: password,
          },
          validationErrors: errors.array(),
        });
      }
      bcrypt
        .compare(password, user.password)
        .then((doMatch) => {
          if (doMatch) {
            req.session.isLoggedIn = true;
            req.session.user = user;
            return req.session.save(() => {
              return res.redirect("/");
            });
          }
          return res.status(422).render("auth/login", {
            path: "/login",
            pageTitle: "login",
            errorMessage: "Invalid email or password.",
            oldInput: {
              email: email,
              password: password,
            },
            validationErrors: errors.array(),
          });
        })
        .catch((err) => {
          console.log(err);
        });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect("/");
  });
};

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const errors = validationResult(req);
  console.log(errors.array());
  if (!errors.isEmpty()) {
    return res.status(422).render("auth/signup", {
      path: "/signup",
      pageTitle: "Signup",
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email: email,
        password: password,
        confirmPassword: req.body.confirmPassword,
      },
      validationErrors: errors.array(),
    });
  }
  bcrypt
    .hash(password, 12)
    .then((hashedPassword) => {
      const user = new User({
        email: email,
        password: hashedPassword,
        cart: { items: [] },
      });
      return user.save();
    })
    .then((result) => {
      res.redirect("/login");
      return transporter
        .sendMail({
          to: email,
          from: "muhammadusamafarhat100@gmail.com",
          subject: "Singup Succeeded !",
          html: "<h1>You have successfully signed up</h1>",
        })
        .then((result) => {
          console.log(result);
        })
        .catch((err) => {
          console.log(err);
        });
    });
};
exports.getSignup = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) message = message[0];
  else message = undefined;
  res.render("auth/signup", {
    path: "/signup",
    pageTitle: "Signup",
    errorMessage: message,
    oldInput: { email: "", password: "", confirmPassword: "" },
    validationErrors: [],
  });
};

exports.getReset = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) message = message[0];
  else message = undefined;
  res.render("auth/reset", {
    path: "/reset",
    pageTitle: "Reset Password",
    errorMessage: message,
  });
};
exports.postReset = (req, res, next) => {
  const email = req.body.email;
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      return res.redirect("/reset");
    }
    const token = buffer.toString("hex");
    User.findOne({ email: req.body.email })
      .then((user) => {
        if (!user) {
          req.flash("error", "No Account Found With This Email");
          return req.redirect("/reset");
        }
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000;
        return user.save();
      })
      .then((result) => {
        res.redirect("/");
        return transporter.sendMail({
          to: email,
          from: "muhammadusamafarhat100@gmail.com",
          subject: "Reset Password !",
          html: `
        <p>You requested password reset</p>
        <p>Click this <a href='http://localhost:3000/new-password/${token}'>link</a> to reset </p>
        `,
        });
      })
      .catch((err) => {
        console.log(err);
      });
  });
};

exports.getNewPassword = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) message = message[0];
  else message = undefined;

  const token = req.params.token;
  User.findOne({
    resetToken: token,
    resetTokenExpiration: { $gt: Date.now() },
  })
    .then((user) => {
      res.render("auth/new-password", {
        path: "/new-password",
        pageTitle: "new-password",
        errorMessage: message,
        userId: user._id.toString(),
        passwordToken: token,
      });
    })
    .catch((err) => {
      req.flash("error", "Token has been expired");
      res.redirect("/reset");
    });
};

exports.postNewPassword = (req, res, next) => {
  const password = req.body.password;
  const userId = req.body.userId;
  const passwordToken = req.body.passwordToken;
  let resetUser;

  User.findOne({
    resetToken: passwordToken,
    resetTokenExpiration: { $gt: Date.now() },
    _id: userId,
  })
    .then((user) => {
      resetUser = user;
      return bcrypt.hash(password, 12);
    })
    .then((hashedPAssword) => {
      resetUser.password = hashedPAssword;
      resetUser.resetToken = undefined;
      resetUser.resetTokenExpiration = undefined;
      return resetUser.save();
    })
    .then((result) => {
      return res.redirect("/");
    })
    .catch((err) => {
      return res.redirect("/");
    });
};
