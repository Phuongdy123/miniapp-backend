const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const ZALO_SECRET_KEY = process.env.ZALO_SECRET_KEY || "08vwXY668Oh4P42I7qC8";

app.post('/get-phone', async (req, res) => {
    const { accessToken, code } = req.body;

    if (!accessToken || !code) {
        return res.status(400).json({ success: false, message: "Thiếu tham số kết nối" });
    }

    try {
        // IP Việt Nam mẫu (Viettel) để giả lập
        const vietnamIP = "14.226.0.1"; 

        const response = await axios.get("https://graph.zalo.me/v2.0/me/info", {
            headers: {
                "access_token": accessToken,
                "code": code,
                "secret_key": ZALO_SECRET_KEY,
                // GIẢ LẬP IP VIỆT NAM ĐỂ VƯỢT RÀO
                "X-Forwarded-For": vietnamIP,
                "X-Real-IP": vietnamIP,
                "Client-IP": vietnamIP,
                "True-Client-IP": vietnamIP,
                "Forwarded": `for=${vietnamIP};proto=https`
            }
        });

        const { data, error, message } = response.data;

        if (error === 0) {
            console.log("✅ Lấy SĐT thành công qua Vercel");
            return res.json({ success: true, phoneNumber: data.number });
        } else {
            console.error("❌ Lỗi Zalo:", message);
            return res.status(400).json({ success: false, message: message });
        }
    } catch (err) {
        console.error("🔥 Lỗi Vercel:", err.message);
        return res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = app;