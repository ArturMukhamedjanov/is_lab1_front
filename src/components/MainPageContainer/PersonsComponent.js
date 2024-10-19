import React, { useEffect, useState } from 'react';

const PersonsComponent = ({ serverPort }) => {
    const [persons, setPersons] = useState([]); // Состояние для хранения списка персон
    const [allPersons, setAllPersons] = useState([]);
    const [loading, setLoading] = useState(true); // Состояние для отслеживания загрузки
    const [showAddForm, setShowAddForm] = useState(false); // Показать форму добавления
    const [showDeleteForm, setShowDeleteForm] = useState(false); // Показать форму удаления
    const [showUpdateForm, setShowUpdateForm] = useState(false); // Показать форму обновления

    const [newPerson, setNewPerson] = useState({ eyeColor: '', hairColor: '', locationId: '', height: '', passportID: '' }); // Состояние для добавления
    const [deletePersonId, setDeletePersonId] = useState(''); // ID для удаления
    const [updatePerson, setUpdatePerson] = useState({ id: '', eyeColor: '', hairColor: '', locationId: '', height: '', passportID: '' }); // Состояние для обновления

    const [idFilter, setIdFilter] = useState(''); // Фильтр по ID
    const [passportIdFilter, setPassportIdFilter] = useState(''); // Фильтр по Passport ID
    const [currentPage, setCurrentPage] = useState(1); // Текущая страница
    const personsPerPage = 10; // Количество элементов на страницу

    const validColors = ['BLUE', 'ORANGE', 'WHITE']; // Enum values for eyeColor и hairColor

    const [sortConfig, setSortConfig] = useState({ key: '', direction: 'asc' });

    useEffect(() => {
        fetchPersons();
    }, []);

    const fetchPersons = async () => {
        try {
            const result = await getPersons(serverPort, localStorage.getItem("token"));
            if (result.status === 200) {
                const data = await result.json();
                setAllPersons(data);
                setPersons(data);
            } else {
                const errMessage = result.headers.get('ErrMessage');
                alert(errMessage || "Unable to get persons");
            }
        } catch (error) {
            console.error('Error fetching persons:', error);
            alert("Error fetching persons");
        } finally {
            setLoading(false); // Загрузка завершена
        }
    };

    const handleAddPerson = async () => {
        // Валидация
        if (!validColors.includes(newPerson.eyeColor)) {
            alert(`Eye color must be one of the following: ${validColors.join(', ')}`);
            return;
        }
        if (!validColors.includes(newPerson.hairColor)) {
            alert(`Hair color must be one of the following: ${validColors.join(', ')}`);
            return;
        }
        if (newPerson.locationId.trim() === "") {
            alert("Location ID can't be null");
            return;
        }
        if (newPerson.height !== '' && Number(newPerson.height) <= 0) {
            alert("Height must be greater than 0");
            return;
        }
        if (newPerson.passportID !== '' && (newPerson.passportID.length < 10 || newPerson.passportID.length > 33)) {
            alert("Passport ID must be between 10 and 33 characters");
            return;
        }

        try {
            const result = await addPersonRequest(serverPort, localStorage.getItem("token"), newPerson);
            if (result.status !== 200) {
                const errMessage = result.headers.get('ErrMessage');
                alert(errMessage || "Error adding person");
            } else {
                setShowAddForm(false);
                fetchPersons(); // Обновляем список после добавления
            }
        } catch (error) {
            console.error("Error adding person:", error);
            alert("Error adding person");
        }
    };

    const handleDeletePerson = async () => {
        if (deletePersonId.trim() === "") {
            alert("Person ID can't be empty");
            return;
        }
        try {
            const result = await deletePersonRequest(serverPort, localStorage.getItem("token"), deletePersonId);
            if (result.status !== 200) {
                const errMessage = result.headers.get('ErrMessage');
                alert(errMessage || "Error deleting person");
            } else {
                setShowDeleteForm(false);
                fetchPersons(); // Обновляем список после удаления
            }
        } catch (error) {
            console.error("Error deleting person:", error);
            alert("Error deleting person");
        }
    };

    const handleUpdatePerson = async () => {
        // Валидация
        if (!validColors.includes(updatePerson.eyeColor)) {
            alert(`Eye color must be one of the following: ${validColors.join(', ')}`);
            return;
        }
        if (!validColors.includes(updatePerson.hairColor)) {
            alert(`Hair color must be one of the following: ${validColors.join(', ')}`);
            return;
        }
        if (updatePerson.locationId.trim() === "") {
            alert("Location ID can't be null");
            return;
        }
        if (updatePerson.height !== '' && Number(updatePerson.height) <= 0) {
            alert("Height must be greater than 0");
            return;
        }
        if (updatePerson.passportID !== '' && (updatePerson.passportID.length < 10 || updatePerson.passportID.length > 33)) {
            alert("Passport ID must be between 10 and 33 characters");
            return;
        }

        try {
            const result = await updatePersonRequest(serverPort, localStorage.getItem("token"), updatePerson);
            if (result.status !== 200) {
                const errMessage = result.headers.get('ErrMessage');
                alert(errMessage || "Error updating person");
            } else {
                setShowUpdateForm(false);
                fetchPersons(); // Обновляем список после обновления
            }
        } catch (error) {
            console.error("Error updating person:", error);
            alert("Error updating person");
        }
    };

    useEffect(() => {
        handleFilterPerson();
        setCurrentPage(1); 
    }, [idFilter, passportIdFilter, allPersons]);

    const handleFilterPerson = () => {
        let filteredPersons = allPersons;

        if (idFilter.trim() !== "") {
            const id = Number(idFilter);
            if (!isNaN(id)) {
                filteredPersons = filteredPersons.filter(person => person.id === id);
            }
        }

        if (passportIdFilter.trim() !== "") {
            const passportId = passportIdFilter.toLowerCase();
            filteredPersons = filteredPersons.filter(person => person.passportID && person.passportID.toLowerCase().includes(passportId));
        }

        setPersons(filteredPersons);
    }

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    useEffect(() => {
        let sortedPersons = persons; // Копируем координаты, чтобы не изменять оригинальный массив

        if (sortConfig.key) {
            sortedPersons.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }

        setPersons(sortedPersons);
    }, [sortConfig, persons]);

    const indexOfLastPerson = currentPage * personsPerPage;
    const indexOfFirstPerson = indexOfLastPerson - personsPerPage;
    const currentPersons = persons.slice(indexOfFirstPerson, indexOfLastPerson);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    if (loading) {
        return <div>Loading persons...</div>;
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
                    <label htmlFor="passportIdFilter">Filter by Passport ID:</label>
                    <input
                        id="passportIdFilter"
                        type="text"
                        placeholder="Enter Passport ID"
                        value={passportIdFilter}
                        onChange={(e) => setPassportIdFilter(e.target.value)}
                        style={{ marginLeft: '10px', padding: '5px', width: '200px' }}
                    />
                </div>
            </div>

            <h2>Available Persons</h2>
            <div className="table-btn-container" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <table className='locations-table'>
                    <thead>
                        <tr>
                            <th onClick={() => handleSort('id')}>
                                ID {sortConfig.key === 'id' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                            </th>
                            <th onClick={() => handleSort('creatorId')}>
                                Creator ID {sortConfig.key === 'creatorId' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                            </th>
                            <th onClick={() => handleSort('eyeColor')}>
                                Eye Color {sortConfig.key === 'eyeColor' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                            </th>
                            <th onClick={() => handleSort('hairColor')}>
                                Hair Color{sortConfig.key === 'hairColor' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                            </th>
                            <th onClick={() => handleSort('locationId')}>
                                Location ID {sortConfig.key === 'locationId' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                            </th>
                            <th onClick={() => handleSort('height')}>
                                Height {sortConfig.key === 'height' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                            </th>
                            <th onClick={() => handleSort('passportId')}>
                                Passport ID {sortConfig.key === 'passportId' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentPersons.map(person => (
                            <tr key={person.id}>
                                <td>{person.id}</td>
                                <td>{person.creatorId}</td>
                                <td>{person.eyeColor}</td>
                                <td>{person.hairColor}</td>
                                <td>{person.locationId}</td>
                                <td>{person.height}</td>
                                <td>{person.passportID}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="location-buttons" style={{ marginLeft: '20px' }}>
                    <button className="btn" onClick={() => setShowAddForm(true)}>Add Person</button>
                    <button className="btn" onClick={() => setShowDeleteForm(true)}>Delete Person</button>
                    <button className="btn" onClick={() => setShowUpdateForm(true)}>Update Person</button>
                </div>
            </div>

            {/* Pagination */}
            <div className="pagination" style={{ marginTop: '20px' }}>
                {Array.from({ length: Math.ceil(persons.length / personsPerPage) }, (_, i) => (
                    <button key={i} onClick={() => paginate(i + 1)} className="btn" style={{ margin: '0 5px' }}>
                        {i + 1}
                    </button>
                ))}
            </div>

            {/* Форма для добавления персона */}
            {showAddForm && (
                <div className="overlay">
                    <div className="form-container">
                        <h3>Add Person</h3>
                        <select
                            value={newPerson.eyeColor}
                            onChange={e => setNewPerson({ ...newPerson, eyeColor: e.target.value })}
                        >
                            <option value="">Select Eye Color</option>
                            {validColors.map(color => (
                                <option key={color} value={color}>{color}</option>
                            ))}
                        </select>
                        <select
                            value={newPerson.hairColor}
                            onChange={e => setNewPerson({ ...newPerson, hairColor: e.target.value })}
                        >
                            <option value="">Select Hair Color</option>
                            {validColors.map(color => (
                                <option key={color} value={color}>{color}</option>
                            ))}
                        </select>
                        <input 
                            type="number" 
                            placeholder="Location ID" 
                            value={newPerson.locationId} 
                            onChange={e => setNewPerson({ ...newPerson, locationId: e.target.value })} 
                        />
                        <input 
                            type="number" 
                            placeholder="Height" 
                            value={newPerson.height} 
                            onChange={e => setNewPerson({ ...newPerson, height: e.target.value })} 
                        />
                        <input 
                            type="text" 
                            placeholder="Passport ID" 
                            value={newPerson.passportID} 
                            onChange={e => setNewPerson({ ...newPerson, passportID: e.target.value })} 
                        />
                        <button className="btn" onClick={handleAddPerson}>Submit</button>
                        <button className="btn" onClick={() => setShowAddForm(false)}>Cancel</button>
                    </div>
                </div>
            )}

            {/* Форма для удаления персона */}
            {showDeleteForm && (
                <div className="overlay">
                    <div className="form-container">
                        <h3>Delete Person</h3>
                        <input 
                            type="number"
                            placeholder="Person ID" 
                            value={deletePersonId} 
                            onChange={e => setDeletePersonId(e.target.value)} 
                        />
                        <button className="btn" onClick={handleDeletePerson}>Delete</button>
                        <button className="btn" onClick={() => setShowDeleteForm(false)}>Cancel</button>
                    </div>
                </div>
            )}

            {/* Форма для обновления персона */}
            {showUpdateForm && (
                <div className="overlay">
                    <div className="form-container">
                        <h3>Update Person</h3>
                        <input 
                            type="number"
                            placeholder="ID" 
                            value={updatePerson.id} 
                            onChange={e => setUpdatePerson({ ...updatePerson, id: e.target.value })} 
                        />
                        <select
                            value={updatePerson.eyeColor}
                            onChange={e => setUpdatePerson({ ...updatePerson, eyeColor: e.target.value })}
                        >
                            <option value="">Select Eye Color</option>
                            {validColors.map(color => (
                                <option key={color} value={color}>{color}</option>
                            ))}
                        </select>
                        <select
                            value={updatePerson.hairColor}
                            onChange={e => setUpdatePerson({ ...updatePerson, hairColor: e.target.value })}
                        >
                            <option value="">Select Hair Color</option>
                            {validColors.map(color => (
                                <option key={color} value={color}>{color}</option>
                            ))}
                        </select>
                        <input 
                            type="number"
                            placeholder="Location ID" 
                            value={updatePerson.locationId} 
                            onChange={e => setUpdatePerson({ ...updatePerson, locationId: e.target.value })} 
                        />
                        <input 
                            type="number" 
                            placeholder="Height" 
                            value={updatePerson.height} 
                            onChange={e => setUpdatePerson({ ...updatePerson, height: e.target.value })} 
                        />
                        <input 
                            type="text" 
                            placeholder="Passport ID" 
                            value={updatePerson.passportID} 
                            onChange={e => setUpdatePerson({ ...updatePerson, passportID: e.target.value })} 
                        />
                        <button className="btn" onClick={handleUpdatePerson}>Submit</button>
                        <button className="btn" onClick={() => setShowUpdateForm(false)}>Cancel</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PersonsComponent;

// Получение списка персон
const getPersons = async (port, token) => {
    const url = `http://localhost:${port}/api/persons`;
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });

    return response;
};

// Добавление новой персоны
const addPersonRequest = async (port, token, person) => {
    const url = `http://localhost:${port}/api/persons`;
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(person)
    });

    return response;
};

// Удаление персоны по ID
const deletePersonRequest = async (port, token, id) => {
    const url = `http://localhost:${port}/api/persons/${id}`;
    const response = await fetch(url, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });

    return response;
};

// Обновление персоны по ID
const updatePersonRequest = async (port, token, person) => {
    const url = `http://localhost:${port}/api/persons/${person.id}`;
    const response = await fetch(url, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(person)
    });

    return response;
};
