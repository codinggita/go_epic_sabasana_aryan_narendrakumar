const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");
const problemRoutes = require("../src/routes/problem.routes");
const topicRoutes = require("./routes/topic.routes");



const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use("/problems", problemRoutes);
app.use("/topics", topicRoutes);


mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected"))
    .catch((err) => console.log(err));


app.get((req,res) => {
    res.send("Go Epic Backend Running");
})



module.exports = app;