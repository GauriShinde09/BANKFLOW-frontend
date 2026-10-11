import { useEffect, useState } from "react";
import api from "../../services/api";

const formatAmount = (amount) =>
  Number(amount || 0).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const formatDate = (value, includeTime = false) => {
  if (!value) return "—";

  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(value);
  const date = new Date(
    dateOnly ? `${value}T00:00:00` : value
  );

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString(
    "en-IN",
    includeTime
      ? {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }
      : {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
  );
};

const getStatusStyle = (status) => {
  switch (status) {
    case "PAID":
      return "bg-emerald-100 text-emerald-700";
    case "PENDING":
      return "bg-amber-100 text-amber-700";
    case "OVERDUE":
      return "bg-red-100 text-red-700";
    default:
      return "bg-slate-100 text-slate-600";
  }
};

function LoanRepaymentSchedule() {
  const [loans, setLoans] = useState([]);
  const [selectedLoanId, setSelectedLoanId] = useState("");
  const [repayments, setRepayments] = useState([]);

  const [loadingLoans, setLoadingLoans] = useState(true);
  const [loadingSchedule, setLoadingSchedule] = useState(false);

  const [error, setError] = useState("");
  const [paymentMessage, setPaymentMessage] = useState("");
  const [paymentError, setPaymentError] = useState("");

  const [paymentLoadingId, setPaymentLoadingId] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Load the customer's loans
  useEffect(() => {
    let active = true;

    const fetchLoans = async () => {
      setLoadingLoans(true);
      setError("");

      try {
        const response = await api.get("/loan-applications/my");

        if (!active) return;

        const applications = Array.isArray(response.data)
          ? response.data
          : [];

        const eligibleLoans = applications.filter((loan) =>
          ["DISBURSED", "COMPLETED"].includes(loan.status)
        );

        setLoans(eligibleLoans);

        setSelectedLoanId((currentId) => {
          const exists = eligibleLoans.some(
            (loan) => String(loan.id) === currentId
          );

          if (exists) return currentId;

          return eligibleLoans.length
            ? String(eligibleLoans[0].id)
            : "";
        });
      } catch (err) {
        if (!active) return;

        setError(
          err.response?.data?.message ||
            "Unable to load your loan applications."
        );
      } finally {
        if (active) setLoadingLoans(false);
      }
    };

    fetchLoans();

    return () => {
      active = false;
    };
  }, []);

  // Load the selected loan's repayment schedule
  useEffect(() => {
    let active = true;

    const fetchSchedule = async () => {
      if (!selectedLoanId) {
        setRepayments([]);
        setLoadingSchedule(false);
        return;
      }

      setLoadingSchedule(true);
      setError("");
      setRepayments([]);

      try {
        const response = await api.get(
          `/loan-repayments/${selectedLoanId}`
        );

        if (!active) return;

        setRepayments(
          Array.isArray(response.data) ? response.data : []
        );
      } catch (err) {
        if (!active) return;

        setError(
          err.response?.data?.message ||
            "Unable to load the EMI schedule."
        );
      } finally {
        if (active) setLoadingSchedule(false);
      }
    };

    fetchSchedule();

    return () => {
      active = false;
    };
  }, [selectedLoanId, refreshKey]);

  // Pay a scheduled installment
  const handlePayEmi = async (repayment) => {
    if (
      repayment.status !== "PENDING" ||
      paymentLoadingId !== null
    ) {
      return;
    }

    const confirmed = window.confirm(
      `Pay EMI ${repayment.installmentNumber} of ${formatAmount(
        repayment.amount
      )} from your bank account?`
    );

    if (!confirmed) return;

    setPaymentLoadingId(repayment.id);
    setPaymentMessage("");
    setPaymentError("");

    try {
      await api.post(`/loan-repayments/${selectedLoanId}`, {
        installmentNumber: repayment.installmentNumber,
        amount: repayment.amount,
      });

      setPaymentMessage(
        `EMI ${repayment.installmentNumber} paid successfully!`
      );

      setRefreshKey((current) => current + 1);
    } catch (err) {
      setPaymentError(
        err.response?.data?.message ||
          "Payment failed. Check your account balance and try again."
      );
    } finally {
      setPaymentLoadingId(null);
    }
  };

  // Selected loan
  const selectedLoan = loans.find(
    (loan) => String(loan.id) === selectedLoanId
  );

  const approvedLoanAmount = Number(
    selectedLoan?.approvedAmount ??
      selectedLoan?.disbursedAmount ??
      0
  );

  // Repayment statistics
  const paidRepayments = repayments.filter(
    (item) => item.status === "PAID"
  );

  const paidCount = paidRepayments.length;

  const pendingCount = repayments.filter(
    (item) => item.status === "PENDING"
  ).length;

  const overdueCount = repayments.filter(
    (item) => item.status === "OVERDUE"
  ).length;

  const remainingInstallments = repayments.filter(
    (item) => item.status !== "PAID"
  ).length;

  const paidAmount = paidRepayments.reduce(
    (total, item) => total + Number(item.amount || 0),
    0
  );

  const remainingRepayment = repayments
    .filter((item) => item.status !== "PAID")
    .reduce(
      (total, item) => total + Number(item.amount || 0),
      0
    );

  // Principal repaid through installments marked PAID
  const principalPaid = paidRepayments.reduce(
    (total, item) =>
      total + Number(item.principalComponent || 0),
    0
  );

  const outstandingPrincipal = Math.max(
    0,
    approvedLoanAmount - principalPaid
  );

  const repaymentProgress =
    repayments.length > 0
      ? Math.round((paidCount / repayments.length) * 100)
      : 0;

  return (
    <div className="min-h-screen bg-[#f7f9f6] px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-[#47796b]">
            BANKFLOW / LOANS
          </p>

          <h1 className="mt-2 text-2xl font-bold text-[#103b32] sm:text-3xl">
            EMI Repayment Schedule
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Track your outstanding principal, installments and interest.
          </p>
        </div>

        {/* Loan selector */}
        <div className="mb-6 rounded-2xl border border-[#e1e9e1] bg-white p-5 shadow-sm sm:p-7">
          <label
            htmlFor="loanApplication"
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            Select Loan Application
          </label>

          <select
            id="loanApplication"
            value={selectedLoanId}
            onChange={(event) => {
              setSelectedLoanId(event.target.value);
              setPaymentMessage("");
              setPaymentError("");
            }}
            disabled={loadingLoans || loans.length === 0}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-[#245e50] focus:ring-2 focus:ring-[#245e50]/10 sm:max-w-lg"
          >
            <option value="">Select a loan</option>

            {loans.map((loan) => (
              <option key={loan.id} value={String(loan.id)}>
                Loan #{loan.id} — {loan.loanTypeName || "Loan"} (
                {loan.status})
              </option>
            ))}
          </select>
        </div>

        {loadingLoans && (
          <div className="rounded-2xl bg-white p-10 text-center text-slate-500">
            Loading your loans...
          </div>
        )}

        {!loadingLoans && loans.length === 0 && !error && (
          <div className="rounded-2xl border border-[#e1e9e1] bg-white p-10 text-center">
            <h2 className="text-lg font-semibold text-[#103b32]">
              No Disbursed Loans
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Your repayment schedule appears here after disbursement.
            </p>
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {!loadingLoans && loans.length > 0 && (
          <>
            {paymentMessage && (
              <div
                role="status"
                className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700"
              >
                {paymentMessage}
              </div>
            )}

            {paymentError && (
              <div
                role="alert"
                className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {paymentError}
              </div>
            )}

            {/* Summary cards */}
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

              <div className="rounded-2xl border border-[#e1e9e1] bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">
                  Approved Loan Amount
                </p>
                <p className="mt-2 text-2xl font-bold text-[#103b32]">
                  {formatAmount(approvedLoanAmount)}
                </p>
              </div>

              <div className="rounded-2xl border border-[#e1e9e1] bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">
                  Outstanding Principal
                </p>
                <p className="mt-2 text-2xl font-bold text-[#103b32]">
                  {formatAmount(outstandingPrincipal)}
                </p>
              </div>

              <div className="rounded-2xl border border-[#e1e9e1] bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">
                  Remaining Repayment
                </p>
                <p className="mt-2 text-2xl font-bold text-amber-600">
                  {formatAmount(remainingRepayment)}
                </p>
              </div>

              <div className="rounded-2xl border border-[#e1e9e1] bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">
                  Installments Paid
                </p>
                <p className="mt-2 text-2xl font-bold text-emerald-600">
                  {paidCount} / {repayments.length}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {remainingInstallments} remaining
                </p>
              </div>
            </div>

            {/* Repayment progress */}
            <div className="mb-6 rounded-2xl border border-[#e1e9e1] bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-lg font-bold text-[#103b32]">
                    Repayment Progress
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {paidCount} of {repayments.length} installments completed
                  </p>
                </div>

                <span className="text-lg font-bold text-[#103b32]">
                  {repaymentProgress}%
                </span>
              </div>

              <div
                className="h-3 w-full overflow-hidden rounded-full bg-[#e8eee8]"
                role="progressbar"
                aria-label="Loan repayment progress"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={repaymentProgress}
              >
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${repaymentProgress}%` }}
                />
              </div>

              <div className="mt-4 flex flex-wrap justify-between gap-2 text-sm">
                <span className="text-slate-500">
                  Total paid:{" "}
                  <span className="font-semibold text-emerald-700">
                    {formatAmount(paidAmount)}
                  </span>
                </span>

                <span className="text-slate-500">
                  Pending:{" "}
                  <span className="font-semibold text-amber-700">
                    {pendingCount}
                  </span>
                  {overdueCount > 0 && (
                    <span className="ml-2 font-semibold text-red-600">
                      · Overdue: {overdueCount}
                    </span>
                  )}
                </span>
              </div>
            </div>

            {/* Installment table */}
            <div className="overflow-hidden rounded-2xl border border-[#e1e9e1] bg-white shadow-sm">
              <div className="border-b border-[#e5ebe5] px-5 py-5 sm:px-7">
                <h2 className="text-lg font-bold text-[#103b32]">
                  Monthly Installments
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Loan Application #{selectedLoanId}
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[1250px] text-left">
                  <thead>
                    <tr className="bg-[#f7f9f6] text-xs font-semibold uppercase tracking-wider text-slate-500">
                      <th className="px-5 py-4">EMI No.</th>
                      <th className="px-5 py-4">Due Date</th>
                      <th className="px-5 py-4">EMI Amount</th>
                      <th className="px-5 py-4">Principal</th>
                      <th className="px-5 py-4">Interest</th>
                      <th className="px-5 py-4">Remaining Principal</th>
                      <th className="px-5 py-4">Payment Date</th>
                      <th className="px-5 py-4">Status</th>
                      <th className="px-5 py-4">Action</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-[#e8eee8]">
                    {loadingSchedule ? (
                      <tr>
                        <td
                          colSpan={9}
                          className="px-6 py-12 text-center text-slate-500"
                        >
                          Refreshing repayment schedule...
                        </td>
                      </tr>
                    ) : repayments.length === 0 ? (
                      <tr>
                        <td
                          colSpan={9}
                          className="px-6 py-12 text-center text-slate-500"
                        >
                          No repayment installments found.
                        </td>
                      </tr>
                    ) : (
                      repayments.map((repayment) => (
                        <tr
                          key={repayment.id}
                          className="transition hover:bg-[#fbfcfa]"
                        >
                          <td className="whitespace-nowrap px-5 py-5 font-semibold text-[#103b32]">
                            EMI {repayment.installmentNumber}
                          </td>

                          <td className="whitespace-nowrap px-5 py-5 text-sm text-slate-600">
                            {formatDate(repayment.dueDate)}
                          </td>

                          <td className="whitespace-nowrap px-5 py-5 font-semibold text-slate-700">
                            {formatAmount(repayment.amount)}
                          </td>

                          <td className="whitespace-nowrap px-5 py-5 text-sm text-slate-700">
                            {formatAmount(repayment.principalComponent)}
                          </td>

                          <td className="whitespace-nowrap px-5 py-5 text-sm text-slate-700">
                            {formatAmount(repayment.interestComponent)}
                          </td>

                          <td className="whitespace-nowrap px-5 py-5 font-medium text-[#103b32]">
                            {formatAmount(repayment.remainingPrincipal)}
                          </td>

                          <td className="whitespace-nowrap px-5 py-5 text-sm text-slate-500">
                            {formatDate(repayment.paymentDate, true)}
                          </td>

                          <td className="whitespace-nowrap px-5 py-5">
                            <span
                              className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${getStatusStyle(
                                repayment.status
                              )}`}
                            >
                              {repayment.status}
                            </span>
                          </td>

                          <td className="whitespace-nowrap px-5 py-5">
                            {repayment.status === "PENDING" ? (
                              <button
                                type="button"
                                onClick={() => handlePayEmi(repayment)}
                                disabled={paymentLoadingId !== null}
                                className="rounded-lg bg-[#103b32] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#185446] disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {paymentLoadingId === repayment.id
                                  ? "Processing..."
                                  : "Pay EMI"}
                              </button>
                            ) : repayment.status === "PAID" ? (
                              <span className="text-sm font-medium text-emerald-600">
                                Paid
                              </span>
                            ) : (
                              <span className="text-sm text-slate-400">
                                —
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="border-t border-[#e5ebe5] px-5 py-4 text-sm text-slate-500 sm:px-7">
                Principal and interest show how each scheduled EMI is allocated.
                Remaining principal is the planned balance after that installment.
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default LoanRepaymentSchedule;