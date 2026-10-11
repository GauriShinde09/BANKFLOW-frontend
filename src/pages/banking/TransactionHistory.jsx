import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";

const PAGE_SIZE = 5;

// Convert backend transaction types into readable labels

const getTransactionType = (type) => {

  const value = (type || "").toUpperCase();

  if (

    value.includes("CREDIT") ||

    value.includes("DEPOSIT") ||

    value.includes("DEPOSITE")

  ) {

    return "Credit";

  }

  if (

    value.includes("DEBIT") ||

    value.includes("WITHDRAW")

  ) {

    return "Debit";

  }

  return type || "Other";

};

// Display the sender or receiver for transfers

const getCounterparty = (transaction) => {

  const type = (transaction.type || "").toUpperCase();

  const username = transaction.counterpartyUsername;

  if (type.includes("TRANSFER_DEBIT")) {

    return username ? `To: ${username}` : "—";

  }

  if (type.includes("TRANSFER_CREDIT")) {

    return username ? `From: ${username}` : "—";

  }

  return "—";

};

// Format date and time

const formatDate = (date) => {

  if (!date) return "—";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {

    return "—";

  }

  return parsedDate

    .toLocaleString("en-IN", {

      day: "2-digit",

      month: "short",

      year: "numeric",

      hour: "2-digit",

      minute: "2-digit",

      hour12: true,

    })

    .replace(/\b(AM|PM)\b/i, (match) => match.toLowerCase());

};

// Format amount using Indian currency

const formatAmount = (amount) => {

  return Number(amount || 0).toLocaleString("en-IN", {

    minimumFractionDigits: 2,

    maximumFractionDigits: 2,

  });

};

