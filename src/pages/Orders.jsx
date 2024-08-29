import React, { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import axios from "axios";
import OrdersTable from "../components/OrdersTable";
import AddOrderForm from "../components/AddOrderForm";
import UpdateOrderStatusForm from "../components/UpdateOrderStatusForm";
import ManageCustomerForm from "../components/ManageCustomerForm";

// Define a structure for initial state of orders and customers
const initialState = {
  orders: [],
  customers: {},
};

function Orders() {
  const [state, setState] = useState(initialState);
  const [newOrder, setNewOrder] = useState({
    cuts: "",
    quantity: 0,
    customerId: "",
  });
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [customer, setCustomer] = useState({ id: "", name: "", email: "" });
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [orderItems, setOrderItems] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      const ordersRes = await axios.get("http://localhost:3002/api/orders");
      const customersRes = await axios.get(
        "http://localhost:3002/api/customers"
      );
      const orderItemsRes = await axios.get(
        "http://localhost:3002/api/orderItems"
      );
      setOrders(ordersRes.data);
      setCustomers(customersRes.data);
      setOrderItems(orderItemsRes.data);
    };
    fetchOrders();
  }, []);

  // Function to add a new order
  const addOrder = (order) => {
    const newOrder = { ...order, status: "pending" }; // New orders start as 'pending'
    setState((prevState) => ({
      ...prevState,
      orders: [...prevState.orders, newOrder],
    }));
  };

  // Function to update order status
  const updateOrderStatus = (orderId, status) => {
    const updatedOrders = state.orders.map((order) =>
      order.id === orderId ? { ...order, status } : order
    );
    setState((prevState) => ({
      ...prevState,
      orders: updatedOrders,
    }));
  };

  // Function to add or update customer information
  const upsertCustomer = (customer) => {
    setState((prevState) => ({
      ...prevState,
      customers: {
        ...prevState.customers,
        [customer.id]: customer,
      },
    }));
  };

  // Function to find customer by ID
  const findCustomerById = (customerId) => {
    return customers.find((customer) => customer.id === customerId) || {};
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewOrder((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form submission for new order
  const handleAddOrder = (e) => {
    e.preventDefault();
    addOrder({ ...newOrder, id: Date.now() }); // Assuming a temporary ID generation
    setNewOrder({ cuts: "", quantity: 0, customerId: "" }); // Reset form
  };

  // Handle status update form submission
  const handleStatusUpdate = (e) => {
    e.preventDefault();
    updateOrderStatus(selectedOrderId, newStatus);
  };

  // Handle customer input changes
  const handleCustomerInputChange = (e) => {
    const { name, value } = e.target;
    setCustomer((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form submission for new or updated customer
  const handleCustomerSubmit = (e) => {
    e.preventDefault();
    upsertCustomer(customer);
    setCustomer({ id: "", name: "", email: "" }); // Reset customer form
  };

  return (
    <Box sx={{ maxWidth: "100%", m: "auto", p: 2 }}>
      <Typography variant="h4" sx={{ mb: 4, textAlign: "center" }}>
        Orders Management
      </Typography>

      <OrdersTable
        orders={orders}
        findCustomerById={findCustomerById}
        orderItems={orderItems}
      />
      <AddOrderForm
        newOrder={newOrder}
        handleInputChange={handleInputChange}
        handleAddOrder={handleAddOrder}
      />
      <UpdateOrderStatusForm
        selectedOrderId={selectedOrderId}
        setSelectedOrderId={setSelectedOrderId}
        newStatus={newStatus}
        setNewStatus={setNewStatus}
        orders={orders}
        handleStatusUpdate={handleStatusUpdate}
      />
      <ManageCustomerForm
        customer={customer}
        handleCustomerInputChange={handleCustomerInputChange}
        handleCustomerSubmit={handleCustomerSubmit}
      />
    </Box>
  );
}

export default Orders;
