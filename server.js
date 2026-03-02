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
                        content: `أنت خبير محترف في كشف البروباجندا والتضليل الإعلامي. حلل النص العربي المقدم بعمق.
                        
                        يجب أن تتبع هذه القواعد بدقة:
                        1. استخدم اللغة العربية الفصحى فقط.
                        2. يمنع تماماً استخدام أي حروف من لغات أخرى (مثل الحروف السيريلية أو اللاتينية).
                        3. تأكد من صحة الإملاء (خاصة التاء المربوطة والهمزات).
                        4. الرد يجب أن يكون بتنسيق JSON حصراً.

                        يجب أن يتضمن الرد:
                        - score: نسبة مئوية (0-100).
                        - status: وصف مختصر للحالة.
                        - reasoning: تحليل تفصيلي ومنطقي للأساليب المكتشفة.`
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
