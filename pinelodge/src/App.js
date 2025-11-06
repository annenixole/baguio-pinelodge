import LandingPage from './components/LandingPage';
import SignUp from './components/SignUp';
import SignIn from './components/SignIn';
import ForgotPass from './components/ForgotPass';
import ResetPassword from './components/ResetPassword';
import HostHome from './components/hostPage/HomeHost';
import HostSidebar from './components/hostPage/SidebarHost';
import HostListing from './components/hostPage/ListingHost';
import HostPayment from './components/hostPage/PaymentHost';
import GetStarted from './components/hostPage/GetStarted';
import AdminPage from './components/adminPage/adminPage';
import GuestPage from './components/guestPage/GuestPage'; 
import AccomGuest from './components/guestPage/AccomGuest';
import ExpGuest from './components/guestPage/ExpGuest';
import ServGuest from './components/guestPage/ServGuest';
import BookingPage from './components/guestPage/BookingPage';
import Favorites from './components/guestPage/Favorites';
import ListingLink from './components/guestPage/ListingLink';
import MyBookings from './components/guestPage/MyBookings';
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
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verifyEmail" element={<VerifyEmail />} />

        {/* Public listing link - no login required */}
        <Route path='/ListingLink' element={<ListingLink />} />

        {/* Public listing pages - accessible to all users */}
        <Route path='/AccomGuest' element={<AccomGuest/>}/>
        <Route path='/ExpGuest' element={<ExpGuest/>}/>
        <Route path='/ServGuest' element={<ServGuest/>}/>

        {/* Protected routes - require login */}
        <Route path='/guestPage/GuestPage' element= {<ProtectedRoute> <GuestPage/> </ProtectedRoute>}/>
        <Route path='/BookingPage' element= {<ProtectedRoute> <BookingPage/> </ProtectedRoute>}/>
        <Route path='/Favorites' element= {<ProtectedRoute> <Favorites/> </ProtectedRoute>}/>
        <Route path='/MyBookings' element= {<ProtectedRoute> <MyBookings/> </ProtectedRoute>}/>
       
        <Route path="/hostPage/HomeHost" element={<ProtectedRoute> <HostHome /> </ProtectedRoute> }/>
        <Route path="/hostPage/SidebarHost" element={<ProtectedRoute> <HostSidebar /> </ProtectedRoute>}/>
        <Route path="/hostPage/ListingHost" element={<ProtectedRoute> <HostListing /> </ProtectedRoute> }/>
        <Route path="/hostPage/PaymentHost" element={<ProtectedRoute> <HostPayment /> </ProtectedRoute> } />
        <Route path="/hostPage/GetStarted" element={<ProtectedRoute> <GetStarted /> </ProtectedRoute> }/>

        {/* Admin route */}
        <Route path="/adminPage" element={<AdminPage />} />

      </Routes>
    </Router>
  );
}

export default App;