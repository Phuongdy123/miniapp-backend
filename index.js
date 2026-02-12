const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();

// Render/Ngrok sẽ tự động cấp cổng hoặc dùng 3000
const PORT = process.env.PORT || 3000; 

// 1. Cấu hình CORS
app.use(cors());

// 2. Cấu hình đọc JSON
app.use(express.json());

// --- SỬA LỖI TẠI ĐÂY ---
// Điền trực tiếp khóa bí mật vào để chạy được ngay trên máy tính
const ZALO_SECRET_KEY = "08vwXY668Oh4P42I7qC8";

// API lấy số điện thoại
app.post('/get-phone', async (req, res) => {
    // Lấy accessToken và code từ phía Mini App gửi lên
    const { accessToken, code } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!accessToken || !code) {
        return res.status(400).json({ 
            success: false, 
            message: "Thiếu accessToken hoặc code (token số điện thoại)" 
        });
    }

    try {
        console.log("Đang gọi Zalo với Secret Key:", ZALO_SECRET_KEY); // Log để kiểm tra

        // Gọi sang Zalo Server
        const response = await axios.get("https://graph.zalo.me/v2.0/me/info", {
            headers: {
                "access_token": accessToken,
                "code": code,
                "secret_key": ZALO_SECRET_KEY, // Khóa này giờ đã có giá trị đúng
                // Fake IP
                "X-Forwarded-For": "14.226.0.1",
                "X-Real-IP": "14.226.0.1",
                "Client-IP": "14.226.0.1"
            }
        });

        const { data, error, message } = response.data;

        if (error === 0) {
            console.log("✅ Lấy SDT thành công:", data.number);
            return res.json({
                success: true,
                phoneNumber: data.number
            });
        } else {
            console.error("❌ Lỗi từ Zalo:", message);
            return res.status(400).json({
                success: false,
                message: message || "Lỗi secret_key hoặc token"
            });
        }

    } catch (err) {
        console.error("🔥 Lỗi Server:", err.message);
        if (err.response) {
            return res.status(err.response.status).json(err.response.data);
        }
        return res.status(500).json({ 
            success: false, 
            message: "Lỗi server nội bộ", 
            error: err.message 
        });
    }
});

// Khởi động server
app.listen(PORT, () => {
    console.log(`Server đang chạy trên cổng ${PORT}`);
});