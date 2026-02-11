const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Chỉ giữ lại Khóa bí mật Zalo
const ZALO_SECRET_KEY = "08vwXY6680h4P42l7qC8"; 

// API duy nhất: Chỉ dùng để giải mã số điện thoại
app.post('/get-phone', async (req, res) => {
    try {
        const response = await axios.get("https://graph.zalo.me/v2.0/me/info", {
            headers: {
                "access_token": req.body.access_token,
                "code": req.body.code,
                "secret_key": ZALO_SECRET_KEY
            }
        });
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: "Zalo API Error", message: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));