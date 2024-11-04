import { ref, update, get } from "firebase/database";
import { db, auth } from "../../services/firebaseConfig";
import { useState, useEffect } from "react";
import { fetchRelayData } from "../../controller/dbController";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Buttons = () => {
  const [relays, setRelays] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        const fetchData = fetchRelayData((data) => {
          setRelays(data || {});
          setLoading(false);
        });
        return fetchData;
      } else {
        console.error("User not authenticated");
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const toggleRelayState = async (relayId, currentState) => {
    const user = auth.currentUser;
    if (!user) {
      console.error("User not authenticated");
      return;
    }

    const dbref = ref(db, `users/${user.uid}/relays/${relayId}`);

    try {
      const snapshot = await get(dbref);
      if (!snapshot.exists()) {
        console.error("Relay data not found");
        return;
      }

      const relayData = snapshot.val();
      const deviceName = relayData.device;
      const newState = !currentState;
      await update(dbref, { state: newState });
      const stateMessage = newState ? "on" : "off";
      toast.success(`${deviceName} is now ${stateMessage}`);
      console.log(
        `${deviceName} state updated successfully to ${stateMessage}`
      );
    } catch (error) {
      toast.error(`Error updating ${deviceName} state: ${error.message}`);
      console.error("Error updating relay state:", error);
    }
  };
  const handleLogout = async () => {
    try {
      await auth.signOut();
      toast.success("User signed out successfully");
      console.log("User signed out successfully");
      window.location.href = "/";
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Error signing out. Please try again."); 
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-r from-blue-400 to-purple-500 text-white">
        Loading...
      </div>
    );
  }

  if (!auth.currentUser) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-r from-blue-400 to-purple-500 text-white">
        You need to be logged in to control relays.
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-r from-blue-400 to-purple-500">
      <header className="bg-white shadow-md p-6">
        <h1 className="text-center text-3xl font-bold text-gray-800">
          Control Your Devices
        </h1>
        <div className="w-16 h-1 bg-blue-500 mx-auto mt-2 rounded-full"></div>
      </header>

      <main className="flex-grow p-4">
        <div className="grid grid-cols-1 gap-4 mb-6">
          {Object.keys(relays).map((relayId) => (
            <div
              key={relayId}
              className="bg-white p-4 rounded-lg shadow-lg flex justify-between items-center"
            >
              <div>
                <h2 className="text-lg font-semibold">
                  {relays[relayId].device}
                </h2>
                <p className="text-sm">
                  Status:
                  <span
                    className={
                      relays[relayId].state
                        ? "text-green-600 font-medium"
                        : "text-red-600 font-medium"
                    }
                  >
                    {relays[relayId].state ? " ON" : " OFF"}
                  </span>
                </p>
              </div>
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={relays[relayId].state}
                  onChange={() =>
                    toggleRelayState(relayId, relays[relayId].state)
                  }
                />
                <div className="relative w-14 h-8 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-7 after:w-7 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
          ))}
        </div>

        <Link
          to="/add-relay"
          className="block text-center text-white hover:text-gray-200 font-semibold mb-4"
        >
          Add Devices
        </Link>

        <button
          onClick={handleLogout}
          className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-4 rounded shadow-lg"
        >
          Logout
        </button>
      </main>
    </div>
  );
};

export default Buttons;
