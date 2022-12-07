const { expressjwt: jwt } = require("express-jwt");

function authJWT() {
  const apiUrl = process.env.APP_URL;
  return jwt({
    secret: process.env.TOKEN_SECRET,
    algorithms: ["HS256"],
    isRevoked: async (req, token) => {
      return !token.payload;
    },
  }).unless({
    path: [
      {
        url: /\/api\/v1\/products(.*)/,
        methods: ["GET", "OPTION"],
      },
      {
        url: /\/api\/v1\/categories(.*)/,
        methods: ["GET", "OPTION"],
      },
      {
        url: /\/public\/uploads(.*)/,
        methods: ["GET", "OPTION"],
      },
      `${apiUrl}/users/login`,
    ],
  });
}

module.exports = authJWT;
