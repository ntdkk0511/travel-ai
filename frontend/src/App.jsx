import { useState, useCallback } from "react";
import { GoogleMap, DirectionsRenderer, useJsApiLoader } from "@react-google-maps/api";

import { LanguageProvider, useLanguage } from "./contexts/LanguageContext";
import LanguageSwitcher from "./components/LanguageSwitcher";
import PhotoGallery from "./components/PhotoGallery";
import PlanWithLinks from "./PlanWithLinks";
import LoadingCat from "./LoadingCat";

import HotelBudgetInput from "./components/HotelBudgetInput";
import TripBudgetInput from "./components/TripBudgetInput";
import { useHotelBudget } from "./components/useHotelBudget";

import SavePlanButton from "./components/SavePlanButton";
import HotelList from "./components/HotelList";
import MyPlans from "./components/MyPlans";
import { usePlans } from "./hooks/usePlans";

import RefinePlan from "./components/RefinePlan";
import { API_BASE } from "./api.js";

import "./App.css";

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const mapContainerStyle = {
  width: "100%",
  height: "100%",
  borderRadius: "0",
};

const center = { lat: 34.9858, lng: 135.7588 };
const LIBRARIES = ["places"];

/* ─── paw print SVG decoration ─── */
const PawIcon = ({ size = 20, opacity = 0.18 }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="currentColor" style={{ opacity }}>
    <ellipse cx="20" cy="30" rx="10" ry="7" />
    <ellipse cx="8" cy="18" rx="5" ry="6" />
    <ellipse cx="32" cy="18" rx="5" ry="6" />
    <ellipse cx="13" cy="10" rx="4" ry="5" />
    <ellipse cx="27" cy="10" rx="4" ry="5" />
  </svg>
);

