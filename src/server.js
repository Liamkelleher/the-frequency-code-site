const express = require("express");
const Stripe = require("stripe");
const nodemailer = require("nodemailer");
const path = require("path");
require("dotenv").config();

const app = express();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

// === Serve static files ===
app.use(express.static(path.join(__dirname, "public")));

// === Use express.json except for Stripe Webhook ===
app.use((req, res, next) => {
  if (req.originalUrl === "/webhook") {
    next();
  } else {
    express.json()(req, res, next);
  }
});

// === Create Stripe Checkout Session ===
app.post("/create-checkout-session", async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: "The Frequency Code Bundle" },
            unit_amount: 1499,
          },
          quantity: 1,
        },
      ],
      success_url: `www.thefrequencycode.ca/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `www.thefrequencycode.ca/`,
    });

    res.json({ id: session.id });
  } catch (err) {
    console.error("Checkout Error:", err);
    res.status(500).send("Failed to create Stripe session.");
  }
});

// === Stripe Webhook ===
app.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    let event;

    try {
      if (endpointSecret) {
        const signature = req.headers["stripe-signature"];
        event = stripe.webhooks.constructEvent(
          req.body,
          signature,
          endpointSecret
        );
      } else {
        event = JSON.parse(req.body);
      }
    } catch (err) {
      console.error("Webhook signature error:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const email = session.customer_details.email;

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      await transporter.sendMail({
        from: `"The Frequency Code - LK Socials" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "📚 Your Frequency Code Bundle",
        html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9;">
          <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; padding: 30px; box-shadow: 0 0 10px rgba(0,0,0,0.05);">
            <h2 style="color: #222;">✅ Thank you for your purchase!</h2>
            <p style="font-size: 16px; color: #555;">
              Your download bundle is ready. Click the links below to access your content:
            </p>
            <ul style="padding-left: 20px; margin-top: 20px; margin-bottom: 20px;">
              <li><a href="https://drive.google.com/file/d/1qnwV7PFTbk0eQSJqBSKkYMoHjEGT2FN1/view" target="_blank">📘 The Frequency Code</a></li>
              <li><a href="https://drive.google.com/file/d/12XFlVz0eSKpcskzlQ19r7QUg98gJELVS/view" target="_blank">📜 Historical Facts That Confirm Everything</a></li>
              <li><a href="https://drive.google.com/file/d/1fTLobVb3mvKZdO7y4Vg2QYbsfEysF-GB/view" target="_blank">👽 The 7 Most Shocking UFO Cases in History</a></li>
            </ul>
            <p style="font-size: 14px; color: #666;">You can keep these files forever — no expiry, no DRM.</p>
            <hr style="margin: 30px 0;" />
            <p style="font-size: 13px; color: #999;">Need help? Just reply to this email or contact us at <strong>lksocialgroup@gmail.com</strong></p>
          </div>
        </div>
        `,
      });

      console.log("✅ Email sent.");
    } else {
      console.log(`Unhandled event type: ${event.type}`);
    }

    res.status(200).send("Received");
  }
);

// === Route fallback ===
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/success", (req, res) => {
  res.sendFile(path.join(__dirname, "success.html"));
});

// === Start Server ===
const PORT = process.env.PORT || 4242;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
