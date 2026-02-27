import express from "express";
import cors from "cors";

const app = express();
const port = 3002;

app.use(cors());
app.use(express.json());

app.get("/hello", (req, res) => {
  res.json({ message: "Hello world" });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
