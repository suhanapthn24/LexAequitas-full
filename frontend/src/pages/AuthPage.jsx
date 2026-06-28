import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Scale, Mail, Lock, User, Building, Loader2, ArrowRight, ShieldCheck, RotateCcw } from "lucide-react";

const API = "https://mpj-backend-java.onrender.com/api";

const AuthPage = () => {
  const navigate = useNavigate();
  const { login, register, user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("login");

  // MFA state
  const [mfaStep, setMfaStep] = useState(false);       // true = show OTP screen
  const [pendingEmail, setPendingEmail] = useState(""); // email carried into OTP step
  const [pendingPassword, setPendingPassword] = useState(""); // needed for resend
  const [otp, setOtp] = useState("");

  const [loginData, setLoginData] = useState({ email: "", password: "" });

  const [registerData, setRegisterData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    firmName: ""
  });

  useEffect(() => {
    if (user) navigate("/cases");
  }, [user, navigate]);

  // ── Step 1: validate credentials, trigger OTP email ──────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginData.email || !loginData.password) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: loginData.email.trim().toLowerCase(),
          password: loginData.password,
        }),
      });

      if (res.ok) {
        setPendingEmail(loginData.email.trim().toLowerCase());
        setPendingPassword(loginData.password);
        setMfaStep(true);
        toast.success("A 6-digit code has been sent to your email");
      } else {
        const msg = await res.text();
        toast.error(msg || "Invalid credentials");
      }
    } catch {
      toast.error("Server error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // ── Step 2: verify OTP, receive JWT via AuthContext login ─────────────────
  const handleOtpVerify = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      toast.error("Enter the 6-digit code");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${API}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: pendingEmail, otp: otp.trim() }),
      });

      if (res.ok) {
        const data = await res.json();

        // Store the JWT exactly as AuthContext reads it from localStorage on mount.
        // Do NOT call AuthContext.login() — that re-hits /api/auth/login,
        // sends a second OTP email, and redirects back to /auth.
        localStorage.setItem("token", data.token);
        toast.success("Welcome back!");
        window.location.href = "/cases"; // hard navigate so AuthContext re-hydrates
      } else {
        const msg = await res.text();
        toast.error(msg || "Invalid or expired code");
      }
    } catch {
      toast.error("Server error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // ── Resend OTP ────────────────────────────────────────────────────────────
  const handleResend = async () => {
    setIsLoading(true);
    try {
      await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: pendingEmail, password: pendingPassword }),
      });
      setOtp("");
      toast.success("A new code has been sent");
    } catch {
      toast.error("Could not resend. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // ── Back to credentials ───────────────────────────────────────────────────
  const handleBack = () => {
    setMfaStep(false);
    setOtp("");
    setPendingEmail("");
    setPendingPassword("");
  };

  // ── Register (unchanged) ──────────────────────────────────────────────────
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!registerData.email || !registerData.password || !registerData.fullName) {
      toast.error("Please fill in required fields");
      return;
    }
    if (registerData.password !== registerData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (registerData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);
    try {
      await register({
        email: registerData.email,
        password: registerData.password,
        name: registerData.fullName,
      });
      toast.success("Account created successfully!");
      navigate("/cases");
    } catch (error) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center py-20 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 border border-[#D4AF37]/30 flex items-center justify-center">
            <Scale className="w-8 h-8 text-[#D4AF37]" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-white">
            Lex<span className="text-[#D4AF37]">Aequitas</span>
          </h1>
          <p className="text-slate-400 text-sm mt-2">Legal Technology Platform</p>
        </div>

        <Card className="bg-[#020617] border-slate-800 p-6">

          {/* ── OTP Verification Screen (replaces the tab content) ── */}
          {mfaStep ? (
            <div className="space-y-5">
              {/* Header */}
              <div className="text-center pb-2">
                <div className="w-12 h-12 mx-auto mb-3 border border-[#D4AF37]/30 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 text-[#D4AF37]" />
                </div>
                <h2 className="text-white font-semibold text-base">Two-Factor Verification</h2>
                <p className="text-slate-400 text-sm mt-1">
                  We sent a 6-digit code to{" "}
                  <span className="text-[#D4AF37] font-medium">{pendingEmail}</span>
                </p>
              </div>

              {/* Info banner */}
              <div className="bg-[#D4AF37]/10 border border-[#D4AF37]/20 p-3 text-[#D4AF37] text-xs">
                Code expires in <strong>5 minutes</strong>. Check your spam folder if you don't see it.
              </div>

              <form onSubmit={handleOtpVerify} className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Verification Code</label>
                  <Input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    placeholder="000000"
                    className="bg-transparent border-slate-700 text-white placeholder:text-slate-600 focus:border-[#D4AF37] text-center text-2xl tracking-[0.5em] font-mono font-bold"
                    autoFocus
                    data-testid="otp-input"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || otp.length !== 6}
                  className="w-full bg-[#D4AF37] text-[#0F172A] hover:bg-[#c9a430] rounded-none uppercase tracking-wide font-bold py-4 disabled:opacity-40 disabled:cursor-not-allowed"
                  data-testid="otp-submit"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Verify &amp; Sign In
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </form>

              {/* Secondary actions */}
              <div className="flex justify-between pt-1">
                <button
                  type="button"
                  onClick={handleBack}
                  className="text-slate-500 hover:text-slate-300 text-sm flex items-center gap-1 transition-colors"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={isLoading}
                  className="text-[#D4AF37]/70 hover:text-[#D4AF37] text-sm flex items-center gap-1 transition-colors disabled:opacity-40"
                >
                  <RotateCcw className="w-3 h-3" />
                  Resend code
                </button>
              </div>
            </div>

          ) : (

            /* ── Normal Login / Register Tabs ── */
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 bg-slate-900 mb-6">
                <TabsTrigger
                  value="login"
                  className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-[#0F172A]"
                  data-testid="login-tab"
                >
                  Sign In
                </TabsTrigger>
                <TabsTrigger
                  value="register"
                  className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-[#0F172A]"
                  data-testid="register-tab"
                >
                  Register
                </TabsTrigger>
              </TabsList>

              {/* Login Form */}
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <Input
                        type="email"
                        value={loginData.email}
                        onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                        placeholder="you@lawfirm.com"
                        className="pl-10 bg-transparent border-slate-700 text-white placeholder:text-slate-500 focus:border-[#D4AF37]"
                        data-testid="login-email"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <Input
                        type="password"
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        placeholder="••••••••"
                        className="pl-10 bg-transparent border-slate-700 text-white placeholder:text-slate-500 focus:border-[#D4AF37]"
                        data-testid="login-password"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#D4AF37] text-[#0F172A] hover:bg-[#c9a430] rounded-none uppercase tracking-wide font-bold py-4"
                    data-testid="login-submit"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        Sign In
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>

              {/* Register Form */}
              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Full Name *</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <Input
                        value={registerData.fullName}
                        onChange={(e) => setRegisterData({ ...registerData, fullName: e.target.value })}
                        placeholder="John Smith"
                        className="pl-10 bg-transparent border-slate-700 text-white placeholder:text-slate-500 focus:border-[#D4AF37]"
                        data-testid="register-name"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Email *</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <Input
                        type="email"
                        value={registerData.email}
                        onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                        placeholder="you@lawfirm.com"
                        className="pl-10 bg-transparent border-slate-700 text-white placeholder:text-slate-500 focus:border-[#D4AF37]"
                        data-testid="register-email"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Law Firm (Optional)</label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <Input
                        value={registerData.firmName}
                        onChange={(e) => setRegisterData({ ...registerData, firmName: e.target.value })}
                        placeholder="Smith & Associates"
                        className="pl-10 bg-transparent border-slate-700 text-white placeholder:text-slate-500 focus:border-[#D4AF37]"
                        data-testid="register-firm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Password *</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <Input
                        type="password"
                        value={registerData.password}
                        onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                        placeholder="••••••••"
                        className="pl-10 bg-transparent border-slate-700 text-white placeholder:text-slate-500 focus:border-[#D4AF37]"
                        data-testid="register-password"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Confirm Password *</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <Input
                        type="password"
                        value={registerData.confirmPassword}
                        onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                        placeholder="••••••••"
                        className="pl-10 bg-transparent border-slate-700 text-white placeholder:text-slate-500 focus:border-[#D4AF37]"
                        data-testid="register-confirm-password"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#D4AF37] text-[#0F172A] hover:bg-[#c9a430] rounded-none uppercase tracking-wide font-bold py-4"
                    data-testid="register-submit"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        Create Account
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          )}
        </Card>

        <p className="text-center text-slate-500 text-sm mt-6">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
};

export default AuthPage;