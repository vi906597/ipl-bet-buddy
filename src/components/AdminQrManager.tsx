import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { QrCode, Upload, Trash2, Loader2 } from "lucide-react";

const ADMIN_KEY = "ipl-admin-2026-secret";
const AMOUNTS = [100, 200, 500, 1000, 5000];

interface QrCode_ {
  id: string; label: string; image_url: string; is_active: boolean; created_at: string; amount: number | null;
}

const callAdmin = async (body: any) => {
  const res = await supabase.functions.invoke("admin-matches", {
    body: { ...body, adminKey: ADMIN_KEY },
  });
  if (res.error) throw new Error(res.error.message);
  if (res.data?.error) throw new Error(res.data.error);
  return res.data;
};

const AdminQrManager = () => {
  const [qrCodes, setQrCodes] = useState<QrCode_[]>([]);
  const [selectedAmount, setSelectedAmount] = useState<number>(100);
  const [customAmount, setCustomAmount] = useState("");
  const [label, setLabel] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => { fetchQr(); }, []);

  const fetchQr = async () => {
    try {
      const data = await callAdmin({ action: "list_qr_codes" });
      setQrCodes(data.qr_codes || []);
    } catch (err: any) { toast.error(err.message); }
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    const amount = customAmount ? Number(customAmount) : selectedAmount;
    const filePath = `qr/${Date.now()}-${file.name}`;
    const { error: upErr } = await supabase.storage.from("screenshots").upload(filePath, file);
    if (upErr) { toast.error(upErr.message); setUploading(false); return; }
    const { data: urlData } = supabase.storage.from("screenshots").getPublicUrl(filePath);
    try {
      await callAdmin({ action: "add_qr_code", label: label || `₹${amount} QR`, image_url: urlData.publicUrl, amount });
      toast.success(`₹${amount} QR code added!`);
      setLabel("");
      setCustomAmount("");
      fetchQr();
    } catch (err: any) { toast.error(err.message); }
    setUploading(false);
  };

  const deleteQr = async (id: string) => {
    try {
      await callAdmin({ action: "delete_qr_code", qr_id: id });
      toast.success("QR deleted");
      fetchQr();
    } catch (err: any) { toast.error(err.message); }
  };

  const groupedByAmount = AMOUNTS.map(amt => ({
    amount: amt,
    qr: qrCodes.find(q => q.amount === amt),
  }));

  const otherQrs = qrCodes.filter(q => !AMOUNTS.includes(q.amount || 0));

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold flex items-center gap-2">
        <QrCode className="h-4 w-4 text-primary" /> Payment QR Codes (Per Amount)
      </h3>

      {/* Upload new QR */}
      <div className="rounded-lg bg-card border border-border p-3 space-y-3">
        <p className="text-xs font-semibold text-muted-foreground">Upload QR for amount:</p>
        <div className="flex flex-wrap gap-2">
          {AMOUNTS.map((amt) => (
            <button
              key={amt}
              onClick={() => { setSelectedAmount(amt); setCustomAmount(""); }}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors border ${
                !customAmount && selectedAmount === amt ? "bg-primary/20 border-primary/40 text-primary" : "bg-card border-border text-muted-foreground"
              }`}
            >
              ₹{amt.toLocaleString("en-IN")}
            </button>
          ))}
        </div>
        <input
          type="number"
          placeholder="Or enter custom amount"
          value={customAmount}
          onChange={(e) => setCustomAmount(e.target.value)}
          className="w-full rounded-lg bg-background border border-border px-3 py-2 text-sm"
        />
        <div className="flex gap-2">
          <input placeholder="Label (optional)" value={label} onChange={(e) => setLabel(e.target.value)} className="flex-1 rounded-lg bg-background border border-border px-3 py-2 text-sm" />
          <label className="flex items-center gap-1.5 rounded-lg bg-primary text-primary-foreground px-3 py-2 text-xs font-bold cursor-pointer">
            {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
            Upload QR
            <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); }} />
          </label>
        </div>
      </div>

      {/* QR codes grouped by amount */}
      <div className="space-y-2">
        {groupedByAmount.map(({ amount, qr }) => (
          <div key={amount} className="flex items-center gap-3 rounded-lg bg-card border border-border p-3">
            <div className="flex-1">
              <p className="text-sm font-bold text-primary">₹{amount.toLocaleString("en-IN")}</p>
              {qr ? (
                <div className="flex items-center gap-2 mt-1">
                  <img src={qr.image_url} alt="QR" className="h-10 w-10 rounded object-contain bg-white" />
                  <p className="text-[10px] text-muted-foreground">{qr.label}</p>
                </div>
              ) : (
                <p className="text-[10px] text-muted-foreground">No QR uploaded</p>
              )}
            </div>
            {qr && (
              <button onClick={() => deleteQr(qr.id)} className="h-7 w-7 rounded-lg bg-destructive/20 flex items-center justify-center">
                <Trash2 className="h-3.5 w-3.5 text-destructive" />
              </button>
            )}
          </div>
        ))}
        {otherQrs.map((qr) => (
          <div key={qr.id} className="flex items-center gap-3 rounded-lg bg-card border border-border p-3">
            <img src={qr.image_url} alt="QR" className="h-10 w-10 rounded object-contain bg-white" />
            <div className="flex-1">
              <p className="text-xs font-medium">{qr.label || "Payment QR"} · ₹{qr.amount}</p>
              <p className="text-[10px] text-muted-foreground">{new Date(qr.created_at).toLocaleDateString()}</p>
            </div>
            <button onClick={() => deleteQr(qr.id)} className="h-7 w-7 rounded-lg bg-destructive/20 flex items-center justify-center">
              <Trash2 className="h-3.5 w-3.5 text-destructive" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminQrManager;
