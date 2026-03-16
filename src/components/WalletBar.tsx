import { useBettingStore } from "@/store/bettingStore";
import { Wallet } from "lucide-react";

const WalletBar = () => {
  const wallet = useBettingStore((s) => s.wallet);

  return (
    <header className="flex items-center justify-between px-4 py-3 bg-card shadow-subtle">
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-md bg-primary/20 flex items-center justify-center">
          <span className="text-primary font-bold text-sm">IPL</span>
        </div>
        <h1 className="text-sm font-semibold tracking-tight">IPL Exchange</h1>
      </div>
      <div className="flex items-center gap-2 bg-muted rounded-md px-3 py-1.5">
        <Wallet className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-semibold tabular-nums">₹{wallet.toLocaleString("en-IN")}</span>
      </div>
    </header>
  );
};

export default WalletBar;
