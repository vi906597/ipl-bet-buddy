import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Mail, Lock, User, ArrowRight, Phone } from "lucide-react";
import { toast } from "sonner";

type AuthMethod = "email" | "phone";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [method, setMethod] = useState<AuthMethod>("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back!");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { username: username || "Player" },
          },
        });
        if (error) throw error;
        toast.success("Account created! You're logged in.");
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const formattedPhone = phone.startsWith("+") ? phone : `+91${phone}`;
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithOtp({ phone: formattedPhone });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithOtp({
          phone: formattedPhone,
          options: { data: { username: username || "Player" } },
        });
        if (error) throw error;
      }
      setOtpSent(true);
      toast.success("OTP sent to your phone!");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const formattedPhone = phone.startsWith("+") ? phone : `+91${phone}`;
    try {
      const { error } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token: otp,
        type: isLogin ? "sms" : "sms",
      });
      if (error) throw error;
      toast.success("Welcome!");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        {/* Logo */}
        <div className="text-center space-y-2">
          <div className="h-14 w-14 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center mx-auto">
            <span className="text-2xl">🏏</span>
          </div>
          <h1 className="font-display text-2xl font-extrabold">IPL Exchange</h1>
          <p className="text-sm text-muted-foreground">
            {isLogin ? "Login to start betting" : "Create your account"}
          </p>
        </div>

        {/* Method toggle */}
        <div className="flex rounded-xl bg-card border border-border p-1 gap-1">
          <button
            type="button"
            onClick={() => { setMethod("email"); setOtpSent(false); }}
            className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-colors flex items-center justify-center gap-1.5 ${method === "email" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            <Mail className="h-3.5 w-3.5" /> Email
          </button>
          <button
            type="button"
            onClick={() => { setMethod("phone"); setOtpSent(false); }}
            className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-colors flex items-center justify-center gap-1.5 ${method === "phone" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            <Phone className="h-3.5 w-3.5" /> Phone
          </button>
        </div>

        {/* Forms */}
        <AnimatePresence mode="wait">
          {method === "email" ? (
            <motion.form
              key="email"
              onSubmit={handleEmailSubmit}
              className="space-y-3"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
            >
              {!isLogin && (
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full rounded-xl bg-card border border-border pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                  />
                </div>
              )}
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-xl bg-card border border-border pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full rounded-xl bg-card border border-border pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                />
              </div>
              <motion.button
                type="submit"
                disabled={loading}
                whileTap={{ scale: 0.98 }}
                className="w-full rounded-xl bg-primary text-primary-foreground py-3 text-sm font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>{isLogin ? "Login" : "Sign Up"}<ArrowRight className="h-4 w-4" /></>}
              </motion.button>
            </motion.form>
          ) : (
            <motion.div
              key="phone"
              className="space-y-3"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
            >
              {!otpSent ? (
                <form onSubmit={handlePhoneSendOtp} className="space-y-3">
                  {!isLogin && (
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full rounded-xl bg-card border border-border pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                      />
                    </div>
                  )}
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="tel"
                      placeholder="Phone (e.g. 9876543210)"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      className="w-full rounded-xl bg-card border border-border pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">+91</span>
                  </div>
                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileTap={{ scale: 0.98 }}
                    className="w-full rounded-xl bg-primary text-primary-foreground py-3 text-sm font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Send OTP<ArrowRight className="h-4 w-4" /></>}
                  </motion.button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-3">
                  <p className="text-sm text-muted-foreground text-center">OTP sent to +91{phone}</p>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Enter 6-digit OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      required
                      maxLength={6}
                      className="w-full rounded-xl bg-card border border-border pl-10 pr-4 py-3 text-sm tracking-widest text-center focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                    />
                  </div>
                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileTap={{ scale: 0.98 }}
                    className="w-full rounded-xl bg-primary text-primary-foreground py-3 text-sm font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Verify & Login<ArrowRight className="h-4 w-4" /></>}
                  </motion.button>
                  <button type="button" onClick={() => setOtpSent(false)} className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors">
                    Change number
                  </button>
                </form>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toggle */}
        <p className="text-center text-sm text-muted-foreground">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            onClick={() => { setIsLogin(!isLogin); setOtpSent(false); }}
            className="text-primary font-semibold hover:underline"
          >
            {isLogin ? "Sign Up" : "Login"}
          </button>
        </p>

        {/* Bonus info */}
        <div className="rounded-xl bg-primary/5 border border-primary/10 p-3 text-center">
          <p className="text-xs text-primary font-medium">🎁 Get ₹5,000 free on signup!</p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
