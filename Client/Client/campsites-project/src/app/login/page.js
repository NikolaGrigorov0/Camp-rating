"use client";

import React from "react";
import { useState } from "react";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [validation, setValidation] = useState(false);
  const [validationMessage, setValidationMessage] = useState();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.username || !formData.password) {
      setValidation(true);
      setValidationMessage("Моля въведете потребителско име и парола");
      return;
    }

    const response = await fetch("https://localhost:5022/api/Auth/Login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });
    const responseData = await response.json();
    if (responseData.success) {
      const expirationTime = new Date().getTime() + 30 * 60000; // 30 minutes from now
      localStorage.setItem("jwt", responseData.jwt);
      localStorage.setItem("jwtExpiration", expirationTime);
      window.location.href = "/";
      setValidation(false);
    } else {
      setValidation(true);
      setValidationMessage(responseData.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[url('/assets/login-bg.png')] bg-cover bg-center bg-no-repeat relative overflow-hidden">
      <div className="bg-neutral-900 p-8 rounded-xl shadow-2xl w-full max-w-md z-10">
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full mb-2" />
          <h2 className="text-white text-2xl font-semibold">Добре дошли</h2>
          <p className="text-gray-400 text-sm">
            Нямате акаунт все още?{" "}
            <a href="/signup" className="text-blue-500 hover:underline">
              Регистрирай се
            </a>
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            type="text"
            name="username"
            placeholder="Username"
            className="w-full px-4 py-2 rounded bg-neutral-800 text-white placeholder-gray-500 border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
            value={formData.username}
            onChange={handleChange}
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            className="w-full px-4 py-2 rounded bg-neutral-800 text-white placeholder-gray-500 border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
            value={formData.password}
            onChange={handleChange}
          />
          {validation && (
            <p className="validation-message">{validationMessage}</p>
          )}
          <button
            type="submit"
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded transition"
          >
            Влез
          </button>
        </form>
      </div>
    </div>
  );
}
