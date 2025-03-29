export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { birthDate, birthTime, birthPlace } = req.body;
  const prompt = `請用八字與紫微斗數分析以下人的命理：\n生日：${birthDate} ${birthTime}，出生地：${birthPlace}。請列出八字四柱、紫微命宮主星與性格描述、五行強弱、建議的事業方向，500字以內。`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "你是資深命理老師，擅長八字與紫微分析" },
          { role: "user", content: prompt }
        ]
      })
    });

    const data = await response.json();
    const resultText = data.choices?.[0]?.message?.content || '無法解析回應';
    res.status(200).json({ result: resultText });
  } catch (error) {
    res.status(500).json({ error: '伺服器錯誤' });
  }
}
