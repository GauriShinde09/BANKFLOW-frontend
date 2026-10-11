import { useState } from "react";

import { Link, useNavigate } from "react-router-dom";


import api from "../../services/api";

function Register() {

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");

  const [message, setMessage] = useState("");

const navigate = useNavigate();

  const handleRegister = async (e) => {

  e.preventDefault();

  setError("");

  setMessage("");

  if (!username.trim() || !email.trim() || !password) {
    setError("Please enter your username, email, and password.");
    return;
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email.trim())) {
    setError("Please enter a valid email address.");
    return;
  }

  try {

   await api.post("/register", {
  username: username.trim(),
  email: email.trim().toLowerCase(),
  password: password,
});

    navigate("/login", {

      state: {

        successMessage: "Account created successfully. Please sign in.",

      },

    });

  } catch (err) {

    const responseData = err.response?.data;

    const backendMessage =

      typeof responseData === "string"

        ? responseData

        : responseData?.message || "";

    if (

      backendMessage.toLowerCase().includes("username already exists")

    ) {

      setError("This username already exists. Please choose another.");

    } else if (backendMessage.toLowerCase().includes("email already")) {
      setError("This email is already registered. Please use another email or sign in.");
    } else if (!err.response) {

      setError("Cannot connect to the server. Please try again.");

    } else {

      setError(backendMessage || "Registration failed. Please try again.");

    }

  }

};

  const inputClass =

    "h-[52px] w-full rounded-xl border border-[#dce4dc] bg-white px-4 text-sm text-[#102f2c] outline-none transition placeholder:text-[#a4afa9] focus:border-[#59856d] focus:ring-4 focus:ring-[#548c6a]/10";

  return (

    <main className="grid min-h-screen grid-cols-1 bg-[#f8f9f6] lg:h-screen lg:min-h-0 lg:grid-cols-2 lg:overflow-hidden">

      {/* LEFT BRAND PANEL */}

      <section className="relative hidden min-h-0 flex-col overflow-hidden bg-[#0d302d] px-10 py-7 text-white lg:flex lg:h-full lg:overflow-y-auto lg:overscroll-contain lg:px-12 xl:px-16 xl:py-9">

        {/* Decorative circles */}

        <div

          aria-hidden="true"

          className="pointer-events-none absolute -right-56 top-[18%] h-[480px] w-[480px] rounded-full border border-white/5 shadow-[0_0_0_55px_rgba(255,255,255,0.025),0_0_0_110px_rgba(255,255,255,0.015)]"

        />

        <div

          aria-hidden="true"

          className="pointer-events-none absolute -bottom-32 -left-20 h-[280px] w-[280px] rounded-full bg-[#c5f36b]/5 blur-2xl"

        />

        {/* Logo */}

        <div className="relative z-10 shrink-0 flex items-center gap-3">

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

          <span className="text-2xl font-extrabold tracking-tight">

            bankflow

          </span>

        </div>

        {/* Left content */}

        <div className="relative z-10 my-auto py-8">

          <div className="mb-6 flex items-center gap-3">

            <span className="h-px w-7 bg-[#c5f36b]" />

            <span className="text-xs font-bold uppercase tracking-[2px] text-[#c5f36b]">

              Your journey starts here

            </span>

          </div>

          <h1 className="text-[clamp(42px,3.6vw,58px)] font-semibold leading-[1.08] tracking-[-2.5px]">

            Start smart.

            <br />

            Bank better.

            <br />

            <span className="text-[#c5f36b]">Live freely.</span>

          </h1>

          <p className="mt-6 max-w-[410px] text-[15px] leading-[1.9] text-[#b5c8c2]">

            Create your BankFlow account and bring everyday banking,

            transfers, and loan management together in one simple space.

          </p>

          {/* Features */}

          <div className="mt-8 space-y-4">

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

              text="Plan your next financial step"

            />

          </div>

          {/* Information card */}

          <div className="mt-9 rounded-xl border border-white/10 bg-white/[0.04] p-4">

            <p className="text-sm font-semibold text-white">

              Simple banking. More possibilities.

            </p>

            <p className="mt-1 text-xs leading-5 text-[#b5c8c2]">

              Your financial journey starts with BankFlow.

            </p>

          </div>

        </div>

        {/* Left footer */}

        <div className="relative z-10 flex shrink-0 justify-between gap-3 text-[11px] text-[#91a9a1]">

          <span>BankFlow · Personal banking</span>

          <span>Built around you</span>

        </div>

      </section>

      {/* RIGHT REGISTER PANEL */}

      <section className="flex min-h-screen flex-col px-6 py-5 sm:px-10 lg:h-full lg:min-h-0 lg:overflow-y-auto lg:overscroll-contain lg:px-12 lg:py-4 xl:px-16">

        {/* Security label */}

        <div className="flex shrink-0 items-center justify-end gap-2 text-xs text-[#71807b]">

          <span className="h-2 w-2 rounded-full bg-[#3a9a6d]" />

          Secure registration

        </div>

        {/* Mobile logo */}

        <div className="mt-5 flex items-center gap-3 lg:hidden">

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

          <span className="text-xl font-extrabold text-[#0d302d]">

            bankflow

          </span>

        </div>

        {/* Registration form */}

        <div className="mx-auto my-auto w-full max-w-[440px] py-8 lg:py-4">

          {/* Heading */}

          <div className="mb-8">

            <p className="text-xs font-bold uppercase tracking-[1.8px] text-[#648078]">

              Create your account

            </p>

            <h2 className="mt-3 text-[34px] font-bold tracking-[-1.6px] text-[#102f2c] sm:text-[40px]">

              Join BankFlow

            </h2>

            <p className="mt-3 text-sm leading-7 text-[#71807b]">

              Get started with your personal banking account.

            </p>

          </div>

          {/* Form */}

          <form onSubmit={handleRegister} noValidate>

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

                placeholder="Choose a username"

                value={username}

                onChange={(e) => {

                  setUsername(e.target.value);

                  setError("");

                  setMessage("");

                }}

                className={inputClass}

              />

            </div>

            {/* Email */}
            <div className="mb-5">
              <label
                htmlFor="email"
                className="mb-2 block text-xs font-bold text-[#304541]"
              >
                Email address
              </label>

              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="Enter your email address"
                value={email}
                required
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                  setMessage("");
                }}
                className={inputClass}
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

                  onClick={() => setShowPassword((current) => !current)}

                  className="text-[11px] font-bold text-[#3f725e] hover:text-[#0d302d]"

                >

                  {showPassword ? "HIDE" : "SHOW"}

                </button>

              </div>

              <input

                id="password"

                name="password"

                type={showPassword ? "text" : "password"}

                autoComplete="new-password"

                placeholder="Create a password"

                value={password}

                onChange={(e) => {

                  setPassword(e.target.value);

                  setError("");

                  setMessage("");

                }}

                className={inputClass}

              />

              <p className="mt-2 text-[11px] text-[#8b9991]">

                Enter the password you want to use for your account.

              </p>

            </div>

            {/* Error message */}

            {error && (

              <p

                role="alert"

                className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-xs leading-5 text-red-700"

              >

                {error}

              </p>

            )}

            {/* Status message */}

            {message && (

              <p

                role="status"

                className="mb-4 rounded-lg bg-[#eef3ec] px-3 py-2 text-xs leading-5 text-[#42694f]"

              >

                {message}

              </p>

            )}

            {/* Create account button */}

            <button

              type="submit"

              className="flex h-[54px] w-full items-center justify-center gap-3 rounded-xl bg-[#0d302d] text-sm font-bold text-white transition hover:-translate-y-px hover:bg-[#214740] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#59856d] active:translate-y-0"

            >

              Create account

              <span className="text-lg text-[#c5f36b]">→</span>

            </button>

          </form>

          {/* Divider */}

          <div className="my-7 flex items-center gap-4">

            <div className="h-px flex-1 bg-[#e3e8e1]" />

            <span className="whitespace-nowrap text-[10px] text-[#9aa69f]">

              YOUR FINANCES, IN FOCUS

            </span>

            <div className="h-px flex-1 bg-[#e3e8e1]" />

          </div>

          {/* Login link */}

          <div className="text-center text-xs text-[#71807b]">

            Already have an account?

            <Link

              to="/login"

              className="ml-1 font-bold text-[#2f644e] hover:text-[#0d302d]"

            >

              Sign in

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

              Keep your password private and never share your login credentials.

            </p>

          </div>

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

function Feature({ icon, text }) {

  return (

    <div className="flex items-center gap-3 text-[13px] text-[#e1e9e4]">

      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 text-base text-[#c5f36b]">

        {icon}

      </div>

      <span>{text}</span>

    </div>

  );

}

export default Register;
