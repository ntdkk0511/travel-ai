import { useState, useCallback } from "react";
import { GoogleMap, DirectionsRenderer, useJsApiLoader } from "@react-google-maps/api";
import { LanguageProvider, useLanguage } from "./contexts/LanguageContext";
import LanguageSwitcher from "./components/LanguageSwitcher";

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const LIBRARIES = ["places"];
const MAP_STYLE = { width: "100%", height: "100%" };

// カテゴリ別スタイル設定
const CATEGORY_CONFIG = {
  sightseeing: { emoji: "🏛️", bg: "#fceaea", border: "#d4868a", tagBg: "#fceaea", tagColor: "#7a3a3d", tagBorder: "#d4868a", label: { ja: "観光",   en: "Sightseeing", zh: "观光", ko: "관광" } },
  food:        { emoji: "🍵", bg: "#fdf6ec", border: "#e09a50", tagBg: "#fdefd8", tagColor: "#7a4f2e", tagBorder: "#c8833a", label: { ja: "グルメ", en: "Food",        zh: "美食", ko: "맛집" } },
  transport:   { emoji: "🚃", bg: "#e8f4fb", border: "#b8d4e8", tagBg: "#e8f4fb", tagColor: "#2a5a78", tagBorder: "#b8d4e8", label: { ja: "移動",   en: "Transport",   zh: "交通", ko: "이동" } },
  stay:        { emoji: "🏨", bg: "#e4eedf", border: "#7d9e7a", tagBg: "#e4eedf", tagColor: "#3d5c3a", tagBorder: "#7d9e7a", label: { ja: "宿泊",   en: "Stay",        zh: "住宿", ko: "숙박" } },
};
const DEFAULT_CAT = { emoji: "📍", bg: "#fdf6ec", border: "#e09a50", tagBg: "#fdefd8", tagColor: "#7a4f2e", tagBorder: "#c8833a", label: { ja: "その他", en: "Other", zh: "其他", ko: "기타" } };

// ---- 猫SVGロゴ ----
function CatLogo() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M4 3L4 10C4 14.4 7.6 18 12 18C16.4 18 20 14.4 20 10V3L17 6L12 3L7 6L4 3Z" fill="#c8833a"/>
      <circle cx="9" cy="10" r="1.2" fill="white"/>
      <circle cx="15" cy="10" r="1.2" fill="white"/>
      <path d="M10 13.5C10.5 14.2 11.2 14.5 12 14.5C12.8 14.5 13.5 14.2 14 13.5" stroke="white" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
      <path d="M8 9L5 8M16 9L19 8M8 11L5.5 11.5M16 11L18.5 11.5" stroke="white" strokeWidth="1" strokeLinecap="round"/>
    </svg>
  );
}

