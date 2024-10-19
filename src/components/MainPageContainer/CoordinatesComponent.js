import React, { useEffect, useState } from 'react';

const CoordinatesComponent = ({ serverPort }) => {
    const [coordinates, setCoordinates] = useState([]); // State to store the list of coordinates
    const [allCoordinates, setAllCoordinates] = useState([]);
    const [loading, setLoading] = useState(true); // Loading state
    const [showAddForm, setShowAddForm] = useState(false); // Show add form
    const [showDeleteForm, setShowDeleteForm] = useState(false); // Show delete form
    const [showUpdateForm, setShowUpdateForm] = useState(false); // Show update form

    const [newCoordinates, setNewCoordinates] = useState({ x: '', y: '' }); // State for adding
    const [deleteCoordinatesId, setDeleteCoordinatesId] = useState(''); // ID for deletion
    const [updateCoordinates, setUpdateCoordinates] = useState({ id: '', x: '', y: '' }); // State for updating

    const [sortConfig, setSortConfig] = useState({ key: '', direction: 'asc' }); // Sort configuration

    const [idFilter, setIdFilter] = useState(''); // Filter by ID
    const [currentPage, setCurrentPage] = useState(1); // Current page
    const coordinatesPerPage = 10; // Items per page

    useEffect(() => {
        fetchCoordinates();
    }, []);

    const fetchCoordinates = async () => {
        try {
            const result = await getCoordinates(serverPort, localStorage.getItem("token"));
            if (result.status === 200) {
                const data = await result.json();
                setAllCoordinates(data);
                setCoordinates(data);
            } else {
                const errMessage = result.headers.get('ErrMessage');
                alert(errMessage || "Unable to get coordinates");
            }
        } catch (error) {
            console.error('Error fetching coordinates:', error);
            alert("Error fetching coordinates");
        } finally {
            setLoading(false); // Loading complete
        }
    };

    const handleAddCoordinates = async () => {
        // Validation
        const xValue = parseFloat(newCoordinates.x);
        const yValue = parseInt(newCoordinates.y, 10);

        if (isNaN(xValue) || xValue > 182) {
            alert("X must be a number and cannot be greater than 182");
            return;
        }
        if (isNaN(yValue) || yValue > 329) {
            alert("Y must be a number and cannot be greater than 329");
            return;
        }

        try {
            const result = await addCoordinatesRequest(serverPort, localStorage.getItem("token"), { x: xValue, y: yValue });
            if (result.status !== 200) {
                const errMessage = result.headers.get('ErrMessage');
                alert(errMessage || "Error adding coordinates");
            } else {
                setShowAddForm(false);
                fetchCoordinates(); // Refresh list after adding
            }
        } catch (error) {
            console.error("Error adding coordinates:", error);
            alert("Error adding coordinates");
        }
    };

    const handleDeleteCoordinates = async () => {
        if (deleteCoordinatesId.trim() === "") {
            alert("Coordinates ID can't be empty");
            return;
        }
        try {
            const result = await deleteCoordinatesRequest(serverPort, localStorage.getItem("token"), deleteCoordinatesId);
            if (result.status !== 200) {
                const errMessage = result.headers.get('ErrMessage');
                alert(errMessage || "Error deleting coordinates");
            } else {
                setShowDeleteForm(false);
                fetchCoordinates(); // Refresh list after deletion
            }
        } catch (error) {
            console.error("Error deleting coordinates:", error);
            alert("Error deleting coordinates");
        }
    };

    const handleUpdateCoordinates = async () => {
        // Validation
        const xValue = parseFloat(updateCoordinates.x);
        const yValue = parseInt(updateCoordinates.y, 10);

        if (updateCoordinates.id.trim() === "") {
            alert("ID can't be empty");
            return;
        }
        if (isNaN(xValue) || xValue > 182) {
            alert("X must be a number and cannot be greater than 182");
            return;
        }
        if (isNaN(yValue) || yValue > 329) {
            alert("Y must be a number and cannot be greater than 329");
            return;
        }

        try {
            const result = await updateCoordinatesRequest(serverPort, localStorage.getItem("token"), {
                id: updateCoordinates.id,
                x: xValue,
                y: yValue
            });
            if (result.status !== 200) {
                const errMessage = result.headers.get('ErrMessage');
                alert(errMessage || "Error updating coordinates");
            } else {
                setShowUpdateForm(false);
                fetchCoordinates(); // Refresh list after updating
            }
        } catch (error) {
            console.error("Error updating coordinates:", error);
            alert("Error updating coordinates");
        }
    };

    useEffect(() => {
        handleFilterCoordinates();
        setCurrentPage(1);
    }, [idFilter, allCoordinates]);

    const handleFilterCoordinates = () => {
        let filteredCoordinates = allCoordinates;

        if (idFilter.trim() !== "") {
            const id = Number(idFilter);
            if (!isNaN(id)) {
                filteredCoordinates = filteredCoordinates.filter(coordinate => coordinate.id === id);
            }
        }

        setCoordinates(filteredCoordinates);
    };

    const indexOfLastCoordinates = currentPage * coordinatesPerPage;
    const indexOfFirstCoordinates = indexOfLastCoordinates - coordinatesPerPage;
    const currentCoordinates = coordinates.slice(indexOfFirstCoordinates, indexOfLastCoordinates);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    useEffect(() => {
        let sortedCoordinates = coordinates;
        console.log("before sort", sortedCoordinates);
        if (sortConfig.key) {
            sortedCoordinates = sortedCoordinates.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }

        setCoordinates(sortedCoordinates);
    }, [sortConfig, coordinates]);

    if (loading) {
        return <div>Loading coordinates...</div>;
    }

    return (
        <div className='locations-container'style={{ textAlign: 'center' }}>
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
            </div>
            <h2>Available Coordinates</h2>
            <div className="table-btn-container" style={{ display: 'flex', justifyContent: 'space-between' }}>
                {/* Table for displaying coordinates */}
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
                        </tr>
                    </thead>
                    <tbody>
                        {currentCoordinates.map(coordinate => (
                            <tr key={coordinate.id}>
                                <td>{coordinate.id}</td>
                                <td>{coordinate.creatorId}</td>
                                <td>{coordinate.x}</td>
                                <td>{coordinate.y}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Buttons for managing coordinates */}
                <div className="location-buttons" style={{ marginLeft: '20px' }}>
                    <button className="btn" onClick={() => setShowAddForm(true)}>Add Coordinates</button>
                    <button className="btn" onClick={() => setShowDeleteForm(true)}>Delete Coordinates</button>
                    <button className="btn" onClick={() => setShowUpdateForm(true)}>Update Coordinates</button>
                </div>
            </div>

            {/* Pagination */}
            <div className="pagination" style={{ marginTop: '20px' }}>
                {Array.from({ length: Math.ceil(coordinates.length / coordinatesPerPage) }, (_, i) => (
                    <button
                        key={i}
                        onClick={() => paginate(i + 1)}
                        className="btn"
                        style={{ margin: '0 5px' }}
                    >
                        {i + 1}
                    </button>
                ))}
            </div>

            {/* Add Coordinates Form */}
            {showAddForm && (
                <div className="overlay">
                    <div className="form-container">
                        <h3>Add Coordinates</h3>
                        <input
                            type="number"
                            placeholder="X (max 182)"
                            value={newCoordinates.x}
                            onChange={e => setNewCoordinates({ ...newCoordinates, x: e.target.value })}
                        />
                        <input
                            type="number"
                            placeholder="Y (max 329)"
                            value={newCoordinates.y}
                            onChange={e => setNewCoordinates({ ...newCoordinates, y: e.target.value })}
                        />
                        <div className="form-buttons">
                            <button className="btn" onClick={handleAddCoordinates}>Submit</button>
                            <button className="btn" onClick={() => setShowAddForm(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Coordinates Form */}
            {showDeleteForm && (
                <div className="overlay">
                    <div className="form-container">
                        <h3>Delete Coordinates</h3>
                        <input
                            type="number"
                            placeholder="Coordinates ID"
                            value={deleteCoordinatesId}
                            onChange={e => setDeleteCoordinatesId(e.target.value)}
                        />
                        <div className="form-buttons">
                            <button className="btn" onClick={handleDeleteCoordinates}>Submit</button>
                            <button className="btn" onClick={() => setShowDeleteForm(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Update Coordinates Form */}
            {showUpdateForm && (
                <div className="overlay">
                    <div className="form-container">
                        <h3>Update Coordinates</h3>
                        <input
                            type="number"
                            placeholder="ID"
                            value={updateCoordinates.id}
                            onChange={e => setUpdateCoordinates({ ...updateCoordinates, id: e.target.value })}
                        />
                        <input
                            type="number"
                            placeholder="X (max 182)"
                            value={updateCoordinates.x}
                            onChange={e => setUpdateCoordinates({ ...updateCoordinates, x: e.target.value })}
                        />
                        <input
                            type="number"
                            placeholder="Y (max 329)"
                            value={updateCoordinates.y}
                            onChange={e => setUpdateCoordinates({ ...updateCoordinates, y: e.target.value })}
                        />
                        <div className="form-buttons">
                            <button className="btn" onClick={handleUpdateCoordinates}>Submit</button>
                            <button className="btn" onClick={() => setShowUpdateForm(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Helper functions for API requests
const getCoordinates = async (port, token) => {
    const url = `http://localhost:${port}/api/coordinates`;
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });

    return response;
};

const addCoordinatesRequest = async (port, token, coordinates) => {
    const url = `http://localhost:${port}/api/coordinates`;
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(coordinates)
    });

    return response;
};

const deleteCoordinatesRequest = async (port, token, id) => {
    const url = `http://localhost:${port}/api/coordinates/${id}`;
    const response = await fetch(url, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });

    return response;
};

const updateCoordinatesRequest = async (port, token, coordinates) => {
    const url = `http://localhost:${port}/api/coordinates/${coordinates.id}`;
    const response = await fetch(url, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(coordinates)
    });

    return response;
};

export default CoordinatesComponent;
