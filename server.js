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

app.post('/task-advice', async (req, res) => {
  try {
    const { tasks, settings } = req.body;

    // =========================
    // 開発用：タスク提案ダミーモード
    // APIを使いたくない時は有効にする
    // =========================
    /*
    console.log("受け取ったタスク:", tasks);
    console.log("受け取った設定:", settings);

    return res.json({
      reply: `【確認用】
    受け取ったタスク:
    ${tasks}

    受け取った設定:
    重視: ${settings?.priorities?.join(', ') || 'なし'}
    作業スタイル: ${settings?.workStyle || 'なし'}
    状態: ${settings?.condition || 'なし'}
    メモ: ${settings?.memo || 'なし'}
    `,
    });*/   

    const prompt = `
    あなたはタスク管理専門AIです。

    以下の未完了タスクの中から、今やるべきタスクを優先度順に3つ選んでください。

    【判断基準】
    - 期限が近いものを優先
    - すぐ終わりそうなものも考慮
    - 重要そうなものを優先
    - 回答は理由も加えて日本語で短く

    【ユーザー設定】
    重視すること: ${settings?.priorities?.join(', ') || 'なし'}
    作業スタイル: ${settings?.workStyle || 'どちらでも'}
    現在の状態: ${settings?.condition || '普通'}
    自由記述: ${settings?.memo || 'なし'}

    【未完了タスク】
    ${tasks}

    【回答形式】
    🥇 1位: ○○
    理由: ○○

    🥈 2位: ○○
    理由: ○○

    🥉 3位: ○○
    理由: ○○
    `;

    console.log("task-advice 使用モデル:", "gemini-2.5-flash-lite");

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
      error: 'タスク提案の生成に失敗しました',
    });
  }
});

app.listen(3000, () => {
  console.log('AI chat server is running on http://localhost:3000');
});