import { useBettingStore } from "@/store/bettingStore";
import { useAuth } from "@/contexts/AuthContext";
import { Wallet, LogOut } from "lucide-react";
import { useEffect } from "react";

const WalletBar = () => {
  const wallet = useBettingStore((s) => s.wallet);
  const fetchProfile = useBettingStore((s) => s.fetchProfile);
  const { user, signOut } = useAuth();

  useEffect(() => {
    if (user) fetchProfile();
  }, [user]);

  return (
    <header className="flex items-center justify-between px-4 py-3 bg-card/80 backdrop-blur-md shadow-subtle sticky top-0 z-30">
      <div className="flex items-center gap-2">
        <div className="h-9 w-9 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/30">
          <span className="text-primary font-bold text-xs">🏏</span>
        </div>
        <div>
          <h1 className="text-sm font-bold font-display tracking-tight">SUPER X 11</h1>
          <p className="text-[10px] text-primary font-medium">● Season Live</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-lg px-3 py-1.5">
          <Wallet className="h-4 w-4 text-primary" />
          <span className="text-sm font-bold tabular-nums text-primary">₹{wallet.toLocaleString("en-IN")}</span>
        </div>
        <button
          onClick={signOut}
          className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center hover:bg-secondary transition-colors"
          title="Logout"
        >
          <LogOut className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>
    </header>
  );
};

export default WalletBar;
