import { useState, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import { GoogleMap, DirectionsRenderer, useJsApiLoader } from '@react-google-maps/api';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

// 地図の大きさ設定
const containerStyle = { width: '100%', height: '400px', marginTop: '20px', borderRadius: '10px' };
// 初期表示の中心（京都駅付近）
const center = { lat: 34.9858, lng: 135.7588 };
// ai208 
export default function App() {
  const [plan, setPlan] = useState("");
  const [result, setResult] = useState("");
  const [directions, setDirections] = useState(null);
  const [loading, setLoading] = useState(false);

  // Google Mapsのロード
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: ['places']
  });

  // AIの回答から [地点, 地点] を抜き出してルートを計算する関数
  const calculateRoute = useCallback((text) => {
    if (!isLoaded) return;

    // AIの回答から Locations: [...] の部分を探す
    const match = text.match(/Locations:\s*\[(.*?)\]/);
    if (!match) return;

    const locations = match[1].split(',').map(s => s.trim());
    if (locations.length < 2) return;

    const directionsService = new window.google.maps.DirectionsService();

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

  const generatePlan = async () => {
    try {
      setLoading(true);
      setDirections(null); // 地図をリセット
      const res = await fetch("http://localhost:3000/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: plan })
      });
      const data = await res.json();
      setResult(data.plan);

      // AIの回答が届いたらルートを計算
      calculateRoute(data.plan);
    } catch (error) {
      setResult("エラーが発生しました。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "40px", maxWidth: "800px", margin: "0 auto" }}>
      <h1>AI旅行プランナー 🗺️</h1>
      <div style={{ marginBottom: "20px" }}>
        <input
          value={plan}
          onChange={(e) => setPlan(e.target.value)}
          placeholder="例：京都1日旅"
          style={{ width: "70%", padding: "10px" }}
        />
        <button onClick={generatePlan} disabled={loading} style={{ padding: "10px 20px", marginLeft: "10px" }}>
          {loading ? "生成中..." : "プラン生成"}
        </button>
      </div>
      <div>
        <input type="text" />
      </div>

      {/* 地図の表示エリア */}
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