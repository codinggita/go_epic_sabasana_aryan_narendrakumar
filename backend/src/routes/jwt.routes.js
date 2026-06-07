const express = require("express");

const router = express.Router();

const {
  generateToken,
  verifyToken,
  refreshToken,
  jwtProfile,
  adminRoute,
  userRoute,
  checkAdminRole,
} = require("../controllers/jwt.controller");

const { verifyJWT, verifyAdmin } = require("../middleware/auth.middleware");

router.post("/generate-token", generateToken);

router.post("/verify-token", verifyToken);

router.post("/refresh-token", refreshToken);

router.get("/profile", verifyJWT, jwtProfile);

router.get("/admin", verifyJWT, verifyAdmin, adminRoute);

router.get("/user", verifyJWT, userRoute);

router.get("/check-role/admin", verifyJWT, checkAdminRole);

module.exports = router;