// ---- タイムラインアイテム ----
function TimelineItem({ item, isLast, lang }) {
  const cfg = CATEGORY_CONFIG[item.category] || DEFAULT_CAT;
  return (
    <div style={{ display: "flex", gap: 11, marginBottom: isLast ? 0 : 14, position: "relative" }}>
      {!isLast && <div style={{ position: "absolute", left: 17, top: 36, bottom: -6, width: 1.5, background: "#ead4b8", borderRadius: 1 }} />}
      <div style={{ width: 34, height: 34, borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, flexShrink: 0, background: cfg.bg, border: `1.5px solid ${cfg.border}` }}>
        {cfg.emoji}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: "#c8833a", letterSpacing: "0.8px", marginBottom: 1 }}>{item.time}</div>
        <div style={{ fontSize: 13, fontWeight: 800, color: "#3d2b1f", marginBottom: 2 }}>{item.name}</div>
        <div style={{ fontSize: 11, color: "#9b7e6a", lineHeight: 1.45 }}>{item.desc}</div>
        <div style={{ display: "flex", gap: 4, marginTop: 4, flexWrap: "wrap" }}>
          <span style={{ padding: "2px 7px", borderRadius: 4, fontSize: 9, fontWeight: 800, background: cfg.tagBg, color: cfg.tagColor, border: `1px solid ${cfg.tagBorder}` }}>
            {cfg.label[lang] || cfg.label.ja}
          </span>
          {item.duration && (
            <span style={{ padding: "2px 7px", borderRadius: 4, fontSize: 9, fontWeight: 800, background: "#faecd8", color: "#7a4f2e", border: "1px solid #f5dfc0" }}>
              {item.duration}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ---- タイムラインカード ----
function TimelineCard({ plan, lang, t }) {
  const [dayIndex, setDayIndex] = useState(0);
  if (!plan?.days?.length) return null;
  const day = plan.days[dayIndex];
  return (
    <div style={{ background: "#fffcf7", borderRadius: 22, border: "1.5px solid #ead4b8", padding: "18px 18px 14px", boxShadow: "0 4px 20px rgba(200,131,58,0.08)", display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ fontSize: 15, fontWeight: 900, color: "#3d2b1f" }}>🐾 {t("travel.planLabel")}</div>
        <div style={{ display: "flex", gap: 4 }}>
          {plan.days.map((_, i) => (
            <button key={i} onClick={() => setDayIndex(i)} style={{ padding: "3px 10px", borderRadius: 50, border: `1px solid ${i === dayIndex ? "#c8833a" : "#ead4b8"}`, background: i === dayIndex ? "#fdefd8" : "transparent", color: i === dayIndex ? "#7a4f2e" : "#9b7e6a", fontSize: 10, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>
              Day {i + 1}
            </button>
          ))}
        </div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", paddingRight: 2 }}>
        {day.items.map((item, i) => (
          <TimelineItem key={i} item={item} isLast={i === day.items.length - 1} lang={lang} />
        ))}
      </div>
    </div>
  );
}

// ---- 地図カード ----
function MapCard({ directions, plan, isLoaded, t }) {
  const spotCount = plan?.locations?.length ?? 0;
  return (
    <div style={{ background: "#fffcf7", borderRadius: 22, border: "1.5px solid #ead4b8", overflow: "hidden", boxShadow: "0 4px 20px rgba(200,131,58,0.08)" }}>
      <div style={{ height: 252, background: "linear-gradient(160deg,#e8f4fb,#dceef8,#cce4f5)", position: "relative" }}>
        {isLoaded && directions ? (
          <GoogleMap mapContainerStyle={MAP_STYLE} zoom={12} center={{ lat: 35.0, lng: 135.75 }}>
            <DirectionsRenderer directions={directions} />
          </GoogleMap>
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}>
            <svg width="44" height="44" viewBox="0 0 48 48" fill="none">
              <path d="M24 4C15.16 4 8 11.16 8 20C8 31 24 44 24 44S40 31 40 20C40 11.16 32.84 4 24 4ZM24 26C20.68 26 18 23.32 18 20S20.68 14 24 14 30 16.68 30 20 27.32 26 24 26Z" fill="#c8833a" opacity="0.35"/>
            </svg>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#9b7e6a" }}>{t("travel.mapWaiting")}</p>
          </div>
        )}
        {/* 猫の透かし */}
        <svg style={{ position: "absolute", bottom: 10, right: 14, opacity: 0.15, pointerEvents: "none" }} width="46" height="38" viewBox="0 0 48 40">
          <path d="M8 6L8 22C8 30 14 36 24 36S40 30 40 22V6L34 11L24 6L14 11Z" fill="#c8833a"/>
          <circle cx="18" cy="20" r="2.5" fill="white"/><circle cx="30" cy="20" r="2.5" fill="white"/>
          <path d="M16 18L10 16M32 18L38 16M16 22L10 23M32 22L38 23" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </div>
      <div style={{ padding: "12px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid #ead4b8" }}>
        <div style={{ display: "flex", gap: 22 }}>
          <div>
            <div style={{ fontSize: 17, fontWeight: 900, color: "#3d2b1f" }}>{spotCount || "—"}</div>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#9b7e6a", textTransform: "uppercase", letterSpacing: "0.5px" }}>{t("travel.spots")}</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5, background: "#e4eedf", color: "#3d5c3a", fontSize: 11, fontWeight: 700, padding: "5px 12px", borderRadius: 50, border: "1px solid #7d9e7a" }}>
          {directions ? `🐾 ${t("travel.routeActive")}` : `🐾 ${t("travel.routeReady")}`}
        </div>
      </div>
    </div>
  );
}

// ---- メインコンテンツ ----
function AppContent() {
  const { t, lang } = useLanguage();

  const [prompt, setPrompt]               = useState("");
  const [startLocation, setStartLocation] = useState("");
  const [time, setTime]                   = useState("");
  const [stayType, setStayType]           = useState("日帰り");
  const [startDate, setStartDate]         = useState(new Date());
  const [nights, setNights]               = useState(1);
  const [stayLocation, setStayLocation]   = useState("");
  const [plan, setPlan]                   = useState(null);
  const [directions, setDirections]       = useState(null);
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState("");

  const { isLoaded } = useJsApiLoader({ googleMapsApiKey: GOOGLE_MAPS_API_KEY, libraries: LIBRARIES });

  const calculateRoute = useCallback((locations) => {
    if (!isLoaded || !locations || locations.length < 2) return;
    new window.google.maps.DirectionsService().route(
      {
        origin: locations[0],
        destination: locations[locations.length - 1],
        waypoints: locations.slice(1, -1).map((loc) => ({ location: loc, stopover: true })),
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === "OK") setDirections(result);
        else console.error("Route error:", status);
      }
    );
  }, [isLoaded]);

  const generatePlan = async () => {
    if (!prompt || !startDate) { setError(t("travel.inputError")); return; }
    if (stayType === "宿泊" && (!nights || nights < 1)) { setError(t("travel.nightsError")); return; }
    setError(""); setLoading(true); setDirections(null); setPlan(null);
    const start = startDate.toISOString().split("T")[0];
    try {
      const body = { prompt, startDate: start, stayType, lang };
      if (startLocation) body.startLocation = startLocation;
      if (time) body.time = time;
      if (stayType === "宿泊") { body.nights = nights; if (stayLocation) body.stayLocation = stayLocation; }
      const res  = await fetch("http://localhost:3000/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      if (res.ok) {
        setPlan(data.plan);
        if (data.plan.locations?.length >= 2) calculateRoute(data.plan.locations);
      } else {
        setError(data.error || t("travel.generalError"));
      }
    } catch (e) {
      console.error(e); setError(t("travel.generalError"));
    } finally {
      setLoading(false);
    }
  };

  const todayStr = new Date().toISOString().split("T")[0];

  // ---- pill style helpers ----
  const pillBase = { display: "flex", alignItems: "center", gap: 5, padding: "6px 13px", borderRadius: 50, fontSize: 12, fontWeight: 700, fontFamily: "inherit" };
  const pillActive   = { ...pillBase, border: "1.5px solid #c8833a", background: "#fdefd8", color: "#7a4f2e", cursor: "pointer" };
  const pillInactive = { ...pillBase, border: "1.5px solid #ead4b8", background: "#fffcf7", color: "#9b7e6a", cursor: "pointer" };

  return (
    <div style={{ minHeight: "100vh", background: "#fdf6ec", fontFamily: "'Nunito', 'Zen Maru Gothic', sans-serif", position: "relative", overflow: "hidden" }}>

      {/* 肉球背景 */}
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", opacity: 0.045 }} viewBox="0 0 800 800">
        <g fill="#c8833a">
          <ellipse cx="60"  cy="80"  rx="18" ry="14"/><ellipse cx="44"  cy="62"  rx="8"  ry="6"/><ellipse cx="60"  cy="58"  rx="8"  ry="6"/><ellipse cx="76"  cy="62"  rx="8"  ry="6"/>
          <ellipse cx="720" cy="200" rx="16" ry="12"/><ellipse cx="706" cy="184" rx="7"  ry="5.5"/><ellipse cx="720" cy="180" rx="7"  ry="5.5"/><ellipse cx="734" cy="184" rx="7"  ry="5.5"/>
          <ellipse cx="400" cy="720" rx="20" ry="15"/><ellipse cx="382" cy="701" rx="9"  ry="7"/><ellipse cx="400" cy="696" rx="9"  ry="7"/><ellipse cx="418" cy="701" rx="9"  ry="7"/>
          <ellipse cx="140" cy="500" rx="14" ry="10"/><ellipse cx="128" cy="487" rx="6"  ry="5"/><ellipse cx="140" cy="484" rx="6"  ry="5"/><ellipse cx="152" cy="487" rx="6"  ry="5"/>
        </g>
      </svg>

      {/* ===== HEADER ===== */}
      <div style={{ position: "relative", zIndex: 10, background: "#fffcf7", borderBottom: "1.5px solid #ead4b8", padding: "0 28px", height: 62, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 38, height: 38, background: "#fdefd8", borderRadius: 12, border: "1.5px solid #e09a50", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <CatLogo />
          </div>
          <div>
            <div style={{ fontSize: 21, fontWeight: 900, color: "#7a4f2e", letterSpacing: "-0.3px" }}>
              Neko<span style={{ color: "#c8833a" }}>Tabi</span>
            </div>
            <div style={{ fontSize: 10, fontWeight: 600, color: "#9b7e6a", letterSpacing: "1.5px" }}>AI TRAVEL PLANNER</div>
          </div>
        </div>
        <LanguageSwitcher />
      </div>

      {/* ===== HERO ===== */}
      <div style={{ position: "relative", zIndex: 5, padding: "28px 28px 20px", textAlign: "center" }}>
        <h1 style={{ fontSize: 26, fontWeight: 900, color: "#7a4f2e", lineHeight: 1.25, marginBottom: 6 }}>
          {t("travel.heroTitle")}<br />
          <span style={{ color: "#c8833a" }}>{t("travel.heroSub")}</span>
        </h1>
        <p style={{ fontSize: 13, color: "#9b7e6a", marginBottom: 22, fontWeight: 500 }}>{t("travel.heroDesc")}</p>

        {/* メイン入力 */}
        <div style={{ position: "relative", maxWidth: 680, margin: "0 auto 14px" }}>
          <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 22, pointerEvents: "none" }}>🐱</span>
          <input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !loading && generatePlan()}
            placeholder={t("travel.planPlaceholder")}
            style={{ width: "100%", padding: "15px 152px 15px 50px", borderRadius: 18, border: `2px solid ${error ? "#d4868a" : "#ead4b8"}`, background: "#fffcf7", fontSize: 14, fontFamily: "inherit", fontWeight: 600, color: "#3d2b1f", outline: "none", boxShadow: "0 4px 20px rgba(200,131,58,0.1)", transition: "border-color 0.2s" }}
          />
          <button onClick={generatePlan} disabled={loading}
            style={{ position: "absolute", right: 6, top: 6, bottom: 6, padding: "0 20px", borderRadius: 13, border: "none", background: loading ? "#d4c4b0" : "#c8833a", color: "white", fontSize: 13, fontWeight: 800, fontFamily: "inherit", cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 5, boxShadow: loading ? "none" : "0 2px 10px rgba(200,131,58,0.4)", whiteSpace: "nowrap", transition: "background 0.2s" }}>
            {loading ? `🐾 ${t("travel.generating")}` : `✨ ${t("travel.generate")}`}
          </button>
        </div>

        {error && <p style={{ color: "#d4868a", fontSize: 12, fontWeight: 700, marginBottom: 10 }}>{error}</p>}

        {/* ===== オプションピル ===== */}
        <div style={{ display: "flex", gap: 7, justifyContent: "center", flexWrap: "wrap", maxWidth: 680, margin: "0 auto" }}>

          {/* 日付 */}
          <label style={pillActive}>
            📅
            <input type="date" value={startDate.toISOString().split("T")[0]} min={todayStr}
              onChange={(e) => setStartDate(new Date(e.target.value))}
              style={{ border: "none", background: "transparent", fontSize: 12, fontWeight: 700, color: "#7a4f2e", fontFamily: "inherit", cursor: "pointer", outline: "none" }} />
          </label>

          {/* 日帰り/宿泊 */}
          <button onClick={() => setStayType("日帰り")} style={stayType === "日帰り"
            ? { ...pillBase, border: "1.5px solid #7d9e7a", background: "#e4eedf", color: "#3d5c3a", cursor: "pointer" }
            : pillInactive}>
            ☀️ {t("travel.dayTrip")}
          </button>
          <button onClick={() => setStayType("宿泊")} style={stayType === "宿泊"
            ? { ...pillBase, border: "1.5px solid #7d9e7a", background: "#e4eedf", color: "#3d5c3a", cursor: "pointer" }
            : pillInactive}>
            🌙 {t("travel.overnight")}
          </button>

          {/* 出発時間 */}
          <label style={pillInactive}>
            ⏰
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)}
              style={{ border: "none", background: "transparent", fontSize: 12, fontWeight: 700, color: "#9b7e6a", fontFamily: "inherit", cursor: "pointer", outline: "none" }} />
          </label>

          {/* 出発場所 */}
          <div style={pillInactive}>
            📍
            <input value={startLocation} onChange={(e) => setStartLocation(e.target.value)}
              placeholder={t("travel.departurePlaceholder")}
              style={{ border: "none", background: "transparent", fontSize: 12, fontWeight: 700, color: "#9b7e6a", fontFamily: "inherit", outline: "none", width: 110 }} />
          </div>

          {/* 宿泊数 */}
          {stayType === "宿泊" && (
            <div style={{ ...pillBase, border: "1.5px solid #d4868a", background: "#fceaea", color: "#7a3a3d" }}>
              🌙
              <input type="number" value={nights} min={1} onChange={(e) => setNights(Number(e.target.value))}
                style={{ border: "none", background: "transparent", fontSize: 12, fontWeight: 700, color: "#7a3a3d", fontFamily: "inherit", outline: "none", width: 36 }} />
              {t("travel.nights")}
            </div>
          )}

          {/* 宿泊場所 */}
          {stayType === "宿泊" && (
            <div style={pillInactive}>
              🏨
              <input value={stayLocation} onChange={(e) => setStayLocation(e.target.value)}
                placeholder={t("travel.stayPlaceholder")}
                style={{ border: "none", background: "transparent", fontSize: 12, fontWeight: 700, color: "#9b7e6a", fontFamily: "inherit", outline: "none", width: 110 }} />
            </div>
          )}
        </div>
      </div>

      {/* ===== コンテンツグリッド ===== */}
      <div style={{ position: "relative", zIndex: 5, padding: "0 28px 28px", display: "grid", gridTemplateColumns: "1fr 330px", gap: 18 }}>

        {/* 地図 */}
        <MapCard directions={directions} plan={plan} isLoaded={isLoaded} t={t} />

        {/* タイムライン or 空状態 */}
        {plan ? (
          <TimelineCard plan={plan} lang={lang} t={t} />
        ) : (
          <div style={{ background: "#fffcf7", borderRadius: 22, border: "1.5px solid #ead4b8", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32, textAlign: "center", boxShadow: "0 4px 20px rgba(200,131,58,0.08)", minHeight: 300 }}>
            <div style={{ fontSize: 48, marginBottom: 12, opacity: 0.35 }}>🐾</div>
            <p style={{ fontSize: 14, fontWeight: 800, color: "#7a4f2e", marginBottom: 6 }}>{t("travel.emptyTitle")}</p>
            <p style={{ fontSize: 12, color: "#9b7e6a", lineHeight: 1.6 }}>{t("travel.emptyDesc")}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}
