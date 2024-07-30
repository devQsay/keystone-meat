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
  TablePagination, // Import TablePagination
} from "@mui/material";

// This component displays a table of products fetched from the server.
function ProductTable() {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(0); // Current page (starts at 0)
  const [rowsPerPage, setRowsPerPage] = useState(10); // Rows per page

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:3002/api/products");
        setProducts(response.data);
      } catch (error) {
        console.error("Error fetching product data:", error);
      }
    };
    fetchData();
  }, []);

  // Get keys from the first product object
  const productKeys = products.length > 0 ? Object.keys(products[0]) : [];

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
            {products
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage) // Slice data for the current page
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

        {/* Pagination component */}
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
