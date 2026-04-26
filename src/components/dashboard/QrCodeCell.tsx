import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { Download, QrCode as QrIcon } from "lucide-react";
import { Batch } from "@/data/mockData";
import { logVerification } from "@/lib/history";

const buildPayload = (batch: Batch) => ({
  app: "AlgaeTrace Tunisia",
  version: "1.0",
  batchId: batch.id,
  algae: { type: batch.algaeType, species: batch.algaeName },
  origin: batch.origin,
  harvestDate: batch.harvestDate,
  quality: {
    score: batch.qualityScore,
    successRate: batch.successRate,
    defectRate: batch.defectRate,
    toxicity: batch.toxicity,
    contamination: batch.contamination,
  },
  composition: {
    protein: batch.protein,
    lipid: batch.lipid,
    carbohydrate: batch.carbohydrate,
  },
  environment: {
    co2Absorbed: batch.co2Absorbed,
    o2Produced: batch.o2Produced,
    nitrate: batch.nitrate,
    salinity: batch.salinity,
    waterTemp: batch.waterTemp,
    pollutionIndex: batch.pollutionIndex,
  },
  blockchain: {
    hash: batch.blockHash,
    block: batch.blockNumber,
    status: batch.blockchainStatus,
    timestamp: batch.timestamp,
    labSignature: batch.labSignature,
  },
  verifyUrl: `https://algaetrace.tn/verify/${batch.id}?hash=${batch.blockHash}`,
});

export const QrCodeCell = ({ batch }: { batch: Batch }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [open, setOpen] = useState(false);
  const [dataUrl, setDataUrl] = useState<string>("");

  const payload = JSON.stringify(buildPayload(batch));

  useEffect(() => {
    if (!canvasRef.current) return;
    QRCode.toCanvas(canvasRef.current, payload, {
      errorCorrectionLevel: "M",
      margin: 1,
      width: 64,
      color: {
        dark: "#0f172a",
        light: "#00000000",
      },
    }).catch(() => {});
    QRCode.toDataURL(payload, {
      errorCorrectionLevel: "M",
      margin: 2,
      width: 512,
      color: { dark: "#0a0f1c", light: "#ffffff" },
    })
      .then(setDataUrl)
      .catch(() => {});
  }, [payload]);

  const downloadPng = () => {
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `${batch.id}-qr.png`;
    a.click();
  };

  const downloadJson = () => {
    const blob = new Blob([JSON.stringify(buildPayload(batch), null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${batch.id}-payload.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="relative">
      <button
        onClick={() => {
          setOpen((o) => {
            const next = !o;
            if (next) {
              logVerification({
                batchId: batch.id,
                batchLabel: batch.algaeName,
                action: "qr_view",
                txHash: batch.blockHash,
              });
            }
            return next;
          });
        }}
        className="group flex items-center gap-2 rounded border border-primary/40 bg-background p-1.5 transition-all hover:border-primary hover:shadow-[0_0_12px_hsl(var(--primary)/0.4)]"
        title="View & download QR"
      >
        <canvas ref={canvasRef} className="h-12 w-12" />
        <QrIcon className="h-3 w-3 text-muted-foreground group-hover:text-primary" />
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-lg border border-primary/40 bg-card p-3 shadow-[0_0_24px_hsl(var(--primary)/0.3)] animate-fade-in">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-primary">{batch.id}</span>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                QR Payload
              </span>
            </div>
            {dataUrl && (
              <img
                src={dataUrl}
                alt={`QR code for batch ${batch.id}`}
                className="mb-2 w-full rounded border border-border bg-white"
              />
            )}
            <p className="mb-2 line-clamp-2 break-all font-mono text-[9px] text-muted-foreground">
              {batch.blockHash}
            </p>
            <div className="flex gap-1">
              <button
                onClick={downloadPng}
                className="flex flex-1 items-center justify-center gap-1 rounded border border-primary/40 bg-primary/10 px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-primary transition-all hover:bg-primary/20"
              >
                <Download className="h-3 w-3" /> PNG
              </button>
              <button
                onClick={downloadJson}
                className="flex flex-1 items-center justify-center gap-1 rounded border border-border bg-background px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-foreground transition-all hover:border-primary hover:text-primary"
              >
                <Download className="h-3 w-3" /> JSON
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
