const fs = require("fs");
const { Client } = require("pg");

// Database configuration (replace with your actual credentials)
const dbConfig = {
  user: "your_user",
  host: "localhost",
  database: "your_database",
  password: "your_password",
  port: 5432,
};

// Path to your JSON file
const dataFile = "./data.json";

// Function to create the table
async function createTable() {
  const client = new Client(dbConfig);

  try {
    await client.connect();

    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        code VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        manufacturer VARCHAR(255),
        distributor VARCHAR(255),
        category VARCHAR(255),
        quantity REAL,
        unit VARCHAR(50),
        gtin VARCHAR(255),
        avgqty REAL,
        inuse BOOLEAN,
        properties BIGINT
      );
    `;
    await client.query(createTableQuery);
    console.log("Table created successfully!");
  } catch (err) {
    console.error("Error creating table:", err);
  } finally {
    await client.end();
  }
}

// Function to insert data into the table
async function insertData() {
  const client = new Client(dbConfig);

  try {
    await client.connect();

    // Read the JSON file
    const data = JSON.parse(fs.readFileSync(dataFile, "utf8"));

    for (const product of data) {
      const insertQuery = `
        INSERT INTO products (code, name, description, manufacturer, distributor, category, quantity, unit, gtin, avgqty, inuse, properties)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12);
      `;
      const values = [
        product.code,
        product.name,
        product.description,
        product.manufacturer,
        product.distributor,
        product.category,
        parseFloat(product.quantity),
        product.unit,
        product.gtin,
        product.avgqty ? parseFloat(product.avgqty) : null,
        product.inuse,
        product.properties,
      ];
      await client.query(insertQuery, values);
    }

    console.log("Data inserted successfully!");
  } catch (err) {
    console.error("Error inserting data:", err);
  } finally {
    await client.end();
  }
}

// Execute the functions
(async () => {
  await createTable();
  await insertData();
})();
