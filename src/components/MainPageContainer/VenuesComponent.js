import React, { useEffect, useState } from 'react';

const VenuesComponent = ({ serverPort }) => {
    const [venues, setVenues] = useState([]); // Состояние для хранения списка площадок
    const [allVenues, setAllVenues] = useState([]);
    const [loading, setLoading] = useState(true); // Состояние для отслеживания загрузки
    const [showAddForm, setShowAddForm] = useState(false); // Показать форму добавления
    const [showDeleteForm, setShowDeleteForm] = useState(false); // Показать форму удаления
    const [showUpdateForm, setShowUpdateForm] = useState(false); // Показать форму обновления

    const [newVenue, setNewVenue] = useState({ name: '', capacity: '', type: '' }); // Состояние для добавления
    const [deleteVenueId, setDeleteVenueId] = useState(''); // ID для удаления
    const [updateVenue, setUpdateVenue] = useState({ id: '', name: '', capacity: '', type: '' }); // Состояние для обновления

    // Состояния для фильтров
    const [idFilter, setIdFilter] = useState(''); // Фильтр по ID
    const [nameFilter, setNameFilter] = useState(''); // Фильтр по Name
    
    const [currentPage, setCurrentPage] = useState(1); // Текущая страница
    const venuesPerPage = 10; // Количество элементов на страницу

    const [sortConfig, setSortConfig] = useState({ key: '', direction: 'asc' });

    useEffect(() => {
        fetchVenues();
    }, []);

    const fetchVenues = async () => {
        try {
            const result = await getVenues(serverPort, localStorage.getItem("token"));
            if (result.status === 200) {
                const data = await result.json();   
                setAllVenues(data);
                setVenues(data);
            } else {
                const errMessage = result.headers.get('ErrMessage');
                alert(errMessage || "Unable to get venues");
            }
        } catch (error) {
            console.error('Error fetching venues:', error);
            alert("Error fetching venues");
        } finally {
            setLoading(false); // Загрузка завершена
        }
    };

    const handleAddVenue = async () => {
        if (newVenue.name == null || newVenue.name.trim() === "") {
            alert("Name can't be null or empty");
            return;
        }
        if (newVenue.capacity == null || newVenue.capacity < 0) {
            alert("Capacity can't be null or less than 0");
            return;
        }
        if (!newVenue.type || !["BAR", "LOFT", "THEATRE", "CINEMA", "STADIUM"].includes(newVenue.type)) {
            alert("Venue type must be one of the following: BAR, LOFT, THEATRE, CINEMA, STADIUM");
            return;
        }
        try {
            const result = await addVenueRequest(serverPort, localStorage.getItem("token"), newVenue);
            if (result.status !== 200) {
                const errMessage = result.headers.get('ErrMessage');
                alert(errMessage || "Error adding venue");
            } else {
                setShowAddForm(false);
                fetchVenues(); // Обновляем список после добавления
            }
        } catch (error) {
            console.error("Error adding venue:", error);
            alert("Error adding venue");
        }
    };

    const handleDeleteVenue = async () => {
        if (deleteVenueId.trim() === "") {
            alert("Venue ID can't be empty");
            return;
        }
        try {
            const result = await deleteVenueRequest(serverPort, localStorage.getItem("token"), deleteVenueId);
            if (result.status !== 200) {
                const errMessage = result.headers.get('ErrMessage');
                alert(errMessage || "Error deleting venue");
            } else {
                setShowDeleteForm(false);
                fetchVenues(); // Обновляем список после удаления
            }
        } catch (error) {
            console.error("Error deleting venue:", error);
            alert("Error deleting venue");
        }
    };

    const handleUpdateVenue = async () => {
        if (updateVenue.name == null || updateVenue.name.trim() === "") {
            alert("Name can't be null or empty");
            return;
        }
        if (updateVenue.capacity == null || updateVenue.capacity < 0) {
            alert("Capacity can't be null or less than 0");
            return;
        }
        if (!updateVenue.type || !["BAR", "LOFT", "THEATRE", "CINEMA", "STADIUM"].includes(updateVenue.type)) {
            alert("Venue type must be one of the following: BAR, LOFT, THEATRE, CINEMA, STADIUM");
            return;
        }
        try {
            const result = await updateVenueRequest(serverPort, localStorage.getItem("token"), updateVenue);
            if (result.status !== 200) {
                const errMessage = result.headers.get('ErrMessage');
                alert(errMessage || "Error updating venue");
            } else {
                setShowUpdateForm(false);
                fetchVenues(); // Обновляем список после обновления
            }
        } catch (error) {
            console.error("Error updating venue:", error);
            alert("Error updating venue");
        }
    };

    useEffect(() => {
        handleFilterVenue();
        setCurrentPage(1); 
    }, [idFilter, nameFilter, allVenues]);

    const handleFilterVenue = () => {
        let filteredVenues = allVenues;

        if (idFilter.trim() !== "") {
            const id = Number(idFilter);
            if (!isNaN(id)) {
                filteredVenues = filteredVenues.filter(venue => venue.id === id);
            }
        }

        if (nameFilter.trim() !== "") {
            const name = nameFilter.toLowerCase();
            filteredVenues = filteredVenues.filter(venue => venue.name.toLowerCase().includes(name));
        }

        setVenues(filteredVenues);
    }

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    useEffect(() => {
        let sortedVenues = venues; // Копируем координаты, чтобы не изменять оригинальный массив

        if (sortConfig.key) {
            sortedVenues.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }

        setVenues(sortedVenues);
    }, [sortConfig, venues]);

    const indexOfLastVenue = currentPage * venuesPerPage;
    const indexOfFirstVenue = indexOfLastVenue - venuesPerPage;
    const currentVenues = venues.slice(indexOfFirstVenue, indexOfLastVenue);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    if (loading) {
        return <div>Loading venues...</div>;
    }

    return (
        <div className='locations-container' style={{ textAlign: 'center' }}>
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
            <h2>Available Venues</h2>
            <div className="table-btn-container" style={{ display: 'flex', justifyContent: 'space-between' }}>
                {/* Table for displaying venues */}
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
                            <th onClick={() => handleSort('capacity')}>
                                Capacity {sortConfig.key === 'capacity' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                            </th>
                            <th onClick={() => handleSort('type')}>
                                Type {sortConfig.key === 'type' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentVenues.map(venue => (
                            <tr key={venue.id}>
                                <td>{venue.id}</td>
                                <td>{venue.creatorId}</td>
                                <td>{venue.name}</td>
                                <td>{venue.capacity}</td>
                                <td>{venue.type}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Buttons for managing venues */}
                <div className="location-buttons" style={{ marginLeft: '20px' }}>
                    <button className="btn" onClick={() => setShowAddForm(true)}>Add Venue</button>
                    <button className="btn" onClick={() => setShowDeleteForm(true)}>Delete Venue</button>
                    <button className="btn" onClick={() => setShowUpdateForm(true)}>Update Venue</button>
                </div>
            </div>

            {/* Pagination */}
            <div className="pagination" style={{ marginTop: '20px' }}>
                {Array.from({ length: Math.ceil(venues.length / venuesPerPage) }, (_, i) => (
                    <button key={i} onClick={() => paginate(i + 1)} className="btn" style={{ margin: '5px' }}>
                        {i + 1}
                    </button>
                ))}
            </div>

            {/* Add Venue Form */}
            {showAddForm && (
                <div className="overlay">
                    <div className="form-container">
                        <h3>Add New Venue</h3>
                        <input
                            type="text"
                            placeholder="Venue Name"
                            value={newVenue.name}
                            onChange={(e) => setNewVenue({ ...newVenue, name: e.target.value })}
                        />
                        <input
                            type="number"
                            placeholder="Venue Capacity"
                            value={newVenue.capacity}
                            onChange={(e) => setNewVenue({ ...newVenue, capacity: e.target.value })}
                        />
                        <select value={newVenue.type} onChange={(e) => setNewVenue({ ...newVenue, type: e.target.value })}>
                            <option value="">Select Venue Type</option>
                            <option value="BAR">BAR</option>
                            <option value="LOFT">LOFT</option>
                            <option value="THEATRE">THEATRE</option>
                            <option value="CINEMA">CINEMA</option>
                            <option value="STADIUM">STADIUM</option>
                        </select>
                        <button onClick={handleAddVenue} className="btn">Add</button>
                        <button onClick={() => setShowAddForm(false)} className="btn">Cancel</button>
                    </div>
                </div>
            )}

            {/* Delete Venue Form */}
            {showDeleteForm && (
                <div className="overlay">
                    <div className="form-container">
                        <h3>Delete Venue</h3>
                        <input
                            type="text"
                            placeholder="Enter Venue ID"
                            value={deleteVenueId}
                            onChange={(e) => setDeleteVenueId(e.target.value)}
                        />
                        <button onClick={handleDeleteVenue} className="btn">Delete</button>
                        <button onClick={() => setShowDeleteForm(false)} className="btn">Cancel</button>
                    </div>
                </div>
            )}

            {/* Update Venue Form */}
            {showUpdateForm && (
                <div className="overlay">
                    <div className="form-container">
                        <h3>Update Venue</h3>
                        <input
                            type="text"
                            placeholder="Venue ID"
                            value={updateVenue.id}
                            onChange={(e) => setUpdateVenue({ ...updateVenue, id: e.target.value })}
                        />
                        <input
                            type="text"
                            placeholder="Venue Name"
                            value={updateVenue.name}
                            onChange={(e) => setUpdateVenue({ ...updateVenue, name: e.target.value })}
                        />
                        <input
                            type="number"
                            placeholder="Venue Capacity"
                            value={updateVenue.capacity}
                            onChange={(e) => setUpdateVenue({ ...updateVenue, capacity: e.target.value })}
                        />
                        <select value={updateVenue.type} onChange={(e) => setUpdateVenue({ ...updateVenue, type: e.target.value })}>
                            <option value="">Select Venue Type</option>
                            <option value="BAR">BAR</option>
                            <option value="LOFT">LOFT</option>
                            <option value="THEATRE">THEATRE</option>
                            <option value="CINEMA">CINEMA</option>
                            <option value="STADIUM">STADIUM</option>
                        </select>
                        <button onClick={handleUpdateVenue} className="btn">Update</button>
                        <button onClick={() => setShowUpdateForm(false)} className="btn">Cancel</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VenuesComponent;

// Получение списка площадок
const getVenues = async (serverPort, token) => {
    const url = `http://localhost:${serverPort}/api/venues`;
    return await fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`, // Используем Bearer токен для авторизации
            'Content-Type': 'application/json',
        },
    });
};

// Добавление новой площадки
const addVenueRequest = async (serverPort, token, venueData) => {
    const url = `http://localhost:${serverPort}/api/venues`;
    return await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(venueData), // Преобразуем объект venueData в JSON строку для отправки
    });
};

// Удаление площадки по ID
const deleteVenueRequest = async (serverPort, token, venueId) => {
    const url = `http://localhost:${serverPort}/api/venues/${venueId}`;
    return await fetch(url, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });
};

// Обновление площадки
const updateVenueRequest = async (serverPort, token, venueData) => {
    const url = `http://localhost:${serverPort}/api/venues/${venueData.id}`;
    return await fetch(url, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            name: venueData.name,
            capacity: venueData.capacity,
            type: venueData.type,
        }), // Преобразуем объект venueData в JSON строку для отправки
    });
};

