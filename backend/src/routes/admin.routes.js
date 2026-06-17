const express = require("express");

const router = express.Router();

const {
  verifyJWT,
  verifyAdmin,
} = require("../middleware/auth.middleware");

const {
  getAdminProblems,
  getAdminTopics,
  getAdminSolutions,
  getAdminDatasets,
  getAdminDashboard,
} = require("../controllers/admin.controller");

router.get(
  "/dashboard",
  verifyJWT,
  verifyAdmin,
  getAdminDashboard
);

router.get(
  "/problems",
  verifyJWT,
  verifyAdmin,
  getAdminProblems
);

router.get(
  "/topics",
  verifyJWT,
  verifyAdmin,
  getAdminTopics
);

router.get(
  "/solutions",
  verifyJWT,
  verifyAdmin,
  getAdminSolutions
);

router.get(
  "/datasets",
  verifyJWT,
  verifyAdmin,
  getAdminDatasets
);

module.exports = router;