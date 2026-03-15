/**
 * TripBudgetInput.jsx
 *
 * お出かけ全体予算（任意）の入力コンポーネント。
 * 日帰り・宿泊どちらでも表示できます。
 *
 * Props:
 *   totalBudget    : string
 *   setTotalBudget : (v: string) => void
 *   currency       : string — 省略時 "円"
 */

export default function TripBudgetInput({ totalBudget, setTotalBudget, currency = "円" }) {
    return (
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <label style={{ whiteSpace: "nowrap", fontSize: "14px" }}>
                💰 全体予算（任意）
            </label>
            <input
                type="number"
                min={0}
                step={1000}
                value={totalBudget}
                onChange={(e) => setTotalBudget(e.target.value)}
                placeholder="例: 50000"
                style={{ width: "110px", padding: "10px" }}
            />
            <span style={{ fontSize: "14px" }}>{currency}</span>
        </div>
    );
}