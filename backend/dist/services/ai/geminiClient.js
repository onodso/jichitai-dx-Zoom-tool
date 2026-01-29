"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeminiClient = void 0;
const generative_ai_1 = require("@google/generative-ai");
/**
 * Google Gemini Generative AI APIとの連携を行うクライアントクラス。
 * 環境変数 GEMINI_API_KEY を使用して認証を行う。
 */
class GeminiClient {
    constructor() {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.warn('GEMINI_API_KEY is not set. AI generation will fail.');
        }
        this.genAI = new generative_ai_1.GoogleGenerativeAI(apiKey || '');
        this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
    }
    /**
     * 指定されたプロンプトに基づいてテキストを生成する。
     * @param prompt AIへの入力プロンプト
     * @returns 生成されたテキスト
     */
    async generateText(prompt) {
        try {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        }
        catch (error) {
            console.error('Gemini API Error:', error);
            throw new Error('Failed to generate content from AI');
        }
    }
}
exports.GeminiClient = GeminiClient;
