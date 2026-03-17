/**
 * TripBudgetInput.jsx
 *
 * お出かけ全体予算（任意）の入力コンポーネント。
 * 日帰り・宿泊どちらでも表示できます。
 *
 * Props:
 *   totalBudget    : string
 *   setTotalBudget : (v: string) => void
 *   currency       : string — 省略時は翻訳から取得
 */

import { useLanguage } from "../contexts/LanguageContext";
import "./TripBudgetInput.css";

export default function TripBudgetInput({ totalBudget, setTotalBudget, currency }) {
  const { t } = useLanguage();
  const currencyLabel = currency || t("travel.currencyJP") || "円";

  return (
    <div className="tbi-wrap">
      <label className="tbi-label">
        💰 {t("travel.totalBudgetLabel") || "全体予算（任意）"}
      </label>
      <div className="tbi-input-wrap">
        <input
          className="tbi-input"
          type="number"
          min={0}
          step={1000}
          value={totalBudget}
          onChange={(e) => setTotalBudget(e.target.value)}
          placeholder="50000"
        />
        <span className="tbi-currency">{currencyLabel}</span>
      </div>
    </div>
  );
}
