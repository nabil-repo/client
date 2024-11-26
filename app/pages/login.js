import { useRef, useState } from "react";
import axios from "axios";
import { v4 as uuid } from "uuid";
import useLocalStore from "../hooks/localstore";

export default function Login({ onIdSubmit }) {
  const idRef = useRef();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(""); // "create" or "error"
  const [modalMessage, setModalMessage] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const dotenv = require("dotenv");

  const API_URL ="https://chatting-app-server-9v6p.onrender.com";
  //const API_URL = process.env.ENDPOINT;

  const openModal = (type, message = "") => {
    setModalType(type);
    setModalMessage(message);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalType("");
    setModalMessage("");
    setUsername("");
    setPassword("");
  };
  // Login with username and password
  const handleLogin = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      openModal("error", "Please enter both username and password.");
      return;
    }
    //console.log(API_URL);

    try {
      const response = await axios.post(API_URL + "/api/users/validate", {
        username,
        password,
      });

      if (response.data.user) {
        openModal("info", `Welcome back, ${response.data.user.username}`);
        onIdSubmit(response.data.user.id); // Assuming ID is returned from backend
        localStorage.setItem("username", username);
      } else {
        openModal("error", "Invalid username or password.");
      }
    } catch (error) {
      console.error(error);
      openModal("error", "Error during login. Please try again.");
    }
  };

  const handleCreateUser = async () => {
    if (!username) {
      openModal("error", "Username is required.");
      return;
    }

    if (!password) {
      openModal("error", "Password is required.");
      return;
    }

    const id = uuid();

    try {
      await axios.post(API_URL + "/api/users/create", {
        id,
        username,
        password,
      });
      closeModal();
      openModal("info", "User created successfully!");
      onIdSubmit(id);
      localStorage.setItem("username", username);
    } catch (error) {
      console.error(error);
      openModal("error", "Error creating user. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-semibold text-center mb-6">Welcome</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            Login
          </button>
        </form>
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">Don't have an account?</p>
          <button
            onClick={() => openModal("create")}
            className="mt-2 py-2 px-4 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:ring-2 focus:ring-green-500 focus:outline-none"
          >
            Create New ID
          </button>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm">
            {modalType === "create" && (
              <>
                <h2 className="text-lg font-semibold mb-4">Create New ID</h2>
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="username"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Username
                    </label>
                    <input
                      type="text"
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Password
                    </label>
                    <input
                      type="password"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <button
                    onClick={handleCreateUser}
                    className="w-full py-2 px-4 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:ring-2 focus:ring-green-500 focus:outline-none"
                  >
                    Create
                  </button>
                </div>
              </>
            )}
            {modalType === "error" && (
              <>
                <h2 className="text-lg font-semibold mb-4">Error</h2>
                <p className="text-sm text-gray-600 mb-6">{modalMessage}</p>
                <button
                  onClick={closeModal}
                  className="py-2 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600 focus:ring-2 focus:ring-red-500 focus:outline-none"
                >
                  Close
                </button>
              </>
            )}
            {modalType === "info" && (
              <>
                <h2 className="text-lg font-semibold mb-4">Info</h2>
                <p className="text-sm text-gray-600 mb-6">{modalMessage}</p>
                <button
                  onClick={closeModal}
                  className="py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  Close
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
