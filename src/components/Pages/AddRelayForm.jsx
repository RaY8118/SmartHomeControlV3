import React, { useState, useEffect } from "react";
import {
  addRelay,
  fetchRelays,
  deleteRelay,
} from "../../controller/dbController";
import { auth } from "../../services/firebaseConfig";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AddRelayForm = () => {
  const [deviceName, setDeviceName] = useState("");
  const [loading, setLoading] = useState(true);
  const [nextRelayId, setNextRelayId] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [existingRelays, setExistingRelays] = useState({});
  const navigate = useNavigate();

  const suggestedDevices = [
    "LIVING ROOM LIGHT",
    "LIVING ROOM FAN",
    "BEDROOM LIGHT",
    "BEDROOM FAN",
    "KITCHEN APPLIANCE",
    "BATHROOM HEATER",
  ];

  useEffect(() => {
    const fetchRelaysData = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const relays = await fetchRelays(user.uid);
          setExistingRelays(relays || {});
          const relayIds = Object.keys(relays || {}).map(Number);
          const maxRelayId = relayIds.length ? Math.max(...relayIds) : 0;
          setNextRelayId(maxRelayId + 1);
        } catch (error) {
          console.error("Error fetching devices:", error);
          toast.error("Error fetching devices. Please try again.");
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchRelaysData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (nextRelayId && deviceName) {
      try {
        await addRelay(nextRelayId, deviceName.toUpperCase());
        setExistingRelays((prev) => ({
          ...prev,
          [nextRelayId]: { device: deviceName.toUpperCase() },
        }));
        setNextRelayId(nextRelayId + 1);
        setDeviceName("");
        toast.success("Device added successfully!");
      } catch (error) {
        console.error("Error adding device:", error);
        toast.error("Error adding device. Please try again.");
      }
    }
  };

  const handleDeviceNameChange = (e) => {
    setDeviceName(e.target.value);
  };

  const handleSuggestionClick = (suggestion) => {
    setDeviceName(suggestion);
    setShowSuggestions(false);
  };

  const handleDeleteRelay = async (relayId) => {
    if (window.confirm("Are you sure you want to delete this device?")) {
      try {
        await deleteRelay(relayId);
        setExistingRelays((prev) => {
          const newRelays = { ...prev };
          delete newRelays[relayId];
          return newRelays;
        });
        toast.success("Device deleted successfully!");
      } catch (error) {
        console.error("Error deleting devvice:", error);
        toast.error("Error deleting device. Please try again.");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-r from-blue-400 to-purple-500 text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-r from-blue-400 to-purple-500">
      <header className="bg-white shadow-md p-6">
        <h1 className="text-center text-3xl font-bold text-gray-800">
          Manage Devices
        </h1>
        <div className="w-16 h-1 bg-blue-500 mx-auto mt-2 rounded-full"></div>
      </header>

      <main className="flex-grow p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <form onSubmit={handleSubmit} className="mb-6">
            <div className="mb-4 relative">
              <label
                htmlFor="deviceName"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Device Name
              </label>
              <input
                type="text"
                id="deviceName"
                value={deviceName}
                onChange={handleDeviceNameChange}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                placeholder="Enter device name"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              {showSuggestions && (
                <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1">
                  {suggestedDevices.map((suggestion, index) => (
                    <li
                      key={index}
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      {suggestion}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded shadow-lg"
            >
              Add Device
            </button>
          </form>

          <div className="mt-8">
            <h2 className="text-lg font-semibold mb-4">Existing Devices</h2>
            <ul className="space-y-2">
              {Object.entries(existingRelays).map(([relayId, relay]) => (
                <li
                  key={relayId}
                  className="flex justify-between items-center bg-gray-100 p-3 rounded-md shadow"
                >
                  <span>{relay.device}</span>
                  <button
                    onClick={() => handleDeleteRelay(relayId)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Link
          to="/dashboard"
          className="block text-center text-white hover:text-gray-200 font-semibold mt-6"
        >
          Back to Dashboard
        </Link>
      </main>
    </div>
  );
};

export default AddRelayForm;
