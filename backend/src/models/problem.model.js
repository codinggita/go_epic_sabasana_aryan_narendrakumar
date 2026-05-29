const mongoose = require("mongoose");

const problemSchema = new mongoose.Schema(
    {
        title : {
            type : String,
            required : true,
            trim : true,
        },

        difficulty : {
            type : String,
            required : true,
            enum : ["easy", "medium", "advanced"],
        },

        topic : {
            type : String,
            required : true,
            trim : true,
        }, 

        instruction : {
            type : String,
            required : true, 
            trim : true,
        },
    },
    {
        timestamps : true,
    }
)

module.exports = mongoose.model("Problem", problemSchema);