import React, { useState } from "react";

const VideoPlayer = ({ video }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  console.log("VideoPlayer renderovan", video);

  if (!video || !video.url) {
    console.log("Nema videa ili URL");
    return null;
  }

  return (
    <div className="video-gallery-item">
      {!isPlaying ? (
        <div
          className="video-thumbnail"
          onClick={() => {
            console.log("Klik na video thumbnail");
            setIsPlaying(true);
          }}
          style={{ cursor: "pointer" }}
        >
          {video.thumbnail ? (
            <img src={video.thumbnail} alt={video.naziv} />
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
          className="video-player-inline"
          autoPlay
          src={video.url}
          style={{ width: "100%", aspectRatio: "16/9" }}
        />
      )}
      <div className="video-title">{video.naziv || "Video"}</div>
    </div>
  );
};

export default VideoPlayer;
