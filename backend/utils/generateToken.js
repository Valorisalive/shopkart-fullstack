const jwt = require("jsonwebtoken");
module.exports = function generateToken(customerId) {
  return jwt.sign({ sub: customerId.toString() }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1d"
  });
};
