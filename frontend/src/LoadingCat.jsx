import catGif from "./assets/cat.gif";

export default function LoadingCat() {
  return (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      <img src={catGif} alt="loading..." style={{ width: "200px", borderRadius: "10px" }} />
      
    </div>
  );
}
