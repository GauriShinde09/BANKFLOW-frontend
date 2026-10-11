import { useState } from "react";

import { Link, useNavigate, useLocation} from "react-router-dom";


import api from "../../services/api";


function Login() {

  const [username, setUsername] = useState("");

  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [rememberMe, setRememberMe] = useState(true);

  const [error, setError] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState("");
  const [forgotMessage, setForgotMessage] = useState("");

  const navigate = useNavigate();

const [loading, setLoading] = useState(false);

const location = useLocation();

const successMessage = location.state?.successMessage;

const handleLogin = async (e) => {

  e.preventDefault();

  setError("");



  if (!username.trim() || !password) {

    setError("Please enter your username and password.");

    return;

  }



  setLoading(true);



  try {

    const response = await api.post("/login", {
  username: username.trim(),
  password: password,
});



    const { token, role, username: loggedInUsername } = response.data;



    if (!token) {

      setError("Login successful, but token was not received.");

      return;

    }



    // Respect the Remember me checkbox

    localStorage.removeItem("token");

    localStorage.removeItem("username");

    localStorage.removeItem("role");



    sessionStorage.removeItem("token");

    sessionStorage.removeItem("username");

    sessionStorage.removeItem("role");



    const storage = rememberMe ? localStorage : sessionStorage;



    storage.setItem("token", token);

    storage.setItem("username", loggedInUsername || username);

    storage.setItem("role", role);



    navigate("/dashboard");

  } catch (err) {

    if (err.response?.status === 401) {
  setError("Incorrect username or password. Please try again.");
} else {

      setError(

        err.response?.data?.message ||

        "Unable to connect to the server. Please try again."

      );

    }

  } finally {

    setLoading(false);

  }

};



  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotError("");
    setForgotMessage("");

    const email = forgotEmail.trim().toLowerCase();
    if (!email) {
      setForgotError("Please enter your registered email address.");
      return;
    }

    setForgotLoading(true);
    try {
    const response = await api.post("/forgot-password", { email });
      setForgotMessage(
        response.data?.message ||
          "If an account with that email exists, a password reset link has been sent."
      );
    } catch (err) {
      setForgotError(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          "Unable to request a reset link. Please try again."
      );
    } finally {
      setForgotLoading(false);
    }
  };

  const openForgotPassword = () => {
    setShowForgotPassword(true);
    setError("");
    setForgotError("");
    setForgotMessage("");
  };

  const returnToLogin = () => {
    setShowForgotPassword(false);
    setError("");
    setForgotError("");
    setForgotMessage("");
  };

  const Logo = () => (

    <div className="flex items-center gap-3">

      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#c5f36b] text-[#0d302d]">

        <svg

          viewBox="0 0 24 24"

          fill="none"

          stroke="currentColor"

          strokeWidth="2"

          strokeLinecap="round"

          strokeLinejoin="round"

          className="h-6 w-6"

          aria-hidden="true"

        >

          <path d="M3 10.5 12 4l9 6.5" />

          <path d="M5.5 10v8M10 10v8M14 10v8M18.5 10v8" />

          <path d="M3.5 20h17" />

        </svg>

      </div>



      <span className="text-2xl font-extrabold tracking-tight text-white">

        bankflow

      </span>

    </div>

  );



  const Feature = ({ icon, text }) => (

    <div className="flex items-center gap-3 text-[13px] text-[#e1e9e4]">

      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 text-base text-[#c5f36b]">

        {icon}

      </div>

      <span>{text}</span>

    </div>

  );



  return (

    <main className="grid min-h-screen grid-cols-1 bg-[#f8f9f6] lg:h-screen lg:min-h-0 lg:grid-cols-2 lg:overflow-hidden">



      {/* LEFT BRAND PANEL */}

     <section className="relative hidden min-h-0 flex-col overflow-hidden bg-[#0d302d] px-10 py-7 text-white lg:flex lg:h-full lg:overflow-y-auto lg:overscroll-contain lg:px-12 xl:px-16 xl:py-9">

        {/* Decorative circles */}

        <div

          aria-hidden="true"

          className="pointer-events-none absolute right-[-230px] top-[18%] h-[500px] w-[500px] rounded-full border border-white/5 shadow-[0_0_0_55px_rgba(255,255,255,0.025),0_0_0_110px_rgba(255,255,255,0.015)]"

        />



        {/* Brand */}

        <div className="relative z-10 shrink-0">

          <Logo />

        </div>



        {/* Main branding content */}

        <div className="relative z-10 my-auto py-8">

          <div className="mb-6 flex items-center gap-3">

            <span className="h-px w-7 bg-[#c5f36b]" />



            <span className="text-xs font-bold uppercase tracking-[2px] text-[#c5f36b]">

              Banking, made clearer

            </span>

          </div>



          <h1 className="text-[clamp(42px,3.6vw,58px)] font-semibold leading-[1.08] tracking-[-2.5px]">

            Your money.

            <br />

            Your moves.

            <br />

            <span className="text-[#c5f36b]">Your future.</span>

          </h1>



          <p className="mt-6 max-w-[410px] text-[15px] leading-[1.9] text-[#b5c8c2]">

            A calmer way to stay on top of your money. Manage your everyday

            banking with confidence, clarity, and control.

          </p>



          <div className="mt-8 space-y-3">

            <Feature

              icon="↗"

              text="Everyday banking, all in one place"

            />



            <Feature

              icon="⌁"

              text="Transfers and transactions at a glance"

            />



            <Feature

              icon="◇"

              text="Loans that fit your next chapter"

            />

          </div>

        </div>



        {/* Left footer */}

        <div className="relative z-10 flex shrink-0 justify-between gap-3 text-[11px] text-[#91a9a1]">

          <span>BankFlow · Personal banking</span>

          <span>Built around you</span>

        </div>

      </section>



   {/* RIGHT LOGIN PANEL */}

<section className="flex min-h-screen flex-col px-6 py-5 sm:px-10 lg:h-full lg:min-h-0 lg:overflow-hidden lg:px-12 lg:py-4 xl:px-16">

        {/* Secure sign-in */}

        <div className="flex shrink-0 items-center justify-end gap-2 text-xs text-[#71807b]">

          <span className="h-2 w-2 rounded-full bg-[#3a9a6d]" />

          Secure sign-in

        </div>



        {/* Mobile brand */}

        <div className="mt-6 flex items-center lg:hidden">

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#c5f36b] text-[#0d302d]">

            <svg

              viewBox="0 0 24 24"

              fill="none"

              stroke="currentColor"

              strokeWidth="2"

              strokeLinecap="round"

              strokeLinejoin="round"

              className="h-5 w-5"

              aria-hidden="true"

            >

              <path d="M3 10.5 12 4l9 6.5" />

              <path d="M5.5 10v8M10 10v8M14 10v8M18.5 10v8" />

              <path d="M3.5 20h17" />

            </svg>

          </div>



          <span className="ml-3 text-xl font-extrabold text-[#0d302d]">

            bankflow

          </span>

        </div>



        {/* Login content */}

        <div className="mx-auto my-auto w-full max-w-[465px] py-4 lg:py-1">



          {/* Heading */}

          <div className="mb-7">

            <p className="text-xs font-bold uppercase tracking-[1.8px] text-[#648078]">

              {showForgotPassword ? "Account recovery" : "Welcome back"}

            </p>



            <h2 className="mt-3 text-[34px] font-bold tracking-[-1.6px] text-[#102f2c] sm:text-[40px]">

              {showForgotPassword ? "Reset your password" : "Sign in to BankFlow"}

            </h2>



            <p className="mt-3 text-sm leading-7 text-[#71807b]">

              {showForgotPassword
                ? "Enter your registered email address and we’ll send you a secure reset link if it matches an account."
                : "Pick up right where you left off. Your financial space is waiting."}

            </p>

          </div>

{/* Registration success message */}

{!showForgotPassword && successMessage && (

  <p className="mb-4 rounded-lg bg-[#eef3ec] px-3 py-3 text-sm text-[#42694f]">

    {successMessage}

  </p>

)}

          {showForgotPassword ? (
            <form onSubmit={handleForgotPassword} noValidate className="space-y-5">
              {forgotMessage ? (
                <div
                  role="status"
                  className="rounded-xl border border-[#d7e9d9] bg-[#eef8ee] p-4 text-sm leading-6 text-[#2f644e]"
                >
                  <div className="mb-2 flex items-center gap-2 font-bold">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#d8efd7] text-[#246141]">✓</span>
                    Reset link requested
                  </div>
                  {forgotMessage}
                  <p className="mt-2 text-xs text-[#587068]">
                    Check your inbox and Spam folder. For security, this message is the same whether or not the email is registered.
                  </p>
                </div>
              ) : (
                <>
                  <div>
                    <label
                      htmlFor="forgotEmail"
                      className="mb-2 block text-xs font-bold text-[#304541]"
                    >
                      Registered email address
                    </label>
                    <input
                      id="forgotEmail"
                      name="forgotEmail"
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      required
                      className="h-[54px] w-full rounded-xl border border-[#dce4dc] bg-white px-4 text-sm text-[#102f2c] outline-none transition placeholder:text-[#a4afa9] focus:border-[#59856d] focus:ring-4 focus:ring-[#548c6a]/10"
                    />
                  </div>

                  {forgotError && (
                    <p
                      role="alert"
                      className="rounded-lg bg-[#fff0ee] px-3 py-3 text-xs leading-5 text-[#a14436]"
                    >
                      {forgotError}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="flex h-[54px] w-full items-center justify-center gap-3 rounded-xl bg-[#0d302d] text-sm font-bold text-white transition hover:bg-[#214740] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {forgotLoading ? "Sending reset link..." : "Send reset link"}
                    {!forgotLoading && (
                      <span className="text-lg text-[#c5f36b]">→</span>
                    )}
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={returnToLogin}
                className="w-full rounded-xl border border-[#dce4dc] px-4 py-3 text-sm font-bold text-[#315a4a] transition hover:bg-[#eef3ec]"
              >
                ← Back to sign in
              </button>
            </form>
          ) : (

          <form onSubmit={handleLogin} noValidate>

            {/* Username */}

            <div className="mb-5">

              <label

                htmlFor="username"

                className="mb-2 block text-xs font-bold text-[#304541]"

              >

                Username

              </label>



              <input

                id="username"

                name="username"

                type="text"

                autoComplete="username"

                placeholder="Enter your username"

                value={username}

                onChange={(e) => setUsername(e.target.value)}

                className="h-[54px] w-full rounded-xl border border-[#dce4dc] bg-white px-4 text-sm text-[#102f2c] outline-none transition placeholder:text-[#a4afa9] focus:border-[#59856d] focus:ring-4 focus:ring-[#548c6a]/10"

              />

            </div>



            {/* Password */}

            <div className="mb-5">

              <div className="mb-2 flex items-center justify-between gap-3">

                <label

                  htmlFor="password"

                  className="text-xs font-bold text-[#304541]"

                >

                  Password

                </label>



                <button

                  type="button"
                  onClick={openForgotPassword}

                  className="text-xs font-bold text-[#3f725e] hover:text-[#0d302d]"

                >

                  Forgot password?

                </button>

              </div>



              <div className="relative">

                <input

                  id="password"

                  name="password"

                  type={showPassword ? "text" : "password"}

                  autoComplete="current-password"

                  placeholder="Enter your password"

                  value={password}

                  onChange={(e) => setPassword(e.target.value)}

                  className="h-[54px] w-full rounded-xl border border-[#dce4dc] bg-white px-4 pr-20 text-sm text-[#102f2c] outline-none transition placeholder:text-[#a4afa9] focus:border-[#59856d] focus:ring-4 focus:ring-[#548c6a]/10"

                />



                <button

                  type="button"

                  onClick={() => setShowPassword((current) => !current)}

                  aria-label={showPassword ? "Hide password" : "Show password"}

                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded px-2 py-1 text-[11px] font-bold text-[#567067] hover:text-[#0d302d]"

                >

                  {showPassword ? "HIDE" : "SHOW"}

                </button>

              </div>

            </div>



            {/* Remember me */}

            <div className="mb-7 flex items-center justify-between gap-3 text-xs text-[#60726b]">

              <label className="flex cursor-pointer items-center gap-2">

                <input

                  type="checkbox"

                  checked={rememberMe}

                  onChange={(e) => setRememberMe(e.target.checked)}

                  className="h-4 w-4 accent-[#234c3b]"

                />

                Remember me

              </label>



              <span>Private &amp; secure</span>

            </div>



            {/* Submit */}

            <button

  type="submit"

  disabled={loading}

  className="flex h-[54px] w-full items-center justify-center gap-3 rounded-xl bg-[#0d302d] text-sm font-bold text-white transition hover:bg-[#214740] disabled:cursor-not-allowed disabled:opacity-70"

>

  {loading ? "Signing in..." : "Sign in securely"}

  {!loading && (

    <span className="text-lg text-[#c5f36b]">→</span>

  )}

</button>



            {/* Form feedback */}

            {error && (

              <p

                role="alert"

                className="mt-3 text-xs leading-5 text-[#a14436]"

              >

                {error}

              </p>

            )}

          </form>
          )}

          {!showForgotPassword && (
            <>
          {/* Divider */}

          <div className="my-7 flex items-center gap-4">

            <div className="h-px flex-1 bg-[#e3e8e1]" />



            <span className="whitespace-nowrap text-[10px] text-[#9aa69f]">

              YOUR FINANCES, IN FOCUS

            </span>



            <div className="h-px flex-1 bg-[#e3e8e1]" />

          </div>



          {/* Registration link */}

          <div className="text-center text-xs text-[#71807b]">

            New to BankFlow?



            <Link

              to="/register"

              className="ml-1 font-bold text-[#2f644e] hover:text-[#0d302d]"

            >

              Create an account ↗

            </Link>

          </div>



          {/* Security note */}

          <div className="mt-7 flex items-start gap-3 rounded-xl bg-[#eef3ec] p-4 text-[11px] leading-5 text-[#587068]">

            <svg

              viewBox="0 0 24 24"

              fill="none"

              stroke="currentColor"

              strokeWidth="1.8"

              strokeLinecap="round"

              strokeLinejoin="round"

              className="mt-0.5 h-[18px] w-[18px] shrink-0"

              aria-hidden="true"

            >

              <rect x="4" y="10" width="16" height="11" rx="2" />

              <path d="M8 10V7a4 4 0 0 1 8 0v3" />

              <path d="M12 14v3" />

            </svg>



            <p>

              <strong>Your security matters.</strong>{" "}

              Never share your password or one-time codes. BankFlow will never

              ask for them over a call or message.

            </p>

          </div>

            </>
          )}

        </div>



        {/* Right footer */}

        <footer className="shrink-0 pb-1 text-center text-[10px] text-[#98a49d]">

          © 2026 BankFlow

          <span className="mx-2">Privacy</span>

          <span>Help &amp; support</span>

        </footer>

      </section>

    </main>

  );

}



export default Login;