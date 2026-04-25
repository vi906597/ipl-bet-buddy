import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { ArrowDownToLine, Upload, Clock, CheckCircle, XCircle, QrCode, X, Image } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import paymentQrFallback from "@/assets/payment-qr.png";

const AMOUNTS = [20, 200, 500, 1000, 5000];

interface DepositRequest {
  id: string;
  amount: number;
  status: string;
  screenshot_url: string | null;
  created_at: string;
}

const DepositPanel = () => {
  const { user } = useAuth();
  const [showQr, setShowQr] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [deposits, setDeposits] = useState<DepositRequest[]>([]);
  const [uploading, setUploading] = useState<string | null>(null);
  const [qrImageUrl, setQrImageUrl] = useState<string>(paymentQrFallback);
  const [paymentMode, setPaymentMode] = useState<string>("manual");

  useEffect(() => {
    if (user) {
      fetchDeposits();
      fetchPaymentMode();
    }
  }, [user]);

  const fetchPaymentMode = async () => {
    const { data } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "payment_mode")
      .maybeSingle();
    if (data?.value) setPaymentMode(data.value);
  };

  const fetchQrForAmount = async (amount: number) => {
    // Try to find QR for this specific amount
    const { data } = await supabase
      .from("qr_codes")
      .select("image_url")
      .eq("is_active", true)
      .eq("amount", amount)
      .limit(1)
      .maybeSingle();
    if (data?.image_url) {
      setQrImageUrl(data.image_url);
    } else {
      // Fallback to any active QR
      const { data: fallback } = await supabase
        .from("qr_codes")
        .select("image_url")
        .eq("is_active", true)
        .limit(1)
        .maybeSingle();
      setQrImageUrl(fallback?.image_url || paymentQrFallback);
    }
  };

  const fetchDeposits = async () => {
    const { data } = await supabase
      .from("deposit_requests")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setDeposits(data as any);
  };

  const handleAmountClick = async (amount: number) => {
    setSelectedAmount(amount);

    if (paymentMode === "gateway") {
      // Use Bharat4U payment gateway
      try {
        const res = await supabase.functions.invoke("bharat4u-payin", {
          body: { amount },
        });
        if (res.error) throw new Error(res.error.message);
        if (res.data?.error) throw new Error(res.data.error);
        if (res.data?.payment_url) {
          // Save deposit request first
          await supabase.from("deposit_requests").insert({
            user_id: user!.id,
            amount,
            user_email: user!.email || "",
            status: "pending",
          });
          fetchDeposits();
          // Open payment URL
          window.open(res.data.payment_url, "_blank");
          return;
        }
      } catch (err: any) {
        toast.error("Gateway error: " + err.message + ". Showing QR instead.");
      }
    }

    // Manual mode - show QR
    await fetchQrForAmount(amount);
    setShowQr(true);
  };

  const handleConfirmPayment = async () => {
    if (!selectedAmount || !user) return;
    const { error } = await supabase.from("deposit_requests").insert({
      user_id: user.id,
      amount: selectedAmount,
      user_email: user.email || "",
      status: "pending",
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(`₹${selectedAmount} deposit request submitted!`);
    setShowQr(false);
    setSelectedAmount(null);
    fetchDeposits();
  };

  const handleScreenshotUpload = async (depositId: string, file: File) => {
    if (!user) return;
    setUploading(depositId);
    const filePath = `${user.id}/${depositId}-${Date.now()}.${file.name.split(".").pop()}`;
    const { error: uploadErr } = await supabase.storage.from("screenshots").upload(filePath, file);
    if (uploadErr) {
      toast.error("Upload failed: " + uploadErr.message);
      setUploading(null);
      return;
    }
    const { data: urlData } = supabase.storage.from("screenshots").getPublicUrl(filePath);
    const { error: updateErr } = await supabase
      .from("deposit_requests")
      .update({ screenshot_url: urlData.publicUrl })
      .eq("id", depositId);
    if (updateErr) {
      toast.error(updateErr.message);
    } else {
      toast.success("Screenshot uploaded!");
      fetchDeposits();
    }
    setUploading(null);
  };

  const statusIcon = (status: string) => {
    if (status === "approved") return <CheckCircle className="h-3.5 w-3.5 text-green-400" />;
    if (status === "rejected") return <XCircle className="h-3.5 w-3.5 text-destructive" />;
    return <Clock className="h-3.5 w-3.5 text-yellow-400" />;
  };

  const statusColor = (status: string) => {
    if (status === "approved") return "bg-green-500/20 text-green-400";
    if (status === "rejected") return "bg-destructive/20 text-destructive";
    return "bg-yellow-500/20 text-yellow-400";
  };

  return (
    <div className="space-y-4">
      {/* Fixed Amount Buttons */}
      <div>
        <p className="text-xs text-muted-foreground mb-2">Select amount to deposit</p>
        <div className="grid grid-cols-3 gap-2">
          {AMOUNTS.map((amt) => (
            <button
              key={amt}
              onClick={() => handleAmountClick(amt)}
              className="rounded-lg bg-primary/10 border border-primary/20 py-3 text-sm font-bold text-primary hover:bg-primary/20 transition-colors"
            >
              ₹{amt.toLocaleString("en-IN")}
            </button>
          ))}
        </div>
      </div>

      {/* QR Modal */}
<AnimatePresence>
  {showQr && selectedAmount && (
    <>
      {/* Background Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setShowQr(false)}
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[60]"
      />

      {/* Bottom Sheet Modal */}
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        className="fixed inset-x-0 bottom-0 z-[70]"
      >
        <div className="w-full h-[85vh] max-h-[85vh] overflow-y-auto rounded-t-2xl bg-card border-t border-border p-4 space-y-4">

          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <QrCode className="h-4 w-4 text-primary" />
              Pay ₹{selectedAmount.toLocaleString("en-IN")}
            </h3>
            <button
              onClick={() => setShowQr(false)}
              className="h-8 w-8 rounded-full bg-muted flex items-center justify-center"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>

          {/* QR */}
          <div className="rounded-xl bg-white p-4 flex items-center justify-center">
            <img
              src={qrImageUrl}
              alt="Payment QR"
              className="w-56 h-56 object-contain"
            />
          </div>

          {/* Text */}
          <p className="text-xs text-muted-foreground text-center">
            Scan QR with any UPI app and pay ₹{selectedAmount.toLocaleString("en-IN")}
          </p>

          {/* Button */}
          <button
            onClick={handleConfirmPayment}
            className="w-full rounded-lg bg-primary text-primary-foreground py-3 text-sm font-bold"
          >
            ✅ Confirm – I've Paid
          </button>

        </div>
      </motion.div>
    </>
  )}
</AnimatePresence>

      {/* Deposit History */}
      <div>
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Deposit History</h3>
        {deposits.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No deposit requests yet</p>
        ) : (
          <div className="space-y-2">
            {deposits.map((d) => (
              <div key={d.id} className="rounded-lg bg-card border border-border p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ArrowDownToLine className="h-4 w-4 text-primary" />
                    <span className="text-sm font-bold tabular-nums text-primary">₹{Number(d.amount).toLocaleString("en-IN")}</span>
                  </div>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full flex items-center gap-1 ${statusColor(d.status)}`}>
                    {statusIcon(d.status)}
                    {d.status}
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground">{new Date(d.created_at).toLocaleString()}</p>
                {d.status === "pending" && !d.screenshot_url && (
                  <label className="flex items-center gap-2 rounded-lg bg-primary/10 border border-primary/20 px-3 py-2 cursor-pointer hover:bg-primary/20 transition-colors">
                    {uploading === d.id ? (
                      <span className="text-xs text-primary">Uploading...</span>
                    ) : (
                      <>
                        <Upload className="h-3.5 w-3.5 text-primary" />
                        <span className="text-xs font-medium text-primary">Upload Screenshot</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleScreenshotUpload(d.id, file);
                      }}
                    />
                  </label>
                )}
                {d.screenshot_url && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Image className="h-3 w-3" />
                    <span>Screenshot uploaded</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DepositPanel;
