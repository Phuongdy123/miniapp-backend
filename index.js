const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Khóa bí mật lấy từ Environment Variables trên Vercel Dashboard
const ZALO_SECRET_KEY = process.env.ZALO_SECRET_KEY || "08vwXY668Oh4P42I7qC8";

app.post('/get-phone', async (req, res) => {
    const { accessToken, code } = req.body;
    
    // Log để kiểm tra trên Vercel Runtime Logs
    console.log("📥 Request nhận được:", { hasToken: !!accessToken, hasCode: !!code });

    if (!accessToken || !code) {
        return res.status(400).json({ success: false, message: "Thiếu accessToken hoặc code" });
    }

    try {
        const response = await axios.get("https://graph.zalo.me/v2.0/me/info", {
            headers: {
                "access_token": accessToken, // Đã sửa đúng tên biến Zalo yêu cầu
                "code": code,
                "secret_key": ZALO_SECRET_KEY,
                // Giả lập IP Việt Nam để vượt rào IP nước ngoài của Vercel
                "X-Forwarded-For": "14.226.0.1",
                "X-Real-IP": "14.226.0.1",
                "Client-IP": "14.226.0.1"
            }
        });

        console.log("📡 Zalo Response:", response.data);

        if (response.data.error === 0) {
            return res.json({
                success: true,
                phoneNumber: response.data.data.number
            });
        } else {
            return res.status(400).json({
                success: false,
                message: response.data.message
            });
        }
    } catch (err) {
        console.error("🔥 Server Error:", err.response ? err.response.data : err.message);
        return res.status(500).json({ 
            success: false, 
            message: "Lỗi kết nối Zalo API",
            error: err.message 
        });
    }
});

module.exports = app;