"""
test_router.py — Unit tests for rule-based query classifier and helper utilities.
"""

import unittest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from router import classify_query
from main import app, parse_grounding_json, compute_confidence
from fastapi.testclient import TestClient


class TestRouter(unittest.TestCase):
    def test_change_detection_classification(self):
        # 2 images with temporal keywords -> change
        self.assertEqual(classify_query("What changed between 2020 and 2024?", num_images=2, has_sar=False), "change")
        self.assertEqual(classify_query("Compare the deforestation over time", num_images=2, has_sar=False), "change")

    def test_fusion_classification(self):
        # 2 images with SAR flag -> fusion
        self.assertEqual(classify_query("Analyze urban density", num_images=2, has_sar=True), "fusion")

    def test_grounding_classification(self):
        # 1 image with grounding phrase -> grounding
        self.assertEqual(classify_query("Highlight the river in the image", num_images=1, has_sar=False), "grounding")
        self.assertEqual(classify_query("Where is the airport?", num_images=1, has_sar=False), "grounding")
        self.assertEqual(classify_query("Show me the buildings", num_images=1, has_sar=False), "grounding")

    def test_vqa_default(self):
        # Generic query -> vqa
        self.assertEqual(classify_query("What kind of terrain is visible?", num_images=1, has_sar=False), "vqa")
        self.assertEqual(classify_query("Describe the landscape in detail", num_images=1, has_sar=False), "vqa")

    def test_parse_grounding_json_normalized(self):
        raw = '{"bbox": [0.1, 0.2, 0.8, 0.9], "description": "reservoir detected"}'
        parsed = parse_grounding_json(raw)
        self.assertIsNotNone(parsed)
        self.assertEqual(parsed["bbox"], [0.1, 0.2, 0.8, 0.9])

    def test_parse_grounding_json_1000_scale(self):
        raw = '```json\n{"bbox": [100, 200, 800, 900], "description": "reservoir detected"}\n```'
        parsed = parse_grounding_json(raw)
        self.assertIsNotNone(parsed)
        self.assertEqual(parsed["bbox"], [0.1, 0.2, 0.8, 0.9])

    def test_confidence_computation(self):
        self.assertEqual(compute_confidence("vqa", {}, "A very short"), "moderate")
        long_answer = "This is a detailed analysis of the satellite image depicting extensive vegetation coverage and urban layout across multiple square kilometers."
        self.assertEqual(compute_confidence("vqa", {}, long_answer), "high")

    def test_api_regions_and_validation(self):
        client = TestClient(app)
        # Test /health
        res_health = client.get("/health")
        self.assertEqual(res_health.status_code, 200)
        self.assertEqual(res_health.json(), {"status": "ok"})

        # Test /regions
        res_regions = client.get("/regions")
        self.assertEqual(res_regions.status_code, 200)
        regions = res_regions.json()
        self.assertTrue(len(regions) >= 2)
        self.assertEqual(regions[0]["id"], "NP-KTM-01")

        # Test /analyze validation without image or location
        res_bad = client.post("/analyze", data={"query": "Test query"})
        self.assertEqual(res_bad.status_code, 400)


if __name__ == "__main__":
    unittest.main()
