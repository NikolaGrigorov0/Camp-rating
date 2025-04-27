"use client";
import { useState, useEffect } from "react";

const handleLogout = () => {
  fetch("https://localhost:5022/api/Auth/Logout", {
    method: "POST",
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        localStorage.clear();
        window.location.href = "/";
      }
    })
    .catch((error) => {
      console.error("Error during logout:", error);
    });
};

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setAdmin] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [username, setUsername] = useState("");

  useEffect(() => {
    const jwtToken = localStorage.getItem("jwt");
    setIsLoggedIn(!!jwtToken);
  }, []);

  useEffect(() => {
    const getUser = async () => {
      const jwtToken = localStorage.getItem("jwt");

      if (!jwtToken) {
        console.log("User is not logged in");
        return;
      }

      try {
        const response = await fetch("https://localhost:5022/api/Auth/GetUser", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        });

        if (!response.ok) {
          console.error(`Failed to fetch user data: ${response.statusText}`);
          if (response.status === 401) {
            localStorage.clear();
            setIsLoggedIn(false);
          }
          return;
        }

        const data = await response.json();
        if (data && data.user.userName) {
          setUsername(data.user.userName);
          if (data.roles == "Admin") {
            setAdmin(true);
          }
        } else {
          console.error("Invalid response format", data);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    getUser();
  }, []);

  const handleLogoutClick = (e) => {
    e.preventDefault();
    handleLogout();
  };

  return (
    <div className="navbar">
      <div className="nav-buttons-all">
        {isLoggedIn && (
          <div
          className="profile-dropdown"
          onMouseEnter={() => setIsDropdownOpen(true)}
          onMouseLeave={() => setIsDropdownOpen(false)}
        >
          <button className="profile-button">
            <img src="/assets/logo.png" alt="Profile" />
            <span>{username}</span>
          </button>
          {isDropdownOpen && (
            <ul className="dropdown-menu">
              {isAdmin && (<li><a href="/admin">Админ панел</a></li>)}
              <li><a href="/reviews">Моите ревюта</a></li>
              <li><a href="/login" onClick={handleLogoutClick}>Изход</a></li>
            </ul>
          )}
        </div>
        )}
      </div>
    </div>
  );
}