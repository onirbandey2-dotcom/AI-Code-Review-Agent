"""
CodeSage AI - Analysis Models
Security findings, quality reports, complexity metrics, and code smells.
"""

from __future__ import annotations

import enum
import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional

from sqlalchemy import (
    DateTime,
    Enum,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base, GUID, JSONType


class SeverityLevel(str, enum.Enum):
    """Severity level for findings."""

    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
    INFO = "info"


class FindingCategory(str, enum.Enum):
    """Category of security/code analysis finding."""

    SQL_INJECTION = "sql_injection"
    XSS = "xss"
    COMMAND_INJECTION = "command_injection"
    HARDCODED_SECRET = "hardcoded_secret"
    WEAK_CRYPTOGRAPHY = "weak_cryptography"
    UNSAFE_DESERIALIZATION = "unsafe_deserialization"
    RACE_CONDITION = "race_condition"
    MEMORY_LEAK = "memory_leak"
    BROKEN_AUTHENTICATION = "broken_authentication"
    PATH_TRAVERSAL = "path_traversal"
    INSECURE_DIRECT_OBJECT_REFERENCE = "idor"
    SECURITY_MISCONFIGURATION = "security_misconfiguration"
    UNVALIDATED_REDIRECT = "unvalidated_redirect"
    INSECURE_DEPENDENCY = "insecure_dependency"
    SSRF = "ssrf"
    IMPROPER_ERROR_HANDLING = "improper_error_handling"
    CODE_SMELL = "code_smell"
    COMPLEXITY = "complexity"
    DUPLICATION = "duplication"
    PERFORMANCE = "performance"
    BEST_PRACTICE = "best_practice"


class SecurityFinding(Base):
    """Security vulnerability finding from analysis."""

    __tablename__ = "security_findings"

    id: Mapped[uuid.UUID] = mapped_column(
        GUID(), primary_key=True, default=uuid.uuid4
    )
    review_id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        ForeignKey("reviews.id", ondelete="CASCADE"),
        nullable=False,
    )
    category: Mapped[FindingCategory] = mapped_column(
        Enum(FindingCategory), nullable=False
    )
    severity: Mapped[SeverityLevel] = mapped_column(
        Enum(SeverityLevel), nullable=False
    )
    cwe_id: Mapped[Optional[str]] = mapped_column(String(20))
    owasp_category: Mapped[Optional[str]] = mapped_column(String(100))
    file_path: Mapped[str] = mapped_column(String(500), nullable=False)
    line_start: Mapped[int] = mapped_column(Integer, nullable=False)
    line_end: Mapped[Optional[int]] = mapped_column(Integer)
    vulnerable_code: Mapped[Optional[str]] = mapped_column(Text)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    impact: Mapped[Optional[str]] = mapped_column(Text)
    remediation: Mapped[Optional[str]] = mapped_column(Text)
    evidence: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSONType)
    cvss_score: Mapped[Optional[float]] = mapped_column(Float)
    is_false_positive: Mapped[bool] = mapped_column(default=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    def __repr__(self) -> str:
        return f"<SecurityFinding {self.category} in {self.file_path}>"


class QualityReport(Base):
    """Code quality analysis report for a review."""

    __tablename__ = "quality_reports"

    id: Mapped[uuid.UUID] = mapped_column(
        GUID(), primary_key=True, default=uuid.uuid4
    )
    review_id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        ForeignKey("reviews.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
    )
    overall_score: Mapped[float] = mapped_column(Float, default=0.0)
    maintainability_index: Mapped[Optional[float]] = mapped_column(Float)
    technical_debt_ratio: Mapped[Optional[float]] = mapped_column(Float)
    total_lines: Mapped[int] = mapped_column(Integer, default=0)
    total_functions: Mapped[int] = mapped_column(Integer, default=0)
    total_classes: Mapped[int] = mapped_column(Integer, default=0)
    comment_ratio: Mapped[Optional[float]] = mapped_column(Float)
    duplication_percentage: Mapped[Optional[float]] = mapped_column(Float)
    test_coverage: Mapped[Optional[float]] = mapped_column(Float)
    issues: Mapped[Dict[str, Any]] = mapped_column(JSONType, default=dict)
    extra_data: Mapped[Dict[str, Any]] = mapped_column("metadata", JSONType, default=dict)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    def __repr__(self) -> str:
        return f"<QualityReport score={self.overall_score}>"


class ComplexityMetric(Base):
    """Cyclomatic complexity metrics per function/method."""

    __tablename__ = "complexity_metrics"

    id: Mapped[uuid.UUID] = mapped_column(
        GUID(), primary_key=True, default=uuid.uuid4
    )
    review_id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        ForeignKey("reviews.id", ondelete="CASCADE"),
        nullable=False,
    )
    file_path: Mapped[str] = mapped_column(String(500), nullable=False)
    function_name: Mapped[str] = mapped_column(String(255), nullable=False)
    line_start: Mapped[int] = mapped_column(Integer, nullable=False)
    line_end: Mapped[int] = mapped_column(Integer, nullable=False)
    cyclomatic_complexity: Mapped[int] = mapped_column(Integer, default=1)
    cognitive_complexity: Mapped[Optional[int]] = mapped_column(Integer)
    nesting_depth: Mapped[int] = mapped_column(Integer, default=0)
    lines_of_code: Mapped[int] = mapped_column(Integer, default=0)
    parameters_count: Mapped[int] = mapped_column(Integer, default=0)
    return_points: Mapped[int] = mapped_column(Integer, default=1)
    is_excessive: Mapped[bool] = mapped_column(default=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    def __repr__(self) -> str:
        return f"<ComplexityMetric {self.function_name}: {self.cyclomatic_complexity}>"


class DuplicateBlock(Base):
    """Duplicate code block detection."""

    __tablename__ = "duplicate_blocks"

    id: Mapped[uuid.UUID] = mapped_column(
        GUID(), primary_key=True, default=uuid.uuid4
    )
    review_id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        ForeignKey("reviews.id", ondelete="CASCADE"),
        nullable=False,
    )
    file_path_1: Mapped[str] = mapped_column(String(500), nullable=False)
    start_line_1: Mapped[int] = mapped_column(Integer, nullable=False)
    end_line_1: Mapped[int] = mapped_column(Integer, nullable=False)
    file_path_2: Mapped[str] = mapped_column(String(500), nullable=False)
    start_line_2: Mapped[int] = mapped_column(Integer, nullable=False)
    end_line_2: Mapped[int] = mapped_column(Integer, nullable=False)
    similarity_percentage: Mapped[float] = mapped_column(Float, nullable=False)
    lines_count: Mapped[int] = mapped_column(Integer, nullable=False)
    tokens: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSONType)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    def __repr__(self) -> str:
        return f"<DuplicateBlock {self.similarity_percentage}%>"


class CodeSmell(Base):
    """Code smell detection results."""

    __tablename__ = "code_smells"

    id: Mapped[uuid.UUID] = mapped_column(
        GUID(), primary_key=True, default=uuid.uuid4
    )
    review_id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        ForeignKey("reviews.id", ondelete="CASCADE"),
        nullable=False,
    )
    smell_type: Mapped[str] = mapped_column(String(100), nullable=False)
    file_path: Mapped[str] = mapped_column(String(500), nullable=False)
    line_start: Mapped[int] = mapped_column(Integer, nullable=False)
    line_end: Mapped[Optional[int]] = mapped_column(Integer)
    severity: Mapped[SeverityLevel] = mapped_column(
        Enum(SeverityLevel), nullable=False
    )
    description: Mapped[str] = mapped_column(Text, nullable=False)
    suggestion: Mapped[Optional[str]] = mapped_column(Text)
    effort_hours: Mapped[Optional[float]] = mapped_column(Float)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    def __repr__(self) -> str:
        return f"<CodeSmell {self.smell_type} in {self.file_path}>"

