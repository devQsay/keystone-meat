import React from "react";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Box,
  Grid,
  Typography,
} from "@mui/material";

function UpdateOrderStatusForm({
  selectedOrderId,
  setSelectedOrderId,
  newStatus,
  setNewStatus,
  orders,
  handleStatusUpdate,
}) {
  return (
    <Box component="form" onSubmit={handleStatusUpdate} sx={{ mt: 2 }}>
      <Typography variant="h5" sx={{ mt: 4 }}>
        Update Order Status
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel id="order-select-label">Order ID</InputLabel>
            <Select
              labelId="order-select-label"
              value={selectedOrderId}
              onChange={(e) => setSelectedOrderId(e.target.value)}
              label="Order ID"
            >
              {orders.map((order) => (
                <MenuItem key={order.id} value={order.id}>
                  {order.id}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel id="status-select-label">Status</InputLabel>
            <Select
              labelId="status-select-label"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              label="Status"
            >
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="processing">Processing</MenuItem>
              <MenuItem value="shipped">Shipped</MenuItem>
              <MenuItem value="complete">Complete</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <Button type="submit" variant="contained" color="primary">
            Update Status
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}

export default UpdateOrderStatusForm;
