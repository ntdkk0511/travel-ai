// src/components/LanguageSwitcher.jsx
// 画面右上に配置する言語切替ボタンUI
// 使い方: App.jsx や Header.jsx で <LanguageSwitcher /> を配置するだけでOK

import { useLanguage, SUPPORTED_LANGUAGES } from "../contexts/LanguageContext";
import styles from "./LanguageSwitcher.module.css";

// 各言語コードの表示ラベル
const LANGUAGE_LABELS = {
  ja: "JA",
  en: "EN",
  zh: "ZH",
  ko: "KO",
};

// 各言語のネイティブ名（ツールチップ用）
const LANGUAGE_NATIVE_NAMES = {
  ja: "日本語",
  en: "English",
  zh: "中文",
  ko: "한국어",
};

export default function LanguageSwitcher() {
  const { lang, setLang } = useLanguage();

  return (
    <div className={styles.switcher} role="group" aria-label="Language selection">
      {SUPPORTED_LANGUAGES.map((code) => (
        <button
          key={code}
          className={`${styles.button} ${lang === code ? styles.active : ""}`}
          onClick={() => setLang(code)}
          aria-pressed={lang === code}
          aria-label={LANGUAGE_NATIVE_NAMES[code]}
          title={LANGUAGE_NATIVE_NAMES[code]}
        >
          {LANGUAGE_LABELS[code]}
        </button>
      ))}
    </div>
  );
}
