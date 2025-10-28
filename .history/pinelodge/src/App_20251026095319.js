import LandingPage from './components/LandingPage';
import SignUp from './components/SignUp';
import SignIn from './components/SignIn';
import ForgotPass from './components/ForgotPass';
import HostHome from './components/hostPage/HomeHost';
import HostSidebar from './components/hostPage/SidebarHost';
import HostListing from './components/hostPage/ListingHost';
import HostPayment from './components/hostPage/PaymentHost';
import GetStarted from './components/hostPage/GetStarted';
import GuestPage from './components/guestPage/GuestPage'; 
import BookingPage from './components/guestPage/BookingPage';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import React from 'react';
import ProtectedRoute from './components/ProtectedRoute';
import VerifyEmail from './components/verifyEmail';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/Signup" element={<SignUp />} />
        <Route path="/SignIn" element={<SignIn />} />
        <Route path="/ForgotPass" element={<ForgotPass />} />
        <Route path="/verifyEmail" element={<VerifyEmail />} />

        <Route path='/guestPage/GuestPage' element= {<ProtectedRoute> <GuestPage/> </ProtectedRoute>}/>
        <Route path='/guestPage/BookingPage' element= {<ProtectedRoute> <BookingPage/> </ProtectedRoute>}/>
       
        <Route path="/hostPage/HomeHost" element={<ProtectedRoute> <HostHome /> </ProtectedRoute> }/>
        <Route path="/hostPage/SidebarHost" element={<ProtectedRoute> <HostSidebar /> </ProtectedRoute>}/>
        <Route path="/hostPage/ListingHost" element={<ProtectedRoute> <HostListing /> </ProtectedRoute> }/>
        <Route path="/hostPage/PaymentHost" element={<ProtectedRoute> <HostPayment /> </ProtectedRoute> } />
        <Route path="/hostPage/GetStarted" element={<ProtectedRoute> <GetStarted /> </ProtectedRoute> }/>

      </Routes>
    </Router>
  );
}

export default App;