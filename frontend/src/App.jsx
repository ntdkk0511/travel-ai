import { useState, useCallback } from "react";
import { GoogleMap, DirectionsRenderer, useJsApiLoader } from "@react-google-maps/api";

import { LanguageProvider, useLanguage } from "./contexts/LanguageContext";
import LanguageSwitcher from "./components/LanguageSwitcher";
import PhotoGallery from "./components/PhotoGallery";
import PlanWithLinks from "./PlanWithLinks";
import LoadingCat from "./LoadingCat";

// 予算
import HotelBudgetInput from "./components/HotelBudgetInput";
import TripBudgetInput from "./components/TripBudgetInput";
import { useHotelBudget } from "./components/useHotelBudget";

// プラン保存・一覧
import SavePlanButton from "./components/SavePlanButton";

//ホテル
import HotelList from "./components/HotelList";

import MyPlans from "./components/MyPlans";
import { usePlans } from "./hooks/usePlans";


// ★ 追加要望
import RefinePlan from "./components/RefinePlan";
import { API_BASE } from "./api.js";

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const containerStyle = {
  width: "100%",
  height: "400px",
  marginTop: "20px",
  borderRadius: "10px",
};

const center = { lat: 34.9858, lng: 135.7588 };
const LIBRARIES = ["places"];
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
  const [endDate, setEndDate] = useState("");
  const [directions, setDirections] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refineLoading, setRefineLoading] = useState(false); // ★ 追加
  const [locations, setLocations] = useState([]);
  const [spotPhotos, setSpotPhotos] = useState([]);

  //ホテル
  const [hotelLocation, setHotelLocation] = useState("");
  // ★ プラン保存フック（user.id を渡す）

  const { plans, saving, loading: plansLoading, saveSuccess, savePlan, fetchPlans, deletePlan } = usePlans(user?.id);

  // 予算
  const { hotelBudget, setHotelBudget, totalBudget, setTotalBudget, getBudgetForRequest } = useHotelBudget();

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries:LIBRARIES,
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

  // 初回プラン生成
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
    setEndDate("");
    setLocations([]);
    setSpotPhotos([]);

    //ホテル
    setHotelLocation("");
    const start = startDate.toISOString().split("T")[0];

    try {
      const bodyData = { prompt: plan, startDate: start, stayType, lang };
      if (startLocation) bodyData.startLocation = startLocation;
      if (time) bodyData.time = time;
      if (stayType === "宿泊") {
        bodyData.nights = nights;
        if (stayLocation) bodyData.stayLocation = stayLocation;
      }
      Object.assign(bodyData, getBudgetForRequest(stayType, nights)); // 予算（日帰り・宿泊共通）

      const res = await fetch(`${API_BASE}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      });

      const data = await res.json();

      if (res.ok) {
        setResult(data.plan);
        setEndDate(data.endDate);

        if (stayType === "宿泊") setHotelLocation(data.hotelLocation || stayLocation || plan); // ← これに置き換え

        calculateRoute(data.plan);

        const match = data.plan.match(/Locations:\s*\[(.*?)\]/);
        if (match) {
          const parsed = match[1].split(",").map((s) => s.trim().replace(/\*+/g, ""));
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

  // ★ 追加要望でプランを再生成
  const handleRefine = async (feedback) => {
    setRefineLoading(true);
    setDirections(null);
    setLocations([]);     // ★ prevKeyリセットのため先に空にする
    setSpotPhotos([]);

    try {
      const res = await fetch(`${API_BASE}/refine-plan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalPlan: result,
          feedback,
          startDate: startDate.toISOString().split("T")[0],
          endDate,
          stayType,
          nights,
          stayLocation,
          lang,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setResult(data.plan);
        setEndDate(data.endDate);
        calculateRoute(data.plan);
        const match = data.plan.match(/Locations:\s*\[(.*?)\]/);
        if (match) {
          const parsed = match[1].split(",").map((s) => s.trim().replace(/\*+/g, ""));
          setLocations(parsed);   // ★ [] → parsed の変化でPhotoGalleryが再取得
        }
      } else {
        alert(data.error || "再生成に失敗しました");
      }
    } catch (err) {
      console.error(err);
      alert("再生成に失敗しました");
    } finally {
      setRefineLoading(false);
    }
  };

  // 保存
  const handleSave = () => {
    console.log(">>> user:", user);        // ← 追加
    console.log(">>> user._id:", user?.id); // ← 追加
    savePlan({
      title: plan,
      plan: result,
      startDate: startDate.toISOString().split("T")[0],
      endDate,
      nights,
      stayLocation,
    });
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
            {/* ホテル予算（宿泊時のみ） */}
            <HotelBudgetInput budget={hotelBudget} setBudget={setHotelBudget} />
          </>
        )}

        {/* 全体予算（日帰り・宿泊共通） */}
        <TripBudgetInput totalBudget={totalBudget} setTotalBudget={setTotalBudget} />

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

      <PhotoGallery locations={locations} onPhotosLoaded={setSpotPhotos} />

      <PlanWithLinks result={result} locations={locations} photos={spotPhotos} />


      {/* ★ プラン生成後にのみ表示 */}
      {result && (
        <>
          {refineLoading && <LoadingCat />}
          <RefinePlan onRefine={handleRefine} loading={refineLoading} />
          <SavePlanButton
            onSave={handleSave}
            saving={saving}
            saveSuccess={saveSuccess}
            disabled={!result}
          />
        </>
      )}

      <HotelList
      hotelLocation={hotelLocation}
      stayType={stayType}
      />
      {/* ★ 保存ボタン（プランが生成されたときだけ表示） */}
      <SavePlanButton
        onSave={handleSave}
        saving={saving}
        saveSuccess={saveSuccess}
        disabled={!result}
      />

      <MyPlans
        user={user}
        plans={plans}
        loading={plansLoading}
        onFetch={fetchPlans}
        onDelete={deletePlan}
      />
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
