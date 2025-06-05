import express from "express";
import { directoryTree } from "./data";
import cors from "cors";
import fs from "fs";
import path from "path";
import { db } from "./db/db";
import { messages } from "./db/schema/message";
import rateLimit from "express-rate-limit";

const corsOptions = {
  origin:
    process.env.NODE_ENV == "production" ? "https://www.fergus-lai.dev" : "*",
  methods: ["GET", "POST"],
};

const limiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  message: "Too many requests from this IP, please try again after 15 minutes",
});

const app = express();
const port = process.env.PORT || 3000;

app.use(cors(corsOptions));
app.use(express.json());

app.use("/contact", limiter);

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

app.get("/file/:path(*)", (req, res) => {
  const inputPath = req.params.path;
  if (inputPath == "") res.status(404).send("Directory not found");
  else {
    try {
      const directoryPath = inputPath.split("/");
      const fileName = directoryPath.pop().toLowerCase();
      const directory = toDirectory(directoryPath.join("/"));
      if (!directory.file.includes(fileName))
        throw ReferenceError("File Not Found");
      const filePath = path.join(__dirname, "data", fileName);
      fs.readFile(filePath, "utf8", (err, data) => {
        if (err) {
          return res.status(500).send("Error reading file");
        }
        res.type("text/markdown"); // Set content type as markdown
        res.send(data);
      });
    } catch (error) {
      if (error instanceof RangeError && error.message == "Directory Not Found")
        res.status(404).send("Directory not found");
      else if (
        error instanceof ReferenceError &&
        error.message == "File Not Found"
      )
        res.status(404).send("File Not Found");
      else res.status(502).send("Unknown error occurred");
    }
  }
});

app.get("/download/:path(*)", (req, res) => {
  const inputPath = req.params.path;
  if (inputPath == "") res.status(404).send("Directory not found");
  else {
    try {
      const directoryPath = inputPath.split("/");
      const fileName = directoryPath.pop().toLowerCase();
      const directory = toDirectory(directoryPath.join("/"));
      if (!directory.file.includes(fileName))
        throw ReferenceError("File Not Found");
      const filePath = path.join(__dirname, "data", fileName);
      res.download(filePath, fileName, (err) => {
        if (err) {
          console.error("Download error:", err);
          res.status(500).send("Could not download the file.");
        }
      });
    } catch (error) {
      if (error instanceof RangeError && error.message == "Directory Not Found")
        res.status(404).send("Directory not found");
      else if (
        error instanceof ReferenceError &&
        error.message == "File Not Found"
      )
        res.status(404).send("File Not Found");
      else res.status(502).send("Unknown error occurred");
    }
  }
});

app.post("/contact", async (req, res) => {
  const { title, inputName, email, message } = req.body;
  if (!title) {
    res.status(400).send("Title Missing");
    return;
  }
  if (!inputName) {
    res.status(400).send("Input Name Missing");
    return;
  }
  if (!email) {
    res.status(400).send("Email Missing");
    return;
  }
  if (!message) {
    res.status(400).send("Message Missing");
    return;
  }
  try {
    await db.insert(messages).values({
      name: inputName,
      title: title,
      email: email,
      message: message,
    });
    res.status(200).send("Saved Message");
  } catch (error) {
    res.status(500).send("Unknown error occurred");
  }
});

app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});
