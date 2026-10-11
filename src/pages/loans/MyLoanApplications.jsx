import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";

const formatAmount = (amount) => {
  if (amount === null || amount === undefined) return "—";

  return Number(amount).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getStatusStyle = (status) => {
  switch (status) {
    case "PENDING":
      return "bg-amber-100 text-amber-700";
    case "APPROVED":
      return "bg-blue-100 text-blue-700";
    case "REJECTED":
      return "bg-red-100 text-red-700";
    case "DISBURSED":
      return "bg-emerald-100 text-emerald-700";
    case "COMPLETED":
      return "bg-green-100 text-green-800";
    default:
      return "bg-slate-100 text-slate-600";
  }
};

function MyLoanApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;

    const fetchApplications = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await api.get("/loan-applications/my");

        if (!active) return;

        setApplications(
          Array.isArray(response.data) ? response.data : []
        );
      } catch (err) {
        if (!active) return;

        setError(
          err.response?.data?.message ||
            "Unable to load your loan applications. Please try again."
        );
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchApplications();

    return () => {
      active = false;
    };
  }, [refreshKey]);

  const pendingCount = applications.filter(
    (loan) => loan.status === "PENDING"
  ).length;

  const approvedCount = applications.filter((loan) =>
    ["APPROVED", "DISBURSED", "COMPLETED"].includes(loan.status)
  ).length;

  const rejectedCount = applications.filter(
    (loan) => loan.status === "REJECTED"
  ).length;

  const totalRequested = applications.reduce(
    (total, loan) =>
      total + Number(loan.requestedAmount || 0),
    0
  );

  return (
    <div className="min-h-screen bg-[#f7f9f6] px-4 py-8 text-[#102f2c] sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">

        {/* Navigation */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link
            to="/dashboard"
            className="text-sm font-semibold text-[#24543e] hover:underline"
          >
            ← Back to Dashboard
          </Link>

          <Link
            to="/loans/apply"
            className="rounded-xl bg-[#103b32] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#185446]"
          >
            + Apply for a Loan
          </Link>
        </div>

        {/* Heading */}
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-[2px] text-[#648078]">
            BANKFLOW / LOANS
          </p>

          <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#103b32] sm:text-4xl">
            My Loan Applications
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500 sm:text-base">
            Track your loan applications, review approval decisions,
            and monitor your loan details in one place.
          </p>
        </div>

        {/* Summary cards */}
        {!loading && !error && (
          <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

            <div className="rounded-2xl border border-[#e1e9e1] bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">
                Total Applications
              </p>

              <p className="mt-2 text-3xl font-bold text-[#103b32]">
                {applications.length}
              </p>
            </div>

            <div className="rounded-2xl border border-[#e1e9e1] bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">
                Pending Applications
              </p>

              <p className="mt-2 text-3xl font-bold text-amber-600">
                {pendingCount}
              </p>
            </div>

            <div className="rounded-2xl border border-[#e1e9e1] bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">
                Approved / Active
              </p>

              <p className="mt-2 text-3xl font-bold text-emerald-600">
                {approvedCount}
              </p>
            </div>

            <div className="rounded-2xl border border-[#e1e9e1] bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">
                Total Amount Requested
              </p>

              <p className="mt-2 text-2xl font-bold text-[#103b32]">
                {formatAmount(totalRequested)}
              </p>

              {rejectedCount > 0 && (
                <p className="mt-2 text-xs text-red-600">
                  {rejectedCount} rejected{" "}
                  {rejectedCount === 1 ? "application" : "applications"}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="rounded-2xl border border-[#e1e9e1] bg-white p-12 text-center shadow-sm">
            <p className="font-medium text-slate-600">
              Loading your loan applications...
            </p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div
            role="alert"
            className="rounded-2xl border border-red-200 bg-red-50 p-6"
          >
            <p className="font-semibold text-red-700">
              Unable to load applications
            </p>

            <p className="mt-2 text-sm text-red-600">
              {error}
            </p>

            <button
              type="button"
              onClick={() => setRefreshKey((current) => current + 1)}
              className="mt-4 rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && applications.length === 0 && (
          <div className="rounded-2xl border border-[#e1e9e1] bg-white px-6 py-14 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#eef3ec] text-3xl text-[#24543e]">
              ₹
            </div>

            <h2 className="mt-5 text-xl font-bold text-[#103b32]">
              No Loan Applications Yet
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
              Your loan applications will appear here after you submit
              your first application.
            </p>

            <Link
              to="/loans/apply"
              className="mt-6 inline-flex rounded-xl bg-[#103b32] px-5 py-3 text-sm font-semibold text-white hover:bg-[#185446]"
            >
              Apply for a Loan
            </Link>
          </div>
        )}

        {/* Application cards */}
        {!loading && !error && applications.length > 0 && (
          <div className="space-y-5">

            {applications
              .slice()
              .sort(
                (a, b) =>
                  new Date(b.appliedAt || 0) -
                  new Date(a.appliedAt || 0)
              )
              .map((loan) => {
                const loanAmount =
                  loan.approvedAmount ??
                  loan.disbursedAmount;

                return (
                  <article
                    key={loan.id}
                    className="overflow-hidden rounded-2xl border border-[#e1e9e1] bg-white shadow-sm transition hover:border-[#c5d4c7]"
                  >
                    {/* Card header */}
                    <div className="flex flex-col justify-between gap-4 border-b border-[#edf0eb] px-5 py-5 sm:flex-row sm:items-center sm:px-7">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                          Application ID
                        </p>

                        <h2 className="mt-1 text-xl font-bold text-[#103b32]">
                          #{loan.id}
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                          {loan.loanTypeName || "Loan"} Loan
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <span
                          className={`inline-flex rounded-full px-4 py-2 text-xs font-bold ${getStatusStyle(
                            loan.status
                          )}`}
                        >
                          {loan.status || "UNKNOWN"}
                        </span>
                      </div>
                    </div>

                    {/* Card body */}
                    <div className="grid grid-cols-1 gap-x-8 gap-y-6 p-5 sm:grid-cols-2 lg:grid-cols-4 sm:p-7">

                      <div>
                        <p className="text-sm text-slate-500">
                          Requested Amount
                        </p>

                        <p className="mt-2 text-lg font-bold text-[#103b32]">
                          {formatAmount(loan.requestedAmount)}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-slate-500">
                          Approved Amount
                        </p>

                        <p className="mt-2 text-lg font-bold text-[#103b32]">
                          {formatAmount(loanAmount)}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-slate-500">
                          Annual Interest Rate
                        </p>

                        <p className="mt-2 text-lg font-bold text-[#103b32]">
                          {loan.interestRate != null
                            ? `${loan.interestRate}%`
                            : "—"}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-slate-500">
                          Loan Tenure
                        </p>

                        <p className="mt-2 text-lg font-bold text-[#103b32]">
                          {loan.requestedTenureMonths != null
                            ? `${loan.requestedTenureMonths} months`
                            : "—"}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-slate-500">
                          Estimated / Approved EMI
                        </p>

                        <p className="mt-2 text-lg font-bold text-[#103b32]">
                          {formatAmount(loan.emiAmount)}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-slate-500">
                          Total Interest
                        </p>

                        <p className="mt-2 text-lg font-bold text-[#103b32]">
                          {formatAmount(loan.totalInterest)}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-slate-500">
                          Total Repayment
                        </p>

                        <p className="mt-2 text-lg font-bold text-[#103b32]">
                          {formatAmount(loan.totalRepayment)}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-slate-500">
                          Application Date
                        </p>

                        <p className="mt-2 text-base font-semibold text-[#103b32]">
                          {formatDate(loan.appliedAt)}
                        </p>
                      </div>
                    </div>

                    {/* Rejection reason */}
                    {loan.status === "REJECTED" &&
                      loan.rejectionReason && (
                        <div className="mx-5 mb-5 rounded-xl border border-red-200 bg-red-50 p-4 sm:mx-7">
                          <p className="text-sm font-bold text-red-700">
                            Rejection Reason
                          </p>

                          <p className="mt-1 text-sm leading-6 text-red-600">
                            {loan.rejectionReason}
                          </p>
                        </div>
                      )}

                    {/* Review date */}
                    {loan.reviewedAt && (
                      <div className="mx-5 mb-5 text-xs text-slate-500 sm:mx-7">
                        Reviewed on: {formatDate(loan.reviewedAt)}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-wrap gap-3 border-t border-[#edf0eb] bg-[#fbfcfa] px-5 py-4 sm:px-7">
                      {(loan.status === "DISBURSED" ||
                        loan.status === "COMPLETED") && (
                        <Link
                          to="/loans/repayments"
                          className="rounded-lg bg-[#103b32] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#185446]"
                        >
                          View EMI Schedule →
                        </Link>
                      )}

                      {loan.status === "APPROVED" && (
                        <p className="self-center text-sm text-blue-700">
                          Your loan is approved and awaiting disbursement.
                        </p>
                      )}

                      {loan.status === "PENDING" && (
                        <p className="self-center text-sm text-amber-700">
                          Your application is awaiting admin review.
                        </p>
                      )}

                      {loan.status === "REJECTED" && (
                        <p className="self-center text-sm text-red-700">
                          This application was rejected.
                        </p>
                      )}

                      {loan.status === "COMPLETED" && (
                        <span className="self-center text-sm font-semibold text-emerald-700">
                          Loan fully repaid
                        </span>
                      )}
                    </div>
                  </article>
                );
              })}
          </div>
        )}

        {/* Footer actions */}
        {!loading && !error && applications.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/loans/apply"
              className="rounded-xl bg-[#103b32] px-5 py-3 text-sm font-semibold text-white hover:bg-[#185446]"
            >
              + Apply for Another Loan
            </Link>

            <Link
              to="/loans/repayments"
              className="rounded-xl border border-[#d7e2d7] bg-white px-5 py-3 text-sm font-semibold text-[#24543e] hover:bg-[#eef3ec]"
            >
              View EMI Repayments
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default MyLoanApplications;