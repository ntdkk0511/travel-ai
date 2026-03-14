import { useState, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import { GoogleMap, DirectionsRenderer, useJsApiLoader } from '@react-google-maps/api';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

// 地図の大きさ設定
const containerStyle = { width: '100%', height: '400px', marginTop: '20px', borderRadius: '10px' };
const center = { lat: 34.9858, lng: 135.7588 };

export default function App() {
  const [plan, setPlan] = useState("");            // プラン入力
  const [time, setTime] = useState("");            // 出発時間
  const [stayType, setStayType] = useState("日帰り"); // 日帰り/宿泊
  const [dateRange, setDateRange] = useState({ start: "", end: "" }); // 出発日〜最終日
  const [result, setResult] = useState("");        // AI結果
  const [directions, setDirections] = useState(null);
  const [loading, setLoading] = useState(false);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: ['places']
  });

  const calculateRoute = useCallback((text) => {
    if (!isLoaded) return;
    const match = text.match(/Locations:\s*\[(.*?)\]/);
    if (!match) return;
    const locations = match[1].split(',').map(s => s.trim());
    if (locations.length < 2) return;

    const directionsService = new window.google.maps.DirectionsService();
    directionsService.route({
      origin: locations[0],
      destination: locations[locations.length - 1],
      waypoints: locations.slice(1, -1).map(loc => ({ location: loc, stopover: true })),
      travelMode: window.google.maps.TravelMode.DRIVING,
    }, (result, status) => {
      if (status === 'OK') setDirections(result);
      else console.error("ルート検索に失敗しました:", status);
    });
  }, [isLoaded]);

  const generatePlan = async () => {
    if (!plan || !time || !dateRange.start || (stayType === "宿泊" && !dateRange.end)) {
      alert("プラン・日付・時間を入力してください");
      return;
    }

    try {
      setLoading(true);
      setDirections(null);
      setResult("");

      // 日帰りなら終了日は出発日と同じ
      const startDate = dateRange.start;
      const endDate = stayType === "日帰り" ? dateRange.start : dateRange.end;

      const res = await fetch("http://localhost:3000/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: plan, startDate, endDate, time, stayType })
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
        <input
          value={plan}
          onChange={(e) => setPlan(e.target.value)}
          placeholder="例：京都旅行"
          style={{ flex: "1 1 200px", padding: "10px" }}
        />

        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          style={{ flex: "0 0 120px", padding: "10px" }}
        />

        <select
          value={stayType}
          onChange={(e) => setStayType(e.target.value)}
          style={{ flex: "0 0 120px", padding: "10px" }}
        >
          <option value="日帰り">日帰り</option>
          <option value="宿泊">宿泊</option>
        </select>

        {/* 範囲選択用カレンダー */}
        <input
          type="date"
          value={dateRange.start}
          onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value, end: stayType === "日帰り" ? e.target.value : prev.end }))}
          style={{ flex: "0 0 150px", padding: "10px" }}
        />
        {stayType === "宿泊" && (
          <input
            type="date"
            value={dateRange.end}
            min={dateRange.start}
            onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
            style={{ flex: "0 0 150px", padding: "10px" }}
          />
        )}

        <button onClick={generatePlan} disabled={loading} style={{ padding: "10px 20px" }}>
          {loading ? "生成中..." : "プラン生成"}
        </button>
      </div>

      {isLoaded ? (
        <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={13}>
          {directions && <DirectionsRenderer directions={directions} />}
        </GoogleMap>
      ) : (
        <div>地図を読み込み中...</div>
      )}

      <hr />
      <div style={{ marginTop: "20px" }}>
        <ReactMarkdown>{result}</ReactMarkdown>
      </div>
    </div>
  );
}