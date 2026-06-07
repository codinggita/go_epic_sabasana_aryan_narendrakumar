const Dataset = require("../models/dataset.model");

const asyncHandler = require("../utils/asyncHandler");

const getAllDatasets = asyncHandler(async (req, res) => {
  const filter = {};

  if (req.query.source) {
    filter.source = req.query.source;
  }

  if (req.query.topic) {
    filter.topic = req.query.topic;
  }

  if (req.query.difficulty) {
    filter.difficulty = req.query.difficulty;
  }

  if (req.query.search?.trim()) {
    filter.$or = [
      {
        source: {
          $regex: req.query.search,
          $options: "i",
        },
      },
      {
        topic: {
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

  const sort = req.query.sort || "createdAt";

  const page = Math.max(1, Number(req.query.page) || 1);

  const limit = Math.max(1, Number(req.query.limit) || 10);

  const skip = (page - 1) * limit;

  const datasets = await Dataset.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(limit);

  const totalDatasets = await Dataset.countDocuments(filter);

  res.status(200).json({
    success: true,
    page,
    limit,
    totalDatasets,
    totalPages: Math.ceil(totalDatasets / limit),
    count: datasets.length,
    data: datasets,
  });
});

const getDatasetsBySource = asyncHandler(async (req, res) => {
  const datasets = await Dataset.find({
    source: req.params.source,
  });

  res.status(200).json({
    success: true,
    count: datasets.length,
    data: datasets,
  });
});


const getDatasetsByTopic = asyncHandler(async (req, res) => {
  const datasets = await Dataset.find({
    topic: req.params.topic,
  });

  res.status(200).json({
    success: true,
    count: datasets.length,
    data: datasets,
  });
});


const getDatasetsByDifficulty = asyncHandler(async (req, res) => {
  const datasets = await Dataset.find({
    difficulty: req.params.difficulty,
  });

  res.status(200).json({
    success: true,
    count: datasets.length,
    data: datasets,
  });
});

const searchDatasets = asyncHandler(async (req, res) => {
  const q = req.query.q;

  if (!q?.trim()) {
    throw new ApiError(400, "Search query is required");
  }

  const datasets = await Dataset.find({
    $or: [
      {
        source: {
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
    count: datasets.length,
    data: datasets,
  });
});


const getLatestDatasets = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);

  const limit = Math.max(1, Number(req.query.limit) || 5);

  const skip = (page - 1) * limit;

  const datasets = await Dataset.find()
    .sort("-createdAt")
    .skip(skip)
    .limit(limit);

  res.status(200).json({
    success: true,
    page,
    limit,
    count: datasets.length,
    data: datasets,
  });
});

const getSingleDataset = asyncHandler(async (req, res) => {
  const dataset = await Dataset.findById(req.params.datasetId);

  if (!dataset) {
    throw new ApiError(404, "Dataset not found");
  }

  res.status(200).json({
    success: true,
    data: dataset,
  });
});

const createDataset = asyncHandler(async (req, res) => {
  const newDataset = await Dataset.create(req.body);

  res.status(201).json({
    success: true,
    data: newDataset,
  });
});

const replaceDataset = asyncHandler(async (req, res) => {
  const updatedDataset = await Dataset.findByIdAndUpdate(
    req.params.datasetId,
    req.body,
    {
      new: true,
      runValidators: true,
    },
  );

  if (!updatedDataset) {
    throw new ApiError(404, "Dataset not found");
  }

  res.status(200).json({
    success: true,
    data: updatedDataset,
  });
});

const updateDataset = asyncHandler(async (req, res) => {
  const updatedDataset = await Dataset.findByIdAndUpdate(
    req.params.datasetId,
    req.body,
    {
      new: true,
      runValidators: true,
    },
  );

  if (!updatedDataset) {
    throw new ApiError(404, "Dataset not found");
  }

  res.status(200).json({
    success: true,
    data: updatedDataset,
  });
});

const deleteDataset = asyncHandler(async (req, res) => {
  const deletedDataset = await Dataset.findByIdAndDelete(req.params.datasetId);

  if (!deletedDataset) {
    throw new ApiError(404, "Dataset not found");
  }

  res.status(200).json({
    success: true,
    message: "Dataset deleted successfully",
  });
});

module.exports = {
  getAllDatasets,
  getSingleDataset,
  createDataset,
  replaceDataset,
  updateDataset,
  deleteDataset,
  getDatasetsBySource,
  getDatasetsByTopic,
  getDatasetsByDifficulty,
  searchDatasets,
  getLatestDatasets,
};
