import "./LogoutButton.css";

export default function LogoutButton({ onLogout }) {
  return (
    <button className="lb-btn" onClick={onLogout}>
      <span className="lb-icon">🚪</span>
      ログアウト
    </button>
  );
}
