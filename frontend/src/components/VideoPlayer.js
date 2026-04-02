import React, { useMemo, useState } from "react";

const normalizeVideo = (video) => {
  if (!video) return null;

  return {
    url: video.url || video.secure_url || video.path || "",
    thumbnail: video.thumbnail || "",
    naziv: video.naziv || "",
  };
};

const VideoPlayer = ({ video }) => {
  const normalizedVideo = useMemo(() => normalizeVideo(video), [video]);
  const [isPlaying, setIsPlaying] = useState(false);

  if (!normalizedVideo || !normalizedVideo.url) {
    return null;
  }

  const handlePlay = () => {
    setIsPlaying(true);
  };

  return (
    <div className="video-gallery-item">
      {!isPlaying ? (
        <div
          className="video-thumbnail"
          onClick={handlePlay}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              handlePlay();
            }
          }}
          aria-label={`Pokreni video ${normalizedVideo.naziv || "video"}`}
          style={{ cursor: "pointer" }}
        >
          {normalizedVideo.thumbnail ? (
            <img
              src={normalizedVideo.thumbnail}
              alt={normalizedVideo.naziv || "Video thumbnail"}
              loading="lazy"
            />
          ) : (
            <div className="video-placeholder">🎬</div>
          )}

          <div className="play-button-overlay">
            <div className="play-icon">▶</div>
          </div>
        </div>
      ) : (
        <video
          controls
          autoPlay
          className="video-player-inline"
          src={normalizedVideo.url}
          style={{ width: "100%", aspectRatio: "16/9" }}
        />
      )}

      <div className="video-title">{normalizedVideo.naziv || "Video"}</div>
    </div>
  );
};

export default VideoPlayer;
