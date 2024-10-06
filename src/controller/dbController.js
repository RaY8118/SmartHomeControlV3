import { get, ref, update, onValue, remove } from "firebase/database";
import { db, auth } from "../services/firebaseConfig"; // Import initialized Firebase app and auth

// Fetch relay data specific to the authenticated user
export const fetchRelayData = (callback) => {
    const user = auth.currentUser;  // Get the current user
    if (user) {
        const dbref = ref(db, `users/${user.uid}/relays/`);  // Reference to the user's relays
        const unsubscribe = onValue(dbref, (snapshot) => {
            if (snapshot.exists()) {
                callback(snapshot.val());
            } else {
                callback(null);
            }
        });
        return unsubscribe;
    } else {
        console.error("No authenticated user.");
    }
};

// Toggle relay state for the specific user
export const toggleRelayState = (relayId, currentState) => {
    const userId = auth.currentUser.uid;
    try {
        update(ref(db, `users/${userId}/relays/${relayId}`), {
            state: !currentState
        });
        console.log("Relay state updated");
    } catch (error) {
        console.error("Error updating relay state: ", error);
    }
};

// Add a new relay for the specific user
export const addRelay = (relayId, deviceName) => {
    const userId = auth.currentUser.uid;
    try {
        update(ref(db, `users/${userId}/relays/${relayId}`), {
            state: false,
            device: deviceName
        });
        console.log("Relay added");
    } catch (error) {
        console.error("Error adding relay: ", error);
    }
};

export const fetchRelays = async (userId) => {
    const relaysRef = ref(db, `users/${userId}/relays`);
    const snapshot = await get(relaysRef);
    return snapshot.exists() ? snapshot.val() : {};
};

export const deleteRelay = async (relayId) => {
    const user = auth.currentUser;
    if (user) {
        const relayRef = ref(db, `users/${user.uid}/relays/${relayId}`);
        await remove(relayRef);
    } else {
        throw new Error("User not authenticated");
    }
};