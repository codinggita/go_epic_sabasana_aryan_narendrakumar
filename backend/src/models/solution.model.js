const mongoose = require('mongoose');

const solutionSchema = new mongoose.Schema(
    {
        title : {
            type : String,
            required : true,
            trim : true,
        },

        topic : {
            type : String,
            required : true,
            trim : true,
        },

        difficulty : {
            type : String,
            required : true,
            enum : ["easy", "medium", "advanced"],
        },

        source : {
            type : String,
            required : true,
            trim : true,
        },

        code : {
            type : String,
            required : true,
        },

        explanation : {
            type : String,
            required : true,
            trim : true,
        },
    },

    {
        timestamps : true,
    }
);


module.exports = mongoose.model("Solution", solutionSchema);