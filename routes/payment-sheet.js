const express = require("express");
const router = express.Router();

const stripe = require("stripe")(process.env.STRIPE_API_SECRET);
// This example sets up an endpoint using the Express framework.
// Watch this video to get started: https://youtu.be/rPR2aJ6XnAc.

router.post("/payment-sheet", async (req, res) => {
  // Use an existing Customer ID if this is a returning customer.
  const customer = await stripe.customers.create();
  const ephemeralKey = await stripe.ephemeralKeys.create(
    { customer: customer.id },
    { apiVersion: "2022-11-15" }
  );
  const paymentIntent = await stripe.paymentIntents.create({
    amount: 1099,
    currency: "eur",
    customer: customer.id,
    automatic_payment_methods: {
      enabled: true,
    },
  });

  res.json({
    paymentIntent: paymentIntent.client_secret,
    ephemeralKey: ephemeralKey.secret,
    customer: customer.id,
    publishableKey:
      "pk_test_51MeGHPIr9kBL5nQG96njcyR7gWOvXkBglWC0cE2s1SOXfM3SeBMrQEPlGHhi84pCCwor3IAXIdJpeebi4w5y2HPr00ixVT2irf",
  });
});

module.exports = router;
