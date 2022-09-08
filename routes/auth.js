const path = require("path");
const { check, body } = require("express-validator");
const express = require("express");
const User = require("../models/user");
const shopController = require("../controllers/shop");

const router = express.Router();
const autController = require("../controllers/auth");

router.get("/login", autController.getLogin);
router.post("/login", autController.postLogin);

router.post("/logout", autController.postLogout);

router.post(
  "/signup",
  [
    check("email")
      .isEmail()
      .withMessage("Please Enter Valid Email")
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject(
              "Email Already Exist Please pick a different one"
            );
          }
        });
      }),

    body(
      "password",
      "Please Enter a oassword with only number and text and atleast 5 character"
    )
      .isLength({ min: 5 })
      .isAlphanumeric(),

    body("confirmPassword").custom((value, { req }) => {
      if (value != req.body.password) throw new Error("Password Must Match!!");
      return true;
    }),
  ],
  autController.postSignup
);
router.get("/signup", autController.getSignup);

router.get("/reset", autController.getReset);
router.post("/reset", autController.postReset);

router.get("/new-password/:token", autController.getNewPassword);
router.post("/new-password", autController.postNewPassword);
module.exports = router;
