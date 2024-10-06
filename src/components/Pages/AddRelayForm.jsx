import React, { useState, useEffect } from "react";
import { addRelay, fetchRelays, deleteRelay } from "../../controller/dbController";
import { auth } from "../../services/firebaseConfig";
import { Link, useNavigate } from "react-router-dom";

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
    const user = auth.currentUser;
    if (user) {
      fetchRelays(user.uid)
        .then((relays) => {
          setExistingRelays(relays || {});
          const relayIds = Object.keys(relays || {}).map(Number);
          const maxRelayId = relayIds.length ? Math.max(...relayIds) : 0;
          setNextRelayId(maxRelayId + 1);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching relays:", error);
          setLoading(false);
        });
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (nextRelayId && deviceName) {
      addRelay(nextRelayId, deviceName.toUpperCase());
      setExistingRelays(prev => ({...prev, [nextRelayId]: {device: deviceName.toUpperCase()}}));
      setNextRelayId(nextRelayId + 1);
      setDeviceName("");
      alert("Relay added successfully!");
    }
  };

  const handleDeviceNameChange = (e) => {
    setDeviceName(e.target.value);
  };

  const handleSuggestionClick = (suggestion) => {
    setDeviceName(suggestion);
    setShowSuggestions(false);
  };

  const handleDeleteRelay = (relayId) => {
    if (window.confirm("Are you sure you want to delete this device?")) {
      deleteRelay(relayId).then(() => {
        setExistingRelays(prev => {
          const newRelays = {...prev};
          delete newRelays[relayId];
          return newRelays;
        });
        alert("Device deleted successfully!");
      }).catch(error => {
        console.error("Error deleting relay:", error);
        alert("Error deleting device. Please try again.");
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm p-4">
        <h1 className="text-center text-xl font-bold">Manage Devices</h1>
      </header>

      <main className="flex-grow p-4">
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
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded"
          >
            Add Device
          </button>
        </form>

        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4">Existing Devices</h2>
          <ul className="space-y-2">
            {Object.entries(existingRelays).map(([relayId, relay]) => (
              <li key={relayId} className="flex justify-between items-center bg-white p-3 rounded-md shadow">
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

        <Link
          to="/dashboard"
          className="block text-center text-blue-500 hover:text-blue-600 font-semibold mt-6"
        >
          Back to Dashboard
        </Link>
      </main>
    </div>
  );
};

export default AddRelayForm;
