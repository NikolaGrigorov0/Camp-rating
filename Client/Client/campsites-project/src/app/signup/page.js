"use client";

import React, { useState } from "react";

export default function SignUpPage() {
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    Username: "",
    Password: "",
    ConfirmPassword: "",
    FirstName: "",
    LastName: "",
  });

  const [validation, setValidation] = useState(false);
  const [validationMessages, setValidationMessages] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const validateStepOne = () => {
    if (!formData.Username || !formData.Password || !formData.ConfirmPassword) {
      setValidation(true);
      setValidationMessages("Моля въведете потребителско име и пароли.");
      return false;
    }
    if (formData.Password !== formData.ConfirmPassword) {
      setValidation(true);
      setValidationMessages("Паролите не съвпадат.");
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStepOne()) {
      setValidation(false);
      setStep(2);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.FirstName || !formData.LastName) {
      setValidation(true);
      setValidationMessages("Моля попълнете всички полета.");
      return;
    }

    try {
      const response = await fetch("https://localhost:5022/api/Auth/Register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const responseData = await response.json();
      if (responseData.success) {
        window.location.href = "/login";
      } else {
        setValidation(true);
        setValidationMessages(responseData.message || "Възникна грешка.");
      }
    } catch (error) {
      setValidation(true);
      setValidationMessages("Грешка при свързване със сървъра.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[url('/assets/login-bg.png')] bg-cover bg-center bg-no-repeat relative overflow-hidden">
      <div className="bg-neutral-900 p-8 rounded-xl shadow-2xl w-full max-w-md z-10">
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full mb-2" />
          <h2 className="text-white text-2xl font-semibold">Регистрация</h2>
          <p className="text-gray-400 text-sm">
            Имате акаунт?{" "}
            <a href="/login" className="text-blue-500 hover:underline">
              Влез
            </a>
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {step === 1 && (
            <>
              <input
                type="text"
                name="Username"
                placeholder="Потребителско име"
                className="w-full px-4 py-2 rounded bg-neutral-800 text-white placeholder-gray-500 border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
                value={formData.Username}
                onChange={handleChange}
              />
              <input
                type="password"
                name="Password"
                placeholder="Парола"
                className="w-full px-4 py-2 rounded bg-neutral-800 text-white placeholder-gray-500 border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
                value={formData.Password}
                onChange={handleChange}
              />
              <input
                type="password"
                name="ConfirmPassword"
                placeholder="Потвърди паролата"
                className="w-full px-4 py-2 rounded bg-neutral-800 text-white placeholder-gray-500 border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
                value={formData.ConfirmPassword}
                onChange={handleChange}
              />
              {validation && <p className="text-red-500 text-sm">{validationMessages}</p>}
              <button
                type="button"
                onClick={handleNext}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded transition"
              >
                Продължи
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <input
                type="text"
                name="FirstName"
                placeholder="Собствено име"
                className="w-full px-4 py-2 rounded bg-neutral-800 text-white placeholder-gray-500 border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
                value={formData.FirstName}
                onChange={handleChange}
              />
              <input
                type="text"
                name="LastName"
                placeholder="Фамилно име"
                className="w-full px-4 py-2 rounded bg-neutral-800 text-white placeholder-gray-500 border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
                value={formData.LastName}
                onChange={handleChange}
              />
              {validation && <p className="text-red-500 text-sm">{validationMessages}</p>}
              <button
                type="submit"
                className="w-full py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded transition"
              >
                Регистрация
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
