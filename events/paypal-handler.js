const axios = require("axios");

const PAYPAL_CLIENT_ID = "YOUR_SANDBOX_CLIENT_ID";
const PAYPAL_SECRET = "YOUR_SANDBOX_SECRET";
const PAYPAL_BASE_URL = "https://api-m.sandbox.paypal.com"; // Sandbox mode

// Function to create a PayPal order
async function createInvoice(interaction, amount, description) {
  try {
    const response = await axios.post(
      `${PAYPAL_BASE_URL}/v2/checkout/orders`,
      {
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: "USD",
              value: amount.toFixed(2),
            },
            description: description,
          },
        ],
      },
      {
        auth: {
          username: PAYPAL_CLIENT_ID,
          password: PAYPAL_SECRET,
        },
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return response.data.id; // Return the PayPal Order ID
  } catch (error) {
    console.error("PayPal Error:", error.response?.data || error.message);
    throw new Error("Failed to create PayPal order.");
  }
}

// Function to check the payment status
async function getInvoice(orderId) {
  try {
    const response = await axios.get(
      `${PAYPAL_BASE_URL}/v2/checkout/orders/${orderId}`,
      {
        auth: {
          username: PAYPAL_CLIENT_ID,
          password: PAYPAL_SECRET,
        },
      }
    );

    return response.data; // Return order details
  } catch (error) {
    console.error("PayPal Error:", error.response?.data || error.message);
    return null;
  }
}

module.exports = { createInvoice, getInvoice };
