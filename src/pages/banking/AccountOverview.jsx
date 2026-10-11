import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";

function AccountOverview() {
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAccount = async () => {
      try {
        const response = await api.get("/my-account");
        setAccount(response.data);
      } catch (err) {
        if (err.response?.status === 401) {
          setError("Your session has expired. Please log in again.");
        } else if (err.response?.status === 403) {
          setError("You do not have permission to view this account.");
        } else {
          setError("Unable to load account details. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAccount();
  }, []);

  const formatBalance = (balance) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(balance ?? 0));
  };

  return (
    <div className="min-h-screen bg-[#f8f9f6] text-[#102f2c]">

      {/* Navbar */}
      <nav className="flex items-center justify-between border-b border-[#e3e8e1] bg-white px-6 py-4 sm:px-10">
        <Link to="/dashboard" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0d302d] text-[#c5f36b]">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6"
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

        <Link
          to="/dashboard"
          className="rounded-lg border border-[#dce4dc] px-4 py-2.5 text-sm font-semibold transition hover:bg-[#eef3ec]"
        >
          ← Dashboard
        </Link>
      </nav>

      {/* Main content */}
      <main className="mx-auto max-w-6xl px-6 py-10 sm:px-10">

        <div>
          <p className="text-xs font-bold uppercase tracking-[2px] text-[#648078]">
            Banking
          </p>

          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Account Overview
          </h1>

          <p className="mt-3 text-sm leading-6 text-[#71807b]">
            View your account information and available balance.
          </p>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="mt-8 rounded-2xl border border-[#e3e8e1] bg-white p-8">
            <p className="text-sm text-[#71807b]">
              Loading your account details...
            </p>
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div
            role="alert"
            className="mt-8 rounded-xl border border-red-200 bg-red-50 p-5"
          >
            <p className="text-sm text-red-700">{error}</p>

            <button
              onClick={() => window.location.reload()}
              className="mt-3 text-sm font-bold text-red-800 underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Account details */}
        {!loading && !error && account && (
          <>
            {/* Balance card */}
            <section className="relative mt-8 overflow-hidden rounded-2xl bg-[#0d302d] p-7 text-white sm:p-10">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full border border-white/10"
              />

              <div className="relative z-10">
                <div className="flex items-center gap-2 text-sm text-[#b5c8c2]">
                  <span className="h-2 w-2 rounded-full bg-[#c5f36b]" />
                  Available Balance
                </div>

                <p className="mt-5 break-words text-3xl font-bold tracking-tight sm:text-5xl">
                  {formatBalance(account.balance)}
                </p>

                <p className="mt-5 text-xs text-[#b5c8c2]">
                  Your current account balance
                </p>
              </div>
            </section>

            {/* Account information */}
            <section className="mt-8">
              <h2 className="text-xl font-bold">Account Details</h2>

              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <div className="rounded-2xl border border-[#e3e8e1] bg-white p-6">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#71807b]">
                    Account Number
                  </p>

                  <p className="mt-3 break-all text-lg font-bold">
                    {account.accountNumber}
                  </p>
                </div>

                <div className="rounded-2xl border border-[#e3e8e1] bg-white p-6">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#71807b]">
                    Account ID
                  </p>

                  <p className="mt-3 text-lg font-bold">
                    {account.id}
                  </p>
                </div>
              </div>
            </section>

            {/* Banking actions - UI for now */}
            <section className="mt-8">
              <h2 className="text-xl font-bold">Quick Actions</h2>

              <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <ActionCard
  icon="＋"
  title="Deposit"
  description="Add money to your account."
  to="/banking/deposit"
/>
<ActionCard
  icon="↗"
  title="Withdraw"
  description="Withdraw money from your account."
  to="/banking/withdraw"
/>
               <ActionCard
  icon="⇄"
  title="Transfer"
  description="Transfer funds to another customer."
  to="/banking/transfer"
/>
<Link
  to="/banking/transactions"
  className="block rounded-2xl border border-[#e3e8e1] bg-white p-5 transition hover:-translate-y-1 hover:border-[#b7c9b8]"
>
  <h3 className="font-bold">Transaction History</h3>

  <p className="mt-2 text-sm text-[#71807b]">
    View your recent debits and credits.
  </p>

  <p className="mt-4 text-xs font-semibold text-[#648078]">
    View transactions →
  </p>
</Link>

<Link
  to="/banking/beneficiaries"
  className="block rounded-2xl border border-[#e3e8e1] bg-white p-5 transition hover:-translate-y-1 hover:border-[#b7c9b8]"
>
  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eef3ec] text-xl text-[#24543e]">
    ♧
  </div>

  <h3 className="mt-4 font-bold">Beneficiaries</h3>

  <p className="mt-2 text-sm text-[#71807b]">
    Manage saved recipient accounts.
  </p>

  <p className="mt-4 text-xs font-semibold text-[#648078]">
    Manage beneficiaries →
  </p>
</Link>
              </div>
            </section>
          </>
        )}

      </main>

      <footer className="mt-10 border-t border-[#e3e8e1] px-6 py-5 text-center text-xs text-[#98a49d]">
        © 2026 BankFlow · Personal banking
      </footer>
    </div>
  );
}

function ActionCard({ icon, title, description, to }) {
  const content = (
    <div
      className={`rounded-2xl border border-[#e3e8e1] bg-white p-5 ${
        to
          ? "cursor-pointer transition hover:-translate-y-1 hover:border-[#b7c9b8] hover:shadow-sm"
          : ""
      }`}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eef3ec] text-xl text-[#24543e]">
        {icon}
      </div>

      <h3 className="mt-4 font-bold">{title}</h3>

      <p className="mt-2 text-sm leading-6 text-[#71807b]">
        {description}
      </p>

      <p className="mt-4 text-xs font-semibold text-[#648078]">
        {to ? "Open " + title + " →" : "Coming next"}
      </p>
    </div>
  );

  return to ? (
    <Link to={to} className="block rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#59856d]">
      {content}
    </Link>
  ) : (
    content
  );
}

export default AccountOverview;