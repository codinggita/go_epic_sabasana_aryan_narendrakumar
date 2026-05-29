const express = require("express");

const router = express.Router();

const Dataset = require("../models/dataset.model");


// GET ALL DATASETS
router.get("/", async (req, res) => {
  try {
    const datasets = await Dataset.find();

    res.status(200).json({
      success: true,
      count: datasets.length,
      data: datasets,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});


// GET SINGLE DATASET
router.get("/:datasetId", async (req, res) => {
  try {
    const dataset = await Dataset.findById(req.params.datasetId);

    if (!dataset) {
      return res.status(404).json({
        success: false,
        message: "Dataset not found",
      });
    }

    res.status(200).json({
      success: true,
      data: dataset,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});


// CREATE DATASET
router.post("/", async (req, res) => {
  try {
    const newDataset = await Dataset.create(req.body);

    res.status(201).json({
      success: true,
      data: newDataset,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});


// REPLACE DATASET
router.put("/:datasetId", async (req, res) => {
  try {
    const updatedDataset = await Dataset.findByIdAndUpdate(
      req.params.datasetId,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedDataset) {
      return res.status(404).json({
        success: false,
        message: "Dataset not found",
      });
    }

    res.status(200).json({
      success: true,
      data: updatedDataset,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});


// UPDATE DATASET
router.patch("/:datasetId", async (req, res) => {
  try {
    const updatedDataset = await Dataset.findByIdAndUpdate(
      req.params.datasetId,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedDataset) {
      return res.status(404).json({
        success: false,
        message: "Dataset not found",
      });
    }

    res.status(200).json({
      success: true,
      data: updatedDataset,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});


// DELETE DATASET
router.delete("/:datasetId", async (req, res) => {
  try {
    const deletedDataset = await Dataset.findByIdAndDelete(
      req.params.datasetId
    );

    if (!deletedDataset) {
      return res.status(404).json({
        success: false,
        message: "Dataset not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Dataset deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;