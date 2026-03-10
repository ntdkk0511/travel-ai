import { useState } from "react";
import ReactMarkdown from "react-markdown";

// 関数名の前に 'export default' を直接つけるのが一番確実です！
export default function App() {
  const [plan, setPlan] = useState("");
  const [result, setResult] = useState("");

  const generatePlan = async () => {
    try {
      setResult("生成中..."); // 進捗をユーザーに見せる

      const res = await fetch("http://localhost:3000/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          prompt: plan
        })
      });

      if (!res.ok) {
        throw new Error(`サーバーエラー: ${res.status}`);
      }

      const data = await res.json();
      console.log("届いたデータ:", data); // デバッグ用ログ

      // バックエンドのキー名 'plan' に合わせる
      setResult(data.plan || "結果が空でした");

    } catch (error) {
      console.error("エラー詳細:", error);
      setResult("エラーが発生しました: " + error.message);
    }
  };

  return (
    <div style={{ padding: "40px" }}>
      <h1>AI旅行プラン生成</h1>

      <input
        value={plan}
        onChange={(e) => setPlan(e.target.value)}
        placeholder="例：京都1日旅"
        style={{ width: "300px", padding: "10px", marginRight: "10px" }}
      />

      <button onClick={generatePlan} style={{ padding: "10px 20px" }}>
        プラン生成
      </button>

      <hr />

      <div style={{ marginTop: "20px", background: "#f9f9f9", padding: "20px", borderRadius: "8px" }}>
        {/* result がある時だけ ReactMarkdown を表示 */}
        {result ? (
          <ReactMarkdown>{result}</ReactMarkdown>
        ) : (
          <p style={{ color: "#888" }}>プランを入力してボタンを押してください。</p>
        )}
      </div>
    </div>
  );
}