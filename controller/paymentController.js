const stripe = require('stripe')(process.env.STRIPE_SECRET);

exports.sendStripeKey = (req, res) => {
  res.status(200).json({
    stripeKey: process.env.STRIPE_KEY
    });
}

exports.capturePayment = async (req, res) => {

    const paymentIntent = await stripe.paymentIntents.create({
        amount: req.body.amount,
        currency: 'inr',
        // automatic_payment_methods: {enabled: true},
      });

    res.status(200).json({
        success: true,
        clientSecret: paymentIntent.client_secret
    });

}