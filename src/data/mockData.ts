export type AlgaeType = "green" | "red" | "brown";
export type BlockchainStatus = "Verified" | "Pending" | "Rejected";
export type ToxicityRisk = "low" | "medium" | "high";

export interface Batch {
  id: string;
  algaeType: AlgaeType;
  algaeName: string;
  origin: string;
  harvestDate: string;
  qualityScore: number;
  successRate: number;
  defectRate: number;
  biomassKg: number;
  // Quality
  protein: number;
  lipid: number;
  carbohydrate: number;
  toxicity: ToxicityRisk;
  contamination: boolean;
  // Environmental
  co2Absorbed: number;
  o2Produced: number;
  nitrate: number;
  salinity: number;
  waterTemp: number;
  pollutionIndex: number;
  // Blockchain
  blockHash: string;
  blockchainStatus: BlockchainStatus;
  timestamp: string;
  labSignature: string;
  blockNumber: number;
}

const tunisianCoasts = [
  "Bizerte Bay",
  "Gulf of Tunis",
  "Hammamet Coast",
  "Monastir Lagoon",
  "Mahdia Shore",
  "Sfax Coast",
  "Djerba Island",
  "Tabarka Reef",
  "Kerkennah Islands",
  "Zarzis Bay",
];

const algaeNames: Record<AlgaeType, string[]> = {
  green: ["Ulva lactuca", "Chlorella vulgaris", "Spirulina platensis", "Caulerpa prolifera"],
  red: ["Gracilaria verrucosa", "Porphyra umbilicalis", "Corallina officinalis"],
  brown: ["Sargassum vulgare", "Cystoseira compressa", "Padina pavonica"],
};

const labSigners = ["Dr. A. Ben Salem", "Dr. K. Trabelsi", "Dr. M. Hammami", "Dr. L. Chakroun"];

const randHash = () =>
  "0x" +
  Array.from({ length: 40 }, () => "0123456789abcdef"[Math.floor(Math.random() * 16)]).join("");

const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

