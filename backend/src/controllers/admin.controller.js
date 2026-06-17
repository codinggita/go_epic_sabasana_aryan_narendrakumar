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

const getAdminDashboard = asyncHandler(async (req, res) => {
  const [
    totalProblems,
    totalTopics,
    totalSolutions,
    totalDatasets,
    problemsByDifficulty,
    problemViews,
    solutionViews,
    topicViews,
    recentProblems,
    recentSolutions,
    recentDatasets
  ] = await Promise.all([
    Problem.countDocuments(),
    Topic.countDocuments(),
    Solution.countDocuments(),
    Dataset.countDocuments(),
    Problem.aggregate([
      { $group: { _id: "$difficulty", count: { $sum: 1 } } }
    ]),
    Problem.aggregate([
      { $group: { _id: null, total: { $sum: "$views" } } }
    ]),
    Solution.aggregate([
      { $group: { _id: null, total: { $sum: "$views" } } }
    ]),
    Topic.aggregate([
      { $group: { _id: null, total: { $sum: "$views" } } }
    ]),
    Problem.find().sort("-createdAt").limit(5).select("title difficulty topic createdAt"),
    Solution.find().sort("-createdAt").limit(5).select("title difficulty topic source createdAt"),
    Dataset.find().sort("-createdAt").limit(5).select("source topic difficulty totalProblems createdAt")
  ]);

  const totalProblemViews = problemViews[0]?.total || 0;
  const totalSolutionViews = solutionViews[0]?.total || 0;
  const totalTopicViews = topicViews[0]?.total || 0;
  const totalViews = totalProblemViews + totalSolutionViews + totalTopicViews;

  // Format difficulty stats into an easy-to-use object
  const difficultyStats = { easy: 0, medium: 0, advanced: 0 };
  problemsByDifficulty.forEach((stat) => {
    if (stat._id in difficultyStats) {
      difficultyStats[stat._id] = stat.count;
    }
  });

  res.status(200).json({
    success: true,
    data: {
      stats: {
        totalProblems,
        totalTopics,
        totalSolutions,
        totalDatasets,
        totalViews,
        viewsBreakdown: {
          problems: totalProblemViews,
          solutions: totalSolutionViews,
          topics: totalTopicViews
        },
        difficultyBreakdown: difficultyStats
      },
      recentActivity: {
        problems: recentProblems,
        solutions: recentSolutions,
        datasets: recentDatasets
      }
    }
  });
});

module.exports = {
  getAdminProblems,
  getAdminTopics,
  getAdminSolutions,
  getAdminDatasets,
  getAdminDashboard,
};