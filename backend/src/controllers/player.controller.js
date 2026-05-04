import {
  createPlayerProfileRecord,
  findPlayerByEmail,
  updatePlayerProfileRecord,
} from "../lib/playerStore.js";

export async function getPlayerProfile(req, res) {
  const email = req.query.email;

  if (!email) {
    res.status(400).json({ error: "Email is required" });
    return;
  }

  const player = await findPlayerByEmail(email);

  if (!player) {
    res.status(404).json({ error: "Player profile not found" });
    return;
  }

  res.json(player);
}

export async function createPlayerProfile(req, res) {
  const newPlayer = await createPlayerProfileRecord(req.body);
  res.status(201).json(newPlayer);
}

export async function updatePlayerProfile(req, res) {
  const { email, ...updateData } = req.body;

  if (!email) {
    res.status(400).json({ error: "Email is required for updating profile" });
    return;
  }

  const updatedPlayer = await updatePlayerProfileRecord(email, updateData);
  res.json(updatedPlayer);
}
