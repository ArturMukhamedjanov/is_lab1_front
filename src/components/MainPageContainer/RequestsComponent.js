import React, { useEffect, useState } from 'react';

const RequestsComponent = ({ serverPort }) => {
    const [requests, setRequests] = useState([]); // Состояние для хранения списка запросов
    const [loading, setLoading] = useState(true); // Состояние для отслеживания загрузки

    useEffect(() => {
        fetchRequests();
    }, []);

    // Получение списка запросов
    const fetchRequests = async () => {
        try {
            const result = await getAdminRequests(serverPort, localStorage.getItem("token"));
            if (result.status === 200) {
                const data = await result.json();
                setRequests(data);
            } else {
                const errMessage = result.headers.get('ErrMessage');
                alert(errMessage || "Unable to get requests");
            }
        } catch (error) {
            console.error('Error fetching requests:', error);
            alert("Error fetching requests");
        } finally {
            setLoading(false); // Загрузка завершена
        }
    };

    // Отправка запроса на подтверждение регистрации
    const handleAcceptRequest = async (requestId) => {
        try {
            const result = await acceptRequest(serverPort, localStorage.getItem("token"), requestId);
            if (result.status !== 200) {
                const errMessage = result.headers.get('ErrMessage');
                alert(errMessage || "Error accepting request");
            } else {
                fetchRequests(); // Обновляем список после подтверждения
            }
        } catch (error) {
            console.error('Error accepting request:', error);
            alert("Error accepting request");
        }
    };

    if (loading) {
        return <div>Loading requests...</div>;
    }

    return (
        <div className="locations-container" style={{ textAlign: 'center' }}>
            <h2>Admin Requests</h2>
            <table className='locations-table'>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Username</th>
                        <th>Reviewer ID</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {requests.map(request => (
                        <tr key={request.id}>
                            <td>{request.id}</td>
                            <td>{request.username}</td>
                            <td>{request.reviewerId !== null ? request.reviewerId : "No Reviewer"}</td>
                            <td>
                                {request.reviewerId == null && (
                                    <button className="btn btn-block" onClick={() => handleAcceptRequest(request.id)}>
                                        Accept
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default RequestsComponent;

// Получение списка запросов
const getAdminRequests = async (serverPort, token) => {
    const url = `http://localhost:${serverPort}/auth/register/accept`;
    return await fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`, // Токен авторизации
            'Content-Type': 'application/json',
        },
    });
};

// Отправка запроса на подтверждение
const acceptRequest = async (serverPort, token, requestId) => {
    const url = `http://localhost:${serverPort}/auth/register/accept/${requestId}`;
    return await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`, // Токен авторизации
            'Content-Type': 'application/json',
        },
    });
};