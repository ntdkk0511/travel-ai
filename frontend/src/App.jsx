import { useState, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import { GoogleMap, DirectionsRenderer, useJsApiLoader } from '@react-google-maps/api';
import { DateRange } from 'react-date-range';
import { addDays } from 'date-fns';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const containerStyle = { width: '100%', height: '400px', marginTop: '20px', borderRadius: '10px' };
const center = { lat: 34.9858, lng: 135.7588 };

export default function App() {
  const [plan, setPlan] = useState("");
  const [time, setTime] = useState("");
  const [stayType, setStayType] = useState("日帰り");
  const [dateRange, setDateRange] = useState({ start: new Date(), end: new Date() });
  const [result, setResult] = useState("");
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

    setLoading(true);
    setDirections(null);
    setResult("");

    const startDate = dateRange.start.toISOString().split('T')[0];
    const endDate = stayType === "日帰り" ? startDate : dateRange.end.toISOString().split('T')[0];

    try {
      const res = await fetch("http://localhost:3000/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: plan, startDate, endDate, time, stayType })
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
        <input
          value={plan}
          onChange={e => setPlan(e.target.value)}
          placeholder="例：京都旅行"
          style={{ flex: "1 1 200px", padding: "10px" }}
        />
        <input
          type="time"
          value={time}
          onChange={e => setTime(e.target.value)}
          style={{ flex: "0 0 120px", padding: "10px" }}
        />
        <select
          value={stayType}
          onChange={e => setStayType(e.target.value)}
          style={{ flex: "0 0 120px", padding: "10px" }}
        >
          <option value="日帰り">日帰り</option>
          <option value="宿泊">宿泊</option>
        </select>

        {stayType === "日帰り" ? (
          <input
            type="date"
            value={dateRange.start.toISOString().split('T')[0]}
            min={new Date().toISOString().split('T')[0]}
            onChange={e => setDateRange({ start: new Date(e.target.value), end: new Date(e.target.value) })}
            style={{ flex: "0 0 150px", padding: "10px" }}
          />
        ) : (
          <DateRange
            editableDateInputs={true}
            onChange={item => setDateRange({ start: item.selection.startDate, end: item.selection.endDate })}
            moveRangeOnFirstSelection={false}
            ranges={[{ startDate: dateRange.start, endDate: dateRange.end, key: 'selection' }]}
            minDate={new Date()}
            maxDate={addDays(new Date(), 365)}
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