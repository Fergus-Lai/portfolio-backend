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

app.get("/checkDirectory/:path(*)", (req, res) => {
  const path = req.params.path;
  if (path == "") {
    res.send(false);
    return;
  }
  if (path == "~") {
    res.send(true);
    return;
  }
  const directories = path.split("/");
  let currentDirectory = directoryTree;
  directories.forEach((directory) => {
    if (!(directory in currentDirectory)) {
      res.send(false);
      return;
    }
    currentDirectory = currentDirectory[directory];
  });
  res.send(true);
  return;
});

app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});
