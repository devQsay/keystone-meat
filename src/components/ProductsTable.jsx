import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
} from "@mui/material";

function ProductTable() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:3002/api/products");
        setProducts(response.data);
      } catch (error) {
        console.error("Error fetching product data:", error);
        // You might want to handle errors more gracefully in your UI
      }
    };
    fetchData();
  }, []);

  // Get keys from the first product object
  const productKeys = products.length > 0 ? Object.keys(products[0]) : [];

  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h2" gutterBottom>
        Products
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              {productKeys.map((key) => (
                <TableCell key={key} sx={{ fontWeight: "bold" }}>
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                {productKeys.map((key) => (
                  <TableCell key={key}>{product[key]}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default ProductTable;
