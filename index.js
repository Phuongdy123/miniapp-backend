const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();

// --- SỬA LỖI QUAN TRỌNG ---
// Render sẽ tự động cấp cổng qua process.env.PORT
// Nếu chạy máy cá nhân thì dùng cổng 3000
const PORT = process.env.PORT || 3000; 

// 1. Cấu hình CORS: Cho phép Mini App gọi vào Server này
app.use(cors());

// 2. Cấu hình để đọc body JSON gửi lên
app.use(express.json());

// 3. Khóa bí mật (Lấy từ hình ảnh Dashboard của bạn)
// CẢNH BÁO: Code này để chạy ngay. Sau này nên đưa vào biến môi trường (.env) để bảo mật hơn.
const ZALO_SECRET_KEY = process.env.ZALO_SECRET_KEY;
// API để Mini App gọi vào lấy số điện thoại
app.post('/get-phone', async (req, res) => {
    const { accessToken, code } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!accessToken || !code) {
        return res.status(400).json({ 
            success: false, 
            message: "Thiếu accessToken hoặc code (token số điện thoại)" 
        });
    }

    try {
        // Gọi sang Zalo Server
        const response = await axios.get("https://graph.zalo.me/v2.0/me/info", {
            headers: {
                "access_token": accessToken,
                "code": code,
                "secret_key": ZALO_SECRET_KEY,
                // Giữ nguyên logic giả lập IP Việt Nam để tránh bị Zalo chặn IP nước ngoài (Render server)
                "X-Forwarded-For": "14.226.0.1",
                "X-Real-IP": "14.226.0.1",
                "Client-IP": "14.226.0.1"
            }
        });

        // Xử lý kết quả trả về từ Zalo
        const { data, error, message } = response.data;

        if (error === 0) {
            // Thành công: Zalo trả về số điện thoại
            // data.number ví dụ: 849123456789
            console.log("Lấy SDT thành công:", data.number);
            return res.json({
                success: true,
                phoneNumber: data.number
            });
        } else {
            // Thất bại: Token hết hạn hoặc sai
            console.error("Lỗi từ Zalo:", message);
            return res.status(400).json({
                success: false,
                message: message || "Không lấy được số điện thoại từ Zalo"
            });
        }

    } catch (err) {
        // Lỗi hệ thống hoặc lỗi mạng
        console.error("Lỗi Server:", err.message);
        
        // Kiểm tra xem có response từ Zalo trả về lỗi HTTP không
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