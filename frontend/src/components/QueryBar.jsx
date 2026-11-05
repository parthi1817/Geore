const SUGGESTIONS = [
  "What do you see in this image?",
  "Detect water bodies and vegetation",
  "Identify roads and built-up structures",
];

export default function QueryBar({
  query,
  onQueryChange,
  onRun,
  disabled,
  loading,
}) {
  return (
    <div className="query-bar">
      <label>Query</label>

      <textarea
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder="What do you see in this image?"
      />

      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "8px" }}>
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onQueryChange(s)}
            style={{
              background: "#16252b",
              border: "1px solid var(--border)",
              borderRadius: "4px",
              color: "var(--text-muted)",
              fontSize: "11px",
              padding: "3px 8px",
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            {s}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={onRun}
        disabled={disabled || loading}
        style={{ marginTop: "12px", opacity: disabled ? 0.6 : 1, cursor: disabled ? "not-allowed" : "pointer" }}
      >
        {loading ? "Analyzing with Gemini..." : "Run analysis"}
      </button>

      {disabled && !loading && (
        <div style={{ color: "var(--text-muted)", fontSize: "11px", marginTop: "6px", textAlign: "center" }}>
          {!query.trim() ? "Select an image and enter or pick a query above" : "Please select an image above"}
        </div>
      )}
    </div>
  );
}