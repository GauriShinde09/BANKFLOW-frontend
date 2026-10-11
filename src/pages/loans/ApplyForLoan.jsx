import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import { Link } from "react-router-dom";

const initialForm = {
  loanTypeId: "",
  requestedAmount: "",
  requestedTenureMonths: "12",
  monthlyIncome: "",
};

const formatCurrency = (value) => {
  if (value === null || value === undefined || value === "" || !Number.isFinite(Number(value))) {
    return "₹—";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value));
};

function calculateEmi(principal, annualInterestRate, tenureMonths) {
  if (principal <= 0 || tenureMonths <= 0) return 0;

  const monthlyRate = annualInterestRate / 1200;
  if (monthlyRate === 0) return principal / tenureMonths;

  const factor = Math.pow(1 + monthlyRate, tenureMonths);
  return (principal * monthlyRate * factor) / (factor - 1);
}

export default function ApplyForLoan() {
  const [loanTypes, setLoanTypes] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loadingTypes, setLoadingTypes] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  useEffect(() => {
    const fetchLoanTypes = async () => {
      try {
        const response = await api.get("/loan-types");
        setLoanTypes(
          response.data.filter((loan) => loan.active !== false)
        );
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Unable to load loan types. Please try again."
        );
      } finally {
        setLoadingTypes(false);
      }
    };

    fetchLoanTypes();
  }, []);

  const selectedLoan = loanTypes.find(
    (loan) => String(loan.id) === form.loanTypeId
  );
  const amount = Number(form.requestedAmount);
  const tenure = Number(form.requestedTenureMonths);
  const income = Number(form.monthlyIncome);
  const hasAmount = form.requestedAmount.trim() !== "" && amount > 0;
  const hasTenure = form.requestedTenureMonths.trim() !== "" && tenure > 0;

  const repayment = useMemo(() => {
    if (!selectedLoan || !hasAmount || !hasTenure) return null;

    const emi = calculateEmi(
      amount,
      Number(selectedLoan.interestRate),
      tenure
    );
    const totalRepayment = emi * tenure;

    return {
      emi,
      totalInterest: Math.max(0, totalRepayment - amount),
      totalRepayment,
    };
  }, [selectedLoan, amount, tenure, hasAmount, hasTenure]);

  const eligibility = useMemo(() => {
    if (!repayment || !selectedLoan || !Number.isFinite(income) || income <= 0) {
      return null;
    }

    const affordableEmi = income * 0.4;
    const amountValid =
      amount >= Number(selectedLoan.minAmount) &&
      amount <= Number(selectedLoan.maxAmount);
    const tenureValid =
      Number.isInteger(tenure) &&
      tenure >= 1 &&
      tenure <= Number(selectedLoan.maxTenureMonths);

    return {
      emi: repayment.emi,
      affordableEmi,
      eligible: repayment.emi <= affordableEmi && amountValid && tenureValid,
      amountValid,
      tenureValid,
    };
  }, [repayment, selectedLoan, income, amount, tenure]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
    setError("");
    setResult(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setResult(null);

    if (!selectedLoan) {
      setError("Please select a loan type.");
      return;
    }
    if (!hasAmount || !Number.isFinite(amount)) {
      setError("Please enter a valid loan amount.");
      return;
    }
    if (amount < Number(selectedLoan.minAmount)) {
      setError(`Minimum loan amount is ${formatCurrency(selectedLoan.minAmount)}.`);
      return;
    }
    if (amount > Number(selectedLoan.maxAmount)) {
      setError(`Maximum loan amount is ${formatCurrency(selectedLoan.maxAmount)}.`);
      return;
    }
    if (
      !Number.isInteger(tenure) ||
      tenure < 1 ||
      tenure > Number(selectedLoan.maxTenureMonths)
    ) {
      setError(`Tenure must be between 1 and ${selectedLoan.maxTenureMonths} months.`);
      return;
    }
    if (!Number.isFinite(income) || income <= 0) {
      setError("Please enter a valid monthly income greater than zero.");
      return;
    }

    try {
      setSubmitting(true);
      const response = await api.post("/loan-applications", {
        loanTypeId: Number(form.loanTypeId),
        requestedAmount: amount,
        requestedTenureMonths: tenure,
        monthlyIncome: income,
      });
      setResult(response.data);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Unable to submit your application. Please try again.";
      setError(typeof message === "string" ? message : "Unable to submit your application.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingTypes) {
    return (
      <div className="min-h-screen bg-[#f6f8f5] p-8 text-center text-slate-600">
        Loading available loan types...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f8f5] px-4 py-5 sm:px-6 lg:px-7">
      <div className="mx-auto mb-5 flex max-w-[1360px] flex-wrap items-center justify-between gap-3">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 rounded-xl border border-[#dce5dc] bg-white px-4 py-2.5 text-sm font-semibold text-[#103f35] shadow-sm transition hover:bg-[#f0f5f0]"
        >
          <span aria-hidden="true">←</span> Go Back to Dashboard
        </Link>
        <Link
          to="/loans/repayments"
          className="inline-flex items-center gap-2 rounded-xl bg-[#174f40] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#103f35]"
        >
          EMI Repayments <span aria-hidden="true">→</span>
        </Link>
      </div>
      <div className="mx-auto grid max-w-[1360px] grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1.7fr)_minmax(320px,0.95fr)] xl:gap-6">
        {/* Loan application form */}
        <section className="rounded-[22px] border border-[#dce5dc] bg-white p-5 shadow-sm sm:p-7 lg:p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-[#103f35]">Loan Details</h1>
            <p className="mt-2 text-slate-500">
              All fields are required to submit your application.
            </p>
          </div>

          {error && (
            <div role="alert" className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {result && (
            <div
              role="status"
              className={`mb-6 rounded-xl border p-4 text-sm ${
                result.status === "REJECTED"
                  ? "border-red-200 bg-red-50 text-red-800"
                  : "border-emerald-200 bg-emerald-50 text-emerald-800"
              }`}
            >
              <p className="font-semibold">
                {result.status === "REJECTED"
                  ? "Application submitted, but you are not eligible"
                  : "Loan application submitted successfully"}
              </p>
              <p className="mt-1">Application ID: {result.id}</p>
              <p className="mt-1">Status: {result.status}</p>
              {result.rejectionReason && <p className="mt-2">Reason: {result.rejectionReason}</p>}
              {result.status === "PENDING" && (
                <p className="mt-2">Your application is waiting for admin review.</p>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="loanTypeId" className="mb-2 block text-sm font-medium text-[#243f55]">
                Loan Type
              </label>
              <select
                id="loanTypeId"
                name="loanTypeId"
                value={form.loanTypeId}
                onChange={handleChange}
                required
                className="w-full rounded-2xl border border-[#dbe4f0] bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-[#174f40] focus:ring-2 focus:ring-[#174f40]/10"
              >
                <option value="">Select loan type</option>
                {loanTypes.map((loan) => (
                  <option key={loan.id} value={loan.id}>
                    {loan.name}
                  </option>
                ))}
              </select>
              {loanTypes.length === 0 && (
                <p className="mt-2 text-sm text-slate-500">No active loan types are currently available.</p>
              )}
            </div>

            {selectedLoan && (
              <div className="grid grid-cols-1 gap-x-8 gap-y-5 rounded-2xl bg-[#f6f8f5] p-5 sm:grid-cols-2 sm:p-6">
                <div>
                  <p className="text-sm text-slate-500">Annual Interest Rate</p>
                  <p className="mt-1 text-xl font-bold text-[#103f35]">{selectedLoan.interestRate}% p.a.</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Maximum Tenure</p>
                  <p className="mt-1 text-xl font-bold text-[#103f35]">{selectedLoan.maxTenureMonths} months</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Minimum Loan Amount</p>
                  <p className="mt-1 font-semibold text-[#103f35]">{formatCurrency(selectedLoan.minAmount)}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Maximum Loan Amount</p>
                  <p className="mt-1 font-semibold text-[#103f35]">{formatCurrency(selectedLoan.maxAmount)}</p>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="requestedAmount" className="mb-2 block text-sm font-medium text-[#243f55]">
                Requested Loan Amount (₹)
              </label>
              <input
                id="requestedAmount"
                name="requestedAmount"
                type="number"
                min={selectedLoan?.minAmount ?? 1}
                max={selectedLoan?.maxAmount}
                step="0.01"
                value={form.requestedAmount}
                onChange={handleChange}
                required
                placeholder="Enter loan amount"
                className="w-full rounded-2xl border border-[#dbe4f0] bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-[#174f40] focus:ring-2 focus:ring-[#174f40]/10"
              />
              {selectedLoan && (
                <p className="mt-2 text-sm text-slate-500">
                  Enter an amount between {formatCurrency(selectedLoan.minAmount)} and {formatCurrency(selectedLoan.maxAmount)}.
                </p>
              )}
            </div>

            <div>
              <label htmlFor="requestedTenureMonths" className="mb-2 block text-sm font-medium text-[#243f55]">
                Loan Tenure (Months)
              </label>
              <input
                id="requestedTenureMonths"
                name="requestedTenureMonths"
                type="number"
                min="1"
                max={selectedLoan?.maxTenureMonths}
                step="1"
                value={form.requestedTenureMonths}
                onChange={handleChange}
                required
                placeholder="For example, 36"
                className="w-full rounded-2xl border border-[#dbe4f0] bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-[#174f40] focus:ring-2 focus:ring-[#174f40]/10"
              />
              {selectedLoan && <p className="mt-2 text-sm text-slate-500">Maximum allowed: {selectedLoan.maxTenureMonths} months.</p>}
            </div>

            <div>
              <label htmlFor="monthlyIncome" className="mb-2 block text-sm font-medium text-[#243f55]">
                Monthly Income (₹)
              </label>
              <input
                id="monthlyIncome"
                name="monthlyIncome"
                type="number"
                min="0.01"
                step="0.01"
                value={form.monthlyIncome}
                onChange={handleChange}
                required
                placeholder="Enter your monthly income"
                className="w-full rounded-2xl border border-[#dbe4f0] bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-[#174f40] focus:ring-2 focus:ring-[#174f40]/10"
              />
              <p className="mt-2 text-sm text-slate-500">
                We use this to estimate affordability before submitting your application.
              </p>
            </div>

            {eligibility && (
              <div className={`rounded-2xl border p-5 ${eligibility.eligible ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"}`}>
                <h2 className="font-bold text-[#103f35]">Eligibility Preview</h2>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-sm text-slate-600">Estimated Monthly EMI</p>
                    <p className="mt-1 text-lg font-bold text-[#103f35]">{formatCurrency(eligibility.emi)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Maximum Affordable EMI (40%)</p>
                    <p className="mt-1 text-lg font-bold text-[#103f35]">{formatCurrency(eligibility.affordableEmi)}</p>
                  </div>
                </div>
                <p className={`mt-3 text-sm font-medium ${eligibility.eligible ? "text-emerald-800" : "text-amber-800"}`}>
                  {eligibility.eligible
                    ? "You meet the project's demo eligibility rule. Final approval is subject to admin review."
                    : "The details do not meet the project's demo eligibility rule or the selected loan limits."}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || loanTypes.length === 0}
              className="w-full rounded-2xl bg-[#174f40] px-6 py-4 font-bold text-white shadow-sm transition hover:bg-[#103f35] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Submitting Application..." : "Submit Loan Application"}
            </button>
          </form>
        </section>

        {/* Live repayment summary and checklist */}
        <aside className="space-y-5 lg:sticky lg:top-5">
          <section className="rounded-[22px] bg-[#103f35] p-6 text-white shadow-sm sm:p-7">
            <p className="text-sm font-extrabold tracking-[0.18em] text-lime-300">EMI CALCULATOR</p>
            <h2 className="mt-4 text-xl font-bold">Your estimated repayment</h2>
            <p className="mt-3 leading-7 text-white/70">
              Change the amount or tenure to see how your monthly installment changes.
            </p>

            <div className="mt-9 border-b border-white/15 pb-6">
              <p className="text-white/70">Estimated Monthly EMI</p>
              <p className="mt-2 text-4xl font-bold tracking-tight">
                {repayment ? formatCurrency(repayment.emi) : "₹—"}
              </p>
            </div>

            <div className="space-y-5 pt-6">
              <div className="flex items-center justify-between gap-4">
                <span className="text-white/70">Principal Amount</span>
                <strong className="text-right">{hasAmount ? formatCurrency(amount) : "₹—"}</strong>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-white/70">Total Interest</span>
                <strong className="text-right">{repayment ? formatCurrency(repayment.totalInterest) : "₹—"}</strong>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-white/70">Total Repayment</span>
                <strong className="text-right">{repayment ? formatCurrency(repayment.totalRepayment) : "₹—"}</strong>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-white/70">Tenure</span>
                <strong className="text-right">{hasTenure ? `${tenure} months` : "—"}</strong>
              </div>
            </div>
            {eligibility && (
              <div className="mt-6 rounded-xl bg-white/10 p-4 text-sm">
                <p className="font-semibold text-lime-200">Affordability check</p>
                <p className="mt-1 text-white/80">
                  {eligibility.eligible
                    ? "Your estimated EMI is within the demo affordability limit."
                    : "Your estimated EMI or requested terms exceed the demo eligibility limits."}
                </p>
              </div>
            )}
          </section>

          <section className="rounded-[22px] border border-[#dce5dc] bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-xl font-bold text-[#103f35]">Before You Apply</h2>
            <ul className="mt-5 space-y-4 text-slate-600">
              <li className="flex gap-3"><span className="font-bold text-emerald-600">✓</span><span>Verify the requested amount and tenure.</span></li>
              <li className="flex gap-3"><span className="font-bold text-emerald-600">✓</span><span>Review the estimated EMI and total interest.</span></li>
              <li className="flex gap-3"><span className="font-bold text-emerald-600">✓</span><span>Enter accurate monthly income for the eligibility estimate.</span></li>
              <li className="flex gap-3"><span className="font-bold text-emerald-600">✓</span><span>Eligible applications start as PENDING for admin review; ineligible applications may be REJECTED by the demo rule.</span></li>
            </ul>
          </section>
          <p className="px-1 text-xs leading-5 text-slate-500">
            Estimate only. Actual decisions and repayment amounts may differ. The 40% income rule is a demonstration rule for this project, not a universal bank lending policy.
          </p>
        </aside>
      </div>
    </div>
  );
}