import express from "express";
import cors from "cors";
import morgan from "morgan";
import connect from "./config/connection.js";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import router from "./routes/index.js";
import OpenAI from "openai";

const app = express();
dotenv.config();

const PORT = process.env.PORT || 4000;

connect();

app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(cors());

app.use(router);



app.listen(PORT, () => {
    console.log(`Server is running at PORT ${PORT}`)
});