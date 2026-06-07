const Problem = require("../models/problem.model");
const Topic = require("../models/topic.model");
const Solution = require("../models/solution.model");
const Dataset = require("../models/dataset.model");

const asyncHandler = require("../utils/asyncHandler");

const getAdminProblems = asyncHandler(async (req, res) => {
  const problems = await Problem.find();

  res.status(200).json({
    success: true,
    count: problems.length,
    data: problems,
  });
});

const getAdminTopics = asyncHandler(async (req, res) => {
  const topics = await Topic.find();

  res.status(200).json({
    success: true,
    count: topics.length,
    data: topics,
  });
});

const getAdminSolutions = asyncHandler(async (req, res) => {
  const solutions = await Solution.find();

  res.status(200).json({
    success: true,
    count: solutions.length,
    data: solutions,
  });
});

const getAdminDatasets = asyncHandler(async (req, res) => {
  const datasets = await Dataset.find();

  res.status(200).json({
    success: true,
    count: datasets.length,
    data: datasets,
  });
});

module.exports = {
  getAdminProblems,
  getAdminTopics,
  getAdminSolutions,
  getAdminDatasets,
};