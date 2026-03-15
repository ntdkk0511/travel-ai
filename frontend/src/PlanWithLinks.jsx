import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";

export default function PlanWithLinks({ result, locations, photos }) {
  const [urlMap, setUrlMap] = useState({});

  useEffect(() => {
    if (!locations || locations.length === 0) return;

    const fetchUrls = async () => {
      try {
        const res = await fetch("http://localhost:3000/url-enrich", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ locations }),
        });
        if (!res.ok) throw new Error("取得失敗");
        const data = await res.json();
        setUrlMap(data);
      } catch (err) {
        console.error("URL取得エラー:", err);
      }
    };

    fetchUrls();
  }, [locations]);

  if (!result) return null;

  // photos配列を { 場所名: photoUrl } のマップに変換
  const photoMap = {};
  if (photos && photos.length > 0) {
    for (const p of photos) {
      if (p.photoUrl) photoMap[p.name] = p.photoUrl;
    }
  }

  // テキストを行ごとに分割して、場所名を含む行の直後に写真を挿入
  const lines = result.split("\n");
  const segments = []; // { text: string, photo: {name, url} | null }[]

  let buffer = [];
  const usedPlaces = new Set(); // 一度表示した場所を記録
  for (const line of lines) {
    // この行にどの場所名が含まれているか探す（未使用のもののみ）
    const matchedPlace = locations.find(
      (loc) => line.includes(loc) && photoMap[loc] && !usedPlaces.has(loc)
    );

    if (matchedPlace) {
      // 場所名を含む行 → bufferに追加してフラッシュ、写真をセット
      usedPlaces.add(matchedPlace); // 使用済みとして記録
      buffer.push(line);
      segments.push({
        text: replaceWithLinks(buffer.join("\n"), urlMap),
        photo: { name: matchedPlace, url: photoMap[matchedPlace] },
      });
      buffer = [];
    } else {
      buffer.push(line);
    }
  }

  // 残りのテキスト
  if (buffer.length > 0) {
    const remaining = buffer.join("\n").trim();
    // Locations:[...] 行は表示しない
    const cleaned = remaining.replace(/Locations:\s*\[.*?\]/g, "").trim();
    if (cleaned) {
      segments.push({ text: replaceWithLinks(cleaned, urlMap), photo: null });
    }
  }

  return (
    <div style={{ marginTop: "20px" }}>
      {segments.map((seg, i) => (
        <div key={i}>
          <ReactMarkdown
            components={{
              a: ({ href, children }) => (
                <a href={href} target="_blank" rel="noopener noreferrer">
                  {children}
                </a>
              ),
            }}
          >
            {seg.text.replace(/\\([*[\]()_~#`])/g, "$1")}
          </ReactMarkdown>

          {seg.photo && (
            <div style={{ margin: "10px 0 18px" }}>
              <img
                src={seg.photo.url}
                alt={seg.photo.name}
                style={{
                  width: "100%",
                  maxWidth: "480px",
                  height: "220px",
                  objectFit: "cover",
                  borderRadius: "10px",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.12)",
                  display: "block",
                }}
                onError={(e) => { e.currentTarget.style.display = "none"; }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function replaceWithLinks(text, urlMap) {
  if (!text || Object.keys(urlMap).length === 0) return text;

  let result = text;
  for (const [name, url] of Object.entries(urlMap)) {
    const alreadyLinked = new RegExp(`\\[${name}\\]\\(`);
    if (alreadyLinked.test(result)) continue;
    result = result.replace(name, `[${name}](${url})`);
  }
  return result;
}