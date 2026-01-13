import mongoose from "mongoose";

/* =========================
   AUDIO FILE SUB-SCHEMA
========================= */
const audioSchema = new mongoose.Schema(
    {
        fileName: { type: String, required: true },
        savedFileName: { type: String, required: true },
        url: { type: String, required: true },
        duration:{type:String,required:true},
        size: { type: Number, required: true },
    },
    { _id: false }
);

/* =========================
   ROOM STATE SUB-SCHEMA
========================= */
const roomStateSchema = new mongoose.Schema(
    {
        files: {
            type: [audioSchema],
            default: [],
        },

        currentIndex: {
            type: Number,
            default: 0,
        },

        /* ---- TIME SYNC CORE ---- */
        seek: {
            type: Number, // seconds
            default: 0,
        },

        startedAt: {
            type: Number, // Date.now() timestamp
            default: null,
        },

        playing: {
            type: Boolean,
            default: false,
        },

        /* ---- PLAY MODE ---- */
        playlistMode: {
            type: String,
            enum: ["loop", "loopOnce", "shuffle"],
            default: "loop",
        },

    shuffledIndices: {
            type: [Number],
            default: [],
        },

        rate: {
            type: Number,
            default: 1,
        },

        duration: {
            type: Number,
            default: 0,
        },
    },
    { _id: false }
);

/* =========================
   ROOM SCHEMA
========================= */
const roomSchema = new mongoose.Schema({
    roomId: {
        type: String,
        unique: true,
        required: true,
        index: true,
    },

    roomName: {
        type: String,
        required: true,
    },

    roomPassword: {
        type: String,
        select: false,
    },

    createdBy: {
        type: String,
        required: true, // IMPORTANT (host authority)
    },

    createdAt: {
        type: Date,
        default: Date.now,
    },

    /* 🔥 SINGLE SOURCE OF TRUTH 🔥 */
    roomState: {
        type: roomStateSchema,
        default: () => ({}),
    },
});

export default mongoose.model("Room", roomSchema);
