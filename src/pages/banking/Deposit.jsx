
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";

function Deposit() {
  const [amount, setAmount] = useState("");
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const formatBalance = (value) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(Number(value ?? 0));

  useEffect(() => {
    const fetchAccount = async () => {
      try {
        const response = await api.get("/my-account");
        setAccount(response.data);
      } catch (err) {
        const data = err.response?.data;
        const backendMessage =
          typeof data === "string"
            ? data
            : data?.detail ||
              data?.message ||
              data?.error;

        setError(
          backendMessage || "Unable to load account details."
        );
      } finally {
        setPageLoading(false);
      }
    };

    fetchAccount();
  }, []);

  const handleDeposit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    const depositAmount = Number(amount);

    if (!amount || !Number.isFinite(depositAmount) || depositAmount <= 0) {
      setError("Please enter a valid amount greater than zero.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/deposite", {
        amount: depositAmount,
      });

      setAccount(response.data);
      setAmount("");
      setMessage("Deposit successful! Your balance has been updated.");
    } catch (err) {
      const status = err.response?.status;
      const data = err.response?.data;

      // Extract the backend's actual error message.
      const backendMessage =
        typeof data === "string"
          ? data
          : data?.detail ||
            data?.message ||
            data?.error ||
            data?.errors?.[0]?.defaultMessage;

      if (
        backendMessage &&
        backendMessage.trim() !== "" &&
        backendMessage !== "Something went wrong"
      ) {
        setError(backendMessage);
      } else if (status === 401) {
        setError("Your session has expired. Please log in again.");
      } else if (status === 403) {
        setError(
          "Deposit blocked. Your account may be frozen or you may not have permission."
        );
      } else if (status >= 500) {
        setError(
          "The server could not process your deposit. Please try again."
        );
      } else {
        setError("Deposit failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9f6] text-[#102f2c]">
      {/* Navbar */}
      <nav className="flex items-center justify-between border-b border-[#e3e8e1] bg-white px-6 py-4 sm:px-10">
        <Link to="/dashboard" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0d302d] text-[#c5f36b]">
            <span className="text-xl">⌂</span>
          </div>
          <span className="text-2xl font-extrabold">bankflow</span>
        </Link>

        <Link
          to="/banking/account"
          className="rounded-lg border border-[#dce4dc] px-4 py-2.5 text-sm font-semibold hover:bg-[#eef3ec]"
        >
          ← My Account
        </Link>
      </nav>

      <main className="mx-auto max-w-5xl px-6 py-10 sm:px-10">
        <p className="text-xs font-bold uppercase tracking-[2px] text-[#648078]">
          Banking
        </p>

        <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
          Deposit Money
        </h1>

        <p className="mt-3 text-sm leading-6 text-[#71807b]">
          Deposit money into your BankFlow account.
        </p>

        {pageLoading ? (
          <p className="mt-8 text-sm text-[#71807b]">
            Loading account details...
          </p>
        ) : (
          <>
            {/* Account summary */}
            {account && (
              <section className="mt-8 rounded-2xl bg-[#0d302d] p-7 text-white sm:p-9">
                <p className="text-sm text-[#b5c8c2]">
                  Available Balance
                </p>

                <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
                  {formatBalance(account.balance)}
                </h2>

                <p className="mt-5 break-all text-xs text-[#b5c8c2]">
                  Account: {account.accountNumber}
                </p>
              </section>
            )}

            {/* Deposit form */}
            <section className="mt-8 max-w-xl rounded-2xl border border-[#e3e8e1] bg-white p-6 sm:p-8">
              <h2 className="text-xl font-bold">
                Enter Deposit Amount
              </h2>

              <p className="mt-2 text-sm text-[#71807b]">
                Enter the amount you want to deposit in INR.
              </p>

              <form onSubmit={handleDeposit} className="mt-6">
                <label
                  htmlFor="amount"
                  className="mb-2 block text-sm font-semibold"
                >
                  Amount (₹)
                </label>

                <input
                  id="amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    setError("");
                    setMessage("");
                  }}
                  className="h-12 w-full rounded-xl border border-[#dce4dc] px-4 outline-none focus:border-[#59856d] focus:ring-4 focus:ring-[#548c6a]/10"
                />

                {error && (
                  <p role="alert" className="mt-3 text-sm text-red-600">
                    {error}
                  </p>
                )}

                {message && (
                  <p role="status" className="mt-3 text-sm text-green-700">
                    {message}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading || pageLoading || !account}
                  className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#0d302d] px-5 text-sm font-bold text-white transition hover:bg-[#214740] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Processing..." : "Deposit Money"}
                  {!loading && (
                    <span className="text-lg text-[#c5f36b]">→</span>
                  )}
                </button>
              </form>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default Deposit;
