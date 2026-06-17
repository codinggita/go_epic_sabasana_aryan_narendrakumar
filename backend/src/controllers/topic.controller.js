const Topic = require("../models/topic.model");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/apiError");

const getAllTopics = asyncHandler(async (req, res) => {
  const filter = {};
  const sort = req.query.sort || "createdAt";
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.max(1, Number(req.query.limit) || 10);
  const skip = (page - 1) * limit;

  if (req.query.search?.trim()) {
    filter.$or = [
      {
        name: {
          $regex: req.query.search,
          $options: "i",
        },
      },
      {
        category: {
          $regex: req.query.search,
          $options: "i",
        },
      },
      {
        description: {
          $regex: req.query.search,
          $options: "i",
        },
      },
    ];
  }

  const topics = await Topic.find(filter)
  .sort(sort)
  .skip(skip)
  .limit(limit);

  const totalTopics = await Topic.countDocuments(filter);

  res.status(200).json({
   success: true,
  page,
  limit,
  totalTopics,
  totalPages: Math.ceil(totalTopics / limit),
  count: topics.length,
  data: topics,
  });
});


const getTopicByName = asyncHandler(async (req, res) => {
  const topic = await Topic.findOne({
    name: req.params.name,
  });

  if (!topic) {
    throw new ApiError(404, "Topic not found");
  }

  res.status(200).json({
    success: true,
    data: topic,
  });
});

const getTopicsByCategory = asyncHandler(async (req, res) => {
  const topics = await Topic.find({
    category: req.params.category,
  });

  res.status(200).json({
    success: true,
    count: topics.length,
    data: topics,
  });
});

const getSingleTopic = asyncHandler(async (req, res) => {
  const topic = await Topic.findOne({
    name: req.params.topicName,
  });

  if (!topic) {
    throw new ApiError(404, "Topic not found");
  }

  res.status(200).json({
    success: true,
    data: topic,
  });
});

const createTopic = asyncHandler(async (req, res) => {
  const newTopic = await Topic.create(req.body);

  res.status(201).json({
    success: true,
    data: newTopic,
  });
});

const replaceTopic = asyncHandler(async (req, res) => {
  const updatedTopic = await Topic.findOneAndUpdate(
    {
      name: req.params.topicName,
    },
    req.body,
    {
      new: true,
      runValidators: true,
    },
  );

  if (!updatedTopic) {
    throw new ApiError(404, "Topic not found");
  }

  res.status(200).json({
    success: true,
    data: updatedTopic,
  });
});

const updateTopic = asyncHandler(async (req, res) => {
  const updatedTopic = await Topic.findOneAndUpdate(
    {
      name: req.params.topicName,
    },
    req.body,
    {
      new: true,
      runValidators: true,
    },
  );

  if (!updatedTopic) {
    throw new ApiError(404, "Topic not found");
  }

  res.status(200).json({
    success: true,
    data: updatedTopic,
  });
});

const deleteTopic = asyncHandler(async (req, res) => {
  const deletedTopic = await Topic.findOneAndDelete({
    name: req.params.topicName,
  });

  if (!deletedTopic) {
    throw new ApiError(404, "Topic not found");
  }

  res.status(200).json({
    success: true,
    message: "Topic deleted successfully",
  });
});

const searchTopics = asyncHandler(async (req, res) => {
  const q = req.query.q;

  if (!q?.trim()) {
    throw new ApiError(400, "Search query is required");
  }

  const topics = await Topic.find({
    $or: [
      {
        name: {
          $regex: q,
          $options: "i",
        },
      },
      {
        category: {
          $regex: q,
          $options: "i",
        },
      },
      {
        description: {
          $regex: q,
          $options: "i",
        },
      },
    ],
  });

  res.status(200).json({
    success: true,
    query: q,
    count: topics.length,
    data: topics,
  });
});

module.exports = {
  getAllTopics,
  getSingleTopic,
  createTopic,
  replaceTopic,
  updateTopic,
  deleteTopic,
  getTopicByName,
  getTopicsByCategory,
  searchTopics,
};
