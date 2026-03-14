# AI 旅行プランナー 🗺️

Gemini AI を使って旅行プランを自動生成するWebアプリ。

## 構成

| ディレクトリ | 技術 | ポート |
|---|---|---|
| `frontend/` | React + Vite | 5173 |
| `backend/` | Express (ESM) | 3000 |

## 環境構築

### 前提条件

- Node.js v24 以上
- npm v11 以上

### 1. バックエンド

```bash
cd backend
npm install
```

`.env` を作成し、以下を設定:

```
GEMINI_API_KEY=your_gemini_api_key
```

Gemini API キーは [Google AI Studio](https://aistudio.google.com/apikey) から取得できます。

### 2. フロントエンド

```bash
cd frontend
npm install
```

`.env` を作成し、以下を設定:

```
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

Google Maps API キーは [Google Cloud Console](https://console.cloud.google.com/) から取得し、以下のAPIを有効化してください:
- Maps JavaScript API
- Directions API

## 起動方法

ターミナルを2つ開いて、それぞれ実行:

```bash
# バックエンド
cd backend
node server.js
```

```bash
# フロントエンド
cd frontend
npm run dev
```

ブラウザで http://localhost:5173/ を開く。

## テスト

```bash
cd backend
npm test
```
