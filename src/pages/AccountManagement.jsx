import { useCallback, useEffect, useMemo, useState } from "react";
import api from "../services/api";

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);

function getErrorMessage(err) {
  const data = err?.response?.data;
  if (typeof data === "string" && data.trim()) return data;
  return (
    data?.message ||
    data?.detail ||
    data?.error ||
    "Something went wrong. Please try again."
  );
}

export default function AccountManagement() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadAccounts = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true);
    setError("");

    try {
      const response = await api.get("/admin/accounts");
      setAccounts(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      if (showLoader) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  const filteredAccounts = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return accounts;

    return accounts.filter((account) =>
      [account.username, account.accountNumber, String(account.id)]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    );
  }, [accounts, search]);

  const frozenCount = accounts.filter((account) => account.frozen).length;
  const activeCount = accounts.length - frozenCount;
  const totalBalance = accounts.reduce(
    (total, account) => total + (Number(account.balance) || 0),
    0
  );

  const handleToggleFreeze = async (account) => {
    const shouldFreeze = !account.frozen;
    const actionLabel = shouldFreeze ? "freeze" : "unfreeze";
    const confirmed = window.confirm(
      `Are you sure you want to ${actionLabel} the account for ${account.username}?`
    );
    if (!confirmed) return;

    setActionId(account.id);
    setError("");
    setNotice("");

    try {
      const endpoint = shouldFreeze
        ? `/admin/accounts/${account.id}/freeze`
        : `/admin/accounts/${account.id}/unfreeze`;
      const response = await api.patch(endpoint);
      const updatedAccount = response.data;

      setAccounts((previous) =>
        previous.map((item) =>
          item.id === account.id ? { ...item, ...updatedAccount } : item
        )
      );
      setNotice(
        updatedAccount?.message ||
          `Account ${shouldFreeze ? "frozen" : "unfrozen"} successfully.`
      );
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setActionId(null);
    }
  };

  return (
    <main className="min-h-screen bg-[#f6f8f4] px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[2px] text-[#648078]">
              Administration · Banking
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#102f2c] sm:text-4xl">
              Account management
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#71807b] sm:text-base">
              Review customer accounts and control whether banking transactions are allowed.
            </p>
          </div>
          <button
            type="button"
            onClick={() => loadAccounts()}
            disabled={loading}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#d7e2d8] bg-white px-4 text-sm font-semibold text-[#234c3b] transition hover:bg-[#eef3ec] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span aria-hidden="true">↻</span>
            {loading ? "Refreshing…" : "Refresh accounts"}
          </button>
        </div>

        {error && (
          <div role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
        {notice && (
          <div role="status" className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            {notice}
          </div>
        )}

        <section className="mb-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-[#e0e7df] bg-white p-5 shadow-sm">
            <p className="text-sm text-[#71807b]">Total accounts</p>
            <p className="mt-2 text-3xl font-bold text-[#102f2c]">{accounts.length}</p>
          </div>
          <div className="rounded-2xl border border-[#e0e7df] bg-white p-5 shadow-sm">
            <p className="text-sm text-[#71807b]">Unfrozen accounts</p>
            <p className="mt-2 text-3xl font-bold text-emerald-700">{activeCount}</p>
          </div>
          <div className="rounded-2xl border border-[#e0e7df] bg-white p-5 shadow-sm">
            <p className="text-sm text-[#71807b]">Frozen accounts</p>
            <p className="mt-2 text-3xl font-bold text-rose-700">{frozenCount}</p>
          </div>
          <div className="rounded-2xl bg-[#0d302d] p-5 text-white shadow-sm">
            <p className="text-sm text-[#c1d2cb]">Combined displayed balance</p>
            <p className="mt-2 text-2xl font-bold">{formatCurrency(totalBalance)}</p>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-[#e0e7df] bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-[#edf0eb] p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <h2 className="text-lg font-bold text-[#102f2c]">Customer accounts</h2>
              <p className="mt-1 text-sm text-[#71807b]">
                {filteredAccounts.length} of {accounts.length} accounts shown
              </p>
            </div>
            <label className="block w-full sm:max-w-sm">
              <span className="sr-only">Search by username, account number or ID</span>
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search username, account number or ID"
                className="h-11 w-full rounded-xl border border-[#dce4dc] px-4 text-sm text-[#102f2c] outline-none transition placeholder:text-[#9aa69f] focus:border-[#59856d] focus:ring-4 focus:ring-[#548c6a]/10"
              />
            </label>
          </div>

          {loading ? (
            <div className="p-12 text-center text-sm text-[#71807b]">Loading accounts…</div>
          ) : filteredAccounts.length === 0 ? (
            <div className="p-12 text-center">
              <p className="font-semibold text-[#102f2c]">No accounts found</p>
              <p className="mt-1 text-sm text-[#71807b]">Try another search term.</p>
            </div>
          ) : (
            <>
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[800px] text-left">
                  <thead className="bg-[#f7f9f5] text-xs uppercase tracking-wide text-[#71807b]">
                    <tr>
                      <th className="px-6 py-4 font-bold">Customer</th>
                      <th className="px-6 py-4 font-bold">Account number</th>
                      <th className="px-6 py-4 font-bold">Balance</th>
                      <th className="px-6 py-4 font-bold">Status</th>
                      <th className="px-6 py-4 text-right font-bold">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#edf0eb]">
                    {filteredAccounts.map((account) => (
                      <tr key={account.id} className="transition hover:bg-[#fbfcfa]">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-[#102f2c]">{account.username}</div>
                          <div className="mt-1 text-xs text-[#8a9891]">Account ID: {account.id}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-[#435951]">{account.accountNumber}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-[#102f2c]">{formatCurrency(account.balance)}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold ${account.frozen ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700"}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${account.frozen ? "bg-rose-500" : "bg-emerald-500"}`} />
                            {account.frozen ? "Frozen" : "Unfrozen"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleToggleFreeze(account)}
                            disabled={actionId === account.id}
                            className={`rounded-lg px-4 py-2 text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-60 ${account.frozen ? "border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100" : "border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"}`}
                          >
                            {actionId === account.id ? "Updating…" : account.frozen ? "Unfreeze account" : "Freeze account"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="grid gap-3 p-4 md:hidden">
                {filteredAccounts.map((account) => (
                  <article key={account.id} className="rounded-xl border border-[#e5ebe3] p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-bold text-[#102f2c]">{account.username}</p>
                        <p className="mt-1 break-all text-xs text-[#71807b]">{account.accountNumber}</p>
                        <p className="mt-1 text-xs text-[#8a9891]">Account ID: {account.id}</p>
                      </div>
                      <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${account.frozen ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700"}`}>
                        {account.frozen ? "Frozen" : "Unfrozen"}
                      </span>
                    </div>
                    <div className="mt-4 flex items-end justify-between gap-3">
                      <div>
                        <p className="text-xs text-[#71807b]">Balance</p>
                        <p className="mt-1 font-bold text-[#102f2c]">{formatCurrency(account.balance)}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleToggleFreeze(account)}
                        disabled={actionId === account.id}
                        className={`rounded-lg px-3 py-2 text-xs font-bold transition disabled:opacity-60 ${account.frozen ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-700"}`}
                      >
                        {actionId === account.id ? "Updating…" : account.frozen ? "Unfreeze" : "Freeze"}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}
        </section>

        <p className="mt-4 text-xs leading-5 text-[#8a9891]">
          Account status is enforced by the backend. Freezing an account blocks the configured deposit, withdrawal and transfer operations; existing balances and transaction history are retained.
        </p>
      </div>
    </main>
  );
}
