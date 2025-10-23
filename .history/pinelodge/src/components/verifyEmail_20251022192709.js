import React, { useEffect, useState } from "react";
import { getAuth, applyActionCode } from "firebase/auth";
import { useSearchParams } from "react-router-dom";
import logo from "../elements/BaguioPinelodgelogo.png";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [message, setMessage] = useState("Verifying your email...");
  const auth = getAuth();

  useEffect(() => {
    const oobCode = searchParams.get("oobCode");

    if (oobCode) {
      applyActionCode(auth, oobCode)
        .then(() => {
          setMessage("✅ Your email has been successfully verified! You can now sign in.");
        })
        .catch((error) => {
          setMessage("❌ Verification link is invalid or has expired.");
          console.error(error);
        });
    } else {
      setMessage("❌ No verification code found.");
    }
  }, [searchParams, auth]);

  return (
    <div style={{
      display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center",
      height: "100vh", backgroundColor: "#f4f4f4", fontFamily: "'Questrial', sans-serif"
    }}>
      <div style={{
        background: "#fff", padding: "40px 60px", borderRadius: "16px",
        boxShadow: "0 6px 15px rgba(0,0,0,0.1)", textAlign: "center"
      }}>
        <img src={logo} alt="Baguio Pinelodge" width="80" style={{ marginBottom: "15px" }} />
        <h2 style={{ color: "#30410D" }}>Baguio Pinelodge</h2>
        <p style={{ marginTop: "20px", color: "#333", fontSize: "16px" }}>{message}</p>
      </div>
    </div>
  );
}
