import { useState, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import { GoogleMap, DirectionsRenderer, useJsApiLoader } from '@react-google-maps/api';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

// 地図の大きさ設定
const containerStyle = { width: '100%', height: '400px', marginTop: '20px', borderRadius: '10px' };
// 初期表示の中心（京都駅付近）
const center = { lat: 34.9858, lng: 135.7588 };

export default function App() {
  const [plan, setPlan] = useState("");         // プランのテキスト入力
  const [date, setDate] = useState("");         // 日付入力
  const [time, setTime] = useState("");         // 時間入力
  const [stayType, setStayType] = useState("日帰り"); // 日帰り/宿泊日数自由入力
  const [result, setResult] = useState("");     // AIからの結果
  const [directions, setDirections] = useState(null);
  const [loading, setLoading] = useState(false);

  // Google Mapsのロード
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: ['places']
  });

  // AIの回答から Locations を抽出してルート計算
  const calculateRoute = useCallback((text) => {
    if (!isLoaded) return;

    const match = text.match(/Locations:\s*\[(.*?)\]/);
    if (!match) return;

    const locations = match[1].split(',').map(s => s.trim());
    if (locations.length < 2) return;

    const directionsService = new window.google.maps.DirectionsService();
    
    directionsService.route(
      {
        origin: locations[0],
        destination: locations[locations.length - 1],
        waypoints: locations.slice(1, -1).map(loc => ({ location: loc, stopover: true })),
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === 'OK') {
          setDirections(result);
        } else {
          console.error("ルート検索に失敗しました:", status);
        }
      }
    );
  }, [isLoaded]);

  // プラン生成ボタン
  const generatePlan = async () => {
    if (!plan || !date || !time || !stayType) {
      alert("場所・日付・時間・宿泊日数を入力してください");
      return;
    }

    try {
      setLoading(true);
      setDirections(null);
      setResult("");

      const res = await fetch("http://localhost:3000/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: plan, date, time, stayType }) // ⭐ stayTypeを追加
      });
      const data = await res.json();
      setResult(data.plan);

      calculateRoute(data.plan);
    } catch (error) {
      console.error(error);
      setResult("エラーが発生しました。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "40px", maxWidth: "800px", margin: "0 auto" }}>
      <h1>AI旅行プランナー 🗺️</h1>

      <div style={{ marginBottom: "20px", display: "flex", flexWrap: "wrap", gap: "10px" }}>
        {/* 場所入力 */}
        <input
          value={plan}
          onChange={(e) => setPlan(e.target.value)}
          placeholder="例：京都1日旅"
          style={{ flex: "1 1 200px", padding: "10px" }}
        />

        {/* 日付入力 */}
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          style={{ flex: "0 0 150px", padding: "10px" }}
        />

        {/* 時間入力 */}
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          style={{ flex: "0 0 120px", padding: "10px" }}
        />

        {/* 宿泊日数入力（自由入力） */}
        <input
          type="text"
          value={stayType}
          onChange={(e) => setStayType(e.target.value)}
          placeholder="例: 日帰り, 1泊, 5泊"
          style={{ flex: "0 0 120px", padding: "10px" }}
        />

        <button onClick={generatePlan} disabled={loading} style={{ padding: "10px 20px" }}>
          {loading ? "生成中..." : "プラン生成"}
        </button>
      </div>

      {/* 地図表示 */}
      {isLoaded ? (
        <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={13}>
          {directions && <DirectionsRenderer directions={directions} />}
        </GoogleMap>
      ) : (
        <div>地図を読み込み中...</div>
      )}

      <hr />

      {/* AI結果表示 */}
      <div style={{ marginTop: "20px" }}>
        <ReactMarkdown>{result}</ReactMarkdown>
      </div>
    </div>
  );
}