import React from "react";
import { ProductsTable, InventoryOverview } from "../components";
import { Grid } from "@mui/material";

function Dashboard() {
  return (
    <Grid container spacing={2}>
      {" "}
      {/* Use a Grid container */}
      <Grid item xs={12} sm={6}>
        {" "}
        {/* Each item takes half the space on small/medium screens */}
        <ProductsTable />
      </Grid>
      <Grid item xs={12} sm={6}>
        <InventoryOverview />
      </Grid>
    </Grid>
  );
}

export default Dashboard;
