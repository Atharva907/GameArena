
import mongoose from "mongoose";

const GameTournamentRegistrationSchema = new mongoose.Schema({
  tournament: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tournament",
    required: true
  },
  player: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Player",
    required: true
  },
  registrationDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ["registered", "confirmed", "cancelled"],
    default: "registered"
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "completed", "refunded"],
    default: "pending"
  },
  teamName: {
    type: String,
    trim: true
  },
  teammates: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Player"
  }]
}, {
  timestamps: true
});

const GameTournamentRegistration = mongoose.models.GameTournamentRegistration || mongoose.model("GameTournamentRegistration", GameTournamentRegistrationSchema);

export default GameTournamentRegistration;
