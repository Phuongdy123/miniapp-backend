const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000; 

app.use(cors());
app.use(express.json());

// Khuyên dùng biến môi trường: process.env.ZALO_SECRET_KEY
// Neu chay truc tiep de test, hay kiem tra ky chuoi duoi day:
const ZALO_SECRET_KEY = "08vwXY668Oh4P42I7qC8"; 

app.post('/get-phone', async (req, res) => {
    const { accessToken, code } = req.body;

    if (!accessToken || !code) {
        return res.status(400).json({ success: false, message: "Thiếu dữ liệu" });
    }

    try {
        const response = await axios.get("https://graph.zalo.me/v2.0/me/info", {
            headers: {
                "access_token": accessToken,
                "code": code,
                "secret_key": ZALO_SECRET_KEY
                // Khi chay tai VPS Viet Nam, khong can fake IP bang X-Forwarded-For
            }
        });

        const { data, error, message } = response.data;

        if (error === 0) {
            return res.json({ success: true, phoneNumber: data.number });
        } else {
            // In ra loi chi tiet de kiem tra
            console.error("❌ Zalo API Error:", message);
            return res.status(400).json({ success: false, message: message });
        }
    } catch (err) {
        console.error("🔥 Server Error:", err.message);
        return res.status(500).json({ success: false, error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server dang chay tai PORT ${PORT}`);
});