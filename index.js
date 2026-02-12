const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();

// 1. Cấu hình CORS và JSON
app.use(cors());
app.use(express.json());

// 2. Khóa bí mật (Khuyên dùng biến môi trường trên Vercel Dashboard)
const ZALO_SECRET_KEY = process.env.ZALO_SECRET_KEY || "08vwXY668Oh4P42I7qC8";

// 3. API lấy số điện thoại
app.post('/get-phone', async (req, res) => {
    const { accessToken, code } = req.body;

    if (!accessToken || !code) {
        return res.status(400).json({ 
            success: false, 
            message: "Thiếu accessToken hoặc code" 
        });
    }

    try {
        console.log("🚀 Đang thực hiện giải mã SĐT trên Vercel...");

        const response = await axios.get("https://graph.zalo.me/v2.0/me/info", {
            headers: {
                "access_token": accessToken,
                "code": code,
                "secret_key": ZALO_SECRET_KEY,
                // BẮT BUỘC: Giả lập IP Việt Nam để vượt qua rào cản IP nước ngoài của Vercel
                "X-Forwarded-For": "14.226.0.1", 
                "X-Real-IP": "14.226.0.1",
                "Client-IP": "14.226.0.1"
            }
        });

        const { data, error, message } = response.data;

        if (error === 0) {
            return res.json({
                success: true,
                phoneNumber: data.number
            });
        } else {
            return res.status(400).json({
                success: false,
                message: message || "Lỗi từ phía Zalo"
            });
        }

    } catch (err) {
        console.error("🔥 Lỗi Serverless:", err.message);
        return res.status(500).json({ 
            success: false, 
            message: "Lỗi server nội bộ", 
            error: err.message 
        });
    }
});

// THAY THẾ app.listen bằng module.exports
module.exports = app;