/* ─── Cat face SVG logo ─── */
const CatLogo = () => (
  <svg width="38" height="38" viewBox="0 0 38 38" fill="none">
    <ellipse cx="19" cy="22" rx="14" ry="12" fill="#c8956c" />
    <polygon points="5,14 10,2 15,14" fill="#c8956c" />
    <polygon points="23,14 28,2 33,14" fill="#c8956c" />
    <ellipse cx="14" cy="22" rx="3" ry="4" fill="#2a1a0e" />
    <ellipse cx="24" cy="22" rx="3" ry="4" fill="#2a1a0e" />
    <ellipse cx="14.8" cy="21.2" rx="1.2" ry="1.8" fill="white" />
    <ellipse cx="24.8" cy="21.2" rx="1.2" ry="1.8" fill="white" />
    <ellipse cx="19" cy="27" rx="2" ry="1.5" fill="#e8a090" />
    <line x1="10" y1="27" x2="3" y2="25" stroke="#c8956c" strokeWidth="1.2" strokeLinecap="round" />
    <line x1="10" y1="28" x2="3" y2="28" stroke="#c8956c" strokeWidth="1.2" strokeLinecap="round" />
    <line x1="10" y1="29" x2="3" y2="31" stroke="#c8956c" strokeWidth="1.2" strokeLinecap="round" />
    <line x1="28" y1="27" x2="35" y2="25" stroke="#c8956c" strokeWidth="1.2" strokeLinecap="round" />
    <line x1="28" y1="28" x2="35" y2="28" stroke="#c8956c" strokeWidth="1.2" strokeLinecap="round" />
    <line x1="28" y1="29" x2="35" y2="31" stroke="#c8956c" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

/* ─── Main App Content ─── */
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
  const [refineLoading, setRefineLoading] = useState(false);
  const [locations, setLocations] = useState([]);
  const [spotPhotos, setSpotPhotos] = useState([]);
  const [hotelLocation, setHotelLocation] = useState("");
  const [activeSearchTab, setActiveSearchTab] = useState("free");
  const [showMyPlans, setShowMyPlans] = useState(false);

  const { plans, saving, loading: plansLoading, saveSuccess, savePlan, fetchPlans, deletePlan } = usePlans(user?.id);
  const { hotelBudget, setHotelBudget, totalBudget, setTotalBudget, getBudgetForRequest } = useHotelBudget();

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: LIBRARIES,
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
    setEndDate("");
    setLocations([]);
    setSpotPhotos([]);
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
      Object.assign(bodyData, getBudgetForRequest(stayType, nights));

      const res = await fetch(`${API_BASE}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      });

      const data = await res.json();

      if (res.ok) {
        setResult(data.plan);
        setEndDate(data.endDate);
        if (stayType === "宿泊") setHotelLocation(data.hotelLocation || stayLocation || plan);
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

  const handleRefine = async (feedback) => {
    setRefineLoading(true);
    setDirections(null);
    setLocations([]);
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
          setLocations(parsed);
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

  const handleSave = () => {
    savePlan({
      title: plan,
      plan: result,
      startDate: startDate.toISOString().split("T")[0],
      endDate,
      nights,
      stayLocation,
    });
  };

  const hasPlan = !!result;

  return (
    <div className="nk-app">
      {/* ── decorative paws bg ── */}
      <div className="nk-paws-bg" aria-hidden="true">
        {[...Array(8)].map((_, i) => (
          <span key={i} className={`nk-paw nk-paw-${i}`}><PawIcon size={40 + i * 10} opacity={0.07 + i * 0.01} /></span>
        ))}
      </div>

      {/* ════════════ HEADER ════════════ */}
      <header className="nk-header">
        <div className="nk-header-left">
          <CatLogo />
          <div className="nk-brand">
            <span className="nk-brand-name">ねこたび</span>
            <span className="nk-brand-en">nekotabi</span>
          </div>
          <p className="nk-tagline">わがままを、最高のプランに。</p>
        </div>

        <div className="nk-header-right">
          {user ? (
            <div className="nk-user-area">
              <button className="nk-btn-ghost" onClick={() => setShowMyPlans(!showMyPlans)}>
                🗂 {t("travel.myPlans") || "マイプラン"}
              </button>
              <button className="nk-btn-ghost nk-btn-logout" onClick={onLogout}>
                {t("travel.logout") || "ログアウト"}
              </button>
            </div>
          ) : (
            <button className="nk-btn-outline">
              {t("travel.login") || "ログイン"}
            </button>
          )}
          <LanguageSwitcher />
        </div>
      </header>

      {/* ════════════ SEARCH PANEL ════════════ */}
      <section className="nk-search-section">
        <div className="nk-search-tabs">
          <button
            className={`nk-tab ${activeSearchTab === "free" ? "nk-tab--active" : ""}`}
            onClick={() => setActiveSearchTab("free")}
          >
            🐾 {t("travel.searchFree") || "自由検索"}
          </button>
          <button
            className={`nk-tab ${activeSearchTab === "condition" ? "nk-tab--active" : ""}`}
            onClick={() => setActiveSearchTab("condition")}
          >
            🗺 {t("travel.searchCondition") || "条件検索"}
          </button>
        </div>

        <div className="nk-search-body">
          {/* free search row */}
          <div className="nk-input-row">
            <div className="nk-input-wrap nk-input-wrap--grow">
              <span className="nk-input-icon">✦</span>
              <input
                className="nk-input"
                value={plan}
                onChange={(e) => setPlan(e.target.value)}
                placeholder={t("travel.planPlaceholder") || "「静かな寺院でぼーっとしたい」「美味しいパフェが食べたい」"}
                onKeyDown={(e) => e.key === "Enter" && generatePlan()}
              />
            </div>
            <div className="nk-input-wrap">
              <span className="nk-input-icon">📍</span>
              <input
                className="nk-input nk-input--sm"
                value={startLocation}
                onChange={(e) => setStartLocation(e.target.value)}
                placeholder={t("travel.departurePlaceholder") || "出発地"}
              />
            </div>
            <div className="nk-input-wrap">
              <span className="nk-input-icon">🕐</span>
              <input
                type="time"
                className="nk-input nk-input--sm nk-input--time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>

          {/* condition row */}
          <div className="nk-input-row nk-input-row--wrap">
            <div className="nk-select-wrap">
              <select
                className="nk-select"
                value={stayType}
                onChange={(e) => setStayType(e.target.value)}
              >
                <option value="日帰り">🌅 {t("travel.dayTrip") || "日帰り"}</option>
                <option value="宿泊">🌙 {t("travel.overnight") || "宿泊"}</option>
              </select>
            </div>

            <div className="nk-input-wrap">
              <span className="nk-input-icon">📅</span>
              <input
                type="date"
                className="nk-input nk-input--sm"
                value={startDate.toISOString().split("T")[0]}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => setStartDate(new Date(e.target.value))}
              />
            </div>

            {stayType === "宿泊" && (
              <>
                <div className="nk-input-wrap nk-input-wrap--narrow">
                  <span className="nk-input-icon">🌙</span>
                  <input
                    type="number"
                    className="nk-input nk-input--sm"
                    value={nights}
                    min={1}
                    onChange={(e) => setNights(Number(e.target.value))}
                    placeholder={t("travel.nights") || "泊数"}
                  />
                </div>
                <div className="nk-input-wrap">
                  <span className="nk-input-icon">🏨</span>
                  <input
                    className="nk-input nk-input--sm"
                    value={stayLocation}
                    onChange={(e) => setStayLocation(e.target.value)}
                    placeholder={t("travel.stayPlaceholder") || "宿泊地"}
                  />
                </div>
                <HotelBudgetInput budget={hotelBudget} setBudget={setHotelBudget} />
              </>
            )}

            <TripBudgetInput totalBudget={totalBudget} setTotalBudget={setTotalBudget} />
          </div>

          <div className="nk-search-footer">
            <button
              className="nk-btn-generate"
              onClick={generatePlan}
              disabled={loading}
            >
              {loading ? (
                <span className="nk-generating">
                  <span className="nk-dot" />
                  <span className="nk-dot" />
                  <span className="nk-dot" />
                  {t("travel.generating") || "考え中にゃ…"}
                </span>
              ) : (
                <>🐱 {t("travel.generate") || "プランを作る"}</>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* ════════════ MAIN CONTENT: MAP + TIMETABLE ════════════ */}
      {(loading || hasPlan) && (
        <main className="nk-main">
          {/* ── LEFT: Map ── */}
          <div className="nk-map-col">
            <div className="nk-panel-header">
              <span className="nk-panel-icon">🗺</span>
              <span className="nk-panel-title">{t("travel.routeLabel") || "ルート"}</span>
            </div>
            <div className="nk-map-container">
              {loading && (
                <div className="nk-map-loading">
                  <LoadingCat />
                </div>
              )}
              {isLoaded ? (
                <GoogleMap
                  mapContainerStyle={mapContainerStyle}
                  center={center}
                  zoom={13}
                  options={{
                    styles: mapStyles,
                    disableDefaultUI: false,
                    zoomControl: true,
                    streetViewControl: false,
                    mapTypeControl: false,
                  }}
                >
                  {directions && <DirectionsRenderer directions={directions} />}
                </GoogleMap>
              ) : (
                <div className="nk-map-placeholder">地図を読み込み中…</div>
              )}
            </div>

            {/* Photo gallery under map */}
            {locations.length > 0 && (
              <div className="nk-photos">
                <PhotoGallery locations={locations} onPhotosLoaded={setSpotPhotos} />
              </div>
            )}
          </div>

          {/* ── RIGHT: TimeTable ── */}
          <div className="nk-timetable-col">
            <div className="nk-panel-header">
              <span className="nk-panel-icon">📋</span>
              <span className="nk-panel-title">{t("travel.scheduleLabel") || "タイムスケジュール"}</span>
              {endDate && <span className="nk-panel-sub">{startDate.toISOString().split("T")[0]} → {endDate}</span>}
            </div>

            <div className="nk-timetable-body">
              {(loading || refineLoading) && (
                <div className="nk-timetable-loading">
                  <LoadingCat />
                  <p className="nk-loading-msg">{t("travel.calculatingRoute") || "ベストなルートを計算中にゃ…"}</p>
                </div>
              )}

              {hasPlan && !loading && (
                <>
                  <div className="nk-plan-content">
                    <PlanWithLinks result={result} locations={locations} photos={spotPhotos} />
                  </div>

                  <div className="nk-plan-actions">
                    <RefinePlan onRefine={handleRefine} loading={refineLoading} />
                    <SavePlanButton
                      onSave={handleSave}
                      saving={saving}
                      saveSuccess={saveSuccess}
                      disabled={!result}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </main>
      )}

      {/* ════════════ HOTEL LIST ════════════ */}
      {hasPlan && (
        <section className="nk-hotel-section">
          <HotelList hotelLocation={hotelLocation} stayType={stayType} />
        </section>
      )}

      {/* ════════════ MY PLANS ════════════ */}
      {showMyPlans && user && (
        <section className="nk-myplans-section">
          <MyPlans
            user={user}
            plans={plans}
            loading={plansLoading}
            onFetch={fetchPlans}
            onDelete={deletePlan}
          />
        </section>
      )}

      {/* ════════════ EMPTY STATE ════════════ */}
      {!loading && !hasPlan && (
        <div className="nk-empty">
          <div className="nk-empty-cat">🐈</div>
          <p className="nk-empty-text">{t("travel.emptyText") || "行きたい場所や気分を入力して、旅のプランを作ってみよう"}</p>
          <div className="nk-empty-hints">
            <span className="nk-hint">{t("travel.hint1") || '"京都で朝ごはんから始まる半日旅"'}</span>
            <span className="nk-hint">{t("travel.hint2") || '"大阪で食べ歩き＆夜景"'}</span>
            <span className="nk-hint">{t("travel.hint3") || '"静かな温泉宿でのんびり2泊"'}</span>
          </div>
        </div>
      )}

      <footer className="nk-footer">
        <PawIcon size={16} opacity={0.3} />
        <span>ねこたび — わがままを、最高のプランに。</span>
        <PawIcon size={16} opacity={0.3} />
      </footer>
    </div>
  );
}

/* ─── Custom Map Style (warm/cream) ─── */
const mapStyles = [
  { elementType: "geometry", stylers: [{ color: "#f5efe6" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#7a5c44" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#fdf5ec" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#e8d5bc" }] },
  { featureType: "road.arterial", elementType: "geometry", stylers: [{ color: "#ddc9a8" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#c8956c" }] },
  { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#b07850" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#b8d4e8" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#7a9bba" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#d4e8c8" }] },
  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#8a7060" }] },
  { featureType: "administrative", elementType: "geometry.stroke", stylers: [{ color: "#c8a882" }] },
  { featureType: "transit", elementType: "geometry", stylers: [{ color: "#e8d0b0" }] },
];

/* ─── Root export with LanguageProvider ─── */
export default function App({ user, onLogout }) {
  return (
    <LanguageProvider>
      <AppContent user={user} onLogout={onLogout} />
    </LanguageProvider>
  );
}
