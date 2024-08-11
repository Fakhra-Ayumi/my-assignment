import express from "express";
import auth from "http-auth";
import authConnect from 'http-auth-connect'; 

const digest = auth.digest({
    realm: "secret",
    file: "./users.htdigest"
  });

const app = express();

app.get("/", (req, res) => {
  res.send("AWS");
});

app.get("/secret", authConnect(digest), (req, res) => {
  res.send('SUCCESS');
});

const port = 8080;
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});