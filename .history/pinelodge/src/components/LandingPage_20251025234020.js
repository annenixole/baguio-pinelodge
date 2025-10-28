import React, { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import NavbarGuest from "./guestPage/NavbarGuest";
import Navbar from "./Navbar"; 
import LandingGuest from "./guestPage/LandingGuest";

export default function LandingPage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  return (
    <>
      {user ? <NavbarGuest /> : <Navbar />}
      <LandingGuest />
    </>
  );
}