function TransactionHistory() {

  const [transactions, setTransactions] = useState([]);

  const [page, setPage] = useState(0);

  const [totalElements, setTotalElements] = useState(0);

  const [totalPages, setTotalPages] = useState(0);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");
  const [statementDownloading, setStatementDownloading] = useState(false);
  const [statementError, setStatementError] = useState("");

  useEffect(() => {

    let active = true;

    const fetchTransactions = async () => {

      setLoading(true);

      setError("");

      try {

        const response = await api.get("/transactions", {

          params: {

            page,

            size: PAGE_SIZE,

          },

        });

        if (!active) return;

        const data = response.data;

        setTransactions(

          Array.isArray(data.content) ? data.content : []

        );

        setTotalElements(Number(data.totalElements || 0));

        setTotalPages(Number(data.totalPages || 0));

      } catch (err) {

        if (!active) return;

        setError(

          err.response?.data?.message ||

            "Unable to load transactions. Please try again."

        );

      } finally {

        if (active) {

          setLoading(false);

        }

      }

    };

    fetchTransactions();

    return () => {

      active = false;

    };

  }, [page]);

  const startRecord =

    totalElements === 0 ? 0 : page * PAGE_SIZE + 1;

  const endRecord = Math.min(

    (page + 1) * PAGE_SIZE,

    totalElements

  );

  const handleDownloadStatement = async () => {
    setStatementError("");
    setStatementDownloading(true);

    try {
      const response = await api.get("/account-statement/pdf", {
        responseType: "blob",
      });

      const pdfBlob = new Blob([response.data], {
        type: "application/pdf",
      });
      const downloadUrl = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");

      link.href = downloadUrl;
      link.download = "BANKFLOW-Account-Statement.pdf";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => window.URL.revokeObjectURL(downloadUrl), 1000);
    } catch (err) {
      let backendMessage = "";
      const responseData = err.response?.data;

      if (responseData instanceof Blob) {
        try {
          const responseText = await responseData.text();
          const parsed = JSON.parse(responseText);
          backendMessage = parsed?.message || parsed?.detail || "";
        } catch {
          // Use the fallback message when the response is not JSON.
        }
      } else if (typeof responseData === "string") {
        backendMessage = responseData;
      } else {
        backendMessage = responseData?.message || responseData?.detail || "";
      }

      setStatementError(
        backendMessage ||
          (err.response?.status === 401
            ? "Your session has expired. Please log in again."
            : err.response?.status === 403
              ? "You are not authorized to download this statement."
              : "Unable to download your account statement. Please try again.")
      );
    } finally {
      setStatementDownloading(false);
    }
  };

  return (

    <div className="min-h-screen bg-[#f7f9f6] px-4 py-8 sm:px-6 lg:px-10">

      <div className="mx-auto max-w-7xl">

        <div className="overflow-hidden rounded-3xl border border-[#dfe7df] bg-white shadow-sm">

          {/* Header */}

          <div className="flex flex-col justify-between gap-4 border-b border-[#e2e9e2] px-6 py-6 sm:flex-row sm:items-center sm:px-8">

            <div>

              <h1 className="text-xl font-bold text-[#102f2a] sm:text-2xl">

                All Transactions

              </h1>

              <p className="mt-2 text-sm text-slate-500 sm:text-base">

                Showing {startRecord}–{endRecord} of {totalElements}

              </p>

            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#dce5dc] bg-white px-4 py-3 text-sm font-semibold text-[#24564b] transition hover:bg-[#edf3eb]"
              >
                <span aria-hidden="true">←</span>
                Go to Dashboard
              </Link>
              <button
                type="button"
                onClick={handleDownloadStatement}
                disabled={statementDownloading}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#103b32] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#185446] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {statementDownloading ? (
                  <>
                    <span
                      className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                      aria-hidden="true"
                    />
                    Preparing PDF...
                  </>
                ) : (
                  <>
                    <span aria-hidden="true">↓</span>
                    Download PDF
                  </>
                )}
              </button>
              <div className="w-fit rounded-xl bg-[#edf3eb] px-4 py-3 text-sm font-medium text-[#24564b]">
                {PAGE_SIZE} per page
              </div>
            </div>

          </div>

          {statementError && (
            <div
              role="alert"
              className="mx-6 mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 sm:mx-8"
            >
              {statementError}
            </div>
          )}

          {/* Error */}

          {error && (

            <div className="m-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">

              {error}

              <button

                onClick={() => setPage((current) => current)}

                className="ml-2 font-semibold underline"

              >

                Retry

              </button>

            </div>

          )}

          {/* Table */}

          <div className="overflow-x-auto">

            <table className="w-full min-w-[850px] border-collapse text-left">

              <thead>

                <tr className="bg-[#f7f9f6] text-xs font-semibold uppercase tracking-wider text-slate-500 sm:text-sm">

                  <th className="px-6 py-5 sm:px-8">

                    Transaction ID

                  </th>

                  <th className="px-6 py-5">

                    Type

                  </th>

                  <th className="px-6 py-5">

                    From / To

                  </th>

                  <th className="px-6 py-5">

                    Date &amp; Time

                  </th>

                  <th className="px-6 py-5 text-right sm:px-8">

                    Amount

                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-[#e8eee8]">

                {loading ? (

                  <tr>

                    <td

                      colSpan={5}

                      className="px-6 py-14 text-center text-slate-500"

                    >

                      Loading transactions...

                    </td>

                  </tr>

                ) : error ? (

                  <tr>

                    <td

                      colSpan={5}

                      className="px-6 py-12 text-center text-slate-500"

                    >

                      Please retry to load your transactions.

                    </td>

                  </tr>

                ) : transactions.length === 0 ? (

                  <tr>

                    <td

                      colSpan={5}

                      className="px-6 py-14 text-center text-slate-500"

                    >

                      No transactions found.

                    </td>

                  </tr>

                ) : (

                  transactions.map((transaction) => {

                    const rawType = (

                      transaction.type || ""

                    ).toUpperCase();

                    const displayType = getTransactionType(

                      transaction.type

                    );

                    const isCredit = displayType === "Credit";

                    return (

                      <tr

                        key={transaction.id}

                        className="transition-colors hover:bg-[#fbfcfa]"

                      >

                        {/* Transaction ID */}

                        <td className="whitespace-nowrap px-6 py-6 font-semibold text-[#102f2a] sm:px-8">

                          #{transaction.id}

                        </td>

                        {/* Type */}

                        <td className="whitespace-nowrap px-6 py-6">

                          <span

                            className={`inline-flex rounded-full px-4 py-2 text-sm font-medium ${

                              isCredit

                                ? "bg-emerald-100 text-emerald-700"

                                : displayType === "Debit"

                                ? "bg-red-100 text-red-700"

                                : "bg-slate-100 text-slate-600"

                            }`}

                          >

                            {displayType}

                          </span>

                        </td>

                        {/* From / To */}

                        <td className="whitespace-nowrap px-6 py-6 text-sm font-medium text-slate-600">

                          {rawType.includes("TRANSFER_DEBIT") ? (

                            <span>

                              <span className="text-slate-400">

                                To:

                              </span>{" "}

                              {transaction.counterpartyUsername || "—"}

                            </span>

                          ) : rawType.includes("TRANSFER_CREDIT") ? (

                            <span>

                              <span className="text-slate-400">

                                From:

                              </span>{" "}

                              {transaction.counterpartyUsername || "—"}

                            </span>

                          ) : (

                            <span className="text-slate-400">—</span>

                          )}

                        </td>

                        {/* Date & Time */}

                        <td className="whitespace-nowrap px-6 py-6 text-sm text-slate-500 sm:text-base">

                          {formatDate(transaction.date)}

                        </td>

                        {/* Amount */}

                        <td className="whitespace-nowrap px-6 py-6 text-right font-bold sm:px-8">

                          <span

                            className={

                              isCredit

                                ? "text-emerald-600"

                                : displayType === "Debit"

                                ? "text-red-600"

                                : "text-slate-600"

                            }

                          >

                            {displayType === "Credit"

                              ? "+"

                              : displayType === "Debit"

                              ? "-"

                              : ""}

                            ₹{formatAmount(transaction.amount)}

                          </span>

                        </td>

                      </tr>

                    );

                  })

                )}

              </tbody>

            </table>

          </div>

          {/* Pagination */}

          <div className="flex flex-col gap-4 border-t border-[#e2e9e2] px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">

            <p className="text-sm text-slate-500">

              Page {totalPages === 0 ? 0 : page + 1} of {totalPages}

            </p>

            <div className="flex items-center gap-3">

              <button

                type="button"

                onClick={() =>

                  setPage((current) => Math.max(0, current - 1))

                }

                disabled={page === 0 || loading}

                className="rounded-xl border border-[#dce5dc] px-5 py-2.5 text-sm font-semibold text-[#24564b] transition hover:bg-[#edf3eb] disabled:cursor-not-allowed disabled:opacity-40"

              >

                Previous

              </button>

              <button

                type="button"

                onClick={() =>

                  setPage((current) =>

                    Math.min(totalPages - 1, current + 1)

                  )

                }

                disabled={

                  loading ||

                  totalPages === 0 ||

                  page >= totalPages - 1

                }

                className="rounded-xl bg-[#103b32] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#185446] disabled:cursor-not-allowed disabled:opacity-40"

              >

                Next

              </button>

            </div>

          </div>

        </div>

      </div>

    </div>

  );

}

export default TransactionHistory;
