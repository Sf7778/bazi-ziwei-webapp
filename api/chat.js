// 完整前後端版本：使用 Vercel Serverless Functions 安全呼叫 OpenAI API

// ✅ 本程式需部署在 Vercel，並在 Vercel 設定 OPENAI_API_KEY 環境變數

// 📁 結構說明：
// - index.html 是前端表單頁面
// - /api/chat.js 是後端 proxy API，接收使用者輸入並呼叫 OpenAI

// ✅ 將此專案推到 GitHub 後，在 Vercel Import 即可部署

// 🔐 不用再把 API 金鑰寫在前端！

// -------- index.html --------

<!DOCTYPE html>
<html lang="zh-Hant">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>八字與紫微算命</title>
</head>
<body>
  <h1>輸入你的生辰</h1>
  <form id="baziForm">
    <label>出生日期：</label>
    <input type="date" id="birthDate" required><br><br>

    <label>出生時間（24小時制）：</label>
    <input type="time" id="birthTime" required><br><br>

    <label>出生城市：</label>
    <input type="text" id="birthPlace" value="台北市" required><br><br>

    <button type="submit">開始算命</button>
  </form>

  <h2>命理解說：</h2>
  <div id="result"></div>

  <script>
    const form = document.getElementById('baziForm');
    const resultDiv = document.getElementById('result');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const birthDate = document.getElementById('birthDate').value;
      const birthTime = document.getElementById('birthTime').value;
      const birthPlace = document.getElementById('birthPlace').value;

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ birthDate, birthTime, birthPlace })
      });

      if (response.ok) {
        const data = await response.json();
        resultDiv.innerText = data.result;
      } else {
        resultDiv.innerText = "發生錯誤，請稍後再試。";
      }
    });
  </script>
</body>
</html>

// -------- api/chat.js --------

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
