const express = require("express");
const router = express.Router();
const Solution = require("../models/solution.model");

//GET ALL PROBLEMS
router.get("/", async (req, res) => {
    try {
        const solutions = await Solution.find();

        res.status(200).json({
            success : true,
            count : solutions.length,
            data : solutions,
        });
    } catch (error) {
        res.status(500).json({
            success : false,
            message : error.message,
        });
    }
});


//GET SINGLE SOLUTION 
router.get("/:solutionId", async (req, res) => {
    try {
        const solution = await Solution.findById(req.params.solutionId);

        if(!solution) {
            return res.status(404).json({
                success : false,
                message : "Solution Not Found",
            })
        }

        res.status(200).json({
            success : true,
            data : solution,
        });
    } catch (error) {
        res.status(500).json({
            success : false,
            message : error.message,
        })
    }
})


// CREATE SOLUTION

router.post("/", async (req,res) => {
    try {
        const newSolution = await Solution.create(req.body);

        res.status(201).json({
            success : true,
            data : newSolution,
        })
    } catch (error) {
        res.status(400).json({
            success : false,
            message : error.message,
        })
    }
})

//REPLACE SOLUTION

router.put("/:solutionId", async (req,res) => {
    try {
        const updatedSolution = await Solution.findByIdAndUpdate(
            req.params.solutionId,
            req.body,
            {
                new : true,
                runValidators : true,
            }
        )

        if(!updatedSolution) {
            return res.status(404).json({
                success : false,
                message : "Solution Not Found"
            });
        }

        res.status(200).json({
            success : true,
            data : updatedSolution,
        });

       }   catch (error) {
        res.status(500).json({
            success : false,
            message : error.message,
        });
    }
});

//UPDATE SOLUTION

router.patch("/:solutionId", async (req,res) => {
     try {
        const updatedSolution = await Solution.findByIdAndUpdate(
            req.params.solutionId,
            req.body,
            {
                new : true,
                runValidators : true,
            }
        )

        if(!updatedSolution) {
            return res.status(404).json({
                success : false,
                message : "Solution Not Found"
            });
        }

        res.status(200).json({
            success : true,
            data : updatedSolution,
        });

       }   catch (error) {
        res.status(500).json({
            success : false,
            message : error.message,
        });
    }
})

//DELETE SOLUTION
router.delete("/:solutionId", async (req, res) => {
  try {
    const deletedSolution = await Solution.findByIdAndDelete(
      req.params.solutionId
    );

    if (!deletedSolution) {
      return res.status(404).json({
        success: false,
        message: "Solution not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Solution deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;