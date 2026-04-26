import { Batch } from "./mockData";

export type SupplyStageKey =
  | "smartfarm"
  | "cultivation"
  | "monitoring"
  | "harvest"
  | "binning"
  | "intake"
  | "lab"
  | "certification"
  | "distribution";

export type StageStatus = "complete" | "active" | "pending" | "failed";

export interface SupplyEvent {
  stage: SupplyStageKey;
  label: string;
  description: string;
  actor: string;
  location: string;
  timestamp: string;
  txHash: string;
  blockNumber: number;
  status: StageStatus;
}

export const stageMeta: Record<SupplyStageKey, { label: string; icon: string; description: string }> = {
  smartfarm: {
    label: "Smart Farm Origin",
    icon: "🌊",
    description: "Spores selected & inoculated in IoT-monitored basin",
  },
  cultivation: {
    label: "Cultivation",
    icon: "🪴",
    description: "Controlled growth · pH, salinity & light tracked on-chain",
  },
  monitoring: {
    label: "IoT Monitoring",
    icon: "📡",
    description: "Sensors stream water & biomass metrics every 15 min",
  },
  harvest: {
    label: "Harvest",
    icon: "🚜",
    description: "Mechanical collection at the smart farm pier",
  },
  binning: {
    label: "Sorting · Bins by Type",
    icon: "🗂️",
    description: "Algae sorted into colored bins (Green / Red / Brown) and tagged",
  },
  intake: {
    label: "Lab Intake",
    icon: "🚛",
    description: "Cold-chain transfer from farm to our quality control lab",
  },
  lab: {
    label: "Quality Control · Lab",
    icon: "🧪",
    description: "Toxicity, contamination, protein & composition analysis",
  },
  certification: {
    label: "Certification",
    icon: "📜",
    description: "Quality certificate signed & anchored on-chain by lab director",
  },
  distribution: {
    label: "Distribution",
    icon: "✅",
    description: "Released to certified buyers with traceable QR",
  },
};

export const stageOrder: SupplyStageKey[] = [
  "smartfarm",
  "cultivation",
  "monitoring",
  "harvest",
  "binning",
  "intake",
  "lab",
  "certification",
  "distribution",
];

const actors: Record<SupplyStageKey, string[]> = {
  smartfarm: ["Bizerte Smart Farm", "Hammamet Smart Farm", "Sfax Smart Farm"],
  cultivation: ["Basin Operator A", "Basin Operator B", "Basin Operator C"],
  monitoring: ["IoT Node #A12", "IoT Node #B07", "IoT Node #C21"],
  harvest: ["Harvest Crew Alpha", "Harvest Crew Delta", "Harvest Crew Sigma"],
  binning: ["Sorting Bay #1 — Green Bin", "Sorting Bay #2 — Red Bin", "Sorting Bay #3 — Brown Bin"],
  intake: ["Mediterranean Cold-Chain", "Carthage Logistics"],
  lab: ["AlgaeTrace QC Lab · Tunis", "AlgaeTrace QC Lab · Sfax"],
  certification: ["Dr. A. Ben Salem (QC Director)", "Dr. K. Trabelsi (QC Director)"],
  distribution: ["Certified Buyer Network", "Inspector co-signed release"],
};

const locations: Record<SupplyStageKey, string[]> = {
  smartfarm: ["Bizerte Bay", "Gulf of Tunis", "Sfax Coast"],
  cultivation: ["Basin 4 · Hammamet", "Lagoon · Monastir", "Pond 2 · Mahdia"],
  monitoring: ["Sector N-7", "Sector E-3", "Sector W-12"],
  harvest: ["Farm Pier 3", "Farm Pier 1", "Farm Pier B"],
  binning: ["Farm Sorting Hall", "On-site Bin Station"],
  intake: ["TUN ← Farm", "SFX ← Farm"],
  lab: ["Tunis QC Lab", "Sfax QC Lab"],
  certification: ["Tunis HQ", "Sfax HQ"],
  distribution: ["Buyer Hub · TN", "Buyer Hub · EU"],
};

const pick = <T,>(arr: T[], seed: number) => arr[seed % arr.length];

const hashFor = (batchId: string, stage: SupplyStageKey, idx: number) => {
  const base = `${batchId}-${stage}-${idx}`;
  let h = 0;
  for (let i = 0; i < base.length; i++) h = ((h * 33) ^ base.charCodeAt(i)) >>> 0;
  const hex = Array.from({ length: 40 }, (_, i) => {
    h = (h * 1103515245 + 12345 + i) >>> 0;
    return (h & 0xf).toString(16);
  }).join("");
  return "0x" + hex;
};

const algaeBinLabel: Record<Batch["algaeType"], string> = {
  green: "Green Bin · Chlorophyta",
  red: "Red Bin · Rhodophyta",
  brown: "Brown Bin · Phaeophyta",
};

/**
 * Build the deterministic 9-stage supply chain for a given batch.
 * Flow: Smart Farm → Cultivation → IoT → Harvest → Sorting Bins (by type)
 *       → Lab Intake → Quality Control → Certification → Distribution.
 *
 * Stage status reflects QC outcome:
 *  - Rejected: fails at the QC lab step.
 *  - Pending: stops at certification (awaiting director signature).
 *  - Verified: full chain through distribution.
 */
export const buildSupplyChain = (batch: Batch): SupplyEvent[] => {
  const seedNum = parseInt(batch.id.replace(/\D/g, ""), 10) || 1;
  const startDate = new Date(batch.harvestDate);

  let lastCompletedIdx = stageOrder.length - 1;
  let failedAt: number | null = null;

  if (batch.blockchainStatus === "Rejected") {
    failedAt = stageOrder.indexOf("lab");
    lastCompletedIdx = failedAt - 1;
  } else if (batch.blockchainStatus === "Pending") {
    lastCompletedIdx = stageOrder.indexOf("certification") - 1;
  }

  return stageOrder.map((stage, idx) => {
    const dayOffset = idx - stageOrder.indexOf("harvest");
    const ts = new Date(startDate.getTime() + dayOffset * 24 * 60 * 60 * 1000);
    let status: StageStatus = "pending";
    if (failedAt !== null && idx === failedAt) status = "failed";
    else if (idx <= lastCompletedIdx) status = "complete";
    else if (idx === lastCompletedIdx + 1) status = "active";

    // Bin step: actor reflects the algae type of this batch.
    const actor =
      stage === "binning"
        ? algaeBinLabel[batch.algaeType]
        : pick(actors[stage], seedNum + idx);

    return {
      stage,
      label: stageMeta[stage].label,
      description: stageMeta[stage].description,
      actor,
      location: pick(locations[stage], seedNum + idx),
      timestamp: ts.toISOString(),
      txHash: hashFor(batch.id, stage, idx),
      blockNumber: batch.blockNumber - (stageOrder.length - idx) * 7,
      status,
    };
  });
};