const baseBatches: Batch[] = [
  {
    id: "ALG-001", algaeType: "green", algaeName: "Spirulina platensis", origin: "Bizerte Bay",
    harvestDate: "2025-04-12", qualityScore: 94, successRate: 96, defectRate: 4, biomassKg: 1240,
    protein: 62, lipid: 8, carbohydrate: 18, toxicity: "low", contamination: false,
    co2Absorbed: 1820, o2Produced: 1340, nitrate: 12, salinity: 35, waterTemp: 22.4, pollutionIndex: 12,
    blockHash: randHash(), blockchainStatus: "Verified", timestamp: "2025-04-12T08:14:22Z",
    labSignature: "Dr. A. Ben Salem", blockNumber: 184_532,
  },
  {
    id: "ALG-002", algaeType: "red", algaeName: "Gracilaria verrucosa", origin: "Gulf of Tunis",
    harvestDate: "2025-04-13", qualityScore: 81, successRate: 88, defectRate: 12, biomassKg: 860,
    protein: 24, lipid: 3, carbohydrate: 58, toxicity: "low", contamination: false,
    co2Absorbed: 980, o2Produced: 720, nitrate: 18, salinity: 36, waterTemp: 23.1, pollutionIndex: 22,
    blockHash: randHash(), blockchainStatus: "Verified", timestamp: "2025-04-13T10:42:11Z",
    labSignature: "Dr. K. Trabelsi", blockNumber: 184_701,
  },
  {
    id: "ALG-003", algaeType: "brown", algaeName: "Sargassum vulgare", origin: "Hammamet Coast",
    harvestDate: "2025-04-14", qualityScore: 67, successRate: 74, defectRate: 26, biomassKg: 1520,
    protein: 14, lipid: 2, carbohydrate: 64, toxicity: "medium", contamination: false,
    co2Absorbed: 2100, o2Produced: 1580, nitrate: 28, salinity: 37, waterTemp: 24.0, pollutionIndex: 38,
    blockHash: randHash(), blockchainStatus: "Pending", timestamp: "2025-04-14T14:20:55Z",
    labSignature: "Dr. M. Hammami", blockNumber: 184_822,
  },
  {
    id: "ALG-004", algaeType: "green", algaeName: "Ulva lactuca", origin: "Monastir Lagoon",
    harvestDate: "2025-04-15", qualityScore: 88, successRate: 92, defectRate: 8, biomassKg: 980,
    protein: 28, lipid: 4, carbohydrate: 42, toxicity: "low", contamination: false,
    co2Absorbed: 1420, o2Produced: 1080, nitrate: 14, salinity: 35, waterTemp: 22.8, pollutionIndex: 16,
    blockHash: randHash(), blockchainStatus: "Verified", timestamp: "2025-04-15T07:33:41Z",
    labSignature: "Dr. L. Chakroun", blockNumber: 184_955,
  },
  {
    id: "ALG-005", algaeType: "red", algaeName: "Porphyra umbilicalis", origin: "Mahdia Shore",
    harvestDate: "2025-04-16", qualityScore: 42, successRate: 51, defectRate: 49, biomassKg: 410,
    protein: 30, lipid: 4, carbohydrate: 48, toxicity: "high", contamination: true,
    co2Absorbed: 520, o2Produced: 380, nitrate: 48, salinity: 38, waterTemp: 26.2, pollutionIndex: 71,
    blockHash: randHash(), blockchainStatus: "Rejected", timestamp: "2025-04-16T11:09:08Z",
    labSignature: "Dr. A. Ben Salem", blockNumber: 185_044,
  },
  {
    id: "ALG-006", algaeType: "brown", algaeName: "Cystoseira compressa", origin: "Sfax Coast",
    harvestDate: "2025-04-17", qualityScore: 76, successRate: 82, defectRate: 18, biomassKg: 1340,
    protein: 12, lipid: 3, carbohydrate: 60, toxicity: "low", contamination: false,
    co2Absorbed: 1880, o2Produced: 1410, nitrate: 22, salinity: 37, waterTemp: 23.5, pollutionIndex: 28,
    blockHash: randHash(), blockchainStatus: "Verified", timestamp: "2025-04-17T09:51:30Z",
    labSignature: "Dr. K. Trabelsi", blockNumber: 185_188,
  },
  {
    id: "ALG-007", algaeType: "green", algaeName: "Chlorella vulgaris", origin: "Djerba Island",
    harvestDate: "2025-04-18", qualityScore: 91, successRate: 94, defectRate: 6, biomassKg: 1110,
    protein: 55, lipid: 10, carbohydrate: 22, toxicity: "low", contamination: false,
    co2Absorbed: 1680, o2Produced: 1240, nitrate: 11, salinity: 34, waterTemp: 22.0, pollutionIndex: 10,
    blockHash: randHash(), blockchainStatus: "Verified", timestamp: "2025-04-18T06:25:14Z",
    labSignature: "Dr. M. Hammami", blockNumber: 185_310,
  },
  {
    id: "ALG-008", algaeType: "red", algaeName: "Corallina officinalis", origin: "Tabarka Reef",
    harvestDate: "2025-04-19", qualityScore: 58, successRate: 64, defectRate: 36, biomassKg: 620,
    protein: 18, lipid: 2, carbohydrate: 52, toxicity: "medium", contamination: false,
    co2Absorbed: 740, o2Produced: 540, nitrate: 32, salinity: 36, waterTemp: 24.8, pollutionIndex: 44,
    blockHash: randHash(), blockchainStatus: "Pending", timestamp: "2025-04-19T13:18:02Z",
    labSignature: "Dr. L. Chakroun", blockNumber: 185_440,
  },
  {
    id: "ALG-009", algaeType: "brown", algaeName: "Padina pavonica", origin: "Kerkennah Islands",
    harvestDate: "2025-04-20", qualityScore: 35, successRate: 44, defectRate: 56, biomassKg: 380,
    protein: 10, lipid: 2, carbohydrate: 58, toxicity: "high", contamination: true,
    co2Absorbed: 460, o2Produced: 320, nitrate: 52, salinity: 39, waterTemp: 27.1, pollutionIndex: 78,
    blockHash: randHash(), blockchainStatus: "Rejected", timestamp: "2025-04-20T15:44:49Z",
    labSignature: "Dr. A. Ben Salem", blockNumber: 185_577,
  },
  {
    id: "ALG-010", algaeType: "green", algaeName: "Caulerpa prolifera", origin: "Zarzis Bay",
    harvestDate: "2025-04-21", qualityScore: 86, successRate: 90, defectRate: 10, biomassKg: 1050,
    protein: 32, lipid: 6, carbohydrate: 38, toxicity: "low", contamination: false,
    co2Absorbed: 1540, o2Produced: 1150, nitrate: 15, salinity: 35, waterTemp: 22.6, pollutionIndex: 18,
    blockHash: randHash(), blockchainStatus: "Verified", timestamp: "2025-04-21T08:02:37Z",
    labSignature: "Dr. K. Trabelsi", blockNumber: 185_702,
  },
  {
    id: "ALG-011", algaeType: "green", algaeName: "Spirulina platensis", origin: "Bizerte Bay",
    harvestDate: "2025-04-22", qualityScore: 93, successRate: 95, defectRate: 5, biomassKg: 1280,
    protein: 60, lipid: 9, carbohydrate: 20, toxicity: "low", contamination: false,
    co2Absorbed: 1880, o2Produced: 1390, nitrate: 12, salinity: 35, waterTemp: 22.5, pollutionIndex: 13,
    blockHash: randHash(), blockchainStatus: "Verified", timestamp: "2025-04-22T07:48:11Z",
    labSignature: "Dr. M. Hammami", blockNumber: 185_834,
  },
  {
    id: "ALG-012", algaeType: "brown", algaeName: "Sargassum vulgare", origin: "Hammamet Coast",
    harvestDate: "2025-04-23", qualityScore: 72, successRate: 80, defectRate: 20, biomassKg: 1410,
    protein: 13, lipid: 3, carbohydrate: 62, toxicity: "medium", contamination: false,
    co2Absorbed: 1960, o2Produced: 1470, nitrate: 26, salinity: 37, waterTemp: 24.2, pollutionIndex: 33,
    blockHash: randHash(), blockchainStatus: "Pending", timestamp: "2025-04-23T12:11:56Z",
    labSignature: "Dr. L. Chakroun", blockNumber: 185_961,
  },
];

