const Solution = require("../models/solution.model");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/apiError");

const getAllSolutions = asyncHandler(async (req, res) => {
  const filter = {};
  const sort = req.query.sort || "createdAt";
  const page = Math.max(1, Number(req.query.page) || 1);

  const limit = Math.max(1, Number(req.query.limit) || 10);

  const skip = (page - 1) * limit;

  if (req.query.difficulty) {
    filter.difficulty = req.query.difficulty;
  }

  if (req.query.topic) {
    filter.topic = req.query.topic;
  }

  if (req.query.source) {
    filter.source = req.query.source;
  }

  const solutions = await Solution.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(limit);

  const totalSolutions = await Solution.countDocuments(filter);

  res.status(200).json({
    success: true,
    page,
    limit,
    totalSolutions,
    totalPages: Math.ceil(totalSolutions / limit),
    count: solutions.length,
    data: solutions,
  });
});

const getSolutionsByTopic = asyncHandler(async (req, res) => {
  const solutions = await Solution.find({
    topic: req.params.topic,
  });

  res.status(200).json({
    success: true,
    count: solutions.length,
    data: solutions,
  });
});

const getSolutionsByDifficulty = asyncHandler(async (req, res) => {
  const solutions = await Solution.find({
    difficulty: req.params.difficulty,
  });

  res.status(200).json({
    success: true,
    count: solutions.length,
    data: solutions,
  });
});

const getSolutionsBySource = asyncHandler(async (req, res) => {
  const solutions = await Solution.find({
    source: req.params.source,
  });

  res.status(200).json({
    success: true,
    count: solutions.length,
    data: solutions,
  });
});

const searchSolutions = asyncHandler(async (req, res) => {
  const q = req.query.q;

  if (!q?.trim()) {
    throw new ApiError(400, "Search query is required");
  }

  const solutions = await Solution.find({
    $or: [
      {
        title: {
          $regex: q,
          $options: "i",
        },
      },
      {
        topic: {
          $regex: q,
          $options: "i",
        },
      },
      {
        explanation: {
          $regex: q,
          $options: "i",
        },
      },
    ],
  });

  res.status(200).json({
    success: true,
    query: q,
    count: solutions.length,
    data: solutions,
  });
});

const getRecentSolutions = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);

  const limit = Math.max(1, Number(req.query.limit) || 5);

  const skip = (page - 1) * limit;

  const solutions = await Solution.find()
    .sort("-createdAt")
    .skip(skip)
    .limit(limit);

  res.status(200).json({
    success: true,
    page,
    limit,
    count: solutions.length,
    data: solutions,
  });
});

const getSingleSolution = asyncHandler(async (req, res) => {
  const solution = await Solution.findById(req.params.solutionId);

  if (!solution) {
    throw new ApiError(404, "Solution not found");
  }

  res.status(200).json({
    success: true,
    data: solution,
  });
});

const createSolution = asyncHandler(async (req, res) => {
  const newSolution = await Solution.create(req.body);

  res.status(201).json({
    success: true,
    data: newSolution,
  });
});

const replaceSolution = asyncHandler(async (req, res) => {
  const updatedSolution = await Solution.findByIdAndUpdate(
    req.params.solutionId,
    req.body,
    {
      new: true,
      runValidators: true,
    },
  );

  if (!updatedSolution) {
    throw new ApiError(404, "Solution not found");
  }

  res.status(200).json({
    success: true,
    data: updatedSolution,
  });
});

const updateSolution = asyncHandler(async (req, res) => {
  const updatedSolution = await Solution.findByIdAndUpdate(
    req.params.solutionId,
    req.body,
    {
      new: true,
      runValidators: true,
    },
  );

  if (!updatedSolution) {
    throw new ApiError(404, "Solution not found");
  }

  res.status(200).json({
    success: true,
    data: updatedSolution,
  });
});

const deleteSolution = asyncHandler(async (req, res) => {
  const deletedSolution = await Solution.findByIdAndDelete(
    req.params.solutionId,
  );

  if (!deletedSolution) {
    throw new ApiError(404, "Solution not found");
  }

  res.status(200).json({
    success: true,
    message: "Solution deleted successfully",
  });
});

module.exports = {
  getAllSolutions,
  getSingleSolution,
  createSolution,
  replaceSolution,
  updateSolution,
  deleteSolution,
  getSolutionsByTopic,
  getSolutionsByDifficulty,
  getSolutionsBySource,
  searchSolutions,
  getRecentSolutions,
};
