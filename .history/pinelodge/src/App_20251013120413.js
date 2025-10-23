import LandingPage from './components/LandingPage';
import SignUp from './components/SignUp';
import SignIn from './components/SignIn';
import ForgotPass from './components/ForgotPass';
import HostHome from './components/hostPage/HomeHost';
import HostSidebar from './components/hostPage/SidebarHost';
import HostListing from './components/hostPage/ListingHost';
import HostPayment from './components/hostPage/PaymentHost';
import GetStarted from './components/hostPage/GetStarted';

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import React from 'react';



function App() {

  return (

    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/Signup" element={<SignUp />} />
        <Route path="/SignIn" element={<SignIn />} />
        <Route path="/ForgotPass" element={<ForgotPass />} />
        <Route path="/hostPage/HomeHost" element={<HostHome />} />
        <Route path="/hostPage/SidebarHost" element={<HostSidebar />} />
        <Route path="/hostPage/ListingHost" element={<HostListing />} />
        <Route path="/hostPage/PaymentHost" element={<HostPayment />} />  
        <Route path="/hostPage/GetStarted" element={<GetStarted />} />
      </Routes>
    </Router>
  );
}

export default App;
