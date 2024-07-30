import React, { useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import { ResponsiveBar } from "@nivo/bar";
import { ProductsTable } from "../components";

function Dashboard() {
  // State for animal data
  const [animals, setAnimals] = useState([
    {
      id: 1,
      breed: "Angus",
      weight: 1250,
      purchaseDate: "2024-07-15",
      status: "Processing",
    },
    {
      id: 2,
      breed: "Hereford",
      weight: 1320,
      purchaseDate: "2024-07-10",
      status: "Received",
    },
    {
      id: 3,
      breed: "Simmental",
      weight: 1180,
      purchaseDate: "2024-07-05",
      status: "Shipped",
    },
    {
      id: 4,
      breed: "Charolais",
      weight: 1400,
      purchaseDate: "2024-07-20",
      status: "Received",
    },
    {
      id: 5,
      breed: "Limousin",
      weight: 1280,
      purchaseDate: "2024-07-18",
      status: "Processing",
    },
  ]);

  console.log("Animals are:", animals);

  return (
    <>
      <Box sx={{ padding: 2 }} id="testBoxArea">
        <Typography variant="h2" gutterBottom>
          Inventory Overview
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead sx={{ backgroundColor: "rgba(0, 0, 0, 0.04)" }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: "bold" }}>Animal ID</TableCell>{" "}
                    <TableCell sx={{ fontWeight: "bold" }}>Breed</TableCell>{" "}
                    <TableCell sx={{ fontWeight: "bold" }}>
                      {" "}
                      Live Weight (lbs)
                    </TableCell>{" "}
                    {/* Add more headers for other animal attributes */}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {animals ? (
                    animals.map((animal) => (
                      <TableRow key={animal.id}>
                        <TableCell>{animal.id}</TableCell>
                        <TableCell>{animal.breed}</TableCell>
                        <TableCell>{animal.weight}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <p> Sorry there are no animals. </p>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>

          <Grid item xs={12} md={8}>
            <Box sx={{ height: 400 }}></Box>
          </Grid>
        </Grid>
      </Box>

      <ProductsTable />
    </>
  );
}

export default Dashboard;
