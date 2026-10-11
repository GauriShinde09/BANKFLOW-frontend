import { Link, useNavigate } from "react-router-dom";

function Dashboard() {

  const navigate = useNavigate();

  const username =

    localStorage.getItem("username") ||

    sessionStorage.getItem("username") ||

    "Customer";

  const role =

    localStorage.getItem("role") ||

    sessionStorage.getItem("role") ||

    "CUSTOMER";

  const isAdmin = role.toUpperCase() === "ADMIN";

  const isCustomer = role.toUpperCase() === "CUSTOMER";

  const handleLogout = () => {

    localStorage.removeItem("token");

    localStorage.removeItem("username");

    localStorage.removeItem("role");

    sessionStorage.removeItem("token");

    sessionStorage.removeItem("username");

    sessionStorage.removeItem("role");

    navigate("/login", { replace: true });

  };

  return (

    <div className="min-h-screen bg-[#f8f9f6] text-[#102f2c]">

      {/* NAVBAR */}

      <nav className="flex items-center justify-between border-b border-[#e3e8e1] bg-white px-6 py-4 sm:px-10">

        <Link

          to="/dashboard"

          className="flex items-center gap-3"

          aria-label="BankFlow dashboard"

        >

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0d302d] text-[#c5f36b]">

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

        </Link>

        {/* USER AND LOGOUT */}

        <div className="flex items-center gap-3 sm:gap-5">

          <div className="hidden text-right sm:block">

            <p className="text-sm font-bold">{username}</p>

            <p className="mt-1 text-xs text-[#71807b]">

              {role}

            </p>

          </div>

          <button

            type="button"

            onClick={handleLogout}

            className="rounded-lg bg-[#0d302d] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#214740] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#59856d]"

          >

            Logout

          </button>

        </div>

      </nav>

      {/* MAIN CONTENT */}

      <main className="mx-auto max-w-7xl px-6 py-10 sm:px-10">

        {/* WELCOME SECTION */}

        <section className="relative overflow-hidden rounded-2xl bg-[#0d302d] p-7 text-white sm:p-10">

          <div

            aria-hidden="true"

            className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full border border-white/10"

          />

          <div

            aria-hidden="true"

            className="pointer-events-none absolute -right-8 -top-16 h-48 w-48 rounded-full border border-white/10"

          />

          <div className="relative z-10">

            <p className="text-xs font-bold uppercase tracking-[2px] text-[#c5f36b]">

              {isAdmin

                ? "BankFlow Administration"

                : "Personal Banking"}

            </p>

            <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">

              Welcome back, {username}!

            </h1>

            <p className="mt-3 max-w-xl text-sm leading-7 text-[#b5c8c2]">

              {isAdmin

                ? "Manage loan applications, review customer requests, and configure available loan products."

                : "Manage your everyday banking, apply for loans, track transactions, and manage EMI repayments—all in one place."}

            </p>

            <div className="mt-6 inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm">

              <span className="h-2 w-2 rounded-full bg-[#c5f36b]" />

              You are signed in as {role}

            </div>

          </div>

        </section>

        {/* ROLE-BASED WORKSPACE */}

        <section className="mt-10">

          <div>

            <h2 className="text-xl font-bold tracking-tight">

              {isAdmin

                ? "Admin Workspace"

                : "Your Financial Space"}

            </h2>

            <p className="mt-2 text-sm text-[#71807b]">

              {isAdmin

                ? "Manage loan applications and available loan products."

                : "Choose a section to manage your finances."}

            </p>

          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2">

            {/* BANKING CARD — CUSTOMER ONLY */}

            {isCustomer && (

              <Link

                to="/banking/account"

                className="group block rounded-2xl border border-[#e3e8e1] bg-white p-6 transition hover:-translate-y-1 hover:border-[#b7c9b8] hover:shadow-md"

              >

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#eef3ec] text-[#24543e]">

                  <svg

                    viewBox="0 0 24 24"

                    fill="none"

                    stroke="currentColor"

                    strokeWidth="1.8"

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

                <h3 className="mt-5 text-lg font-bold">

                  Banking

                </h3>

                <p className="mt-2 text-sm leading-6 text-[#71807b]">

                  Manage your account, deposits, withdrawals,

                  fund transfers, beneficiaries, and transaction history.

                </p>

                <div className="mt-5 border-t border-[#edf0eb] pt-4">

                  <span className="text-xs font-semibold text-[#648078]">

                    Accounts · Transfers · Transaction History

                  </span>

                  <p className="mt-5 text-sm font-bold text-[#24543e]">

                    Open Banking →

                  </p>

                </div>

              </Link>

            )}

            {/* CUSTOMER LOANS CARD */}

            {isCustomer && (

              <div className="rounded-2xl border border-[#e3e8e1] bg-white p-6 transition hover:border-[#b7c9b8] hover:shadow-md">

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#f4f0e5] text-[#82652e]">

                  <svg

                    viewBox="0 0 24 24"

                    fill="none"

                    stroke="currentColor"

                    strokeWidth="1.8"

                    strokeLinecap="round"

                    strokeLinejoin="round"

                    className="h-6 w-6"

                    aria-hidden="true"

                  >

                    <rect x="3" y="5" width="18" height="14" rx="2" />

                    <path d="M3 10h18M7 15h3" />

                  </svg>

                </div>

                <h3 className="mt-5 text-lg font-bold">

                  Loans & EMI Repayments

                </h3>

                <p className="mt-2 text-sm leading-6 text-[#71807b]">

                  Apply for Personal, Home, Education, or Vehicle

                  loans. Track application decisions and pay EMIs.

                </p>

                <div className="mt-5 space-y-3 border-t border-[#edf0eb] pt-4">

                  <Link

                    to="/loans/apply"

                    className="flex items-center justify-between rounded-lg bg-[#103b32] px-4 py-3 text-sm font-semibold text-white hover:bg-[#185446]"

                  >

                    Apply for a Loan

                    <span>→</span>

                  </Link>

                  <Link

                    to="/loans/applications"

                    className="flex items-center justify-between rounded-lg border border-[#dce5dc] px-4 py-3 text-sm font-semibold text-[#24543e] hover:bg-[#eef3ec]"

                  >

                    My Loan Applications

                    <span>→</span>

                  </Link>

                  <Link

                    to="/loans/repayments"

                    className="flex items-center justify-between rounded-lg border border-[#dce5dc] px-4 py-3 text-sm font-semibold text-[#24543e] hover:bg-[#eef3ec]"

                  >

                    EMI Repayment Schedule

                    <span>→</span>

                  </Link>

                </div>

              </div>

            )}

            {/* ADMIN ACCOUNT MANAGEMENT — ADMIN ONLY */}
            {isAdmin && (
              <Link
                to="/admin/accounts"
                className="group block rounded-2xl border border-[#e3e8e1] bg-white p-6 transition hover:-translate-y-1 hover:border-[#b7c9b8] hover:shadow-md"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#fcebea] text-[#a33a32]">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6"
                    aria-hidden="true"
                  >
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                    <path d="M3 10h18M7 15h3" />
                    <path d="M17 14v3M15.5 15.5h3" />
                  </svg>
                </div>

                <h3 className="mt-5 text-lg font-bold">
                  Account Management
                </h3>

                <p className="mt-2 text-sm leading-6 text-[#71807b]">
                  Review customer accounts, view balances, and freeze or unfreeze
                  accounts when needed.
                </p>

                <div className="mt-5 border-t border-[#edf0eb] pt-4">
                  <span className="text-xs font-semibold text-[#648078]">
                    Customer Accounts · Status · Transaction Controls
                  </span>

                  <p className="mt-5 text-sm font-bold text-[#24543e]">
                    Manage Accounts →
                  </p>
                </div>
              </Link>
            )}

            {/* ADMIN LOAN MANAGEMENT — ADMIN ONLY */}

            {isAdmin && (

              <Link

                to="/loans/admin"

                className="group block rounded-2xl border border-[#e3e8e1] bg-white p-6 transition hover:-translate-y-1 hover:border-[#b7c9b8] hover:shadow-md"

              >

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#e8efe7] text-[#24543e]">

                  <svg

                    viewBox="0 0 24 24"

                    fill="none"

                    stroke="currentColor"

                    strokeWidth="1.8"

                    strokeLinecap="round"

                    strokeLinejoin="round"

                    className="h-6 w-6"

                    aria-hidden="true"

                  >

                    <rect x="4" y="3" width="16" height="18" rx="2" />

                    <path d="M8 8h8M8 12h8M8 16h5" />

                  </svg>

                </div>

                <h3 className="mt-5 text-lg font-bold">

                  Admin Loan Management

                </h3>

                <p className="mt-2 text-sm leading-6 text-[#71807b]">

                  Review customer applications, approve or reject

                  requests, and disburse approved loans.

                </p>

                <div className="mt-5 border-t border-[#edf0eb] pt-4">

                  <span className="text-xs font-semibold text-[#648078]">

                    Application Review · Approval · Disbursement

                  </span>

                  <p className="mt-5 text-sm font-bold text-[#24543e]">

                    Manage Loan Applications →

                  </p>

                </div>

              </Link>

            )}

            {/* ADMIN LOAN TYPE MANAGEMENT — ADMIN ONLY */}

            {isAdmin && (

              <Link

                to="/loans/admin/types"

                className="group block rounded-2xl border border-[#e3e8e1] bg-white p-6 transition hover:-translate-y-1 hover:border-[#b7c9b8] hover:shadow-md"

              >

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#f4f0e5] text-[#82652e]">

                  <svg

                    viewBox="0 0 24 24"

                    fill="none"

                    stroke="currentColor"

                    strokeWidth="1.8"

                    strokeLinecap="round"

                    strokeLinejoin="round"

                    className="h-6 w-6"

                    aria-hidden="true"

                  >

                    <rect x="4" y="4" width="16" height="16" rx="3" />

                    <path d="M12 8v8M8 12h8" />

                  </svg>

                </div>

                <h3 className="mt-5 text-lg font-bold">

                  Loan Type Management

                </h3>

                <p className="mt-2 text-sm leading-6 text-[#71807b]">

                  Create and edit loan products, configure interest

                  rates and limits, and activate or deactivate products.

                </p>

                <div className="mt-5 border-t border-[#edf0eb] pt-4">

                  <span className="text-xs font-semibold text-[#648078]">

                    Loan Products · Interest Rates · Eligibility Limits

                  </span>

                  <p className="mt-5 text-sm font-bold text-[#24543e]">

                    Manage Loan Products →

                  </p>

                </div>

              </Link>

            )}

          </div>

        </section>

        {/* SECURITY NOTE */}

        <div className="mt-8 flex items-start gap-3 rounded-xl bg-[#eef3ec] p-4 text-xs leading-6 text-[#587068]">

          <span className="text-lg" aria-hidden="true">

            🔒

          </span>

          <p>

            <strong>Stay secure.</strong>{" "}

            Always log out when using a shared device.

            Never share your password or authentication token.

          </p>

        </div>

      </main>

      {/* FOOTER */}

      <footer className="border-t border-[#e3e8e1] px-6 py-5 text-center text-xs text-[#98a49d]">

        © 2026 BankFlow · Personal banking

      </footer>

    </div>

  );

}

export default Dashboard;