import { supabase } from "@/integrations/supabase/client";

export type VerificationAction = "qr_view" | "verify";

export interface LogVerificationInput {
  batchId: string;
  batchLabel?: string | null;
  action: VerificationAction;
  txHash?: string | null;
  metadata?: Record<string, unknown>;
}

export const logVerification = async (input: LogVerificationInput) => {
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user.id;
  if (!userId) return;

  await supabase.from("verification_history").insert({
    user_id: userId,
    batch_id: input.batchId,
    batch_label: input.batchLabel ?? null,
    action: input.action,
    tx_hash: input.txHash ?? null,
    metadata: (input.metadata ?? null) as never,
  });
};
