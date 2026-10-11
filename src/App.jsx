
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/auth/Login.jsx";
import Register from "./pages/auth/Register.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";

import Dashboard from "./pages/Dashboard.jsx";
import ProtectedRoute from "./routes/ProtectedRoute.jsx";

import AccountOverview from "./pages/banking/AccountOverview.jsx";
import Deposit from "./pages/banking/Deposit.jsx";
import Withdraw from "./pages/banking/Withdraw.jsx";
import Transfer from "./pages/banking/Transfer.jsx";
import TransactionHistory from "./pages/banking/TransactionHistory.jsx";
import BeneficiaryManagement from "./pages/banking/BeneficiaryManagement.jsx";

import LoanRepaymentSchedule from "./pages/loans/LoanRepaymentSchedule.jsx";
import ApplyForLoan from "./pages/loans/ApplyForLoan.jsx";
import MyLoanApplications from "./pages/loans/MyLoanApplications.jsx";
import AdminLoanManagement from "./pages/loans/AdminLoanManagement.jsx";
import AdminLoanTypeManagement from "./pages/loans/AdminLoanTypeManagement.jsx";
import AccountManagement from "./pages/AccountManagement.jsx";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Banking */}
          <Route
            path="/banking/account"
            element={<AccountOverview />}
          />
          <Route
            path="/banking/deposit"
            element={<Deposit />}
          />
          <Route
            path="/banking/withdraw"
            element={<Withdraw />}
          />
          <Route
            path="/banking/transfer"
            element={<Transfer />}
          />
          <Route
            path="/banking/transactions"
            element={<TransactionHistory />}
          />
          <Route
            path="/banking/beneficiaries"
            element={<BeneficiaryManagement />}
          />

          {/* Loans */}
          <Route
            path="/loans/apply"
            element={<ApplyForLoan />}
          />
          <Route
            path="/loans/applications"
            element={<MyLoanApplications />}
          />
          <Route
            path="/loans/repayments"
            element={<LoanRepaymentSchedule />}
          />
          <Route
            path="/loans/admin"
            element={<AdminLoanManagement />}
          />
          <Route
            path="/loans/admin/types"
            element={<AdminLoanTypeManagement />}
          />
          <Route
  path="/admin/accounts"
  element={<AccountManagement />}
/>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
