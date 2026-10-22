import { useState, useMemo } from "react";
import "./styles/tokens.css";
import { analyzeImages } from "./api";
import UploadPanel from "./components/UploadPanel";
import QueryBar from "./components/QueryBar";
import ImageViewer from "./components/ImageViewer";
import ResultCard from "./components/ResultCard";


export default function App() {
  const [image1, setImage1] = useState(null);
  const [image2, setImage2] = useState(null);
  const [hasSar, setHasSar] = useState(false);
  const [location, setLocation] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);


  // Object URLs for preview or GEE fetched base64
  const image1Url = useMemo(() => {
    if (image1) return URL.createObjectURL(image1);
    if (result?.image1_base64) return `data:image/jpeg;base64,${result.image1_base64}`;
    return null;
  }, [image1, result]);

  const image2Url = useMemo(() => {
    if (image2) return URL.createObjectURL(image2);
    if (result?.image2_base64) return `data:image/jpeg;base64,${result.image2_base64}`;
    return null;
  }, [image2, result]);


  const canRun = (!!image1 || location.trim().length > 0) && query.trim().length > 0;


  async function handleRun() {
    if (!canRun || loading) return;


    setLoading(true);
    setError(null);
    setResult(null);


    const fd = new FormData();
    if (image1) fd.append("image1", image1);
    if (location) fd.append("location", location.trim());
    fd.append("query", query.trim());
    if (image2) fd.append("image2", image2);
    fd.append("has_sar", hasSar.toString());


    try {
      const data = await analyzeImages(fd);
      setResult(data);
    } catch (err) {
      setError(err.message || "Analysis request failed");
    } finally {
      setLoading(false);
    }
  }


  const image2Label = hasSar ? "Image 2 (SAR)" : "Image 2 (After)";


  return (
    <div className="app-layout">
      {/* ── Header ─────────────────────────────────────── */}
      <header className="app-header">
        <div className="header-brand">
          <img
            src="/geore-logo.jpg"
            alt="GEORE logo"
            className="header-logo"
          />
          <div>
            <span className="app-wordmark">GEORE</span>
            <span className="app-wordmark-sub">
              Remote sensing analysis instrument
            </span>
          </div>
        </div>
      </header>


      {/* ── Two-pane body ─────────────────────────────── */}
      <div className="app-body">
        {/* Left: Input deck */}
        <aside className="panel">
          <UploadPanel
            image1={image1}
            image2={image2}
            hasSar={hasSar}
            location={location}
            onImage1={setImage1}
            onImage2={setImage2}
            onSarToggle={setHasSar}
            onLocation={setLocation}
          />
          <QueryBar
            query={query}
            onQueryChange={setQuery}
            onRun={handleRun}
            disabled={!canRun}
            loading={loading}
          />
        </aside>


        {/* Center: Image viewer + results below */}
        <main className="panel-center">
          {loading && <div className="loading-text">Analyzing… (GEE fetching can take 15+ seconds)</div>}
          {!loading && (
            <ImageViewer
              image1Url={image1Url}
              image2Url={image2Url}
              image2Label={image2Label}
              bbox={result?.bbox || null}
            />
          )}

          {/* Results rendered below the image */}
          {error && (
            <div className="result-error">
              <span className="result-error-icon">⚠️</span>
              <span>{error}</span>
            </div>
          )}
          {!error && result && result.answer && (
            <div className="result-below-image">
              <ResultCard result={result} image1Url={image1Url} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
