const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export type VerificationAction = "qr_view" | "verify";

export interface LogVerificationInput {
  batchId: string;
  batchLabel?: string | null;
  action: VerificationAction;
  txHash?: string | null;
  metadata?: Record<string, unknown>;
}

export const logVerification = async (input: LogVerificationInput) => {
  const token = localStorage.getItem("token");
  if (!token) return;
  await fetch(`${API_URL}/api/verification-history`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(input),
  });
};