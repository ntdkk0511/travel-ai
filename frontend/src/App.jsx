import { useState, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import { GoogleMap, DirectionsRenderer, useJsApiLoader } from '@react-google-maps/api';
import { addDays } from 'date-fns';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const containerStyle = { width: '100%', height: '400px', marginTop: '20px', borderRadius: '10px' };
const center = { lat: 34.9858, lng: 135.7588 };
export default function App() {
  const [plan, setPlan] = useState("");
  const [time, setTime] = useState("");
  const [stayType, setStayType] = useState("日帰り");
  const [startDate, setStartDate] = useState(new Date());
  const [nights, setNights] = useState(1);
  const [result, setResult] = useState("");
  const [directions, setDirections] = useState(null);
  const [loading, setLoading] = useState(false);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: ['places']
  });

  // Google Maps ルート計算
  const calculateRoute = useCallback((text) => {
    if (!isLoaded) return;
    const match = text.match(/Locations:\s*\[(.*?)\]/);
    if (!match) return;
    const locations = match[1].split(',').map(s => s.trim());
    if (locations.length < 2) return;

    const directionsService = new window.google.maps.DirectionsService();
<<<<<<< HEAD

    // ルート検索の実行
    directionsService.route(
      {
        origin: locations[0], // 出発地
        destination: locations[locations.length - 1], // 目的地
        waypoints: locations.slice(1, -1).map(loc => ({ location: loc, stopover: true })), // 経由地
        travelMode: window.google.maps.TravelMode.DRIVING, // 車移動（徒歩ならWALKING）
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

  // プラン生成
  const generatePlan = async () => {
    if (!plan || !time || !startDate) {
      alert("プラン・出発日・時間を入力してください");
      return;
    }

    setLoading(true);
    setDirections(null);
    setResult("");

    // 出発日とチェックアウト日を計算
    const start = startDate.toISOString().split('T')[0];
    const end = stayType === "日帰り"
      ? start
      : addDays(startDate, nights).toISOString().split('T')[0]; // 宿泊日数分加算

    try {
      const res = await fetch("http://localhost:3000/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: plan,
          startDate: start,
          stayType,
          nights,
          time
        })
      });
      const data = await res.json();
      setResult(data.plan);
      calculateRoute(data.plan);
    } catch (err) {
      console.error(err);
      setResult("エラーが発生しました。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "40px", maxWidth: "800px", margin: "0 auto" }}>
      <h1>AI旅行プランナー 🗺️</h1>

      <div style={{ marginBottom: "20px", display: "flex", flexWrap: "wrap", gap: "10px" }}>
        {/* 旅行内容 */}
        <input
          value={plan}
          onChange={e => setPlan(e.target.value)}
          placeholder="例：京都旅行"
          style={{ flex: "1 1 200px", padding: "10px" }}
        />

        {/* 出発時間 */}
        <input
          type="time"
          value={time}
          onChange={e => setTime(e.target.value)}
          style={{ flex: "0 0 120px", padding: "10px" }}
        />

        {/* 日帰り / 宿泊 */}
        <select
          value={stayType}
          onChange={e => setStayType(e.target.value)}
          style={{ flex: "0 0 120px", padding: "10px" }}
        >
          <option value="日帰り">日帰り</option>
          <option value="宿泊">宿泊</option>
        </select>

        {/* 出発日 */}
        <input
          type="date"
          value={startDate.toISOString().split('T')[0]}
          min={new Date().toISOString().split('T')[0]}
          onChange={e => setStartDate(new Date(e.target.value))}
          style={{ flex: "0 0 150px", padding: "10px" }}
        />

        {/* 宿泊日数入力 */}
        {stayType === "宿泊" && (
          <input
            type="number"
            value={nights}
            min={1}
            onChange={e => setNights(Number(e.target.value))}
            style={{ flex: "0 0 100px", padding: "10px" }}
          />
        )}

        {/* プラン生成ボタン */}
        <button onClick={generatePlan} disabled={loading} style={{ padding: "10px 20px" }}>
          {loading ? "生成中..." : "プラン生成"}
        </button>
      </div>

      {/* Google Map */}
      {isLoaded ? (
        <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={13}>
          {directions && <DirectionsRenderer directions={directions} />}
        </GoogleMap>
      ) : (
        <div>地図を読み込み中...</div>
      )}

      <hr />

      {/* AIプラン表示 */}
      <div style={{ marginTop: "20px" }}>
        <ReactMarkdown>{result}</ReactMarkdown>
      </div>
    </div>
  );
}