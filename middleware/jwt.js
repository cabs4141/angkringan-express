import { expressjwt as jwt } from "express-jwt";

function authJwt() {
  const secret = process.env.secret;
  const api = process.env.API_URL;
  return jwt({
    secret,
    algorithms: ["HS256"],
  }).unless({
    path: [
      { url: /\/public\/uploads(.*)/, methods: ["GET", "OPTIONS"] },
      { url: /\/api\/v1\/products(.*)/, methods: ["GET", "OPTIONS"] },
      { url: /\/api\/v1\/categories(.*)/, methods: ["GET", "OPTIONS"] },
      { url: `${api}/users/login`, methods: ["POST"] },
      { url: `${api}/users/register`, methods: ["POST"] },
      { url: `${api}/auth/google`, methods: ["GET", "POST", "OPTIONS"] },
      { url: `${api}/auth/google/callback`, methods: ["GET", "POST"] },
      { url: `https://angkringan-express-production.up.railway.app/api/v1/auth/google`, methods: ["GET", "POST"] },
      { url: `https://angkringan-express-production.up.railway.app/api/v1/auth/google/callback`, methods: ["GET", "POST"] },
    ],
  });
}

export default authJwt;
