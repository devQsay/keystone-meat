import React from "react";
import { TextField, Button, Box, Grid, Typography } from "@mui/material";

function AddOrderForm({ newOrder, handleInputChange, handleAddOrder }) {
  return (
    <Box component="form" onSubmit={handleAddOrder} sx={{ mt: 2 }}>
      <Typography variant="h5" sx={{ mt: 4 }}>
        Add New Order
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Desired Cuts"
            name="cuts"
            value={newOrder.cuts}
            onChange={handleInputChange}
            variant="outlined"
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <TextField
            fullWidth
            label="Quantity"
            name="quantity"
            type="number"
            value={newOrder.quantity}
            onChange={handleInputChange}
            variant="outlined"
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <TextField
            fullWidth
            label="Customer ID"
            name="customerId"
            value={newOrder.customerId}
            onChange={handleInputChange}
            variant="outlined"
          />
        </Grid>
        <Grid item xs={12}>
          <Button type="submit" variant="contained" color="primary">
            Add Order
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}

export default AddOrderForm;
