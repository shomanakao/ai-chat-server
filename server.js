import { GoogleGenAI } from '@google/genai';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

app.post('/chat', async (req, res) => {
  try {
    const { message, rules } = req.body;

    // =========================
    // 開発用：ダミー返信モード
    // APIを使いたくない時は、この下を有効にする
    // =========================
    /*
    console.log("リクエストが来た:", message);
    console.log("ダミーモード動作中");

    return res.json({
      reply: `ダミー返信です。\n発言: ${message}\nルール文字数: ${rules.length}`,
    });
    */

    // =========================
    // 本番用：Gemini返信モード
    // =========================

    const prompt = `
      あなたは会話ルールに従って返答するAIです。

【会話ルール】
${rules}

【ユーザーの発言】
${message}

上の会話ルールを必ず守って、日本語で返答してください。
`;
    console.log("使用モデル:", "gemini-2.5-flash-lite");

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-lite',
      contents: prompt,
    });

    const reply =
      typeof response.text === 'function'
        ? response.text()
        : response.text;

    res.json({
      reply: reply || '返答が空でした',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'AI返信の生成に失敗しました',
    });
  }
});

app.listen(3000, () => {
  console.log('AI chat server is running on http://localhost:3000');
});