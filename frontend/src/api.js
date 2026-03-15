// API ベースURL（Vercel: 環境変数 VITE_API_URL、ローカル: .env に VITE_API_URL=http://localhost:3000）
export const API_BASE = import.meta.env.VITE_API_URL;

if (!API_BASE) {
  console.error("[api.js] VITE_API_URL が未設定です。.env に VITE_API_URL を設定してください。");
}
