import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";

function BeneficiaryManagement() {
  const navigate = useNavigate();

  const [beneficiaries, setBeneficiaries] = useState([]);
  const [beneficiaryName, setBeneficiaryName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Fetch saved beneficiaries from backend
  const fetchBeneficiaries = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/beneficiary/all");

      setBeneficiaries(
        Array.isArray(response.data) ? response.data : []
      );
    } catch (err) {
      if (err.response?.status === 401) {
        setError("Your session has expired. Please log in again.");
      } else if (err.response?.status === 403) {
        setError("You are not authorized to view beneficiaries.");
      } else {
        setError("Unable to load beneficiaries. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBeneficiaries();
  }, [fetchBeneficiaries]);

  // Add a new beneficiary
  const handleAddBeneficiary = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!beneficiaryName.trim() || !accountNumber.trim()) {
      setError("Please enter the beneficiary name and account number.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await api.post("/beneficiary/add", {
        beneficiaryName: beneficiaryName.trim(),
        accountNumber: accountNumber.trim(),
      });

      setBeneficiaryName("");
      setAccountNumber("");

      setMessage(
        `${response.data.beneficiaryName} added successfully.`
      );

      await fetchBeneficiaries();
    } catch (err) {
      if (err.response?.status === 401) {
        setError("Your session has expired. Please log in again.");
      } else if (err.response?.status === 403) {
        setError("You are not authorized to add beneficiaries.");
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
          backendMessage ||
            "Could not add beneficiary. Please try again."
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Select a beneficiary and navigate to the transfer page
  const handleSelectBeneficiary = (beneficiary) => {
    navigate("/banking/transfer", {
      state: {
        receiverAccountNumber: beneficiary.accountNumber,
      },
    });
  };

  return (
    <div className="min-h-screen bg-[#f8f9f6] text-[#102f2c]">

      {/* Navigation */}
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

      <main className="mx-auto max-w-7xl px-6 py-10 sm:px-10">

        {/* Page heading */}
        <div>
          <p className="text-xs font-bold uppercase tracking-[2px] text-[#648078]">
            Banking
          </p>

          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Beneficiary Management
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#71807b]">
            Manage the people you send money to. Select any saved
            beneficiary to start a transfer.
          </p>
        </div>

        {/* Summary card */}
        <section className="mt-8 flex items-center justify-between gap-4 rounded-2xl bg-[#0d302d] p-6 text-white sm:p-8">
          <div>
            <p className="text-sm text-[#b5c8c2]">
              Your beneficiaries
            </p>

            <p className="mt-2 text-3xl font-bold">
              {loading ? "—" : beneficiaries.length}
            </p>

            <p className="mt-2 text-xs text-[#b5c8c2]">
              Saved beneficiary accounts
            </p>
          </div>

          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-2xl text-[#c5f36b]">
            ♧
          </div>
        </section>

        {/* Form and saved beneficiary list */}
        <div className="mt-8 grid items-start gap-7 lg:grid-cols-[0.85fr_1.15fr]">

          {/* Add beneficiary form */}
          <section className="rounded-2xl border border-[#e3e8e1] bg-white p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#eef3ec] text-xl text-[#24543e]">
                +
              </div>

              <div>
                <h2 className="text-lg font-bold">
                  Add Beneficiary
                </h2>

                <p className="mt-1 text-xs text-[#71807b]">
                  Enter the recipient's details.
                </p>
              </div>
            </div>

            <form onSubmit={handleAddBeneficiary} className="mt-7">

              {/* Beneficiary name */}
              <div className="mb-5">
                <label
                  htmlFor="beneficiaryName"
                  className="mb-2 block text-sm font-semibold"
                >
                  Beneficiary Name
                </label>

                <input
                  id="beneficiaryName"
                  name="beneficiaryName"
                  type="text"
                  placeholder="Enter beneficiary name"
                  value={beneficiaryName}
                  onChange={(e) => {
                    setBeneficiaryName(e.target.value);
                    setError("");
                    setMessage("");
                  }}
                  required
                  maxLength={100}
                  className="h-12 w-full rounded-xl border border-[#dce4dc] bg-white px-4 text-sm outline-none transition placeholder:text-[#a4afa9] focus:border-[#59856d] focus:ring-4 focus:ring-[#548c6a]/10"
                />
              </div>

              {/* Account number */}
              <div className="mb-5">
                <label
                  htmlFor="accountNumber"
                  className="mb-2 block text-sm font-semibold"
                >
                  Account Number
                </label>

                <input
                  id="accountNumber"
                  name="accountNumber"
                  type="text"
                  placeholder="Enter account number"
                  value={accountNumber}
                  onChange={(e) => {
                    setAccountNumber(e.target.value);
                    setError("");
                    setMessage("");
                  }}
                  required
                  maxLength={100}
                  className="h-12 w-full rounded-xl border border-[#dce4dc] bg-white px-4 text-sm outline-none transition placeholder:text-[#a4afa9] focus:border-[#59856d] focus:ring-4 focus:ring-[#548c6a]/10"
                />
              </div>

              {/* Error message */}
              {error && (
                <p
                  role="alert"
                  className="mb-4 rounded-lg bg-red-50 px-3 py-3 text-sm leading-5 text-red-700"
                >
                  {error}
                </p>
              )}

              {/* Success message */}
              {message && (
                <p
                  role="status"
                  className="mb-4 rounded-lg bg-[#eef3ec] px-3 py-3 text-sm leading-5 text-[#42694f]"
                >
                  {message}
                </p>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={submitting}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#0d302d] px-5 text-sm font-bold text-white transition hover:bg-[#214740] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Adding beneficiary..." : "Add Beneficiary"}

                {!submitting && (
                  <span className="text-lg text-[#c5f36b]">→</span>
                )}
              </button>
            </form>

            <p className="mt-5 text-xs leading-5 text-[#8b9991]">
              Double-check the account number before adding a beneficiary.
            </p>
          </section>

          {/* Saved beneficiaries */}
          <section className="overflow-hidden rounded-2xl border border-[#e3e8e1] bg-white">

            <div className="flex items-center justify-between gap-4 border-b border-[#e3e8e1] p-6">
              <div>
                <h2 className="text-lg font-bold">
                  Saved Beneficiaries
                </h2>

                <p className="mt-1 text-xs text-[#71807b]">
                  Select a beneficiary to transfer money
                </p>
              </div>

              <button
                type="button"
                onClick={fetchBeneficiaries}
                disabled={loading}
                className="shrink-0 rounded-lg border border-[#dce4dc] px-3 py-2 text-xs font-semibold transition hover:bg-[#eef3ec] disabled:opacity-50"
              >
                {loading ? "Loading..." : "Refresh ↻"}
              </button>
            </div>

            {/* Loading */}
            {loading ? (
              <div className="p-10 text-center text-sm text-[#71807b]">
                Loading beneficiaries...
              </div>
            ) : error && beneficiaries.length === 0 ? (
              <div className="p-8 text-center">
                <p role="alert" className="text-sm text-red-600">
                  {error}
                </p>
              </div>
            ) : beneficiaries.length === 0 ? (
              /* Empty state */
              <div className="p-10 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eef3ec] text-2xl text-[#24543e]">
                  ♧
                </div>

                <h3 className="mt-4 font-bold">
                  No beneficiaries yet
                </h3>

                <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-[#71807b]">
                  Add your first beneficiary using the form to get started.
                </p>
              </div>
            ) : (
              /* Clickable beneficiary rows */
              <div className="divide-y divide-[#edf0eb]">
                {beneficiaries.map((beneficiary) => (
                  <button
                    type="button"
                    key={beneficiary.id}
                    onClick={() => handleSelectBeneficiary(beneficiary)}
                    aria-label={`Select ${beneficiary.beneficiaryName} for transfer`}
                    className="flex w-full items-center gap-4 p-5 text-left transition hover:bg-[#eef3ec] focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-[#59856d] sm:p-6"
                  >
                    {/* Initial */}
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#eef3ec] text-sm font-bold text-[#24543e]">
                      {beneficiary.beneficiaryName
                        ?.trim()
                        .charAt(0)
                        .toUpperCase() || "B"}
                    </div>

                    {/* Name and account number */}
                    <div className="min-w-0 flex-1">
                      <p className="break-words text-sm font-bold">
                        {beneficiary.beneficiaryName}
                      </p>

                      <p className="mt-1 break-all text-xs text-[#71807b]">
                        Account: {beneficiary.accountNumber}
                      </p>
                    </div>

                    {/* Saved label */}
                    <span className="shrink-0 rounded-full bg-[#eef3ec] px-2.5 py-1 text-[10px] font-semibold text-[#42694f]">
                      Saved
                    </span>
                  </button>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Security note */}
        <div className="mt-8 flex items-start gap-3 rounded-xl bg-[#eef3ec] p-4 text-xs leading-6 text-[#587068]">
          <span className="text-lg">🔒</span>

          <p>
            <strong>Stay secure.</strong>{" "}
            Verify beneficiary details carefully before making a transfer.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-10 border-t border-[#e3e8e1] px-6 py-5 text-center text-xs text-[#98a49d]">
        © 2026 BankFlow · Personal banking
      </footer>
    </div>
  );
}

export default BeneficiaryManagement;