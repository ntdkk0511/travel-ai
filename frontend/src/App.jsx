import { useState, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import { GoogleMap, DirectionsRenderer, useJsApiLoader } from "@react-google-maps/api";

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const containerStyle = {
  width: "100%",
  height: "400px",
  marginTop: "20px",
  borderRadius: "10px"
};

const center = { lat: 34.9858, lng: 135.7588 };
export default function App() {
  const [plan, setPlan] = useState("");
  const [startLocation, setStartLocation] = useState("");
  const [time, setTime] = useState("");
  const [stayType, setStayType] = useState("日帰り");
  const [startDate, setStartDate] = useState(new Date());
  const [nights, setNights] = useState(1);
  const [stayLocation, setStayLocation] = useState("");
  const [result, setResult] = useState("");
  const [directions, setDirections] = useState(null);
  const [loading, setLoading] = useState(false);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: ["places"]
  });

  const calculateRoute = useCallback((text) => {
    if (!isLoaded) return;

    const match = text.match(/Locations:\s*\[(.*?)\]/);
    if (!match) return;

    const locations = match[1].split(",").map((s) => s.trim());
    if (locations.length < 2) return;

    const directionsService = new window.google.maps.DirectionsService();


    directionsService.route(
      {
        origin: locations[0],
        destination: locations[locations.length - 1],
        waypoints: locations.slice(1, -1).map((loc) => ({
          location: loc,
          stopover: true
        })),
        travelMode: window.google.maps.TravelMode.DRIVING
      },
      (result, status) => {
        if (status === "OK") setDirections(result);
        else console.error("ルート検索失敗:", status);
      }
    );
  }, [isLoaded]);

  const generatePlan = async () => {
    if (!plan || !startDate) {
      alert("旅行内容と日付を入力してください");
      return;
    }

    if (stayType === "宿泊" && (!nights || nights < 1)) {
      alert("宿泊日数を入力してください");
      return;
    }

    setLoading(true);
    setDirections(null);
    setResult("");

    const start = startDate.toISOString().split("T")[0];

    try {
      const bodyData = {
        prompt: plan,
        startDate: start,
        stayType
      };

      if (startLocation) bodyData.startLocation = startLocation;
      if (time) bodyData.time = time;

      if (stayType === "宿泊") {
        bodyData.nights = nights;
        if (stayLocation) bodyData.stayLocation = stayLocation;
      }

      const res = await fetch("http://localhost:3000/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData)
      });

      const data = await res.json();

      if (res.ok) {
        setResult(data.plan);
        calculateRoute(data.plan);
      } else {
        setResult(data.error || "エラーが発生しました");
      }
    } catch (err) {
      console.error(err);
      setResult("エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "40px", maxWidth: "800px", margin: "0 auto" }}>
      <h1>AI旅行プランナー 🗺️</h1>

      {/* ===== 1段目 ===== */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
        <input
          value={plan}
          onChange={(e) => setPlan(e.target.value)}
          placeholder="例：京都旅行"
          style={{ flex: 2, padding: "10px" }}
        />

        <input
          value={startLocation}
          onChange={(e) => setStartLocation(e.target.value)}
          placeholder="出発場所（任意）"
          style={{ flex: 1, padding: "10px" }}
        />

        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          style={{ padding: "10px" }}
        />
      </div>

      {/* ===== 2段目 ===== */}
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "20px" }}>
        
        {/* 日帰り / 宿泊 */}
        <select
          value={stayType}
          onChange={(e) => setStayType(e.target.value)}
          style={{ padding: "10px" }}
        >
          <option value="日帰り">日帰り</option>
          <option value="宿泊">宿泊</option>
        </select>

        {/* 日付 */}
        <input
          type="date"
          value={startDate.toISOString().split("T")[0]}
          min={new Date().toISOString().split("T")[0]}
          onChange={(e) => setStartDate(new Date(e.target.value))}
          style={{ padding: "10px" }}
        />

        {/* 宿泊の場合のみ */}
        {stayType === "宿泊" && (
          <>
            <input
              type="number"
              value={nights}
              min={1}
              onChange={(e) => setNights(Number(e.target.value))}
              placeholder="泊数"
              style={{ width: "80px", padding: "10px" }}
            />

            <input
              value={stayLocation}
              onChange={(e) => setStayLocation(e.target.value)}
              placeholder="宿泊場所（任意）"
              style={{ padding: "10px", flex: 1 }}
            />
          </>
        )}

        <button onClick={generatePlan} disabled={loading} style={{ padding: "10px 20px" }}>
          {loading ? "生成中..." : "プラン生成"}
        </button>
      </div>

      {/* 地図 */}
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