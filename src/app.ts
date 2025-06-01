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
  const directories = path.split("/");
  let currentDirectory = directoryTree;
  for (const directory of directories) {
    if (!(directory in currentDirectory)) return false;
    currentDirectory = currentDirectory[directory];
  }
  return true;
};

app.get("/checkDirectory/:path(*)", (req, res) => {
  const path = req.params.path;
  if (path == "") res.send(false);
  else res.send(toDirectory(path));
});

app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});
