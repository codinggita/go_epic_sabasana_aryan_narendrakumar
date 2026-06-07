const jwt = require("jsonwebtoken");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/apiError");

const verifyToken = asyncHandler(async (req, res) => {
  const { token } = req.body;

  if (!token) {
    throw new ApiError(400, "Token is required");
  }

  const decoded = jwt.verify(
    token,
    process.env.JWT_SECRET
  );

  res.status(200).json({
    success: true,
    valid: true,
    decoded,
  });
});

const generateToken = asyncHandler(async (req, res) => {
  const { userId, role = "user" } = req.body;

  if (!userId) {
    throw new ApiError(400, "User ID is required");
  }

  const token = jwt.sign(
    {
      userId,
      role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN,
    }
  );

  res.status(200).json({
    success: true,
    token,
  });
});

const refreshToken = asyncHandler(async (req, res) => {
  const { token } = req.body;

  if (!token) {
    throw new ApiError(400, "Token is required");
  }

  const decoded = jwt.verify(
    token,
    process.env.JWT_SECRET,
    {
      ignoreExpiration: true,
    }
  );

  const newToken = jwt.sign(
    {
      userId: decoded.userId,
      role: decoded.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN,
    }
  );

  res.status(200).json({
    success: true,
    token: newToken,
  });
});

const jwtProfile = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
});


const adminRoute = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Admin access granted",
  });
});

const userRoute = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    message: "User access granted",
  });
});

const checkAdminRole = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    isAdmin: req.user.role === "admin",
  });
});

module.exports = {
  verifyToken,
  generateToken,
  refreshToken,
  jwtProfile,
    adminRoute,
    userRoute,
    checkAdminRole,
 
};