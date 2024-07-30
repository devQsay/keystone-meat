import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Grid,
  InputAdornment,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";

const API_URL = "http://localhost:3002/api/products";

// This component displays a table of products fetched from the server.
function ProductTable() {
  const [page, setPage] = useState(0); // Current page (starts at 0)
  const [products, setProducts] = useState([]);
  const [rowsPerPage, setRowsPerPage] = useState(10); // Rows per page
  const [searchQuery, setSearchQuery] = useState(""); // Searches Through Table

  // Call the API to fetch products.
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(API_URL);
        setProducts(response.data);
      } catch (error) {
        console.error("Error fetching product data:", error);
      }
    };
    fetchData();
  }, []);

  // Get keys from the first product object
  const productKeys = products.length > 0 ? Object.keys(products[0]) : [];

  // Filter products based on search query
  const filteredProducts = products.filter((product) =>
    Object.values(product).some(
      (value) =>
        value &&
        value.toString().toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  // Pagination handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset page to 0 when changing rows per page
  };

  // Calculate displayed rows
  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - products.length) : 0;

  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h2" gutterBottom>
        Products
      </Typography>

      <TableContainer component={Paper}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            direction: "row",
            justifyContent: "flex-start",
            paddingTop: 2,
            paddingBottom: 2,
            paddingLeft: 2,
          }}
        >
          <TextField
            label="Search Products"
            variant="outlined"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>
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
            {/* Map over filteredProducts instead of products */}
            {filteredProducts
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((product) => (
                <TableRow key={product.id}>
                  {productKeys.map((key) => (
                    <TableCell key={key}>{product[key]}</TableCell>
                  ))}
                </TableRow>
              ))}
            {emptyRows > 0 && (
              <TableRow style={{ height: 53 * emptyRows }}>
                <TableCell colSpan={productKeys.length} />
              </TableRow>
            )}
          </TableBody>
        </Table>

        <TablePagination
          rowsPerPageOptions={[10, 25, 50]}
          component="div"
          count={products.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>
    </Box>
  );
}

export default ProductTable;
