/**
 * GS1-128 Barcode Parsing and Data Handling
 *
 * This module provides functions for parsing and processing data from GS1-128
 * barcodes, which are commonly used in the food industry to track and manage
 * products throughout the supply chain.
 *
 * Key features:
 * - Handles specific GS1-128 Application Identifiers (AIs) for product
 *   identification (GTIN), weight (kg, lbs, oz), and various date fields
 * - Validates data to ensure it adheres to the GS1-128 standard
 * - Provides comparison functions for sorting extracted data
 * - Includes a general text field validation function for user input
 */

// GS1-128 barcode field handlers

/**
 * Parses the GTIN (Global Trade Item Number) from a GS1-128 barcode data field.
 *
 * @param {string} data - The raw data extracted from the GTIN field.
 * @param {object} scanner - The scanner object to store the parsed data.
 */
const gs1_gtin = function (data, scanner) {
  if (!/^[0-9]+$/.test(data)) {
    scanner.err = "Invalid GTIN"; // Set error message if GTIN is not numeric
  } else {
    scanner.gtin = parseInt(data); // Store parsed GTIN as an integer
  }
};

/**
 * Parses the weight from a GS1-128 barcode data field, handling different units
 * (kg, lbs, oz).
 *
 * @param {string} data - The raw data extracted from the weight field.
 * @param {object} scanner - The scanner object to store the parsed data.
 */
const gs1_kg = function (data, scanner) {
  if (!/^[0-9]+$/.test(data)) {
    scanner.err = "Invalid weight";
  } else if (data.charAt(0) != "0") {
    scanner.err = `Unsupported GS1-128 application identifier: 31${data.charAt(
      0
    )}`; // Check for valid AI (310-319)
  } else {
    scanner.unit = "kg";
    gs1_weight(data, scanner); // Call the common weight parsing function
  }
};

// Similar handlers for gs1_lbs and gs1_oz (with different AI checks)

/**
 * Common function to parse the weight value and decimal places from a GS1-128
 * weight field.
 *
 * @param {string} data - The raw data extracted from the weight field.
 * @param {object} scanner - The scanner object to store the parsed data.
 */
const gs1_weight = function (data, scanner) {
  const numDecimalPlaces = parseInt(data.substring(1, 2));
  if (numDecimalPlaces > 5) {
    scanner.err = "Invalid weight"; // Limit decimal places to 5
  } else {
    scanner.quantity =
      parseInt(data.substring(2, 8 - numDecimalPlaces)).toString() +
      "." +
      (numDecimalPlaces > 0 ? data.slice(-numDecimalPlaces) : "");
  }
};

const gs1_default = function (data, scanner) {
  // Placeholder handler for unsupported AIs
};

// Supported GS1-128 application identifiers
const GS1_128 = [
  { id: "01", length: 14, handler: gs1_gtin }, // GTIN
  // ... other AIs and handlers
];

// ... (Comparison functions for sorting data - compareName, compareCode, etc.)

// ... (TextField validation function - checkTextField)
