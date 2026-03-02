const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, './')));

app.post('/api/analyze', async (req, res) => {
    const { text } = req.body;
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: "GROQ_API_KEY is not set in environment variables." });
    }

    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [
                    {
                        role: "system",
                        content: `أنت خبير في كشف البروباجندا والتضليل الإعلامي. حلل النص العربي المقدم بعمق. 
                        يجب أن يتضمن ردك:
                        1. نسبة مئوية للتضليل (0-100).
                        2. شرح للتقنيات المستخدمة (مثل: الشيطنة، العاطفة المفرطة، أنصاف الحقائق).
                        3. النتيجة النهائية للجمهور.
                        اجعل التنسيق بصيغة JSON كالتالي:
                        {"score": 80, "status": "نص متحيز جداً", "reasoning": "نص طويل يشرح الأسباب..."}`
                    },
                    { role: "user", content: text }
                ],
                response_format: { type: "json_object" }
            })
        });

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to communicate with Groq API." });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
