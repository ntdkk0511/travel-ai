import { useState, useCallback } from "react";
import { GoogleMap, DirectionsRenderer, useJsApiLoader } from "@react-google-maps/api";

import { LanguageProvider, useLanguage } from "./contexts/LanguageContext";
import LanguageSwitcher from "./components/LanguageSwitcher";
import PhotoGallery from "./components/PhotoGallery";
import PlanWithLinks from "./PlanWithLinks";

//cat
import LoadingCat from "./LoadingCat";

// ホテル予算
import HotelBudgetInput from "./components/HotelBudgetInput";
import { useHotelBudget } from "./components/useHotelBudget";

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const containerStyle = {
  width: "100%",
  height: "400px",
  marginTop: "20px",
  borderRadius: "10px",
};

const center = { lat: 34.9858, lng: 135.7588 };

function AppContent({ user, onLogout }) {
  const { t, lang } = useLanguage();
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
  const [locations, setLocations] = useState([]);
  const [spotPhotos, setSpotPhotos] = useState([]); // 写真データをここで管理

  // ホテル予算
  const { hotelBudget, setHotelBudget, getBudgetForRequest } = useHotelBudget();

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: ["places"],
  });

  const calculateRoute = useCallback(
    (text) => {
      if (!isLoaded) return;
      const match = text.match(/Locations:\s*\[(.*?)\]/);
      if (!match) return;
      const routeLocations = match[1].split(",").map((s) => s.trim());
      if (routeLocations.length < 2) return;

      const directionsService = new window.google.maps.DirectionsService();
      directionsService.route(
        {
          origin: routeLocations[0],
          destination: routeLocations[routeLocations.length - 1],
          waypoints: routeLocations.slice(1, -1).map((loc) => ({
            location: loc,
            stopover: true,
          })),
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === "OK") setDirections(result);
          else console.error("ルート検索失敗:", status);
        }
      );
    },
    [isLoaded]
  );

  const generatePlan = async () => {
    if (!plan || !startDate) {
      alert(t("travel.inputError"));
      return;
    }
    if (stayType === "宿泊" && (!nights || nights < 1)) {
      alert(t("travel.nightsError"));
      return;
    }

    setLoading(true);
    setDirections(null);
    setResult("");
    setLocations([]);
    setSpotPhotos([]); // 前回の写真もリセット

    const start = startDate.toISOString().split("T")[0];

    try {
      const bodyData = { prompt: plan, startDate: start, stayType, lang };
      if (startLocation) bodyData.startLocation = startLocation;
      if (time) bodyData.time = time;
      if (stayType === "宿泊") {
        bodyData.nights = nights;
        if (stayLocation) bodyData.stayLocation = stayLocation;
        Object.assign(bodyData, getBudgetForRequest()); // ホテル予算
      }

      const res = await fetch("http://localhost:3000/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      });

      const data = await res.json();

      if (res.ok) {
        setResult(data.plan);
        calculateRoute(data.plan);
        const match = data.plan.match(/Locations:\s*\[(.*?)\]/);
        if (match) {
          const parsed = match[1].split(",").map((s) => s.trim());
          console.log(">>> [App] setLocations:", parsed);
          setLocations(parsed);
        }
      } else {
        setResult(data.error || t("travel.generalError"));
      }
    } catch (err) {
      console.error(err);
      setResult(t("travel.generalError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "40px", maxWidth: "800px", margin: "0 auto" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px" }}>
        {user && (
          <button onClick={onLogout} style={{ padding: "6px 12px", cursor: "pointer" }}>
            ログアウト
          </button>
        )}
      </header>

      <h1>{t("travel.title")}</h1>

      <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
        <input
          value={plan}
          onChange={(e) => setPlan(e.target.value)}
          placeholder={t("travel.planPlaceholder")}
          style={{ flex: 2, padding: "10px" }}
        />
        <input
          value={startLocation}
          onChange={(e) => setStartLocation(e.target.value)}
          placeholder={t("travel.departurePlaceholder")}
          style={{ flex: 1, padding: "10px" }}
        />
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          style={{ padding: "10px" }}
        />
      </div>

      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "20px" }}>
        <select value={stayType} onChange={(e) => setStayType(e.target.value)} style={{ padding: "10px" }}>
          <option value="日帰り">{t("travel.dayTrip")}</option>
          <option value="宿泊">{t("travel.overnight")}</option>
        </select>

        <input
          type="date"
          value={startDate.toISOString().split("T")[0]}
          min={new Date().toISOString().split("T")[0]}
          onChange={(e) => setStartDate(new Date(e.target.value))}
          style={{ padding: "10px" }}
        />

        {stayType === "宿泊" && (
          <>
            <input
              type="number"
              value={nights}
              min={1}
              onChange={(e) => setNights(Number(e.target.value))}
              placeholder={t("travel.nights")}
              style={{ width: "80px", padding: "10px" }}
            />
            <input
              value={stayLocation}
              onChange={(e) => setStayLocation(e.target.value)}
              placeholder={t("travel.stayPlaceholder")}
              style={{ padding: "10px", flex: 1 }}
            />
            {/* ホテル予算 */}
            <HotelBudgetInput budget={hotelBudget} setBudget={setHotelBudget} />
          </>
        )}

        <button onClick={generatePlan} disabled={loading} style={{ padding: "10px 20px" }}>
          {loading ? t("travel.generating") : t("travel.generate")}
        </button>
        
      </div>
      {loading && <LoadingCat />}
      
      {isLoaded ? (
        <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={13}>
          {directions && <DirectionsRenderer directions={directions} />}
        </GoogleMap>
      ) : (
        <div>{t("travel.mapLoading")}</div>
      )}

      <hr />

      {/* 写真取得 + 親に渡す（ギャラリー表示はしない） */}
      <PhotoGallery locations={locations} onPhotosLoaded={setSpotPhotos} />

      {/* プランテキスト＋場所ごとの写真をインライン表示 */}
      <PlanWithLinks result={result} locations={locations} photos={spotPhotos} />
    </div>
  );
}

export default function App({ user, onLogout }) {
  return (
    <LanguageProvider>
      <header style={{ display: "flex", justifyContent: "flex-end", padding: "12px 16px" }}>
        <LanguageSwitcher />
      </header>
      <AppContent user={user} onLogout={onLogout} />
    </LanguageProvider>
  );
}