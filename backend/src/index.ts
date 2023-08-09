import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import { connectToDatabase, pool } from "./config/connectDb";
import dbrouter from "./routes/dbroutes";
import mailrouter from "./routes/mailroutes";

const app = express();

connectToDatabase();

app.use(bodyParser.json());

app.use("/api/users", dbrouter);
app.use("/api/sendmail", mailrouter);

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
