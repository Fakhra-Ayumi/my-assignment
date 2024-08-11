import express from "express";
import auth from "http-auth";
import authConnect from "http-auth-connect";
import fs from "fs";
import { fileURLToPath } from 'url';
import path from "path";

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

app.use(express.json());
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbFilePath = path.join(__dirname, 'db.json');

app.post('/v1/stocks', (req, res) => {
  const newEntry = req.body;
  if (!newEntry.name) {
    return res.status(400).json({ "message": "ERROR" });
  }

  const nameRegex = /^[a-zA-Z]{1,8}$/;
  if (!nameRegex.test(newEntry.name)) {
    return res.status(400).json({ "message": "ERROR" });
  }

  if(!newEntry.amount) {
    newEntry.amount = 1;
  }

  if (!Number.isInteger(newEntry.amount) || newEntry.amount < 0) {
    return res.status(400).json({ "message": "ERROR" });
  }

  fs.readFile(dbFilePath, 'utf8', (err, data) => {
      if (err) {
          return res.status(500).json({ error: `Failed to read the db json file` });
      }

      let dbData;
      try {
          dbData = JSON.parse(data);
      } catch (parseErr) {
          return res.status(500).json({ error: 'Failed to parse the db json file' });
      }

      const dataToAppend = {
        [newEntry.name]: newEntry.amount
      };

      dbData = { ...dbData, ...dataToAppend };

      fs.writeFile(dbFilePath, JSON.stringify(dbData, null, 2), 'utf8', (err) => {
          if (err) {
              return res.status(500).json({ error: 'Failed to update the db json file' });
          }
          res.status(200).json({ message: 'Database is updated successfully', data: dbData });
      });
  });
});

const port = 8080;
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});