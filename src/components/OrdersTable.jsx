import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
} from "@mui/material";

function OrdersTable({ orders, findCustomerById, orderItems }) {
  return (
    <TableContainer component={Paper} sx={{ mb: 4 }}>
      <Table aria-label="orders table" size="medium">
        <TableHead>
          <TableRow>
            <TableCell>
              <Typography variant="h6">Order ID</Typography>
            </TableCell>
            <TableCell>
              <Typography variant="h6">Customer Name</Typography>
            </TableCell>
            <TableCell>
              <Typography variant="h6">Items</Typography>
            </TableCell>
            <TableCell>
              <Typography variant="h6">Status</Typography>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell>{order.id}</TableCell>
              <TableCell>{findCustomerById(order.customerId).name}</TableCell>
              <TableCell>
                {orderItems
                  .filter((item) => item.orderId === order.id)
                  .map((item) => item.name)
                  .join(", ")}
              </TableCell>
              <TableCell>{order.status}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default OrdersTable;
