"""Analytics service for tracking platform usage metrics, popular languages,
common error topics, and latency without tracking sensitive personal information.
"""

import time
from typing import Dict, Any, List

class AnalyticsService:
    def __init__(self):
        self.total_queries = 42  # Seed baseline
        self.successful_queries = 41
        self.failed_queries = 1
        self.total_latency_ms = 41 * 450
        self.language_counts: Dict[str, int] = {
            "Python": 18,
            "Java": 11,
            "JavaScript": 8,
            "TypeScript": 5,
            "C++": 4,
            "SQL": 3,
            "Go": 2
        }
        self.mode_counts: Dict[str, int] = {
            "tutor": 22,
            "debugger": 10,
            "project-architect": 4,
            "converter": 3,
            "practice": 2,
            "interview": 1
        }
        self.common_errors: Dict[str, int] = {
            "NullPointerException (Java)": 8,
            "IndexError / Out of Bounds": 6,
            "TypeError: Cannot read property of undefined": 5,
            "CORS policy header missing": 4,
            "Segmentation Fault (C/C++)": 3,
            "IndentationError (Python)": 3,
            "Deadlock / Concurrency": 2
        }
        self.recent_activity: List[Dict[str, Any]] = []

    def record_query(self, language: str, mode: str, latency_ms: float, success: bool = True, error_type: str = None):
        """Record an anonymous query event."""
        self.total_queries += 1
        if success:
            self.successful_queries += 1
        else:
            self.failed_queries += 1

        self.total_latency_ms += latency_ms

        # Normalize and record language
        lang = (language or "General").strip().title()
        self.language_counts[lang] = self.language_counts.get(lang, 0) + 1

        # Record mode
        m = (mode or "tutor").strip().lower()
        self.mode_counts[m] = self.mode_counts.get(m, 0) + 1

        if error_type:
            self.common_errors[error_type] = self.common_errors.get(error_type, 0) + 1

        self.recent_activity.insert(0, {
            "timestamp": int(time.time()),
            "language": lang,
            "mode": m,
            "latency_ms": round(latency_ms, 1),
            "success": success
        })
        if len(self.recent_activity) > 50:
            self.recent_activity.pop()

    def get_stats(self) -> Dict[str, Any]:
        """Compute aggregated statistics."""
        avg_latency = round(self.total_latency_ms / max(1, self.successful_queries), 1)

        # Sort top languages
        top_languages = sorted(
            [{"name": k, "count": v} for k, v in self.language_counts.items()],
            key=lambda x: x["count"],
            reverse=True
        )[:10]

        # Sort top errors
        top_errors = sorted(
            [{"error": k, "count": v} for k, v in self.common_errors.items()],
            key=lambda x: x["count"],
            reverse=True
        )[:10]

        return {
            "total_queries": self.total_queries,
            "successful_queries": self.successful_queries,
            "failed_queries": self.failed_queries,
            "success_rate": round((self.successful_queries / max(1, self.total_queries)) * 100, 1),
            "average_response_ms": avg_latency,
            "top_languages": top_languages,
            "mode_distribution": self.mode_counts,
            "common_errors": top_errors,
            "recent_activity": self.recent_activity[:15]
        }


# Global singleton
analytics_service = AnalyticsService()
