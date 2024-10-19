import React, { useState, useEffect } from 'react';
import LoginContainer from '../LoginContainer/LoginContainer';
import LocationsComponent from './LocationsComponent';
import CoordinatesComponent from './CoordinatesComponent';
import VenuesComponent from './VenuesComponent';
import EventsComponent from './EventsComponent';
import PersonsComponent from './PersonsComponent';
import RequestsComponent from './RequestsComponent';
import TicketsComponent from './TicketsComponent';

const MainPage = ({ serverPort, redirectToLogin }) => {
    const [selectedComponent, setSelectedComponent] = useState('Tickets'); // Selected component
    const [adminRights, setAdminRights] = useState(false); // Admin rights state
    const [username, setUsername] = useState("");
    const [userId, setUserId] = useState(-1);

    // States for Update User form
    const [showUpdateUserForm, setShowUpdateUserForm] = useState(false);
    const [updatedUsername, setUpdatedUsername] = useState("");
    const [updatedPassword, setUpdatedPassword] = useState("");
    const [updateError, setUpdateError] = useState("");
    const [isUpdating, setIsUpdating] = useState(false);


    // Function to handle logout
    const sendLogoutRequest = () => {
        localStorage.clear();
        redirectToLogin();
    }

    // Fetch user data and check token/admin rights on component mount
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            sendLogoutRequest();
            return;
        }

        // Check token validity
        sendCheckTokenRequest(serverPort, token)
            .then((result) => {
                if (result.status !== 200) {
                    sendLogoutRequest();
                }
            })
            .catch((e) => {
                console.error("Error checking token:", e);
                sendLogoutRequest();
            });

        // Check admin rights
        sendCheckAdminRequest(serverPort, token)
            .then((result) => {
                if (result.status === 200) {
                    setAdminRights(true);
                }
            })
            .catch((e) => {
                console.error("Error checking admin rights:", e);
            });

        // Get user info
        sendGetUserRequest(serverPort, token)
            .then((result) => {
                if (result.status === 200) {
                    return result.json();
                } else {
                    throw new Error("Failed to fetch user data");
                }
            })
            .then((data) => {
                setUsername(data.username);
                setUserId(data.id);
            })
            .catch((e) => {
                console.error("Error fetching user data:", e);
                sendLogoutRequest();
            });
    }, [serverPort]);

    // Function to render the selected component
    const renderComponent = () => {
        switch (selectedComponent) {
            // Uncomment and implement these cases as needed
            case 'Tickets':
                return <TicketsComponent serverPort={serverPort} />;
            case 'Locations':
                return <LocationsComponent serverPort={serverPort} />;
            case 'Event':
                return <EventsComponent serverPort={serverPort} />;
            case 'Coordinates':
                return <CoordinatesComponent serverPort={serverPort} />;
            case 'Persons':
                return <PersonsComponent serverPort={serverPort} />;
            case 'Venues':
                return <VenuesComponent serverPort={serverPort} />;
            case 'Requests':
                return <RequestsComponent serverPort={serverPort} />;
            default:
                return <LocationsComponent serverPort={serverPort} />;
        }
    };

    // Handler for submitting the Update User form
    const handleUpdateUser = async () => {
        // Reset previous errors
        setUpdateError("");

        // Input validation
        if (updatedUsername.trim() === "") {
            setUpdateError("Username cannot be empty.");
            return;
        }

        if (updatedPassword.length < 8) {
            setUpdateError("Password must be at least 8 characters long.");
            return;
        }

        setIsUpdating(true);

        try {
            const token = localStorage.getItem("token");
            sendUpdateUserRequest(serverPort, token, { username: updatedUsername, password: updatedPassword})
            .then((result) => {
                if (result.status === 200) {
                    return result.json();
                } else {
                    throw new Error("User with this name already exists");
                }
            })
            .then((data) => {
                localStorage.setItem("token", data.token);
                sendGetUserRequest(serverPort, data.token)
                    .then((res) => res.json())
                    .then((data) => {
                        setUsername(data.username);
                        setUserId(data.id);
                        setIsUpdating(false);
                        setShowUpdateUserForm(false);
                    })
                    .catch((e) => {
                        console.error("Error fetching updated user data:", e);
                    });
            })
            .catch((e) => {
                console.error("Error fetching user data:", e);
                sendLogoutRequest();
            });
        } catch (error) {
            console.error("Error updating user:", error);
            setUpdateError("Error updating user.");
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className='main-page-block'>
            <h2>Username: {username}</h2>
            <h2>UserId: {userId}</h2>
            {/* Update User Button */}
            <button className="btn btn-block" onClick={() => setShowUpdateUserForm(true)}>
                Update User
            </button>
            {/* Logout Button */}
            <button className="btn btn-block" onClick={sendLogoutRequest}>
                Log out
            </button>
            <div className='menu-content'>
                <div className='menu'>
                    <button className="btn btn-block" onClick={() => setSelectedComponent('Tickets')}>
                        Tickets
                    </button>
                    <button className="btn btn-block" onClick={() => setSelectedComponent('Locations')}>
                        Locations
                    </button>
                    <button className="btn btn-block" onClick={() => setSelectedComponent('Event')}>
                        Events
                    </button>
                    <button className="btn btn-block" onClick={() => setSelectedComponent('Coordinates')}>
                        Coordinates
                    </button>
                    <button className="btn btn-block" onClick={() => setSelectedComponent('Persons')}>
                        Persons
                    </button>
                    <button className="btn btn-block" onClick={() => setSelectedComponent('Venues')}>
                        Venue
                    </button>
                    {adminRights && (
                        <button className="btn btn-block" onClick={() => setSelectedComponent('Requests')}>
                            Requests
                        </button>
                    )}
                </div>
                <div className='content'>
                    {renderComponent()} {/* Renders the selected component */}
                </div>
            </div>

            {/* Update User Form Overlay */}
            {showUpdateUserForm && (
                <div className="overlay">
                    <div className="form-container">
                        <h3>Update User</h3>
                        <input
                            type="text"
                            placeholder="New Username"
                            value={updatedUsername}
                            onChange={(e) => setUpdatedUsername(e.target.value)}
                        />
                        <input
                            type="password"
                            placeholder="New Password"
                            value={updatedPassword}
                            onChange={(e) => setUpdatedPassword(e.target.value)}
                        />
                        {updateError && <p style={{ color: 'red' }}>{updateError}</p>}
                        <button className="btn" onClick={handleUpdateUser} disabled={isUpdating}>
                            {isUpdating ? "Updating..." : "Submit"}
                        </button>
                        <button className="btn" onClick={() => setShowUpdateUserForm(false)} disabled={isUpdating}>
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MainPage;

// API Request Functions

// Function to check token validity
const sendCheckTokenRequest = async (port, token) => {
    const url = `http://localhost:${port}/auth/checkToken`;
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });

    return response;
};

// Function to check if the user has admin rights
const sendCheckAdminRequest = async (port, token) => {
    const url = `http://localhost:${port}/auth/checkAdmin`;
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });

    return response;
};

// Function to get user information
const sendGetUserRequest = async (port, token) => {
    const url = `http://localhost:${port}/auth/user`;
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });

    return response;
};

// Function to update user information
const sendUpdateUserRequest = async (port, token, userData) => {
    const url = `http://localhost:${port}/auth/user`;
    const response = await fetch(url, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(userData)
    });

    return response;
};
