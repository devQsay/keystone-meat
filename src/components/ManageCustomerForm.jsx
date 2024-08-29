import React from "react";
import { TextField, Button, Box, Grid, Typography } from "@mui/material";

function ManageCustomerForm({
  customer,
  handleCustomerInputChange,
  handleCustomerSubmit,
}) {
  return (
    <Box component="form" onSubmit={handleCustomerSubmit} sx={{ mt: 2 }}>
      <Typography variant="h5" sx={{ mt: 4 }}>
        Manage Customer Information
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="Customer ID"
            name="id"
            value={customer.id}
            onChange={handleCustomerInputChange}
            variant="outlined"
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="Name"
            name="name"
            value={customer.name}
            onChange={handleCustomerInputChange}
            variant="outlined"
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="Email"
            name="email"
            value={customer.email}
            onChange={handleCustomerInputChange}
            variant="outlined"
          />
        </Grid>
        <Grid item xs={12}>
          <Button type="submit" variant="contained" color="primary">
            Save Customer
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}

export default ManageCustomerForm;
