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

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const statusStyle = (status) => {
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

function AdminLoanManagement() {
  const role =
    localStorage.getItem("role") ||
    sessionStorage.getItem("role") ||
    "";

  const [applications, setApplications] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;

    const fetchApplications = async () => {
      if (role !== "ADMIN") {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const response = await api.get(
          "/loan-applications/admin/all"
        );

        if (!active) return;

        setApplications(
          Array.isArray(response.data) ? response.data : []
        );
      } catch (err) {
        if (!active) return;

        setError(
          err.response?.data?.message ||
            "Unable to load loan applications."
        );
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchApplications();

    return () => {
      active = false;
    };
  }, [refreshKey, role]);

  const refreshApplications = () => {
    setRefreshKey((current) => current + 1);
  };

  // Approve a pending loan
  const handleApprove = async (loan) => {
    if (loan.status !== "PENDING") return;

    const answer = window.prompt(
      `Enter the approved amount for loan #${loan.id}:`,
      String(loan.requestedAmount)
    );

    if (answer === null) return;

    const approvedAmount = Number(answer);

    if (
      !Number.isFinite(approvedAmount) ||
      approvedAmount <= 0 ||
      approvedAmount > Number(loan.requestedAmount)
    ) {
      setError(
        "Approved amount must be greater than zero and cannot exceed the requested amount."
      );
      setMessage("");
      return;
    }

    if (
      !window.confirm(
        `Approve loan #${loan.id} for ${formatAmount(
          approvedAmount
        )}?`
      )
    ) {
      return;
    }

    setBusyId(loan.id);
    setError("");
    setMessage("");

    try {
      await api.put(
        `/loan-applications/${loan.id}/approve`,
        null,
        {
          params: { approvedAmount },
        }
      );

      setMessage(`Loan #${loan.id} approved successfully.`);
      refreshApplications();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to approve this loan."
      );
    } finally {
      setBusyId(null);
    }
  };

  // Reject a pending loan
  const handleReject = async (loan) => {
    if (loan.status !== "PENDING") return;

    const rejectionReason = window.prompt(
      `Enter the rejection reason for loan #${loan.id}:`
    );

    if (rejectionReason === null) return;

    if (!rejectionReason.trim()) {
      setError("A rejection reason is required.");
      setMessage("");
      return;
    }

    if (!window.confirm(`Reject loan #${loan.id}?`)) return;

    setBusyId(loan.id);
    setError("");
    setMessage("");

    try {
      await api.put(
        `/loan-applications/${loan.id}/reject`,
        null,
        {
          params: { rejectionReason: rejectionReason.trim() },
        }
      );

      setMessage(`Loan #${loan.id} rejected.`);
      refreshApplications();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to reject this loan."
      );
    } finally {
      setBusyId(null);
    }
  };

  // Disburse an approved loan exactly once
  const handleDisburse = async (loan) => {
    if (
      loan.status !== "APPROVED" ||
      loan.disbursedAmount != null ||
      loan.disbursedAt != null
    ) {
      return;
    }

    if (
      !window.confirm(
        `Disburse ${formatAmount(
          loan.approvedAmount
        )} to the customer for loan #${loan.id}?`
      )
    ) {
      return;
    }

    setBusyId(loan.id);
    setError("");
    setMessage("");

    try {
      await api.put(
        `/loan-applications/${loan.id}/disburse`
      );

      setMessage(`Loan #${loan.id} disbursed successfully.`);
      refreshApplications();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to disburse this loan."
      );
    } finally {
      setBusyId(null);
    }
  };

  const pendingCount = applications.filter(
    (loan) => loan.status === "PENDING"
  ).length;

  const approvedCount = applications.filter(
    (loan) => loan.status === "APPROVED"
  ).length;

  const disbursedCount = applications.filter(
    (loan) => loan.status === "DISBURSED"
  ).length;

  const rejectedCount = applications.filter(
    (loan) => loan.status === "REJECTED"
  ).length;

  const filteredApplications = applications.filter(
    (loan) => filter === "ALL" || loan.status === filter
  );

  if (role !== "ADMIN") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f9f6] px-5">
        <div className="max-w-md rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-red-700">
            Access Denied
          </h1>

          <p className="mt-3 text-sm text-slate-600">
            This page is available to administrators only.
          </p>

          <Link
            to="/dashboard"
            className="mt-6 inline-flex rounded-xl bg-[#103b32] px-5 py-3 text-sm font-semibold text-white"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f9f6] px-4 py-8 text-[#102f2c] sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link
            to="/dashboard"
            className="text-sm font-semibold text-[#24543e] hover:underline"
          >
            ← Back to Dashboard
          </Link>

          <button
            type="button"
            onClick={refreshApplications}
            disabled={loading || busyId !== null}
            className="rounded-xl border border-[#d8e3d7] bg-white px-4 py-2.5 text-sm font-semibold text-[#24543e] hover:bg-[#eef3ec] disabled:opacity-50"
          >
            Refresh Applications
          </button>
        </div>

        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-[2px] text-[#648078]">
            BANKFLOW / ADMIN
          </p>

          <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#103b32] sm:text-4xl">
            Loan Management
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500 sm:text-base">
            Review loan applications, make approval decisions,
            and manage loan disbursements.
          </p>
        </div>

        {/* Notifications */}
        {message && (
          <div
            role="status"
            className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
          >
            {message}
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {/* Summary cards */}
        <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-[#e1e9e1] bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Pending Review
            </p>
            <p className="mt-2 text-3xl font-bold text-amber-600">
              {pendingCount}
            </p>
          </div>

          <div className="rounded-2xl border border-[#e1e9e1] bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Approved
            </p>
            <p className="mt-2 text-3xl font-bold text-blue-600">
              {approvedCount}
            </p>
          </div>

          <div className="rounded-2xl border border-[#e1e9e1] bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Disbursed
            </p>
            <p className="mt-2 text-3xl font-bold text-emerald-600">
              {disbursedCount}
            </p>
          </div>

          <div className="rounded-2xl border border-[#e1e9e1] bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Rejected
            </p>
            <p className="mt-2 text-3xl font-bold text-red-600">
              {rejectedCount}
            </p>
          </div>
        </div>

        {/* Filter */}
        <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-[#e1e9e1] bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-bold text-[#103b32]">
              All Applications
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {filteredApplications.length} application(s)
            </p>
          </div>

          <div className="sm:w-64">
            <label
              htmlFor="statusFilter"
              className="mb-1.5 block text-xs font-semibold text-slate-600"
            >
              Filter by status
            </label>

            <select
              id="statusFilter"
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#24543e]"
            >
              <option value="ALL">All Applications</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="DISBURSED">Disbursed</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="rounded-2xl border border-[#e1e9e1] bg-white p-12 text-center text-slate-500">
            Loading loan applications...
          </div>
        )}

        {/* Empty state */}
        {!loading && filteredApplications.length === 0 && !error && (
          <div className="rounded-2xl border border-[#e1e9e1] bg-white p-12 text-center">
            <h2 className="text-lg font-bold text-[#103b32]">
              No Applications Found
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              No loan applications match this status filter.
            </p>
          </div>
        )}

        {/* Applications table */}
        {!loading && filteredApplications.length > 0 && (
          <div className="overflow-hidden rounded-2xl border border-[#e1e9e1] bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1150px] text-left">
                <thead>
                  <tr className="bg-[#f7f9f6] text-xs font-semibold uppercase tracking-wider text-slate-500">
                    <th className="px-5 py-4">Application</th>
                    <th className="px-5 py-4">Customer ID</th>
                    <th className="px-5 py-4">Loan Type</th>
                    <th className="px-5 py-4">Requested</th>
                    <th className="px-5 py-4">Approved</th>
                    <th className="px-5 py-4">Tenure</th>
                    <th className="px-5 py-4">Applied On</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#e8eee8]">
                  {filteredApplications.map((loan) => {
                    const busy = busyId === loan.id;

                    const disbursementDataExists =
                      loan.disbursedAmount != null ||
                      loan.disbursedAt != null;

                    const inconsistentApprovedLoan =
                      loan.status === "APPROVED" &&
                      disbursementDataExists;

                    return (
                      <tr
                        key={loan.id}
                        className="align-top transition hover:bg-[#fbfcfa]"
                      >
                        <td className="whitespace-nowrap px-5 py-5 font-semibold text-[#103b32]">
                          #{loan.id}
                        </td>

                        <td className="px-5 py-5 text-sm text-slate-600">
                          {loan.applicantId ?? "—"}
                        </td>

                        <td className="px-5 py-5 font-medium text-slate-700">
                          {loan.loanTypeName || "—"}
                        </td>

                        <td className="whitespace-nowrap px-5 py-5 text-sm font-semibold">
                          {formatAmount(loan.requestedAmount)}
                        </td>

                        <td className="whitespace-nowrap px-5 py-5 text-sm">
                          {formatAmount(loan.approvedAmount)}
                        </td>

                        <td className="whitespace-nowrap px-5 py-5 text-sm text-slate-600">
                          {loan.requestedTenureMonths ?? "—"} months
                        </td>

                        <td className="whitespace-nowrap px-5 py-5 text-sm text-slate-500">
                          {formatDate(loan.appliedAt)}
                        </td>

                        <td className="whitespace-nowrap px-5 py-5">
                          <span
                            className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${statusStyle(
                              loan.status
                            )}`}
                          >
                            {loan.status}
                          </span>

                          {inconsistentApprovedLoan && (
                            <p className="mt-2 max-w-40 whitespace-normal text-xs text-red-600">
                              Disbursement data exists. Verify this record before acting.
                            </p>
                          )}

                          {loan.status === "REJECTED" &&
                            loan.rejectionReason && (
                              <p className="mt-2 max-w-44 whitespace-normal text-xs text-red-600">
                                Reason: {loan.rejectionReason}
                              </p>
                            )}
                        </td>

                        <td className="px-5 py-5">
                          <div className="flex min-w-36 flex-col items-start gap-2">
                            {loan.status === "PENDING" && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleApprove(loan)}
                                  disabled={busyId !== null}
                                  className="w-full rounded-lg bg-[#103b32] px-3 py-2 text-xs font-semibold text-white hover:bg-[#185446] disabled:opacity-50"
                                >
                                  {busy ? "Processing..." : "Approve"}
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleReject(loan)}
                                  disabled={busyId !== null}
                                  className="w-full rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
                                >
                                  Reject
                                </button>
                              </>
                            )}

                            {loan.status === "APPROVED" &&
                              !disbursementDataExists && (
                                <button
                                  type="button"
                                  onClick={() => handleDisburse(loan)}
                                  disabled={busyId !== null}
                                  className="w-full rounded-lg bg-emerald-700 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-800 disabled:opacity-50"
                                >
                                  {busy ? "Processing..." : "Disburse"}
                                </button>
                              )}

                            {loan.status === "APPROVED" &&
                              disbursementDataExists && (
                                <span className="text-xs text-red-600">
                                  Verify status
                                </span>
                              )}

                            {["DISBURSED", "COMPLETED"].includes(
                              loan.status
                            ) && (
                              <span className="text-xs font-medium text-emerald-700">
                                {loan.status === "COMPLETED"
                                  ? "Loan completed"
                                  : "Disbursed"}
                              </span>
                            )}

                            {loan.status === "REJECTED" && (
                              <span className="text-xs text-slate-400">
                                No actions
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="border-t border-[#e8eee8] px-5 py-4 text-xs leading-5 text-slate-500">
              Approval, rejection, and disbursement actions call your secured Spring Boot APIs.
              Verify loan details before confirming a financial action.
            </div>
          </div>
        )}

        {/* Footer links */}
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/dashboard"
            className="rounded-xl border border-[#d8e3d7] bg-white px-5 py-3 text-sm font-semibold text-[#24543e] hover:bg-[#eef3ec]"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

export default AdminLoanManagement;