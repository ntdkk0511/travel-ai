// PhotoGallery.jsx
import { useState, useEffect } from "react";

const styles = {
    wrapper: { marginTop: "28px" },
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
    img: { width: "100%", height: "100%", objectFit: "cover", display: "block" },
    noImg: { fontSize: "28px", color: "#bbb" },
    label: { padding: "8px 10px 10px" },
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
};

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

const skeletonImgStyle = {
    width: "100%",
    height: "130px",
    background: "linear-gradient(90deg, #ececec 25%, #f5f5f5 50%, #ececec 75%)",
    backgroundSize: "200% 100%",
    animation: "shimmer 1.5s infinite",
};

function SkeletonCard() {
    return (
        <div style={{ borderRadius: "10px", overflow: "hidden", background: "#f0f0f0" }}>
            <div style={skeletonImgStyle} />
            <div style={{ height: "12px", margin: "10px 10px 6px", borderRadius: "4px", background: "#e0e0e0" }} />
            <div style={{ height: "10px", margin: "0 10px 10px", width: "60%", borderRadius: "4px", background: "#e8e8e8" }} />
        </div>
    );
}

function PlaceCard({ name, photoUrl, address }) {
    const [hovered, setHovered] = useState(false);
    const [imgError, setImgError] = useState(false);
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name)}`;
    return (
        <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: "none", color: "inherit" }}
        >
        <div
            style={{ ...styles.card, ...(hovered ? styles.cardHover : {}) }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <div style={styles.imgWrapper}>
                {photoUrl && !imgError ? (
                    <img src={photoUrl} alt={name} style={styles.img} onError={() => setImgError(true)} />
                ) : (
                    <span style={styles.noImg}>🗺️</span>
                )}
            </div>
            <div style={styles.label}>
                <p style={styles.name}>{name}</p>
                {address && <p style={styles.address}>{address}</p>}
            </div>
        </div>

        </a>
    );
}

/**
 * PhotoGallery
 * Props:
 *   locations {string[]}        - 場所名の配列
 *   onPhotosLoaded {function}   - 写真データ取得後に呼ばれるコールバック
 */
export default function PhotoGallery({ locations, onPhotosLoaded }) {
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [prevKey, setPrevKey] = useState("");

    injectKeyframes();

    useEffect(() => {
        if (!locations || locations.length === 0) {
            setPhotos([]);
            return;
        }

        const key = locations.join(",");
        if (key === prevKey) return;
        setPrevKey(key);

        console.log(">>> [PhotoGallery] 写真取得開始:", locations);
        setLoading(true);
        setPhotos([]);

        fetch("http://localhost:3000/api/photos", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ locations }),
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.photos) {
                    setPhotos(data.photos);
                    // 親コンポーネント（App.jsx）に写真データを渡す
                    if (onPhotosLoaded) onPhotosLoaded(data.photos);
                }
            })
            .catch((err) => console.error("PhotoGallery 写真取得エラー:", err))
            .finally(() => setLoading(false));
    }, [locations]);

    if (!locations || locations.length === 0) return null;

    return (
        <div style={styles.wrapper}>
            <p style={styles.heading}>📍 スポット写真</p>
            <div style={styles.grid}>
                {loading
                    ? Array.from({ length: locations.length || 4 }).map((_, i) => <SkeletonCard key={i} />)
                    : photos.map((p, i) => (
                        <PlaceCard key={i} name={p.name} photoUrl={p.photoUrl} address={p.address} />
                    ))}
            </div>
        </div>
    );
}