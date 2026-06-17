const Problem = require("../models/problem.model");
const asyncHandler = require("../utils/asyncHandler");
const asynHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/apiError");

const getAllProblems = asyncHandler(async (req, res) => {
  const filter = {};
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.max(1, Number(req.query.limit) || 10);
  const skip = (page - 1) * limit;
  const sort = req.query.sort || "createdAt";

  if (req.query.difficulty) {
    filter.difficulty = req.query.difficulty;
  }

  if (req.query.topic) {
    filter.topic = req.query.topic;
  }

  if (req.query.source) {
    filter.source = req.query.source;
  }

  if (req.query.keyword) {
    filter.$or = [
      {
        title: {
          $regex: req.query.keyword,
          $options: "i",
        },
      },
      {
        instruction: {
          $regex: req.query.keyword,
          $options: "i",
        },
      },
    ];
  }

  const problems = await Problem.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(limit);

  const totalProblems = await Problem.countDocuments(filter);

  res.status(200).json({
    success: true,
    page,
    limit,
    sort,
    totalProblems,
    totalPages: Math.ceil(totalProblems / limit),
    count: problems.length,
    data: problems,
  });
});

const getSingleProblem = asynHandler(async (req, res) => {
  const problem = await Problem.findByIdAndUpdate(
    req.params.problemId,
    { $inc: { views: 1 } },
    { new: true }
  );

  if (!problem) {
    throw new ApiError(404, "Problem not found");
  }

  res.status(200).json({
    success: true,
    data: problem,
  });
});

const createProblem = asynHandler(async (req, res) => {
  const newProblem = await Problem.create(req.body);

  res.status(201).json({
    success: true,
    data: newProblem,
  });
});

const replaceProblem = asynHandler(async (req, res) => {
  const updatedProblem = await Problem.findByIdAndUpdate(
    req.params.problemId,
    req.body,
    {
      new: true,
      runValidators: true,
    },
  );

  if (!updatedProblem) {
    throw new ApiError(404, "Problem not found");
  }

  res.status(200).json({
    success: true,
    data: updatedProblem,
  });
});

const updateProblem = asyncHandler(async (req, res) => {
  const updatedProblem = await Problem.findByIdAndUpdate(
    req.params.problemId,
    req.body,
    {
      new: true,
      runValidators: true,
    },
  );

  if (!updatedProblem) {
    throw new ApiError(404, "Problem not found");
  }

  res.status(200).json({
    success: true,
    data: updatedProblem,
  });
});

const deleteProblem = asyncHandler(async (req, res) => {
  const deletedProblem = await Problem.findByIdAndDelete(req.params.problemId);

  if (!deletedProblem) {
    throw new ApiError(404, "Problem not found");
  }

  res.status(200).json({
    success: true,
    message: "Problem deleted successfully",
  });
});

const searchProblems = asyncHandler(async (req, res) => {
  const q = req.query.q;

  if (!q?.trim()) {
    throw new ApiError(400, "Search query is required");
  }

  const problems = await Problem.find({
    $or: [
      {
        title: {
          $regex: q,
          $options: "i",
        },
      },
      {
        instruction: {
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
    ],
  });

  res.status(200).json({
    success: true,
    query: q,
    count: problems.length,
    data: problems,
  });
});

const getProblemsByTopic = asyncHandler(async (req, res) => {
  const problems = await Problem.find({
    topic: req.params.topic,
  });

  res.status(200).json({
    success: true,
    count: problems.length,
    data: problems,
  });
});


const getProblemsByDifficulty = asyncHandler(async (req, res) => {
  const problems = await Problem.find({
    difficulty: req.params.difficulty,
  });

  res.status(200).json({
    success: true,
    count: problems.length,
    data: problems,
  });
});


const getProblemsBySource = asyncHandler(async (req, res) => {
  const problems = await Problem.find({
    source: req.params.source,
  });

  res.status(200).json({
    success: true,
    count: problems.length,
    data: problems,
  });
});

const getProblemsByInstructionKeyword = asyncHandler(async (req, res) => {
  const problems = await Problem.find({
    instruction: {
      $regex: req.params.keyword,
      $options: "i",
    },
  });

  res.status(200).json({
    success: true,
    count: problems.length,
    data: problems,
  });
});

const getRandomProblem = asyncHandler(async (req, res) => {
  const count = await Problem.countDocuments();
  if (count === 0) {
    throw new ApiError(404, "No problems found");
  }
  const random = Math.floor(Math.random() * count);
  const problem = await Problem.findOne().skip(random);
  res.status(200).json({
    success: true,
    data: problem,
  });
});

const getTrendingProblems = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.max(1, Number(req.query.limit) || 10);
  const skip = (page - 1) * limit;

  const problems = await Problem.find()
    .sort("-views -createdAt")
    .skip(skip)
    .limit(limit);

  res.status(200).json({
    success: true,
    page,
    limit,
    count: problems.length,
    data: problems,
  });
});

