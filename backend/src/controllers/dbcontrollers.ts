import expressAsyncHandler from "express-async-handler";
import { pool } from "../config/connectDb";
import { Request, Response } from "express";

const createUser = expressAsyncHandler(async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, options, walletaddress } = req.body;

    const insertQuery = `
          INSERT INTO notification_services (email, options,walletaddress)
          VALUES ($1, $2,$3)
          RETURNING id;
        `;

    const values = [email, options, walletaddress];

    const result = await pool.query(insertQuery, values);
    const insertedId = result.rows[0].id;

    res.send(`Data inserted with ID: ${insertedId}`);
  } catch (error) {
    console.log(error);
  }
});

const getUser = expressAsyncHandler(async (req: Request, res: Response): Promise<void> => {
  try {
    const walletAddress = req.query.walletaddress; // Get the walletaddress from the query parameter

    if (!walletAddress) {
      res.status(400).json({ error: "Missing walletaddress parameter" });
    }

    const client = await pool.connect();

    const query = `
          SELECT * FROM notification_services
          WHERE walletaddress = $1;
        `;

    const result = await client.query(query, [walletAddress]);

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

const updateUser = expressAsyncHandler(async (req: Request, res: Response): Promise<void> => {
  try {
    const walletAddress = req.params.walletaddress;
    const { email, options } = req.body;

    if (!walletAddress) {
      res.status(400).json({ error: "Missing walletaddress parameter" });
    }

    const client = await pool.connect();

    // Update the email and options for the given walletaddress
    const query = `
          UPDATE notification_services
          SET email = $1, options = $2
          WHERE walletaddress = $3;
        `;

    const values = [email, options, walletAddress];
    await client.query(query, values);

    res.json({ message: "User data updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while updating data" });
  }
});

export { createUser, getUser, updateUser };
