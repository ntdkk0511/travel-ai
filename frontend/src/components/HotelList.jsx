// HotelList.jsx
// 宿泊地周辺のホテルを観光地写真と同じカード形式で表示するコンポーネント

import { useEffect, useState } from "react";

export default function HotelList({ hotelLocation, stayType }) {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (stayType !== "宿泊" || !hotelLocation) return;

    const fetchHotels = async () => {
      setLoading(true);
      setError(null);
      setHotels([]);

      try {
        const res = await fetch("http://localhost:3000/api/hotels", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ stayLocation: hotelLocation }),
        });

        const data = await res.json();

        if (res.ok) {
          setHotels(data.hotels);
        } else {
          setError(data.error || "ホテル情報の取得に失敗しました");
        }
      } catch (err) {
        console.error(err);
        setError("ホテル情報の取得中にエラーが発生しました");
      } finally {
        setLoading(false);
      }
    };

    fetchHotels();
  }, [hotelLocation, stayType]);

  if (stayType !== "宿泊") return null;
  if (!hotelLocation) return null;

  return (
    <div style={{ marginTop: "24px" }}>
      <h3 style={{ marginBottom: "12px" }}>🏨 {hotelLocation} のおすすめホテル</h3>

      {loading && <p style={{ color: "#888" }}>ホテル情報を取得中...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && hotels.length === 0 && (
        <p style={{ color: "#888" }}>ホテルが見つかりませんでした。</p>
      )}

      <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", marginTop: "12px" }}>
        {hotels.map((hotel, i) => (
          <a
            key={i}
            href={hotel.googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <div
              style={{
                width: "220px",
                border: "1px solid #ddd",
                borderRadius: "12px",
                overflow: "hidden",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                backgroundColor: "#fff",
                transition: "box-shadow 0.2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.18)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)")
              }
            >
              {hotel.photoUrl ? (
                <img
                  src={hotel.photoUrl}
                  alt={hotel.name}
                  style={{ width: "100%", height: "140px", objectFit: "cover", display: "block" }}
                />
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: "140px",
                    backgroundColor: "#f0f0f0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "36px",
                  }}
                >
                  🏨
                </div>
              )}

              <div style={{ padding: "10px 12px" }}>
                <div style={{ fontWeight: "bold", fontSize: "13px", marginBottom: "6px", lineHeight: "1.4" }}>
                  {hotel.name}
                </div>
                <div style={{ fontSize: "12px", color: "#e67e22", marginBottom: "2px" }}>
                  💴 {hotel.priceLabelJa}
                </div>
                {hotel.rating && (
                  <div style={{ fontSize: "12px", color: "#f39c12", marginBottom: "2px" }}>
                    ⭐ {hotel.rating}
                  </div>
                )}
                {hotel.address && (
                  <div style={{ fontSize: "11px", color: "#888", marginTop: "4px", lineHeight: "1.3" }}>
                    {hotel.address}
                  </div>
                )}
                <div style={{ fontSize: "11px", color: "#aaa", marginTop: "6px" }}>
                  Google Mapsで見る →
                </div>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
