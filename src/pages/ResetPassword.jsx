import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../services/api";

function LockIcon({ className = "h-5 w-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M7 10V7a5 5 0 0 1 10 0v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <rect x="4.5" y="10" width="15" height="11" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 14.2v2.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function EyeIcon({ visible }) {
  return visible ? (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 3l18 18M10.6 10.7a2 2 0 0 0 2.7 2.7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M9.9 5.2A10.8 10.8 0 0 1 12 5c5.2 0 8.7 4.9 9.5 6.2a1.5 1.5 0 0 1 0 1.6 15.4 15.4 0 0 1-3.2 3.7M6.2 6.3A16.1 16.1 0 0 0 2.5 11.2a1.5 1.5 0 0 0 0 1.6C3.3 14.1 6.8 19 12 19c1.1 0 2.1-.2 3-.6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  ) : (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M2.5 12s3.4-7 9.5-7 9.5 7 9.5 7-3.4 7-9.5 7-9.5-7-9.5-7Z" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="m4.5 10.2 3.2 3.2 7.8-7.8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const passwordChecks = useMemo(() => ({
    length: newPassword.length >= 8 && newPassword.length <= 72,
    match: confirmPassword.length > 0 && newPassword === confirmPassword,
  }), [newPassword, confirmPassword]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!token) {
      setError("This reset link is invalid or missing its token. Request a new link to continue.");
      return;
    }
    if (newPassword.length < 8 || newPassword.length > 72) {
      setError("Your password must be between 8 and 72 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Your passwords do not match. Please check them and try again.");
      return;
    }

    try {
      setLoading(true);
      await api.post("/reset-password", { token, newPassword });
      setSuccess(true);
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          "We couldn't reset your password. The link may have expired or already been used. Request a new one and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f3f7f5] px-4 py-8 sm:px-6 lg:py-12">
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-emerald-200/50 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 -right-20 h-96 w-96 rounded-full bg-teal-200/40 blur-3xl" />

      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-[2rem] border border-white/80 bg-white shadow-[0_28px_80px_-35px_rgba(7,55,43,0.35)] lg:min-h-[650px] lg:grid-cols-[0.92fr_1.08fr]">
          {/* Brand panel */}
          <section className="relative hidden flex-col justify-between overflow-hidden bg-[#073f35] p-10 text-white lg:flex xl:p-12">
            <div className="absolute -right-20 -top-16 h-64 w-64 rounded-full border border-white/10" />
            <div className="absolute -right-5 top-0 h-48 w-48 rounded-full border border-white/10" />
            <div className="absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-emerald-400/10 blur-2xl" />

            <div className="relative z-10">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#c5f36b] text-[#073f35] shadow-lg shadow-black/10">
                  <LockIcon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xl font-black tracking-[0.14em]">BANKFLOW</p>
                  <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.23em] text-emerald-100/70">Banking made clearer</p>
                </div>
              </div>

              <div className="mt-20 max-w-md">
                <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-100/20 bg-white/5 px-3 py-1.5 text-xs font-semibold tracking-wide text-[#d8f6ac]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#c5f36b]" /> ACCOUNT SECURITY
                </p>
                <h1 className="text-4xl font-semibold leading-[1.15] tracking-tight xl:text-5xl">
                  A fresh start for your <span className="text-[#c5f36b]">password.</span>
                </h1>
                <p className="mt-5 max-w-sm text-base leading-7 text-emerald-50/75">
                  Set a strong new password to get back to managing your money with confidence.
                </p>
              </div>
            </div>

            <div className="relative z-10 rounded-2xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-[#c5f36b]">
                  <LockIcon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold">Your security comes first</p>
                  <p className="mt-1 text-sm leading-5 text-emerald-50/65">Reset links expire in 15 minutes and can be used only once.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Form panel */}
          <section className="flex items-center justify-center px-5 py-9 sm:px-10 sm:py-12 lg:px-12 xl:px-16">
            <div className="w-full max-w-md">
              <div className="mb-8 flex items-center gap-3 lg:hidden">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#073f35] text-[#c5f36b]">
                  <LockIcon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-lg font-black tracking-[0.12em] text-[#073f35]">BANKFLOW</p>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Banking made clearer</p>
                </div>
              </div>

              {success ? (
                <div className="text-center">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                    <svg className="h-10 w-10" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="m5 12.5 4.3 4.3L19.5 6.8" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <p className="mt-7 text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">Password updated</p>
                  <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">You're all set.</h2>
                  <p className="mx-auto mt-3 max-w-sm leading-6 text-slate-500">Your BANKFLOW password has been changed successfully. Use your new password the next time you log in.</p>
                  <Link to="/login" className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#075b46] px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-900/15 transition hover:-translate-y-0.5 hover:bg-[#064b3b] focus:outline-none focus:ring-4 focus:ring-emerald-100">
                    Continue to login <span aria-hidden="true">→</span>
                  </Link>
                </div>
              ) : (
                <>
                  <div className="mb-8">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">Reset your password</p>
                    <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-[2.15rem]">Create a new password</h2>
                    <p className="mt-3 leading-6 text-slate-500">Choose a password you haven't used before to keep your account secure.</p>
                  </div>

                  {!token && (
                    <div role="alert" className="mb-5 flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                      <span className="mt-0.5 font-bold">!</span>
                      <p>This link doesn't contain a reset token. Open the latest reset link from your email or request a new one.</p>
                    </div>
                  )}

                  {error && (
                    <div role="alert" className="mb-5 flex gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm leading-5 text-rose-800">
                      <span className="mt-0.5 font-bold">!</span>
                      <p>{error}</p>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <label htmlFor="newPassword" className="mb-2 block text-sm font-semibold text-slate-700">New password</label>
                      <div className="relative">
                        <input
                          id="newPassword"
                          type={showPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          minLength={8}
                          maxLength={72}
                          autoComplete="new-password"
                          placeholder="Enter your new password"
                          required
                          className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3.5 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-emerald-700 focus:bg-white focus:ring-4 focus:ring-emerald-700/10"
                        />
                        <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"} className="absolute inset-y-0 right-0 flex items-center px-4 text-slate-400 transition hover:text-slate-700">
                          <EyeIcon visible={showPassword} />
                        </button>
                      </div>
                      <div className="mt-2.5 flex items-center gap-2 text-xs">
                        <span className={`inline-flex h-4 w-4 items-center justify-center rounded-full ${passwordChecks.length ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400"}`}><CheckIcon /></span>
                        <span className={passwordChecks.length ? "text-emerald-700" : "text-slate-500"}>Use 8–72 characters</span>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="confirmPassword" className="mb-2 block text-sm font-semibold text-slate-700">Confirm new password</label>
                      <div className="relative">
                        <input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          minLength={8}
                          maxLength={72}
                          autoComplete="new-password"
                          placeholder="Enter it one more time"
                          required
                          className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3.5 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-emerald-700 focus:bg-white focus:ring-4 focus:ring-emerald-700/10"
                        />
                        <button type="button" onClick={() => setShowConfirmPassword((value) => !value)} aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"} className="absolute inset-y-0 right-0 flex items-center px-4 text-slate-400 transition hover:text-slate-700">
                          <EyeIcon visible={showConfirmPassword} />
                        </button>
                      </div>
                      {confirmPassword && (
                        <div className={`mt-2.5 flex items-center gap-2 text-xs ${passwordChecks.match ? "text-emerald-700" : "text-rose-600"}`}>
                          <span className={`inline-flex h-4 w-4 items-center justify-center rounded-full ${passwordChecks.match ? "bg-emerald-100" : "bg-rose-100"}`}><CheckIcon /></span>
                          {passwordChecks.match ? "Passwords match" : "Passwords don't match yet"}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-3 rounded-xl bg-[#f3f7f5] p-3.5 text-xs leading-5 text-slate-600">
                      <LockIcon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-800" />
                      <p>Your reset link expires after 15 minutes and works only once. Never share it with anyone.</p>
                    </div>

                    <button type="submit" disabled={loading || !token} className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[#075b46] px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-900/15 transition hover:-translate-y-0.5 hover:bg-[#064b3b] focus:outline-none focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0">
                      {loading ? (
                        <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> Updating password...</>
                      ) : (
                        <>Update password <span className="transition group-hover:translate-x-1" aria-hidden="true">→</span></>
                      )}
                    </button>
                  </form>
                </>
              )}

              <div className="mt-8 border-t border-slate-100 pt-5 text-center">
                <Link to="/login" className="text-sm font-semibold text-slate-500 transition hover:text-emerald-800">← Back to login</Link>
                <p className="mt-5 text-[11px] font-medium tracking-wide text-slate-400">© {new Date().getFullYear()} BANKFLOW · SECURE BANKING EXPERIENCE</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}