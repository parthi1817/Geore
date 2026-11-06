import { useRef, useState } from "react";

const validImageExtensions = /\.(png|jpe?g|tiff?|webp|bmp|avif)$/i;

function isValidImageFile(file) {
  if (!file) return false;
  const name = file.name?.toLowerCase() || "";
  const type = file.type?.toLowerCase() || "";
  return type.startsWith("image/") || validImageExtensions.test(name);
}

export default function UploadPanel({
  image1,
  image2,
  hasSar,
  location,
  onImage1,
  onImage2,
  onSarToggle,
  onLocation,
}) {
  const ref1 = useRef(null);
  const ref2 = useRef(null);
  const [drag1, setDrag1] = useState(false);
  const [drag2, setDrag2] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleFileSelection = (file, onSet) => {
    if (!file) return;
    if (!isValidImageFile(file)) {
      setErrorMsg(`"${file.name}" is not a supported image file. Please choose a PNG, JPG, WEBP, or TIFF.`);
      return;
    }
    setErrorMsg("");
    onSet(file);
    if (onLocation) onLocation(""); // Clear location if file selected
  };

  const handleLocationChange = (e) => {
    const val = e.target.value;
    if (onLocation) onLocation(val);
    if (val) {
      onImage1(null);
      onImage2(null);
    }
  };

  const handleLoadSample = async () => {
    try {
      setErrorMsg("");
      const res = await fetch("/geore-logo.jpg");
      const blob = await res.blob();
      const sampleFile = new File([blob], "sample_satellite.jpg", { type: "image/jpeg" });
      onImage1(sampleFile);
      if (onLocation) onLocation("");
    } catch (err) {
      setErrorMsg("Failed to load sample image: " + err.message);
    }
  };

  const renderUploadCard = ({
    image,
    helperText,
    placeholder,
    refInput,
    onSet,
    dragState,
    setDragState,
    inputLabel,
  }) => {
    const isBusy = dragState;

    return (
      <div
        className={`upload-box ${image ? "has-file" : ""} ${isBusy ? "is-dragging" : ""}`}
        onClick={() => {
          if (refInput.current) {
            refInput.current.value = "";
            refInput.current.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragState(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setDragState(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setDragState(false);
          const file = e.dataTransfer.files?.[0];
          handleFileSelection(file, onSet);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            if (refInput.current) {
              refInput.current.value = "";
              refInput.current.click();
            }
          }
        }}
        role="button"
        tabIndex={0}
      >
        <input
          ref={refInput}
          type="file"
          accept="image/*,.png,.jpg,.jpeg,.tif,.tiff,.webp,.bmp"
          onClick={(e) => {
            e.stopPropagation();
            e.target.value = "";
          }}
          onChange={(e) => handleFileSelection(e.target.files?.[0], onSet)}
          className="upload-input"
          aria-label={inputLabel}
        />

        <div className="upload-placeholder-content">
          <span className="upload-icon-large" aria-hidden="true">
            &#x21E7;
          </span>
          <div className="upload-title">{placeholder}</div>
          <div className="upload-format">{helperText}</div>

          {image ? (
            <div className="file-name-row" onClick={(e) => e.stopPropagation()}>
              <span className="upload-file-icon">📁</span>
              <span className="file-name">{image.name}</span>
              <button
                type="button"
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#ff8f8f",
                  cursor: "pointer",
                  fontSize: "14px",
                  marginLeft: "6px",
                  padding: "0 4px",
                }}
                title="Remove image"
                onClick={(e) => {
                  e.stopPropagation();
                  onSet(null);
                }}
              >
                ✕
              </button>
            </div>
          ) : (
            <div className="upload-hint">Click or drag &amp; drop</div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div>
      {onLocation && (
        <div style={{ marginBottom: 18 }}>
          <p className="section-label">FETCH FROM GEE (OR USE UPLOAD BELOW)</p>
          <input
            type="text"
            value={location || ""}
            onChange={handleLocationChange}
            placeholder="e.g. NP-KTM-01 or Kathmandu"
            style={{
              width: "100%",
              padding: "8px",
              boxSizing: "border-box",
              borderRadius: "4px",
              border: "1px solid var(--border)",
              background: "var(--surface)",
              color: "var(--text-main)",
            }}
          />
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", opacity: location ? 0.5 : 1 }}>
        <p className="section-label" style={{ margin: 0 }}>PRIMARY IMAGE</p>
        {!image1 && !location && (
          <button
            type="button"
            onClick={handleLoadSample}
            style={{
              background: "transparent",
              border: "1px solid var(--border)",
              borderRadius: "4px",
              color: "var(--accent)",
              fontSize: "11px",
              padding: "2px 8px",
              cursor: "pointer",
            }}
          >
            Use Sample
          </button>
        )}
      </div>

      {errorMsg && (
        <div style={{ color: "#ff8f8f", fontSize: "12px", marginTop: "6px", marginBottom: "6px" }}>
          {errorMsg}
        </div>
      )}

      <div style={{ marginTop: 8, opacity: location ? 0.5 : 1, pointerEvents: location ? "none" : "auto" }}>
        {renderUploadCard({
          image: image1,
          helperText: "PNG, JPG, WEBP or TIFF",
          placeholder: "Upload primary image",
          refInput: ref1,
          onSet: onImage1,
          dragState: drag1,
          setDragState: setDrag1,
          inputLabel: "Upload primary image",
        })}
      </div>

      <div style={{ marginTop: 18, opacity: location ? 0.5 : 1, pointerEvents: location ? "none" : "auto" }}>
        <p className="section-label">COMPARISON IMAGE (OPTIONAL)</p>

        {renderUploadCard({
          image: image2,
          helperText: "Useful for change detection or SAR",
          placeholder: "Upload comparison image",
          refInput: ref2,
          onSet: onImage2,
          dragState: drag2,
          setDragState: setDrag2,
          inputLabel: "Upload comparison image",
        })}
      </div>

      <div className="sar-toggle-row">
        <input
          type="checkbox"
          id="sar-toggle"
          checked={hasSar}
          onChange={(e) => onSarToggle(e.target.checked)}
          className="sar-checkbox"
        />
        <label htmlFor="sar-toggle" className="sar-label">
          Image 2 is SAR (radar) imagery
        </label>
      </div>
    </div>
  );
}
