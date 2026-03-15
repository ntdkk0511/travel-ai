// PhotoGallery.jsx
// 観光地の写真を取得してギャラリー表示するコンポーネント

import { useState, useEffect } from "react";

const styles = {
    wrapper: {
        marginTop: "28px",
    },
    heading: {
        fontSize: "13px",
        fontWeight: "700",
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: "#888",
        marginBottom: "14px",
    },
    grid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
        gap: "12px",
    },
    card: {
        borderRadius: "10px",
        overflow: "hidden",
        background: "#f5f5f5",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        cursor: "default",
    },
    cardHover: {
        transform: "translateY(-3px)",
        boxShadow: "0 6px 18px rgba(0,0,0,0.13)",
    },
    imgWrapper: {
        width: "100%",
        height: "130px",
        overflow: "hidden",
        background: "#e8e8e8",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },
    img: {
        width: "100%",
        height: "100%",
        objectFit: "cover",
        display: "block",
    },
    noImg: {
        fontSize: "28px",
        color: "#bbb",
    },
    label: {
        padding: "8px 10px 10px",
    },
    name: {
        fontSize: "13px",
        fontWeight: "600",
        color: "#222",
        margin: 0,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
    },
    address: {
        fontSize: "11px",
        color: "#999",
        marginTop: "3px",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
    },
    skeleton: {
        borderRadius: "10px",
        overflow: "hidden",
        background: "#f0f0f0",
        animation: "pulse 1.5s ease-in-out infinite",
    },
    skeletonImg: {
        width: "100%",
        height: "130px",
        background: "linear-gradient(90deg, #ececec 25%, #f5f5f5 50%, #ececec 75%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 1.5s infinite",
    },
    skeletonText: {
        height: "12px",
        margin: "10px 10px 6px",
        borderRadius: "4px",
        background: "#e0e0e0",
    },
    skeletonTextShort: {
        height: "10px",
        margin: "0 10px 10px",
        width: "60%",
        borderRadius: "4px",
        background: "#e8e8e8",
    },
};

// shimmerアニメーション用のグローバルスタイル（一度だけ注入）
const injectKeyframes = (() => {
    let injected = false;
    return () => {
        if (injected || typeof document === "undefined") return;
        const style = document.createElement("style");
        style.textContent = `
      @keyframes shimmer {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
    `;
        document.head.appendChild(style);
        injected = true;
    };
})();

function SkeletonCard() {
    return (
        <div style={styles.skeleton}>
            <div style={styles.skeletonImg} />
            <div style={styles.skeletonText} />
            <div style={styles.skeletonTextShort} />
        </div>
    );
}

function PlaceCard({ name, photoUrl, address }) {
    const [hovered, setHovered] = useState(false);
    const [imgError, setImgError] = useState(false);

    return (
        <div
            style={{ ...styles.card, ...(hovered ? styles.cardHover : {}) }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <div style={styles.imgWrapper}>
                {photoUrl && !imgError ? (
                    <img
                        src={photoUrl}
                        alt={name}
                        style={styles.img}
                        onError={() => setImgError(true)}
                    />
                ) : (
                    <span style={styles.noImg}>🗺️</span>
                )}
            </div>
            <div style={styles.label}>
                <p style={styles.name}>{name}</p>
                {address && <p style={styles.address}>{address}</p>}
            </div>
        </div>
    );
}

/**
 * PhotoGallery
 * Props:
 *   planText {string} - AIが生成した旅行プランのテキスト（Locations:[...] 行を含む）
 */
export default function PhotoGallery({ planText }) {
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [locationNames, setLocationNames] = useState([]);

    injectKeyframes();

    useEffect(() => {
        if (!planText) {
            setPhotos([]);
            setLocationNames([]);
            return;
        }

        // planTextからLocations:[...] 行をパース
        const match = planText.match(/Locations:\s*\[(.*?)\]/);
        if (!match) {
            setPhotos([]);
            setLocationNames([]);
            return;
        }

        const locations = match[1]
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);

        if (locations.length === 0) return;

        // 前回と同じ場所リストなら再取得しない
        if (JSON.stringify(locations) === JSON.stringify(locationNames)) return;

        setLocationNames(locations);
        setLoading(true);
        setPhotos([]);

        fetch("http://localhost:3000/api/photos", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ locations }),
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.photos) setPhotos(data.photos);
            })
            .catch((err) => console.error("写真取得エラー:", err))
            .finally(() => setLoading(false));
    }, [planText]);

    if (!planText) return null;

    const hasLocations = planText.match(/Locations:\s*\[/);
    if (!hasLocations) return null;

    return (
        <div style={styles.wrapper}>
            <p style={styles.heading}>📍 スポット写真</p>
            <div style={styles.grid}>
                {loading
                    ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
                    : photos.map((p, i) => (
                        <PlaceCard
                            key={i}
                            name={p.name}
                            photoUrl={p.photoUrl}
                            address={p.address}
                        />
                    ))}
            </div>
        </div>
    );
}