# GEORE — Remote Sensing AI

Agentic vision-language assistant for satellite imagery analysis.  
Supports **Visual Q&A**, **Grounding**, **Change Detection**, and **Optical–SAR Fusion**.

## Architecture

```
┌─────────────────────────────────────────────┐
│  React frontend (Vite)                      │
│  localhost:5173                             │
│      │                                      │
│      ▼ POST /analyze                        │
│  FastAPI backend                            │
│  localhost:8000                             │
│      │                                      │
│      ├─ router.py      (classify query)     │
│      ├─ rs_toolkit.py  (NDVI, change, etc.) │
│      ├─ prompts.py     (build prompt)       │
│      └─ vlm_client.py  (Gemini / NVIDIA)    │
└─────────────────────────────────────────────┘
```

## Setup

### 1. Backend

```bash
cd backend

# Create and populate .env with your API keys
cp .env.example .env
# Edit .env — add GEMINI_API_KEY (required), NVIDIA_API_KEY (optional fallback)

pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Health check: `curl http://localhost:8000/health`

### 2. Frontend (separate terminal)

```bash
cd frontend
npm install
npm run dev
```

Navigate to `http://localhost:5173` in your browser.

---

## Usage

1. Upload a satellite image (PNG, JPEG, or GeoTIFF) or provide a region location
2. Optionally upload a second image for change detection or fusion
3. Type a query and click **Run analysis**

| Task | Input | Example query |
|------|-------|---------------|
| Visual Q&A | 1 image + question | "What type of land use is shown?" |
| Grounding | 1 image + spatial query | "Highlight the water body" |
| Change Detection | 2 images + temporal query | "What changed between these images?" |
| Optical–SAR Fusion | 2 images (SAR checked) | "Analyze the land cover" |

---

## Running Tests

GEORE includes a dedicated unit test suite for the deterministic remote-sensing toolkit and query classifier:

```bash
# Run all backend unit tests
python -m unittest discover -s backend/tests -p "test_*.py" -v
```

Tests run automatically on every push via the GitHub Actions CI pipeline.

---

## API Reference

### `GET /health`
Returns server status:
```json
{"status": "ok"}
```

### `GET /regions`
Returns list of monitored regions available for live Earth Engine observation fetching.

### `POST /analyze`
Multipart form:
- `query` — string (required)
- `image1` — file (optional if `location` provided)
- `image2` — file (optional comparison/SAR image)
- `location` — string (optional, e.g. "NP-KTM-01" or "Kathmandu" for live/synthetic fetch)
- `has_sar` — boolean (optional, default `false`)

Returns JSON with `answer`, `task`, `detection`, `confidence`, `execution_trace`, `image1_base64`, and telemetry when applicable.

---

## License

Distributed under the MIT License.
