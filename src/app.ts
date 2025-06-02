import express from "express";
import { directoryTree } from "./data";
import cors from "cors";
import serverless from "serverless-http";

const corsOptions = {
  origin:
    process.env.NODE_ENV == "production" ? "https://www.fergus-lai.dev" : "*",
  methods: ["GET", "POST"],
};

const app = express();

app.use(cors(corsOptions));

const toDirectory = (inputPath: string) => {
  inputPath = inputPath.replace("~", "");
  const directories = inputPath.split("/").filter((word) => word.length > 0);
  let currentDirectory = directoryTree;
  for (const directory of directories) {
    if (!(directory in currentDirectory.directory))
      throw new RangeError("Directory Not Found");
    currentDirectory = currentDirectory.directory[directory];
  }
  return currentDirectory;
};

app.get("/checkDirectory/:path(*)", (req, res) => {
  const inputPath = req.params.path;
  if (inputPath == "") res.json({ result: false });
  else {
    try {
      toDirectory(inputPath);
      res.json({ result: true });
    } catch (error) {
      res.json({ result: false });
    }
  }
});

app.get("/listDirectory/:path(*)", (req, res) => {
  const inputPath = req.params.path;
  if (inputPath == "") res.status(404).send("Directory not found");
  else {
    try {
      const directory = toDirectory(inputPath);
      const result = {
        directory: Object.keys(directory.directory),
        file: directory.file,
      };
      res.json(result);
    } catch (error) {
      res.status(404).send("Directory not found");
    }
  }
});

module.exports.handler = serverless(app);
