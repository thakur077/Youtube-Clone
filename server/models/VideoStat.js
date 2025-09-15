import mongoose from "mongoose";

const videoStatSchema = new mongoose.Schema(
  {
    videoId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true
    },
    likes: {
      type: Number,
      default: 0
    },
    dislikes: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

const VideoStat = mongoose.model("VideoStat", videoStatSchema);

export default VideoStat;


