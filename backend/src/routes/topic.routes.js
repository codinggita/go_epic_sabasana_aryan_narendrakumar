const express = require("express");

const router = express.Router();

const Topic = require("../models/topic.model");


router.get("/", async (req, res) => {
  try {
    const topics = await Topic.find();

    res.status(200).json({
      success: true,
      count: topics.length,
      data: topics,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});


router.get("/:topicName", async (req, res) => {
  try {
    const topic = await Topic.findOne({
      name: req.params.topicName,
    });

    if (!topic) {
      return res.status(404).json({
        success: false,
        message: "Topic not found",
      });
    }

    res.status(200).json({
      success: true,
      data: topic,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});


router.post("/", async (req, res) => {
  try {
    const newTopic = await Topic.create(req.body);

    res.status(201).json({
      success: true,
      data: newTopic,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});


router.put("/:topicName", async (req, res) => {
  try {
    const updatedTopic = await Topic.findOneAndUpdate(
      {
        name: req.params.topicName,
      },
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedTopic) {
      return res.status(404).json({
        success: false,
        message: "Topic not found",
      });
    }

    res.status(200).json({
      success: true,
      data: updatedTopic,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

router.patch("/:topicName", async (req, res) => {
  try {
    const updatedTopic = await Topic.findOneAndUpdate(
      {
        name: req.params.topicName,
      },
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedTopic) {
      return res.status(404).json({
        success: false,
        message: "Topic not found",
      });
    }

    res.status(200).json({
      success: true,
      data: updatedTopic,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});


router.delete("/:topicName", async (req, res) => {
  try {
    const deletedTopic = await Topic.findOneAndDelete({
      name: req.params.topicName,
    });

    if (!deletedTopic) {
      return res.status(404).json({
        success: false,
        message: "Topic not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Topic deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;