export const initialBatches: Batch[] = baseBatches;

// Simulation: regenerate dynamic values
export const simulateBatch = (batch: Batch): Batch => {
  const r = (min: number, max: number, dec = 0) =>
    +(Math.random() * (max - min) + min).toFixed(dec);
  const qualityScore = r(30, 99);
  const successRate = Math.max(20, Math.min(100, qualityScore + r(-6, 6)));
  const defectRate = +(100 - successRate).toFixed(0);
  const contamination = qualityScore < 50 && Math.random() > 0.4;
  const toxicity: ToxicityRisk =
    qualityScore > 75 ? "low" : qualityScore > 55 ? "medium" : "high";
  const status: BlockchainStatus =
    qualityScore > 70 ? "Verified" : qualityScore > 50 ? "Pending" : "Rejected";
  return {
    ...batch,
    qualityScore,
    successRate,
    defectRate,
    biomassKg: r(300, 1600),
    protein: r(8, 65),
    lipid: r(1, 12),
    carbohydrate: r(15, 65),
    toxicity,
    contamination,
    co2Absorbed: r(400, 2200),
    o2Produced: r(300, 1700),
    nitrate: r(8, 55),
    salinity: r(33, 39, 1),
    waterTemp: r(20, 28, 1),
    pollutionIndex: r(8, 85),
    blockHash: randHash(),
    blockchainStatus: status,
    timestamp: new Date().toISOString(),
    labSignature: pick(labSigners),
  };
};

export const algaeTypeMeta: Record<AlgaeType, { label: string; color: string; emoji: string }> = {
  green: { label: "Green Algae", color: "hsl(var(--algae-green))", emoji: "🟢" },
  red: { label: "Red Algae", color: "hsl(var(--algae-red))", emoji: "🔴" },
  brown: { label: "Brown Algae", color: "hsl(var(--algae-brown))", emoji: "🟤" },
};
