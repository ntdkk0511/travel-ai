/**
 * HotelBudgetInput.jsx
 *
 * ホテルの予算を任意で入力できるコンポーネント。
 * stayType === "宿泊" のときだけ App.jsx 側で表示してください。
 *
 * Props:
 *   budget       : string        — 現在の予算値（App側のstate）
 *   setBudget    : (v: string) => void — 予算更新関数
 *   currency     : string        — 通貨単位ラベル（省略時 "円"）
 */

export default function HotelBudgetInput({ budget, setBudget, currency = "円" }) {
    return (
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <label style={{ whiteSpace: "nowrap", fontSize: "14px" }}>
                🏨 1泊予算（任意）
            </label>
            <input
                type="number"
                min={0}
                step={1000}
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="例: 15000"
                style={{ width: "110px", padding: "10px" }}
            />
            <span style={{ fontSize: "14px" }}>{currency}</span>
        </div>
    );
}