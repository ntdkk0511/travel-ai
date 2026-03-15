// src/contexts/LanguageContext.jsx
// 言語状態をアプリ全体で共有するためのContext
// 使い方:
//   const { lang, t, setLang } = useLanguage();
//   <p>{t("common.save")}</p>

import { createContext, useContext, useState, useCallback } from "react";
import translations from "../i18n/translations";

// サポートする言語コード
export const SUPPORTED_LANGUAGES = ["ja", "en", "zh", "ko"];

// ブラウザの言語設定から初期言語を決定する
const detectInitialLanguage = () => {
  // 1. localStorageに保存済みの言語を優先
  const saved = localStorage.getItem("appLanguage");
  if (saved && SUPPORTED_LANGUAGES.includes(saved)) return saved;

  // 2. ブラウザ言語から推定
  const browserLang = navigator.language?.slice(0, 2);
  if (SUPPORTED_LANGUAGES.includes(browserLang)) return browserLang;

  // 3. デフォルトは日本語
  return "ja";
};

const LanguageContext = createContext(null);

/**
 * LanguageProvider
 * App.jsx の最上位でラップして使用してください
 */
export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(detectInitialLanguage);

  const setLang = useCallback((newLang) => {
    if (!SUPPORTED_LANGUAGES.includes(newLang)) return;
    setLangState(newLang);
    localStorage.setItem("appLanguage", newLang);
    // html要素のlang属性も更新（アクセシビリティ対応）
    document.documentElement.lang = newLang;
  }, []);

  /**
   * 翻訳関数
   * ドット区切りのキーで翻訳文字列を取得する
   * 例: t("common.save") → "保存" (ja)
   */
  const t = useCallback(
    (key) => {
      const keys = key.split(".");
      let value = translations[lang];
      for (const k of keys) {
        value = value?.[k];
      }
      // キーが見つからない場合はキー文字列をそのまま返す
      if (value === undefined) {
        console.warn(`[i18n] Missing translation key: "${key}" for lang: "${lang}"`);
        return key;
      }
      return value;
    },
    [lang]
  );

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

/**
 * useLanguage フック
 * コンポーネント内で言語状態・翻訳関数を取得する
 */
export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within a <LanguageProvider>");
  }
  return ctx;
}
