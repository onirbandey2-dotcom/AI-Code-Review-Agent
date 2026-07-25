"""
CodeSage AI - Repository Models
Git repository, pull request, and review management.
"""

from __future__ import annotations

import enum
import uuid
from datetime import datetime
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import (
    Boolean,
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

if TYPE_CHECKING:
    from app.models.user import User


class RepositoryProvider(str, enum.Enum):
    """Git provider enumeration."""

    GITHUB = "github"
    GITLAB = "gitlab"
    BITBUCKET = "bitbucket"
    SELF_HOSTED = "self_hosted"


class ReviewStatus(str, enum.Enum):
    """Review status enumeration."""

    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class ReviewDecision(str, enum.Enum):
    """Review decision enumeration."""

    APPROVED = "approved"
    CHANGES_REQUESTED = "changes_requested"
    COMMENTED = "commented"
    DISMISSED = "dismissed"


class Repository(Base):
    """Connected git repository model."""

    __tablename__ = "repositories"

    id: Mapped[uuid.UUID] = mapped_column(
        GUID(), primary_key=True, default=uuid.uuid4
    )
    owner_id: Mapped[uuid.UUID] = mapped_column(
        GUID(), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(500), nullable=False, unique=True)
    description: Mapped[Optional[str]] = mapped_column(Text)
    provider: Mapped[RepositoryProvider] = mapped_column(
        Enum(RepositoryProvider), default=RepositoryProvider.GITHUB
    )
    provider_repo_id: Mapped[Optional[str]] = mapped_column(String(100))
    clone_url: Mapped[str] = mapped_column(String(500), nullable=False)
    default_branch: Mapped[str] = mapped_column(String(100), default="main")
    is_private: Mapped[bool] = mapped_column(Boolean, default=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    language: Mapped[Optional[str]] = mapped_column(String(50))
    topics: Mapped[List[str]] = mapped_column(JSONType, default=list)
    extra_data: Mapped[dict] = mapped_column("metadata", JSONType, default=dict)
    last_synced_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # Relationships
    owner: Mapped["User"] = relationship(back_populates="repositories")
    pull_requests: Mapped[List["PullRequest"]] = relationship(
        back_populates="repository", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<Repository {self.full_name}>"


class PullRequest(Base):
    """Pull request model."""

    __tablename__ = "pull_requests"

    id: Mapped[uuid.UUID] = mapped_column(
        GUID(), primary_key=True, default=uuid.uuid4
    )
    repository_id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        ForeignKey("repositories.id", ondelete="CASCADE"),
        nullable=False,
    )
    provider_pr_id: Mapped[Optional[str]] = mapped_column(String(100))
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text)
    source_branch: Mapped[str] = mapped_column(String(255), nullable=False)
    target_branch: Mapped[str] = mapped_column(String(255), nullable=False)
    commit_sha: Mapped[Optional[str]] = mapped_column(String(40))
    author: Mapped[str] = mapped_column(String(100), nullable=False)
    state: Mapped[str] = mapped_column(String(20), default="open")
    is_merged: Mapped[bool] = mapped_column(Boolean, default=False)
    additions: Mapped[int] = mapped_column(Integer, default=0)
    deletions: Mapped[int] = mapped_column(Integer, default=0)
    changed_files: Mapped[int] = mapped_column(Integer, default=0)
    labels: Mapped[List[str]] = mapped_column(JSONType, default=list)
    extra_data: Mapped[dict] = mapped_column("metadata", JSONType, default=dict)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # Relationships
    repository: Mapped["Repository"] = relationship(back_populates="pull_requests")
    reviews: Mapped[List["Review"]] = relationship(
        back_populates="pull_request", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<PR #{self.provider_pr_id} {self.title}>"


class Review(Base):
    """Code review model."""

    __tablename__ = "reviews"

    id: Mapped[uuid.UUID] = mapped_column(
        GUID(), primary_key=True, default=uuid.uuid4
    )
    pull_request_id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        ForeignKey("pull_requests.id", ondelete="CASCADE"),
        nullable=False,
    )
    reviewer_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        GUID(), ForeignKey("users.id", ondelete="SET NULL")
    )
    status: Mapped[ReviewStatus] = mapped_column(
        Enum(ReviewStatus), default=ReviewStatus.PENDING
    )
    decision: Mapped[Optional[ReviewDecision]] = mapped_column(Enum(ReviewDecision))
    risk_score: Mapped[Optional[float]] = mapped_column(Float, default=0.0)
    summary: Mapped[Optional[str]] = mapped_column(Text)
    total_issues: Mapped[int] = mapped_column(Integer, default=0)
    critical_issues: Mapped[int] = mapped_column(Integer, default=0)
    major_issues: Mapped[int] = mapped_column(Integer, default=0)
    minor_issues: Mapped[int] = mapped_column(Integer, default=0)
    security_issues: Mapped[int] = mapped_column(Integer, default=0)
    quality_issues: Mapped[int] = mapped_column(Integer, default=0)
    ai_confidence_score: Mapped[Optional[float]] = mapped_column(Float)
    is_automatic: Mapped[bool] = mapped_column(Boolean, default=True)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    extra_data: Mapped[dict] = mapped_column("metadata", JSONType, default=dict)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # Relationships
    pull_request: Mapped["PullRequest"] = relationship(back_populates="reviews")
    comments: Mapped[List["ReviewComment"]] = relationship(
        back_populates="review", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<Review {self.id} for PR {self.pull_request_id}>"


class ReviewComment(Base):
    """Individual review comment on a specific code line."""

    __tablename__ = "review_comments"

    id: Mapped[uuid.UUID] = mapped_column(
        GUID(), primary_key=True, default=uuid.uuid4
    )
    review_id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        ForeignKey("reviews.id", ondelete="CASCADE"),
        nullable=False,
    )
    file_path: Mapped[str] = mapped_column(String(500), nullable=False)
    line_start: Mapped[int] = mapped_column(Integer, nullable=False)
    line_end: Mapped[Optional[int]] = mapped_column(Integer)
    severity: Mapped[str] = mapped_column(String(20), default="minor")
    category: Mapped[str] = mapped_column(String(50), nullable=False)
    rule_id: Mapped[Optional[str]] = mapped_column(String(100))
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    suggestion: Mapped[Optional[str]] = mapped_column(Text)
    ai_explanation: Mapped[Optional[str]] = mapped_column(Text)
    ai_confidence: Mapped[Optional[float]] = mapped_column(Float)
    original_code: Mapped[Optional[str]] = mapped_column(Text)
    suggested_code: Mapped[Optional[str]] = mapped_column(Text)
    is_resolved: Mapped[bool] = mapped_column(Boolean, default=False)
    extra_data: Mapped[dict] = mapped_column("metadata", JSONType, default=dict)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    # Relationships
    review: Mapped["Review"] = relationship(back_populates="comments")

    def __repr__(self) -> str:
        return f"<ReviewComment {self.category}: {self.title}>"

