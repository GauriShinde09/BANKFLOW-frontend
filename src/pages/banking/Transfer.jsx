import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import api from "../../services/api";

function Transfer() {
  const location = useLocation();

  const [account, setAccount] = useState(null);
  const [beneficiaries, setBeneficiaries] = useState([]);

  // Prefill the beneficiary selected on the previous page
  const [receiverAccountNumber, setReceiverAccountNumber] = useState(
    location.state?.receiverAccountNumber ?? ""
  );

  const [amount, setAmount] = useState("");
  const [pageLoading, setPageLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const formatBalance = (value) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(value ?? 0));

  // Load account details and beneficiaries
  useEffect(() => {
    const fetchData = async () => {
      setPageLoading(true);
      setError("");

      try {
        const [accountResponse, beneficiaryResponse] = await Promise.all([
          api.get("/my-account"),
          api.get("/beneficiary/all"),
        ]);

        setAccount(accountResponse.data);

        const savedBeneficiaries = Array.isArray(beneficiaryResponse.data)
          ? beneficiaryResponse.data
          : [];

        setBeneficiaries(savedBeneficiaries);

        // Keep the selected beneficiary only if it is in the saved list
        const selectedAccountNumber =
          location.state?.receiverAccountNumber;

        if (
          selectedAccountNumber &&
          savedBeneficiaries.some(
            (beneficiary) =>
              beneficiary.accountNumber === selectedAccountNumber
          )
        ) {
          setReceiverAccountNumber(selectedAccountNumber);
        } else if (selectedAccountNumber) {
          setReceiverAccountNumber("");
          setError("The selected beneficiary was not found in your saved list.");
        }
      } catch (err) {
        if (err.response?.status === 401) {
          setError("Your session has expired. Please log in again.");
        } else if (err.response?.status === 403) {
          setError("You are not authorized to access this information.");
        } else {
          setError("Unable to load account or beneficiary details.");
        }
      } finally {
        setPageLoading(false);
      }
    };

    fetchData();
  }, [location.state]);

  const handleTransfer = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    const transferAmount = Number(amount);

    if (!receiverAccountNumber) {
      setError("Please select a beneficiary.");
      return;
    }

    if (
      amount.trim() === "" ||
      !Number.isFinite(transferAmount) ||
      transferAmount <= 0
    ) {
      setError("Please enter an amount greater than zero.");
      return;
    }

    if (transferAmount > Number(account?.balance ?? 0)) {
      setError("Insufficient balance for this transfer.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await api.post("/transfer-to-beneficiary", {
        receiverAccountNumber,
        amount: transferAmount,
      });

      // Update the sender's balance from the backend response
      setAccount(response.data);
      setAmount("");
      setMessage("Transfer successful! Your balance has been updated.");
    } catch (err) {
      if (err.response?.status === 401) {
        setError("Your session has expired. Please log in again.");
      } else if (err.response?.status === 403) {
        setError("You are not authorized to make this transfer.");
      } else {
        const data = err.response?.data;

        const backendMessage =
          typeof data === "string"
            ? data
            : data?.message ||
              (data?.errors
                ? Object.values(data.errors).join(" ")
                : "");

        setError(
          backendMessage || "Transfer failed. Please try again."
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  const selectedBeneficiary = beneficiaries.find(
    (beneficiary) =>
      beneficiary.accountNumber === receiverAccountNumber
  );

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

        <Link
          to="/banking/account"
          className="rounded-lg border border-[#dce4dc] px-4 py-2.5 text-sm font-semibold transition hover:bg-[#eef3ec]"
        >
          ← My Account
        </Link>
      </nav>

      {/* Main content */}
      <main className="mx-auto max-w-5xl px-6 py-10 sm:px-10">
        <p className="text-xs font-bold uppercase tracking-[2px] text-[#648078]">
          Banking
        </p>

        <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
          Transfer Money
        </h1>

        <p className="mt-3 text-sm leading-6 text-[#71807b]">
          Send money securely to one of your saved beneficiaries.
        </p>

        {/* Loading state */}
        {pageLoading ? (
          <div className="mt-8 rounded-2xl border border-[#e3e8e1] bg-white p-8">
            <p className="text-sm text-[#71807b]">
              Loading account and beneficiaries...
            </p>
          </div>
        ) : !account ? (
          <div
            role="alert"
            className="mt-8 rounded-xl bg-red-50 p-5 text-sm text-red-700"
          >
            {error || "Unable to load your account."}
          </div>
        ) : (
          <>
            {/* Available balance */}
            <section className="relative mt-8 overflow-hidden rounded-2xl bg-[#0d302d] p-7 text-white sm:p-9">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full border border-white/10"
              />

              <div className="relative z-10">
                <p className="text-sm text-[#b5c8c2]">
                  Available Balance
                </p>

                <h2 className="mt-3 break-words text-3xl font-bold sm:text-4xl">
                  {formatBalance(account.balance)}
                </h2>

                <p className="mt-5 break-all text-xs text-[#b5c8c2]">
                  Account: {account.accountNumber}
                </p>
              </div>
            </section>

            {/* Transfer form */}
            <section className="mt-8 max-w-xl rounded-2xl border border-[#e3e8e1] bg-white p-6 sm:p-8">
              <h2 className="text-xl font-bold">
                Transfer Details
              </h2>

              <p className="mt-2 text-sm text-[#71807b]">
                Select a saved beneficiary and enter the amount to send.
              </p>

              {beneficiaries.length === 0 ? (
                <div className="mt-6 rounded-xl bg-[#eef3ec] p-5">
                  <p className="text-sm text-[#42694f]">
                    You haven't added any beneficiaries yet.
                  </p>

                  <Link
                    to="/banking/beneficiaries"
                    className="mt-3 inline-block text-sm font-bold text-[#24543e] underline"
                  >
                    Add a beneficiary →
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleTransfer} className="mt-6">

                  {/* Beneficiary dropdown */}
                  <div className="mb-5">
                    <label
                      htmlFor="beneficiary"
                      className="mb-2 block text-sm font-semibold"
                    >
                      Select Beneficiary
                    </label>

                    <select
                      id="beneficiary"
                      value={receiverAccountNumber}
                      onChange={(e) => {
                        setReceiverAccountNumber(e.target.value);
                        setError("");
                        setMessage("");
                      }}
                      required
                      className="h-12 w-full rounded-xl border border-[#dce4dc] bg-white px-4 text-sm outline-none focus:border-[#59856d] focus:ring-4 focus:ring-[#548c6a]/10"
                    >
                      <option value="">Choose a beneficiary</option>

                      {beneficiaries.map((beneficiary) => (
                        <option
                          key={beneficiary.id}
                          value={beneficiary.accountNumber}
                        >
                          {beneficiary.beneficiaryName} —{" "}
                          {beneficiary.accountNumber}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Selected beneficiary */}
                  {selectedBeneficiary && (
                    <div className="mb-5 rounded-xl bg-[#eef3ec] p-4">
                      <p className="text-xs text-[#648078]">
                        Sending money to
                      </p>

                      <p className="mt-1 break-words text-sm font-bold">
                        {selectedBeneficiary.beneficiaryName}
                      </p>

                      <p className="mt-1 break-all text-xs text-[#71807b]">
                        {selectedBeneficiary.accountNumber}
                      </p>
                    </div>
                  )}

                  {/* Amount */}
                  <div className="mb-5">
                    <label
                      htmlFor="amount"
                      className="mb-2 block text-sm font-semibold"
                    >
                      Transfer Amount (₹)
                    </label>

                    <input
                      id="amount"
                      name="amount"
                      type="number"
                      min="0.01"
                      step="0.01"
                      placeholder="Enter transfer amount"
                      value={amount}
                      onChange={(e) => {
                        setAmount(e.target.value);
                        setError("");
                        setMessage("");
                      }}
                      required
                      className="h-12 w-full rounded-xl border border-[#dce4dc] px-4 outline-none focus:border-[#59856d] focus:ring-4 focus:ring-[#548c6a]/10"
                    />
                  </div>

                  {/* Error message */}
                  {error && (
                    <p
                      role="alert"
                      className="mb-4 rounded-lg bg-red-50 p-3 text-sm leading-5 text-red-700"
                    >
                      {error}
                    </p>
                  )}

                  {/* Success message */}
                  {message && (
                    <p
                      role="status"
                      className="mb-4 rounded-lg bg-[#eef3ec] p-3 text-sm leading-5 text-[#42694f]"
                    >
                      {message}
                    </p>
                  )}

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={submitting || !receiverAccountNumber}
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#0d302d] px-5 text-sm font-bold text-white transition hover:bg-[#214740] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submitting
                      ? "Processing Transfer..."
                      : "Transfer Money"}

                    {!submitting && (
                      <span className="text-lg text-[#c5f36b]">
                        →
                      </span>
                    )}
                  </button>
                </form>
              )}
            </section>
          </>
        )}
      </main>

      <footer className="border-t border-[#e3e8e1] px-6 py-5 text-center text-xs text-[#98a49d]">
        © 2026 BankFlow · Personal banking
      </footer>
    </div>
  );
}

export default Transfer;