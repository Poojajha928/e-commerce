const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { JWT_KEY } = require("../../config/authenticationConfig");

exports.hash = async (password) => {
  const salt = 10;
  return await bcrypt.hash(password, salt);
};

exports.generateSessionToken = async (
  reqBodyPassword,
  userPasswordToken,
  tokenQuery
) => {
  try {
    tokenQuery = tokenQuery || {};
    let result = await bcrypt.compare(reqBodyPassword, userPasswordToken);
    if (result) {
      const token = jwt.sign(tokenQuery, JWT_KEY, {
        expiresIn: "1h",
      });
      return token;
    } else {
      console.log("wrong Password");
      return null;
    }
  } catch (error) {
    console.log(error);
    return null;
  }
};

exports.checkAuth = (req, res, next) => {
  try {
    const token =
      req.query.token ||
      req.body.token ||
      req.headers["x-access-token"] ||
      req.flash("token")[0];
    if (token) {
      req.flash("token", token);
      const decoded = jwt.verify(token, JWT_KEY);
      req.userData = decoded;
      next();
    } else {
      return res.json({ message: "Please login" });
    }
  } catch (error) {
    res.status(401);
    console.log(error);
    res.json({ message: "Invalid User!" });
  }
};
