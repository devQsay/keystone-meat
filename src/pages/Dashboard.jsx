import React, { useState } from "react";
import { ProductsTable, InventoryOverview } from "../components";

function Dashboard() {
  return (
    <>
      <ProductsTable />
      <InventoryOverview />
    </>
  );
}

export default Dashboard;