const getRecentProblems = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.max(1, Number(req.query.limit) || 10);
  const skip = (page - 1) * limit;

  const problems = await Problem.find()
    .sort("-createdAt")
    .skip(skip)
    .limit(limit);

  res.status(200).json({
    success: true,
    page,
    limit,
    count: problems.length,
    data: problems,
  });
});

const getAdvancedProblems = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.max(1, Number(req.query.limit) || 5);
  const skip = (page - 1) * limit;

  const problems = await Problem.find({ difficulty: "advanced" })
    .skip(skip)
    .limit(limit);

  res.status(200).json({
    success: true,
    page,
    limit,
    count: problems.length,
    data: problems,
  });
});

const importProblems = asyncHandler(async (req, res) => {
  let problemsArray = req.body;
  if (!Array.isArray(problemsArray) && req.body && Array.isArray(req.body.problems)) {
    problemsArray = req.body.problems;
  }

  if (!Array.isArray(problemsArray) || problemsArray.length === 0) {
    throw new ApiError(400, "Please provide an array of problems to import");
  }

  const count = await Problem.countDocuments();
  const existingProblems = await Problem.find({}, { title: 1 });
  const existingTitles = new Set(existingProblems.map(p => p.title.toLowerCase()));

  const problemsToInsert = [];
  const errors = [];

  for (let i = 0; i < problemsArray.length; i++) {
    const item = problemsArray[i];
    const instruction = item.instruction || item.description;
    const topic = item.topic || item.category;
    let difficulty = item.difficulty;

    if (!instruction) {
      errors.push({ index: i, error: "Instruction or description is required" });
      continue;
    }
    if (!topic) {
      errors.push({ index: i, error: "Topic or category is required" });
      continue;
    }

    // Normalize difficulty
    if (difficulty) {
      difficulty = difficulty.toLowerCase();
      if (difficulty === "beginner" || difficulty === "easy") {
        difficulty = "easy";
      } else if (difficulty === "intermediate" || difficulty === "medium") {
        difficulty = "medium";
      } else if (difficulty === "hard" || difficulty === "advanced" || difficulty === "difficult") {
        difficulty = "advanced";
      } else {
        difficulty = "medium";
      }
    } else {
      difficulty = "medium";
    }

    // Handle title
    let title = item.title;
    if (!title) {
      const cleanText = instruction.replace(/[^\w\s-]/g, '').trim();
      const words = cleanText.split(/\s+/).slice(0, 5).join(" ");
      title = words ? words : `Problem ${count + i + 1}`;
    }

    // Ensure title uniqueness
    let uniqueTitle = title;
    let suffix = 1;
    while (
      existingTitles.has(uniqueTitle.toLowerCase()) ||
      problemsToInsert.some(p => p.title.toLowerCase() === uniqueTitle.toLowerCase())
    ) {
      uniqueTitle = `${title} (${suffix})`;
      suffix++;
    }

    problemsToInsert.push({
      title: uniqueTitle,
      instruction: instruction.trim(),
      topic: topic.trim(),
      difficulty,
      views: 0
    });
  }

  if (problemsToInsert.length === 0) {
    throw new ApiError(400, "No valid problems found to import", errors);
  }

  const importedProblems = await Problem.insertMany(problemsToInsert);

  res.status(201).json({
    success: true,
    message: `Successfully imported ${importedProblems.length} problems`,
    count: importedProblems.length,
    failedCount: errors.length,
    errors: errors.length > 0 ? errors : undefined,
    data: importedProblems
  });
});

module.exports = {
  getAllProblems,
  getSingleProblem,
  createProblem,
  replaceProblem,
  updateProblem,
  deleteProblem,
  searchProblems,
  getProblemsByTopic,
  getProblemsByDifficulty,
  getProblemsBySource,
  getProblemsByInstructionKeyword,
  getRandomProblem,
  getTrendingProblems,
  getRecentProblems,
  getAdvancedProblems,
  importProblems,
};
