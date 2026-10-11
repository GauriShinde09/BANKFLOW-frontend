import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";

const initialForm = {
  name: "",
  description: "",
  interestRate: "",
  minAmount: "",
  maxAmount: "",
  maxTenureMonths: "",
};

const formatAmount = (amount) =>
  Number(amount || 0).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

function AdminLoanTypeManagement() {
  const role =
    localStorage.getItem("role") ||
    sessionStorage.getItem("role") ||
    "";

  const isAdmin = role.toUpperCase() === "ADMIN";

  const [loanTypes, setLoanTypes] = useState([]);
  const [form, setForm] = useState(initialForm);

  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [busyToggleId, setBusyToggleId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Load all loan products
  const fetchLoanTypes = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/loan-types");

      setLoanTypes(
        Array.isArray(response.data) ? response.data : []
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load loan products."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchLoanTypes();
    } else {
      setLoading(false);
    }
  }, [isAdmin]);

  // Update form fields
  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  // Clear form and exit edit mode
  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
    setError("");
    setSuccess("");
  };

  // Populate the form for editing
  const handleEdit = (loan) => {
    setForm({
      name: loan.name || "",
      description: loan.description || "",
      interestRate: String(loan.interestRate ?? ""),
      minAmount: String(loan.minAmount ?? ""),
      maxAmount: String(loan.maxAmount ?? ""),
      maxTenureMonths: String(loan.maxTenureMonths ?? ""),
    });

    setEditingId(loan.id);
    setError("");
    setSuccess("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Create or update a loan product
  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const name = form.name.trim().toUpperCase();
    const description = form.description.trim();

    const interestRate = Number(form.interestRate);
    const minAmount = Number(form.minAmount);
    const maxAmount = Number(form.maxAmount);
    const maxTenureMonths = Number(form.maxTenureMonths);

    if (!name || !description) {
      setError("Loan name and description are required.");
      return;
    }

    if (
      !Number.isFinite(interestRate) ||
      interestRate <= 0
    ) {
      setError("Interest rate must be greater than zero.");
      return;
    }

    if (
      !Number.isFinite(minAmount) ||
      !Number.isFinite(maxAmount) ||
      minAmount <= 0 ||
      maxAmount <= 0 ||
      minAmount >= maxAmount
    ) {
      setError(
        "Maximum amount must be greater than minimum amount."
      );
      return;
    }

    if (
      !Number.isInteger(maxTenureMonths) ||
      maxTenureMonths < 1
    ) {
      setError("Maximum tenure must be at least one month.");
      return;
    }

    const payload = {
      name,
      description,
      interestRate,
      minAmount,
      maxAmount,
      maxTenureMonths,
    };

    setSubmitting(true);

    try {
      if (editingId !== null) {
        await api.put(
          `/loan-types/${editingId}`,
          payload
        );

        setSuccess(
          `${name} loan type updated successfully.`
        );
      } else {
        await api.post("/loan-types", payload);

        setSuccess(
          `${name} loan type created successfully.`
        );
      }

      setForm(initialForm);
      setEditingId(null);

      await fetchLoanTypes();
    } catch (err) {
      const data = err.response?.data;

      setError(
        data?.message ||
          data?.error ||
          (typeof data === "string" ? data : null) ||
          `Unable to ${
            editingId !== null ? "update" : "create"
          } loan type.`
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Activate or deactivate a loan type
  const handleToggleActive = async (loan) => {
    const newActive = loan.active === false;

    const action = newActive ? "activate" : "deactivate";

    if (
      !window.confirm(
        `${action.charAt(0).toUpperCase() + action.slice(1)} ${
          loan.name
        } loan type?`
      )
    ) {
      return;
    }

    setBusyToggleId(loan.id);
    setError("");
    setSuccess("");

    try {
      await api.patch(
        `/loan-types/${loan.id}/active`,
        null,
        {
          params: {
            active: newActive,
          },
        }
      );

      setSuccess(
        `${loan.name} loan type ${
          newActive ? "activated" : "deactivated"
        } successfully.`
      );

      // If this product was being edited, leave edit mode
      if (editingId === loan.id) {
        setForm(initialForm);
        setEditingId(null);
      }

      await fetchLoanTypes();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          `Unable to ${action} this loan type.`
      );
    } finally {
      setBusyToggleId(null);
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f9f6] px-5">
        <div className="max-w-md rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-red-700">
            Access Denied
          </h1>

          <p className="mt-3 text-sm text-slate-600">
            Only administrators can manage loan products.
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

        {/* Page heading */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <div>
            <Link
              to="/dashboard"
              className="text-sm font-semibold text-[#24543e] hover:underline"
            >
              ← Back to Dashboard
            </Link>

            <p className="mt-6 text-xs font-bold uppercase tracking-[2px] text-[#648078]">
              BANKFLOW / ADMIN
            </p>

            <h1 className="mt-3 text-3xl font-bold text-[#103b32] sm:text-4xl">
              Loan Type Management
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              Create, edit, activate, and deactivate loan products.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchLoanTypes}
            disabled={loading || submitting || busyToggleId !== null}
            className="rounded-xl border border-[#d8e3d7] bg-white px-4 py-3 text-sm font-semibold text-[#24543e] hover:bg-[#eef3ec] disabled:opacity-50"
          >
            Refresh Products
          </button>
        </div>

        {/* Notifications */}
        {success && (
          <div
            role="status"
            className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700"
          >
            {success}
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

        <div className="grid items-start gap-7 lg:grid-cols-[0.9fr_1.3fr]">

          {/* Create or edit form */}
          <section className="rounded-2xl border border-[#e1e9e1] bg-white p-6 shadow-sm sm:p-7">
            <h2 className="text-xl font-bold text-[#103b32]">
              {editingId !== null
                ? `Edit Loan Type #${editingId}`
                : "Add Loan Type"}
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              {editingId !== null
                ? "Update the product details below."
                : "Configure the loan amount range, interest rate, and tenure."}
            </p>

            <form
              onSubmit={handleSubmit}
              className="mt-6 space-y-5"
            >
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Loan Name
                </label>

                <input
                  id="name"
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. PERSONAL"
                  maxLength={100}
                  required
                  disabled={submitting}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#24543e] focus:ring-2 focus:ring-[#24543e]/10 disabled:bg-slate-50"
                />
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Description
                </label>

                <textarea
                  id="description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Describe this loan product"
                  rows={3}
                  maxLength={1000}
                  required
                  disabled={submitting}
                  className="w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#24543e] focus:ring-2 focus:ring-[#24543e]/10 disabled:bg-slate-50"
                />
              </div>

              <div>
                <label
                  htmlFor="interestRate"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Annual Interest Rate (%)
                </label>

                <input
                  id="interestRate"
                  name="interestRate"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={form.interestRate}
                  onChange={handleChange}
                  placeholder="e.g. 8.5"
                  required
                  disabled={submitting}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#24543e] focus:ring-2 focus:ring-[#24543e]/10 disabled:bg-slate-50"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="minAmount"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Minimum Amount (₹)
                  </label>

                  <input
                    id="minAmount"
                    name="minAmount"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={form.minAmount}
                    onChange={handleChange}
                    placeholder="50000"
                    required
                    disabled={submitting}
                    className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-[#24543e] focus:ring-2 focus:ring-[#24543e]/10 disabled:bg-slate-50"
                  />
                </div>

                <div>
                  <label
                    htmlFor="maxAmount"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Maximum Amount (₹)
                  </label>

                  <input
                    id="maxAmount"
                    name="maxAmount"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={form.maxAmount}
                    onChange={handleChange}
                    placeholder="5000000"
                    required
                    disabled={submitting}
                    className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-[#24543e] focus:ring-2 focus:ring-[#24543e]/10 disabled:bg-slate-50"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="maxTenureMonths"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Maximum Tenure (Months)
                </label>

                <input
                  id="maxTenureMonths"
                  name="maxTenureMonths"
                  type="number"
                  min="1"
                  step="1"
                  value={form.maxTenureMonths}
                  onChange={handleChange}
                  placeholder="e.g. 60"
                  required
                  disabled={submitting}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#24543e] focus:ring-2 focus:ring-[#24543e]/10 disabled:bg-slate-50"
                />
              </div>

              <button
                type="submit"
                disabled={submitting || busyToggleId !== null}
                className="w-full rounded-xl bg-[#103b32] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#185446] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting
                  ? "Saving..."
                  : editingId !== null
                  ? "Update Loan Type"
                  : "Create Loan Type"}
              </button>

              {editingId !== null && (
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={submitting}
                  className="w-full rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel Editing
                </button>
              )}

              <p className="text-xs leading-5 text-slate-500">
                Updating a loan type preserves its current active status.
                Loan names must be unique.
              </p>
            </form>
          </section>

          {/* Existing loan products */}
          <section className="rounded-2xl border border-[#e1e9e1] bg-white p-6 shadow-sm sm:p-7">
            <div className="mb-6 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-[#103b32]">
                  Available Loan Products
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  {loanTypes.length} product(s) configured
                </p>
              </div>

              <span className="rounded-full bg-[#eef3ec] px-3 py-1.5 text-xs font-bold text-[#24543e]">
                {loanTypes.length} Total
              </span>
            </div>

            {loading ? (
              <div className="py-12 text-center text-sm text-slate-500">
                Loading loan products...
              </div>
            ) : loanTypes.length === 0 ? (
              <div className="rounded-xl bg-[#f7f9f6] px-5 py-12 text-center">
                <p className="font-semibold text-[#103b32]">
                  No loan products found
                </p>

                <p className="mt-2 text-sm text-slate-500">
                  Create your first loan product using the form.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {loanTypes.map((loan) => {
                  const isBusy = busyToggleId === loan.id;

                  return (
                    <article
                      key={loan.id}
                      className={`rounded-xl border p-5 transition ${
                        loan.active === false
                          ? "border-slate-200 bg-slate-50/70"
                          : "border-[#e5ebe5] hover:border-[#bdcfbd]"
                      }`}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h3 className="text-lg font-bold text-[#103b32]">
                            {loan.name}
                          </h3>

                          <p className="mt-1 text-xs text-slate-400">
                            Product ID: {loan.id}
                          </p>
                        </div>

                        <span
                          className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                            loan.active === false
                              ? "bg-slate-200 text-slate-600"
                              : "bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          {loan.active === false
                            ? "Inactive"
                            : "Active"}
                        </span>
                      </div>

                      <p className="mt-3 text-sm leading-6 text-slate-600">
                        {loan.description || "No description provided."}
                      </p>

                      <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3">
                        <div>
                          <p className="text-xs text-slate-500">
                            Interest Rate
                          </p>

                          <p className="mt-1 font-bold text-[#103b32]">
                            {loan.interestRate}% p.a.
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-slate-500">
                            Minimum Amount
                          </p>

                          <p className="mt-1 text-sm font-semibold text-[#103b32]">
                            {formatAmount(loan.minAmount)}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-slate-500">
                            Maximum Amount
                          </p>

                          <p className="mt-1 text-sm font-semibold text-[#103b32]">
                            {formatAmount(loan.maxAmount)}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-slate-500">
                            Maximum Tenure
                          </p>

                          <p className="mt-1 font-semibold text-[#103b32]">
                            {loan.maxTenureMonths} months
                          </p>
                        </div>
                      </div>

                      {/* Edit and activation controls */}
                      <div className="mt-5 flex flex-wrap gap-3 border-t border-[#e5ebe5] pt-4">
                        <button
                          type="button"
                          onClick={() => handleEdit(loan)}
                          disabled={
                            submitting || busyToggleId !== null
                          }
                          className="rounded-lg bg-[#103b32] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#185446] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleActive(loan)}
                          disabled={
                            submitting || busyToggleId !== null
                          }
                          className={`rounded-lg border px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                            loan.active === false
                              ? "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                              : "border-red-200 text-red-700 hover:bg-red-50"
                          }`}
                        >
                          {isBusy
                            ? "Updating..."
                            : loan.active === false
                            ? "Activate"
                            : "Deactivate"}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        <div className="mt-8">
          <Link
            to="/loans/admin"
            className="text-sm font-semibold text-[#24543e] hover:underline"
          >
            ← Back to Admin Loan Management
          </Link>
        </div>
      </div>
    </div>
  );
}

export default AdminLoanTypeManagement;