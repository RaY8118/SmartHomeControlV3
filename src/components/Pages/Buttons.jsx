import { ref, update } from "firebase/database";
import { db, auth } from "../../services/firebaseConfig";
import { useState, useEffect } from "react";
import { fetchRelayData } from "../../controller/dbController";
import { Link } from "react-router-dom";

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

  const toggleRelayState = (relayId, currentState) => {
    const user = auth.currentUser;
    if (user) {
      const dbref = ref(db, `users/${user.uid}/relays/${relayId}`);
      update(dbref, { state: !currentState })
        .then(() => {
          console.log(`Relay ${relayId} state updated successfully`);
        })
        .catch((error) => {
          console.error("Error updating relay state:", error);
        });
    } else {
      console.error("User not authenticated");
    }
  };

  const handleLogout = () => {
    auth.signOut()
      .then(() => {
        console.log("User signed out successfully");
        window.location.href = '/';
      })
      .catch((error) => {
        console.error("Error signing out:", error);
      });
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!auth.currentUser) {
    return <div className="flex justify-center items-center h-screen">You need to be logged in to control relays.</div>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm p-4">
        <h1 className="text-center text-xl font-bold">Control Your Devices</h1>
      </header>
      
      <main className="flex-grow p-4">
        <div className="grid grid-cols-1 gap-4 mb-6">
          {Object.keys(relays).map((relayId) => (
            <div key={relayId} className="bg-white p-4 rounded-lg shadow-md flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold">{relays[relayId].device}</h2>
                <p className="text-sm text-gray-600">Status: {relays[relayId].state ? "ON" : "OFF"}</p>
              </div>
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={relays[relayId].state}
                  onChange={() => toggleRelayState(relayId, relays[relayId].state)}
                />
                <div className="relative w-14 h-8 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-7 after:w-7 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
          ))}
        </div>
        
        <Link to="/add-relay" className="block text-center text-blue-500 hover:text-blue-600 font-semibold mb-4">
          Add Devices
        </Link>
        
        <button
          onClick={handleLogout}
          className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-4 rounded"
        >
          Logout
        </button>
      </main>
    </div>
  );
};

export default Buttons;
