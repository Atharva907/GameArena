import {
  applyWalletTransaction,
  getWalletSnapshotByEmail,
} from "../lib/playerStore.js";

const playerRequiredMessage =
  "Player profile not found. Complete your profile before using the wallet.";

export async function getWallet(req, res) {
  const email = req.query.email;
  if (!email) return res.status(400).json({ error: "Email is required" });

  const wallet = await getWalletSnapshotByEmail(email);
  if (!wallet) return res.status(404).json({ error: playerRequiredMessage });

  res.json(wallet);
}

export async function updateWallet(req, res) {
  const { email, amount, type, method, description } = req.body;
  if (!email || !amount || !type) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const result = await applyWalletTransaction({
      email,
      amount,
      type,
      method,
      description,
    });

    res.json(result);
  } catch (error) {
    if (error.statusCode === 404) {
      res.status(404).json({ error: playerRequiredMessage });
      return;
    }

    throw error;
  }
}
