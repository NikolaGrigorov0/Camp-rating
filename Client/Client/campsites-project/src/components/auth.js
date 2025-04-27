"use client";
import { useEffect } from "react";

export default function Auth() {
  const isJWTExpired = () => {
    const expirationTime = localStorage.getItem("jwtExpiration");
    if (!expirationTime) return true;
    return new Date().getTime() > parseInt(expirationTime);
  };

  const removeExpiredJWT = () => {
    if (isJWTExpired()) {
      localStorage.removeItem("jwt");
      localStorage.removeItem("jwtExpiration");
      console.log("JWT has expired.");
    } else {
      console.log("Just test for JWT");
    }
  };

  useEffect(() => {
    removeExpiredJWT();

    const intervalId = setInterval(removeExpiredJWT, 30 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, []);
}