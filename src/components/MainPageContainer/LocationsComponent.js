import React, { useEffect, useState } from 'react';

const LocationsComponent = ({ serverPort }) => {
    const [locations, setLocations] = useState([]); // Состояние для хранения списка локаций
    const [allLocations, setAllLocations] = useState([]);
    const [loading, setLoading] = useState(true); // Состояние для отслеживания загрузки
    const [showAddForm, setShowAddForm] = useState(false); // Показать форму добавления
    const [showDeleteForm, setShowDeleteForm] = useState(false); // Показать форму удаления
    const [showUpdateForm, setShowUpdateForm] = useState(false); // Показать форму обновления

    const [newLocation, setNewLocation] = useState({ x: '', y: '', z: '', name: '' }); // Состояние для добавления
    const [deleteLocationId, setDeleteLocationId] = useState(''); // ID для удаления
    const [updateLocation, setUpdateLocation] = useState({ id: '', x: '', y: '', z: '', name: '' }); // Состояние для обновления

    // Состояния для фильтров
    const [idFilter, setIdFilter] = useState(''); // Фильтр по ID
    const [nameFilter, setNameFilter] = useState(''); // Фильтр по Name
    
    const [currentPage, setCurrentPage] = useState(1); // Текущая страница
    const locationsPerPage = 10; // Количество элементов на страницу

    const [sortConfig, setSortConfig] = useState({ key: '', direction: 'asc' });


    useEffect(() => {
        fetchLocations();
    }, []);


    const fetchLocations = async () => {
        try {
            const result = await getLocations(serverPort, localStorage.getItem("token"));
            if (result.status === 200) {
                const data = await result.json();   
                setAllLocations(data);
                setLocations(data);
            } else {
                const errMessage = result.headers.get('ErrMessage');
                alert(errMessage || "Unable to get locations");
            }
        } catch (error) {
            console.error('Error fetching locations:', error);
            alert("Error fetching locations");
        } finally {
            setLoading(false); // Загрузка завершена
        }
    };

    

    const handleAddLocation = async () => {
        if (newLocation.name == null || newLocation.name.trim() === "") {
            alert("Name can't be null or empty");
            return;
        }
        try {
            const result = await addLocationRequest(serverPort, localStorage.getItem("token"), newLocation);
            if (result.status !== 200) {
                const errMessage = result.headers.get('ErrMessage');
                alert(errMessage || "Error adding location");
            } else {
                setShowAddForm(false);
                fetchLocations(); // Обновляем список после добавления
            }
        } catch (error) {
            console.error("Error adding location:", error);
            alert("Error adding location");
        }
    };

    const handleDeleteLocation = async () => {
        if (deleteLocationId.trim() === "") {
            alert("Location ID can't be empty");
            return;
        }
        try {
            const result = await deleteLocationRequest(serverPort, localStorage.getItem("token"), deleteLocationId);
            if (result.status !== 200) {
                const errMessage = result.headers.get('ErrMessage');
                alert(errMessage || "Error deleting location");
            } else {
                setShowDeleteForm(false);
                fetchLocations(); // Обновляем список после удаления
            }
        } catch (error) {
            console.error("Error deleting location:", error);
            alert("Error deleting location");
        }
    };

    const handleUpdateLocation = async () => {
        if (updateLocation.name == null || updateLocation.name.trim() === "") {
            alert("Name can't be null or empty");
            return;
        }
        try {
            const result = await updateLocationRequest(serverPort, localStorage.getItem("token"), updateLocation);
            if (result.status !== 200) {
                const errMessage = result.headers.get('ErrMessage');
                alert(errMessage || "Error updating location");
            } else {
                setShowUpdateForm(false);
                fetchLocations(); // Обновляем список после обновления
            }
        } catch (error) {
            console.error("Error updating location:", error);
            alert("Error updating location");
        }
    };

    useEffect(() => {
        handleFilterLocation();
        setCurrentPage(1); 
    }, [idFilter, nameFilter, allLocations]);

    const handleFilterLocation = () => {
        let filteredLocations = allLocations;

        if (idFilter.trim() !== "") {
            const id = Number(idFilter);
            if (!isNaN(id)) {
                filteredLocations = filteredLocations.filter(location => location.id === id);
            }
        }

        if (nameFilter.trim() !== "") {
            const name = nameFilter.toLowerCase();
            filteredLocations = filteredLocations.filter(location => location.name.toLowerCase().includes(name));
        }

        setLocations(filteredLocations);
    }

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    useEffect(() => {
        let sortedLocations = locations; // Копируем координаты, чтобы не изменять оригинальный массив

        if (sortConfig.key) {
            sortedLocations.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }

        setLocations(sortedLocations);
    }, [sortConfig, locations]);


    const indexOfLastLocation = currentPage * locationsPerPage;
    const indexOfFirstLocation = indexOfLastLocation - locationsPerPage;
    const currentLocations = locations.slice(indexOfFirstLocation, indexOfLastLocation);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    if (loading) {
        return <div>Loading locations...</div>;
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
        <h2>Available Locations</h2>
        <div className="table-btn-container" style={{ display: 'flex', justifyContent: 'space-between' }}>
            {/* Table for displaying locations */}
            <table className='locations-table'>
                <thead>
                    <tr>
                        <th onClick={() => handleSort('id')}>
                            ID {sortConfig.key === 'id' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </th>
                        <th onClick={() => handleSort('creatorId')}>
                                Creator ID {sortConfig.key === 'creatorId' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </th>
                        <th onClick={() => handleSort('x')}>
                            X {sortConfig.key === 'x' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </th>
                        <th onClick={() => handleSort('y')}>
                            Y {sortConfig.key === 'y' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </th>
                        <th onClick={() => handleSort('z')}>
                            Z {sortConfig.key === 'z' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </th>
                        <th onClick={() => handleSort('name')}>
                            Name {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {currentLocations.map(location => (
                        <tr key={location.id}>
                            <td>{location.id}</td>
                            <td>{location.creatorId}</td>
                            <td>{location.x}</td>
                            <td>{location.y}</td>
                            <td>{location.z}</td>
                            <td>{location.name}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Buttons for managing locations */}
            <div className="location-buttons" style={{ marginLeft: '20px' }}>
                <button className="btn" onClick={() => setShowAddForm(true)}>Add Location</button>
                <button className="btn" onClick={() => setShowDeleteForm(true)}>Delete Location</button>
                <button className="btn" onClick={() => setShowUpdateForm(true)}>Update Location</button>
            </div>
        </div>

        {/* Pagination */}
        <div className="pagination" style={{ marginTop: '20px' }}>
            {Array.from({ length: Math.ceil(locations.length / locationsPerPage) }, (_, i) => (
                <button key={i} onClick={() => paginate(i + 1)} className="btn" style={{ margin: '0 5px' }}>
                    {i + 1}
                </button>
            ))}
        </div>

            {/* Форма для добавления локации */}
            {showAddForm && (
                <div className="overlay">
                    <div className="form-container">
                        <h3>Add Location</h3>
                        <input placeholder="X" value={newLocation.x} onChange={e => setNewLocation({ ...newLocation, x: e.target.value })} />
                        <input placeholder="Y" value={newLocation.y} onChange={e => setNewLocation({ ...newLocation, y: e.target.value })} />
                        <input placeholder="Z" value={newLocation.z} onChange={e => setNewLocation({ ...newLocation, z: e.target.value })} />
                        <input placeholder="Name" value={newLocation.name} onChange={e => setNewLocation({ ...newLocation, name: e.target.value })} />
                        <button className="btn" onClick={handleAddLocation}>Submit</button>
                        <button className="btn" onClick={() => setShowAddForm(false)}>Cancel</button>
                    </div>
                </div>
            )}

            {/* Форма для удаления локации */}
            {showDeleteForm && (
                <div className="overlay">
                    <div className="form-container">
                        <h3>Delete Location</h3>
                        <input placeholder="Location ID" value={deleteLocationId} onChange={e => setDeleteLocationId(e.target.value)} />
                        <button className="btn" onClick={handleDeleteLocation}>Submit</button>
                        <button className="btn" onClick={() => setShowDeleteForm(false)}>Cancel</button>
                    </div>
                </div>
            )}

            {/* Форма для обновления локации */}
            {showUpdateForm && (
                <div className="overlay">
                    <div className="form-container">
                        <h3>Update Location</h3>
                        <input placeholder="ID" value={updateLocation.id} onChange={e => setUpdateLocation({ ...updateLocation, id: e.target.value })} />
                        <input placeholder="X" value={updateLocation.x} onChange={e => setUpdateLocation({ ...updateLocation, x: e.target.value })} />
                        <input placeholder="Y" value={updateLocation.y} onChange={e => setUpdateLocation({ ...updateLocation, y: e.target.value })} />
                        <input placeholder="Z" value={updateLocation.z} onChange={e => setUpdateLocation({ ...updateLocation, z: e.target.value })} />
                        <input placeholder="Name" value={updateLocation.name} onChange={e => setUpdateLocation({ ...updateLocation, name: e.target.value })} />
                        <button className="btn" onClick={handleUpdateLocation}>Submit</button>
                        <button className="btn" onClick={() => setShowUpdateForm(false)}>Cancel</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LocationsComponent;

let getLocations = async (port, token) => {
    let url = 'http://localhost:' + port + '/api/locations';
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });

    return response;
};

let addLocationRequest = async (port, token, location) => {
    let url = 'http://localhost:' + port + '/api/locations';
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(location)
    });

    return response;
};

let deleteLocationRequest = async (port, token, id) => {
    let url = `http://localhost:${port}/api/locations/${id}`;
    const response = await fetch(url, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });

    return response;
};

let updateLocationRequest = async (port, token, location) => {
    let url = `http://localhost:${port}/api/locations/${location.id}`;
    const response = await fetch(url, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(location)
    });

    return response;
};
