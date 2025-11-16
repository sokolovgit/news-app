"""Data models for Instagram scrapper."""

# from datetime import datetime
# from typing import List, Optional

# from pydantic import BaseModel, Field


# class InstagramPost(BaseModel):
#     """Model representing an Instagram post."""

#     shortcode: str = Field(..., description="Unique post identifier")
#     caption: Optional[str] = Field(None, description="Post caption/text")
#     timestamp: datetime = Field(..., description="Post creation timestamp")
#     likes_count: int = Field(0, description="Number of likes")
#     comments_count: int = Field(0, description="Number of comments")
#     media_url: str = Field(..., description="URL to the media file")
#     is_video: bool = Field(False, description="Whether the post is a video")
#     video_url: Optional[str] = Field(None, description="URL to video file if is_video")
#     location: Optional[str] = Field(None, description="Post location")
#     hashtags: List[str] = Field(default_factory=list, description="List of hashtags")


# class InstagramProfile(BaseModel):
#     """Model representing an Instagram profile."""

#     username: str = Field(..., description="Instagram username")
#     full_name: Optional[str] = Field(None, description="User's full name")
#     biography: Optional[str] = Field(None, description="Profile biography")
#     followers_count: int = Field(0, description="Number of followers")
#     following_count: int = Field(0, description="Number of following")
#     posts_count: int = Field(0, description="Number of posts")
#     is_private: bool = Field(False, description="Whether the profile is private")
#     is_verified: bool = Field(False, description="Whether the profile is verified")
#     profile_pic_url: Optional[str] = Field(None, description="Profile picture URL")
#     external_url: Optional[str] = Field(None, description="External link from bio")


# class ScrapeJobData(BaseModel):
#     """Model for scrape job data passed through BullMQ."""

#     username: str = Field(..., description="Instagram username to scrape")
#     max_posts: int = Field(10, description="Maximum number of posts to scrape")
#     include_profile: bool = Field(True, description="Whether to include profile data")


# class ScrapeJobResult(BaseModel):
#     """Model for scrape job result."""

#     username: str = Field(..., description="Instagram username that was scraped")
#     profile: Optional[InstagramProfile] = Field(None, description="Profile data")
#     posts: List[InstagramPost] = Field(default_factory=list, description="List of scraped posts")
#     scraped_at: datetime = Field(default_factory=datetime.utcnow, description="Scrape timestamp")
#     success: bool = Field(True, description="Whether the scrape was successful")
#     error: Optional[str] = Field(None, description="Error message if scrape failed")
