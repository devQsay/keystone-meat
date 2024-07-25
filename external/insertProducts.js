const fs = require("fs");
const { Client } = require("pg");
require("dotenv").config();

// Database configuration (replace with your actual credentials)
const dbConfig = {
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
};

// Path to your JSON file
const dataFile = "./products-meatscm.json";

// Function to insert data into the table
async function insertData() {
  const client = new Client(dbConfig);

  try {
    await client.connect();

    // Read and filter the JSON data
    const allProducts = JSON.parse(fs.readFileSync(dataFile, "utf8"));

    const keystoneProducts = allProducts.rows.filter(
      (product) => product.manufacturer === "Keystone Meat"
    );

    for (const product of keystoneProducts) {
      console.log("Inserting product:", product.code);

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
  await insertData();
})();
