import {React , useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useParams  } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ProfileEdit from "./pages/ProfileEdit";
import ProtectedLayout from "./components/ProtectedLayout";
import AdminPending from "./pages/AdminPending";  
import MyMemberships from "./pages/MyMemberships";
import InviteUser from "./pages/InviteUser";
import AcceptInvite from "./pages/AcceptInvite";
import Org from "./pages/Organization";
import SuperAdminPending from "./pages/SuperAdminPending";
import OrgAdminPending from "./pages/OrgAdminPending";
import Channels from "./pages/Channels";
import WhatsAppConnect from "./pages/WhatsAppConnect";
import Subscribe from "./pages/Subscription";
import PaymentSuccess from "./pages/PaymentSuccess";
import OrgMembersPage from "./pages/OrgMembersPage";
import PaymentSummaryPage from "./pages/PaymentSummaryPage";


function App() {

  // 🔐 TOKEN CHECK ON REFRESH
 useEffect(() => {
  const publicPaths = ["/login", "/invite/accept", "/register"];

  const currentPath = window.location.pathname;

  // 🔥 If current page is public, do NOT check token
  if (publicPaths.includes(currentPath)) {
    return;
  }

  const token = localStorage.getItem("token");

  if (!token) {
    window.location.href = "/login";
    return;
  }

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const now = Math.floor(Date.now() / 1000);

    if (payload.exp < now) {
      localStorage.clear();
      window.location.href = "/login";
    }
  } catch (err) {
    console.error("Invalid token:", err);
    localStorage.clear();
    window.location.href = "/login";
  }
}, []);


  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        {/* Protected routes */}
        <Route path="/subscribe" element={<ProtectedLayout><Subscribe/></ProtectedLayout>} />
        <Route
          path="/"
          element={
            <ProtectedLayout>
              <Dashboard />
            </ProtectedLayout>
          }
        />
        <Route
          path="/Profile"
          element={
            <ProtectedLayout>
              <ProfileEdit />
            </ProtectedLayout>
          }
        />
         <Route
          path="/org"
          element={
            <ProtectedLayout>
              <Org />
            </ProtectedLayout>
          }
        />
        <Route 
          path="/admin/pending"
          element={
            <ProtectedLayout>
              <AdminPending/>
            </ProtectedLayout>
          } 
          />
        <Route
          path="/memberships"
          element={
            <ProtectedLayout>
            <MyMemberships/>
          </ProtectedLayout>
        }
        />
        <Route path="/payment-summary" element={<ProtectedLayout><PaymentSummaryPage /></ProtectedLayout>} />
        <Route path="/org/members" element={<ProtectedLayout><OrgMembersPage/></ProtectedLayout>} />
        <Route path="/admin/super" element={<ProtectedLayout><SuperAdminPending/></ProtectedLayout>} />
        <Route path="/admin/org/:orgId" element={<ProtectedLayout><OrgAdminPendingWrapper/></ProtectedLayout>} />
        <Route path="/invite" element={<ProtectedLayout><InviteUser/></ProtectedLayout>} />
        <Route path="/invite/accept/" element={<AcceptInvite/>}/>
        <Route path="/channels" element={<ProtectedLayout><Channels /></ProtectedLayout>} />
        <Route path="/channels/whatsapp" element={<ProtectedLayout><WhatsAppConnect /></ProtectedLayout>} />
        <Route path="/payment-success" element={<PaymentSuccess />} />

        {/* Default route */}
        <Route path="*" element={<Login />} />
      </Routes>
    </Router>
  );
}

function OrgAdminPendingWrapper() {
  const { orgId } = useParams();
  return <OrgAdminPending orgId={orgId} />;
}
export default App;