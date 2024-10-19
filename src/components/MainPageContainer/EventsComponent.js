import React, { useEffect, useState } from 'react';

const EventsComponent = ({ serverPort }) => {
    const [events, setEvents] = useState([]); // Состояние для хранения списка событий
    const [allEvents, setAllEvents] = useState([]);
    const [loading, setLoading] = useState(true); // Состояние для отслеживания загрузки
    const [showAddForm, setShowAddForm] = useState(false); // Показать форму добавления
    const [showDeleteForm, setShowDeleteForm] = useState(false); // Показать форму удаления
    const [showUpdateForm, setShowUpdateForm] = useState(false); // Показать форму обновления

    const [newEvent, setNewEvent] = useState({ name: '', minAge: '', eventType: '' }); // Состояние для добавления
    const [deleteEventId, setDeleteEventId] = useState(''); // ID для удаления
    const [updateEvent, setUpdateEvent] = useState({ id: '', name: '', minAge: '', eventType: '' }); // Состояние для обновления

    const [idFilter, setIdFilter] = useState(''); // Фильтр по ID
    const [nameFilter, setNameFilter] = useState(''); // Фильтр по Name

    const [currentPage, setCurrentPage] = useState(1); // Текущая страница
    const eventsPerPage = 10; // Количество элементов на страницу

    const [sortConfig, setSortConfig] = useState({ key: '', direction: 'asc' }); // Sort configuration

    const eventTypes = ['FOOTBALL', 'BASKETBALL', 'EXPOSITION']; // Допустимые значения для eventType

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const result = await getEvents(serverPort, localStorage.getItem("token"));
            if (result.status === 200) {
                const data = await result.json();
                setAllEvents(data);
                setEvents(data);
            } else {
                const errMessage = result.headers.get('ErrMessage');
                alert(errMessage || "Unable to get events");
            }
        } catch (error) {
            console.error('Error fetching events:', error);
            alert("Error fetching events");
        } finally {
            setLoading(false);
        }
    };

    const handleAddEvent = async () => {
        if (newEvent.name == null || newEvent.name.trim() === "") {
            alert("Name can't be null or empty");
            return;
        }

        try {
            const result = await addEventRequest(serverPort, localStorage.getItem("token"), newEvent);
            if (result.status !== 200) {
                const errMessage = result.headers.get('ErrMessage');
                alert(errMessage || "Error adding event");
            } else {
                setShowAddForm(false);
                fetchEvents(); // Обновляем список после добавления
            }
        } catch (error) {
            console.error("Error adding event:", error);
            alert("Error adding event");
        }
    };

    const handleDeleteEvent = async () => {
        if (deleteEventId.trim() === "") {
            alert("Event ID can't be empty");
            return;
        }
        try {
            const result = await deleteEventRequest(serverPort, localStorage.getItem("token"), deleteEventId);
            if (result.status !== 200) {
                const errMessage = result.headers.get('ErrMessage');
                alert(errMessage || "Error deleting event");
            } else {
                setShowDeleteForm(false);
                fetchEvents(); // Обновляем список после удаления
            }
        } catch (error) {
            console.error("Error deleting event:", error);
            alert("Error deleting event");
        }
    };

    const handleUpdateEvent = async () => {
        if (updateEvent.name == null || updateEvent.name.trim() === "") {
            alert("Name can't be null or empty");
            return;
        }

        try {
            const result = await updateEventRequest(serverPort, localStorage.getItem("token"), updateEvent);
            if (result.status !== 200) {
                const errMessage = result.headers.get('ErrMessage');
                alert(errMessage || "Error updating event");
            } else {
                setShowUpdateForm(false);
                fetchEvents(); // Обновляем список после обновления
            }
        } catch (error) {
            console.error("Error updating event:", error);
            alert("Error updating event");
        }
    };

    useEffect(() => {
        handleFilterEvent();
        setCurrentPage(1);
    }, [idFilter, nameFilter, allEvents]);

    const handleFilterEvent = () => {
        let filteredEvents = allEvents;

        if (idFilter.trim() !== "") {
            const id = Number(idFilter);
            if (!isNaN(id)) {
                filteredEvents = filteredEvents.filter(event => event.id === id);
            }
        }

        if (nameFilter.trim() !== "") {
            const name = nameFilter.toLowerCase();
            filteredEvents = filteredEvents.filter(event => event.name.toLowerCase().includes(name));
        }

        setEvents(filteredEvents);
    };

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    useEffect(() => {
        let sortedEvents = events; // Копируем координаты, чтобы не изменять оригинальный массив

        if (sortConfig.key) {
            sortedEvents.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }

        setEvents(sortedEvents);
    }, [sortConfig, events]);


    const indexOfLastEvent = currentPage * eventsPerPage;
    const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
    const currentEvents = events.slice(indexOfFirstEvent, indexOfLastEvent);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    if (loading) {
        return <div>Loading events...</div>;
    }

    return (
        <div className='events-container' style={{ textAlign: 'center' }}>
            <div className="filters" style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center', gap: '20px' }}>
                <div>
                    <label htmlFor="idFilter">Filter by ID:</label>
                    <input
                        id="idFilter"
                        type="number"
                        placeholder="Enter ID"
                        value={idFilter}
                        onChange={(e) => setIdFilter(e.target.value)}
                        style={{ marginLeft: '10px', padding: '5px', width: '150px' }}
                    />
                </div>
                <div>
                    <label htmlFor="nameFilter">Filter by Name:</label>
                    <input
                        id="nameFilter"
                        type="text"
                        placeholder="Enter name"
                        value={nameFilter}
                        onChange={(e) => setNameFilter(e.target.value)}
                        style={{ marginLeft: '10px', padding: '5px', width: '200px' }}
                    />
                </div>
            </div>

            <h2>Available Events</h2>
            <div className="table-btn-container" style={{ display: 'flex', justifyContent: 'space-between' }}>
                {/* Table for displaying events */}
                <table className='locations-table'>
                    <thead>
                        <tr>
                            <th onClick={() => handleSort('id')}>
                                ID {sortConfig.key === 'id' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                            </th>
                            <th onClick={() => handleSort('creatorId')}>
                                Creator ID {sortConfig.key === 'creatorId' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                            </th>
                            <th onClick={() => handleSort('name')}>
                                Name {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                            </th>
                            <th onClick={() => handleSort('minAge')}>
                                Min age {sortConfig.key === 'minAge' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                            </th>
                            <th onClick={() => handleSort('eventType')}>
                                Event Type {sortConfig.key === 'eventType' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentEvents.map(event => (
                            <tr key={event.id}>
                                <td>{event.id}</td>
                                <td>{event.creatorId}</td>
                                <td>{event.name}</td>
                                <td>{event.minAge}</td>
                                <td>{event.eventType || 'N/A'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Buttons for managing events */}
                <div className="location-buttons" style={{ marginLeft: '20px' }}>
                    <button className="btn" onClick={() => setShowAddForm(true)}>Add Event</button>
                    <button className="btn" onClick={() => setShowDeleteForm(true)}>Delete Event</button>
                    <button className="btn" onClick={() => setShowUpdateForm(true)}>Update Event</button>
                </div>
            </div>

            {/* Pagination */}
            <div className="pagination" style={{ marginTop: '20px' }}>
                {Array.from({ length: Math.ceil(events.length / eventsPerPage) }, (_, i) => (
                    <button key={i} onClick={() => paginate(i + 1)} className="btn" style={{ margin: '0 5px' }}>
                        {i + 1}
                    </button>
                ))}
            </div>

            {/* Form for adding event */}
            {showAddForm && (
                <div className="overlay">
                    <div className="form-container">
                        <h3>Add Event</h3>
                        <input placeholder="Name" value={newEvent.name} onChange={e => setNewEvent({ ...newEvent, name: e.target.value })} />
                        <input placeholder="Min Age" value={newEvent.minAge} onChange={e => setNewEvent({ ...newEvent, minAge: e.target.value })} />
                        <select value={newEvent.eventType} onChange={e => setNewEvent({ ...newEvent, eventType: e.target.value })}>
                            <option value="">Select Event Type</option>
                            {eventTypes.map((type) => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                        <div>
                            <button className="btn" onClick={handleAddEvent}>Submit</button>
                            <button className="btn" onClick={() => setShowAddForm(false)}>Close</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Form for deleting event */}
            {showDeleteForm && (
                <div className="overlay">
                    <div className="form-container">
                        <h3>Delete Event</h3>
                        <input
                            placeholder="Event ID"
                            value={deleteEventId}
                            onChange={e => setDeleteEventId(e.target.value)}
                        />
                        <div>
                            <button className="btn" onClick={handleDeleteEvent}>Submit</button>
                            <button className="btn" onClick={() => setShowDeleteForm(false)}>Close</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Form for updating event */}
            {showUpdateForm && (
                <div className="overlay">
                    <div className="form-container">
                        <h3>Update Event</h3>
                        <input
                            placeholder="Event ID"
                            value={updateEvent.id}
                            onChange={e => setUpdateEvent({ ...updateEvent, id: e.target.value })}
                        />
                        <input
                            placeholder="Name"
                            value={updateEvent.name}
                            onChange={e => setUpdateEvent({ ...updateEvent, name: e.target.value })}
                        />
                        <input
                            placeholder="Min Age"
                            value={updateEvent.minAge}
                            onChange={e => setUpdateEvent({ ...updateEvent, minAge: e.target.value })}
                        />
                        <select
                            value={updateEvent.eventType}
                            onChange={e => setUpdateEvent({ ...updateEvent, eventType: e.target.value })}
                        >
                            <option value="">Select Event Type</option>
                            {eventTypes.map((type) => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                        <div>
                            <button className="btn" onClick={handleUpdateEvent}>Submit</button>
                            <button className="btn" onClick={() => setShowUpdateForm(false)}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const getEvents = (serverPort, token) => {
    return fetch(`http://localhost:${serverPort}/api/events`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
        }
    });
};

const addEventRequest = (serverPort, token, eventDTO) => {
    if (eventDTO.eventType === "") {
        delete eventDTO.eventType;
    }
    return fetch(`http://localhost:${serverPort}/api/events`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(eventDTO),
    });
};

const deleteEventRequest = (serverPort, token, eventId) => {
    return fetch(`http://localhost:${serverPort}/api/events/${eventId}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`,
        }
    });
};

const updateEventRequest = (serverPort, token, eventDTO) => {
    if (eventDTO.eventType === "") {
        delete eventDTO.eventType;
    }
    return fetch(`http://localhost:${serverPort}/api/events/${eventDTO.id}`, {
        method: "PUT",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(eventDTO),
    });
};

export default EventsComponent;
