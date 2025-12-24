// src/script/insert-user.ts
import "dotenv/config";
import { pool } from "../db/db.js";

async function main() {
  const result = await pool.query(
    `INSERT INTO users (name, email)
     VALUES ($1, $2)
     RETURNING *`,
    ["Ali", "ali@test.com"]
  );

  console.log(result.rows[0]);
  await pool.end();
}

main();
