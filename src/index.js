import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import path from "path";
import Config from "./config";
import Article from "./models/Article";

const { MONGODB } = Config;

const app = express();
const PORT = process.env.PORT || 6899;

app.use(
  cors({
    origin: ["http://localhost:6899"], //cors is going to apply on all routes. I can add more routes to this array
    credentials: true, //just to accept credentials
  })
);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "/build")));

app.get("/api/articles/:name", async (req, res) => {
  try {
    const articleName = req.params.name;
    const article = await Article.findOne({ name: articleName });

    if (!article) {
      res.status(404).json({
        message: "Not Found",
      });
    }
    res.status(200).json(article);
  } catch (err) {
    console.log(err.message, "err");
    res.status(500).json({
      message: "Error: Could not fetch request",
      error: err.message,
    });
  }
});
app.post("/api/articles/:name/upvote", async (req, res) => {
  try {
    const articleName = req.params.name;
    const article = await Article.findOne({ name: articleName });
    if (!article) {
      res.status(404).json({
        message: "Not Found",
      });
    }
    //increase the upvotes count by 1
    await Article.updateOne(
      { name: articleName },
      {
        upvotes: article.upvotes + 1,
      }
    );
    const updatedArticleInfo = await Article.findOne({ name: articleName });
    res.status(200).json(updatedArticleInfo);
  } catch (err) {
    console.log(err.message, "err");
    res.status(500).json({
      message: "Error: Could not fetch requesr",
      error: err.message,
    });
  }
});
app.post("/api/articles/:name/add-comments", async (req, res) => {
  try {
    const articleName = req.params.name;
    const { username, text } = req.body;
    const article = await Article.findOne({ name: articleName });
    if (!article) {
      res.status(404).json({
        message: "Not Found",
      });
    }
    //increase the upvotes count by 1
    await Article.updateOne(
      { name: articleName },
      {
        comments: [...article.comments, { username, text }],
      }
    );
    const updatedArticleInfo = await Article.findOne({ name: articleName });
    res.status(200).json(updatedArticleInfo);
  } catch (err) {
    console.log(err.message, "err");
    res.status(500).json({
      message: "Error: Could not fetch requesr",
      error: err.message,
    });
  }
});
//for inserting article
app.post("/api/add-article", (req, res) => {
  console.log("post article");
  Article.create([
    {
      name: "learn-react",
      upvotes: 0,
      comments: [],
    },
    {
      name: "learn-node",
      upvotes: 0,
      comments: [],
    },
    {
      name: "my-thoughts-on-resumes",
      comments: [],
    },
  ]).then((dbArticles) => {
    res
      .status(201)
      .json({
        message: "create successfully",
        dbArticles,
      })
      .catch((err) => {
        res.json(err);
      });
  });
});

//this means that all requests that are not caught by all defined api endpoints should be caught by this endpoint
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname + "/build/index.html"));
});
// app.listen(PORT, () => {
//   console.log(`My Blog server listening on port ${PORT}!`);
// });
//connect to db
mongoose
  .connect(MONGODB, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    //return app.listen({ port: PORT });
    console.log("db connected");
    app.listen(PORT, () => {
      console.log(`My Blog server listening on port ${PORT}!`);
    });
  })
  .catch((error) => {
    console.error(error);
  });
