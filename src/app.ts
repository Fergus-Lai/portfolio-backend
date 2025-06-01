import express from "express";
import { directoryTree } from "./data";
import cors from "cors";

const corsOptions = {
  origin: process.env.NODE_ENV == "production" ? "https://fergus-lai.dev" : "*",
  methods: ["GET", "POST"],
};

const app = express();
const port = process.env.PORT || 3000;

app.use(cors(corsOptions));

const toDirectory = (path: string) => {
  path = path.replace("~", "");
  const directories = path.split("/").filter((word) => word.length > 0);
  let currentDirectory = directoryTree;
  for (const directory of directories) {
    if (!(directory in currentDirectory.directory))
      throw new RangeError("Directory Not Found");
    currentDirectory = currentDirectory.directory[directory];
  }
  return currentDirectory;
};

app.get("/checkDirectory/:path(*)", (req, res) => {
  const path = req.params.path;
  if (path == "") res.send(false);
  else {
    try {
      toDirectory(path);
      res.send(true);
    } catch (error) {
      res.send(false);
    }
  }
});

app.get("/listDirectory/:path(*)", (req, res) => {
  const path = req.params.path;
  if (path == "") res.send(false);
  else {
    try {
      const directory = toDirectory(path);
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

app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});
