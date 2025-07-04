import type { NextApiRequest, NextApiResponse } from "next";
import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID!;
const authToken = process.env.TWILIO_AUTH_TOKEN!;
const fromPhone = process.env.TWILIO_PHONE!;

const client = twilio(accountSid, authToken);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { to, message, username } = req.body;

  if (!to || !message) {
    return res.status(400).json({ error: 'Missing "to" or "message" field' });
  }

  try {
    const finalMessage = username ? `[${username}] ${message}` : message;

    await client.messages.create({
      from: fromPhone,
      to,
      body: finalMessage,
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: "Failed to send SMS", details: (error as Error).message });
  }
}
