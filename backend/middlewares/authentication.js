const { validateToken } = require("../services/authentication");

function checkForAuthenticationCookie(cookieName) {
  return (req, res, next) => {
    const tokenCookieValue = req.cookies[cookieName];
    if (!tokenCookieValue) {
      return res
        .status(401)
        .clearCookie("token")
        .json({ message: "please provide token" });
    }
    try {
      const userPayload = validateToken(tokenCookieValue);
      req.user = userPayload;
      return next();
    } catch (error) {
      return res
        .status(401)
        .clearCookie()
        .json({ message: "please provide token" });
    }
  };
}

module.exports = {
  checkForAuthenticationCookie,
};
