const express = require("express");

const router = express.Router();

const Problem = require("../models/problem.model");

router.get("/", async (req, res) => {
    try {
        const problems = await Problem.find();

        res.status(200).json({
            success : true,
            count : problems.length,
            data : problems,
        });
    } catch (error) {
        res.status(500).json({
            success : false,
            message : error.message,
        });
    }
});


router.get("/:problemId", async (req, res) => {
    try {
        const problem = await Problem.findById(req.params.problemId);

        if(!problem) {
           return res.status(404).json({
            success : false,
            message : "Problem Not Found",
           });
        }

        res.status(200).json({
            success : true,
            data : problem,
        });
    } catch (error) {
        res.status(500).json({
            success : false,
            message : error.message,
        });
    }
});

router.post("/", async (req,res) => {
    try {
        const newProblem = await Problem.create(req.body)

        res.status(201).json({
            success : true,
            data : newProblem,
        });
    } catch (error) {
        res.status(400).json({
            success : false,
            message : error.message,
        });
    }
});

router.put("/:problemId", async (req, res) => {
    try {
        const updatedProblem = await Problem.findByIdAndUpdate(
            req.params.problemId,
            req.body,
            {
                new : true,
                runValidators : true,
            }
        );

        if(!updatedProblem) {
            return res.status(404).json({
                success : false,
                message : "Problem not found",
            })
        }

        res.status(200).json({
            success : true,
            data : updatedProblem,
        })
    } catch (error) {
        res.status(400).json({
            success : false,
            message : error.message,
        });
    }
});


router.patch("/:problemId", async (req,res) => {
    try {
        const updatedProblem = await Problem.findByIdAndUpdate(
            req.params.problemId,
            req.body,
            {
                new : true, 
                runValidators : true,   
            }
        );

        if(!updatedProblem) {
            return res.status(404).json({
                success : false,
                message : "Problem not found",
            })
        }

        res.status(200).json({
            success : true,
            data : updatedProblem,
        })
    } catch (error) {
        res.status(400).json({
            success : false,
            message : error.message,
        });
    }
});


router.delete("/:problemId", async (req,res) => {
    try {
        const deletedProblem = await Problem.findByIdAndDelete(
            req.params.problemId,
        );

        if(!deletedProblem) {
            return res.status(404).json({
                success : false,
                message : "Problem not Found"
            });
        }

        res.status(200).json({
            success : true,
            message : "Problem deleted successfully"
        })
    } catch (error) {
        res.status(500).json({
            success : false,
            message : error.message,
        });
    }
});

module.exports = router;