import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";

export default function PlanWithLinks({ result, locations }) {
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

  const enrichedText = replaceWithLinks(result, urlMap);

  return (
    <div style={{ marginTop: "20px" }}>
      <ReactMarkdown
        components={{
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          ),
        }}
      >
        {enrichedText}
      </ReactMarkdown>
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
