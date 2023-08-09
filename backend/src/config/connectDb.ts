import { Pool } from "pg";

const pool = new Pool({
  user: "graph-node",
  host: "localhost",
  database: "graph-node",
  password: "let-me-in",
  port: 5432,
});

const connectToDatabase = async () => {
  try {
    const client = await pool.connect();
    if (client) {
      const queryResult = await client.query("SELECT current_database() AS database_name;");
      const databaseName = queryResult.rows[0].database_name;
      console.log("Connected to Database: ", databaseName);

      client.release();
    }
  } catch (error) {
    console.log(error);
  }
};

export { connectToDatabase, pool };
