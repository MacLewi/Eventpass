const express = require("express");
const router = express.Router();
const axios = require("axios");

// ================= GET ACCESS TOKEN =================
async function getAccessToken() {
    const auth = Buffer.from(
        process.env.MPESA_CONSUMER_KEY + ":" + process.env.MPESA_CONSUMER_SECRET
    ).toString("base64");

    const response = await axios.get(
        "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
        {
            headers: {
                Authorization: `Basic ${auth}`
            }
        }
    );

    return response.data.access_token;
}

// ================= STK PUSH =================
router.post("/stkpush", async (req, res) => {
    try {
        const { phone, amount } = req.body;

        const token = await getAccessToken();

        const timestamp = new Date()
            .toISOString()
            .replace(/[-:.TZ]/g, "")
            .slice(0, 14);

        const password = Buffer.from(
            process.env.MPESA_SHORTCODE +
            process.env.MPESA_PASSKEY +
            timestamp
        ).toString("base64");

        await axios.post(
            "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
            {
                BusinessShortCode: process.env.MPESA_SHORTCODE,
                Password: password,
                Timestamp: timestamp,
                TransactionType: "CustomerPayBillOnline",
                Amount: amount,
                PartyA: phone,
                PartyB: process.env.MPESA_SHORTCODE,
                PhoneNumber: phone,
                CallBackURL: process.env.CALLBACK_URL,
                AccountReference: "EventPass",
                TransactionDesc: "Ticket Payment"
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        res.json({ message: "📲 STK Push sent successfully" });

    } catch (error) {
        console.log(error.response?.data || error.message);
        res.status(500).json({ error: "❌ STK Push failed" });
    }
});

// ================= CALLBACK =================
router.post("/callback", async (req, res) => {
    console.log("📥 M-Pesa Callback:", JSON.stringify(req.body, null, 2));

    // TODO: Save payment + generate QR here

    res.json({ message: "Callback received" });
});

module.exports = router;