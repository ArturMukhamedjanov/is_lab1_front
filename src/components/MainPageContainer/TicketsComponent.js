import React, { useEffect, useState } from 'react';

const TicketsComponent = ({ serverPort }) => {
    const [tickets, setTickets] = useState([]);
    const [allTickets, setAllTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [showDeleteForm, setShowDeleteForm] = useState(false);
    const [showUpdateForm, setShowUpdateForm] = useState(false);
    const [showDoublePriceForm, setShowDoublePriceForm] = useState(false);

    const [newTicket, setNewTicket] = useState({
        name: '',
        coordinatesId: '',
        personId: '',
        eventId: '',
        price: '',
        type: '',
        discount: '',
        number: '',
        comment: '',
        refundable: '',
        venueId: ''
    });
    const [deleteTicketId, setDeleteTicketId] = useState('');
    const [updateTicket, setUpdateTicket] = useState({
        id: '',
        name: '',
        coordinatesId: '',
        personId: '',
        eventId: '',
        price: '',
        type: '',
        discount: '',
        number: '',
        comment: '',
        refundable: '',
        venueId: ''
    });
    const [doublePriceTicketId, setDoublePriceTicketId] = useState('');

    const [idFilter, setIdFilter] = useState('');
    const [nameFilter, setNameFilter] = useState('');
    const [commentFilter, setCommentFilter] = useState('');

    const [currentPage, setCurrentPage] = useState(1);
    const ticketsPerPage = 10;

    const [sortConfig, setSortConfig] = useState({ key: '', direction: 'asc' });

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        try {
            const result = await getTickets(serverPort, localStorage.getItem("token"));
            if (result.status === 200) {
                const data = await result.json();
                setAllTickets(data);
                setTickets(data);
            } else {
                const errMessage = result.headers.get('ErrMessage');
                alert(errMessage || "Unable to get tickets");
            }
        } catch (error) {
            console.error('Error fetching tickets:', error);
            alert("Error fetching tickets");
        } finally {
            setLoading(false);
        }
    };

    const handleAddTicket = async () => {
        const { name, coordinatesId, personId, price, comment, refundable, venueId } = newTicket;

        // Валидация
        if (!name.trim()) {
            alert("Name can't be null or empty");
            return;
        }
        if (!coordinatesId || !personId || !price || !comment.trim() || refundable === '' || !venueId) {
            alert("Some required fields are missing");
            return;
        }
        if (price <= 0) {
            alert("Price must be greater than 0");
            return;
        }
        if (newTicket.discount && (newTicket.discount <= 0 || newTicket.discount > 100)) {
            alert("Discount must be between 1 and 100");
            return;
        }
        if (newTicket.number && newTicket.number <= 0) {
            alert("Number must be greater than 0");
            return;
        }

        try {
            const result = await addTicketRequest(serverPort, localStorage.getItem("token"), newTicket);
            if (result.status !== 200) {
                const errMessage = result.headers.get('ErrMessage');
                alert(errMessage || "Error adding ticket");
            } else {
                setShowAddForm(false);
                fetchTickets();
            }
        } catch (error) {
            console.error("Error adding ticket:", error);
            alert("Error adding ticket");
        }
    };

    const handleDeleteTicket = async () => {
        if (deleteTicketId.trim() === "") {
            alert("Ticket ID can't be empty");
            return;
        }
        try {
            const result = await deleteTicketRequest(serverPort, localStorage.getItem("token"), deleteTicketId);
            if (result.status !== 200) {
                const errMessage = result.headers.get('ErrMessage');
                alert(errMessage || "Error deleting ticket");
            } else {
                setShowDeleteForm(false);
                fetchTickets();
            }
        } catch (error) {
            console.error("Error deleting ticket:", error);
            alert("Error deleting ticket");
        }
    };

    const handleUpdateTicket = async () => {
        const { name, coordinatesId, personId, price, comment, refundable, venueId } = updateTicket;

        // Валидация
        if (!name.trim()) {
            alert("Name can't be null or empty");
            return;
        }
        if (!coordinatesId || !personId || !price || !comment.trim() || refundable === '' || !venueId) {
            alert("Some required fields are missing");
            return;
        }
        if (price <= 0) {
            alert("Price must be greater than 0");
            return;
        }
        if (updateTicket.discount && (updateTicket.discount <= 0 || updateTicket.discount > 100)) {
            alert("Discount must be between 1 and 100");
            return;
        }
        if (updateTicket.number && updateTicket.number <= 0) {
            alert("Number must be greater than 0");
            return;
        }

        try {
            const result = await updateTicketRequest(serverPort, localStorage.getItem("token"), updateTicket);
            if (result.status !== 200) {
                const errMessage = result.headers.get('ErrMessage');
                alert(errMessage || "Error updating ticket");
            } else {
                setShowUpdateForm(false);
                fetchTickets();
            }
        } catch (error) {
            console.error("Error updating ticket:", error);
            alert("Error updating ticket");
        }
    };

    const handleDoublePriceTicket = async () => {
        // Найдем билет с указанным ID
        var ticket = null;
        tickets.map(
            function(item){
                console.log(item.id);
                if(item.id === Number(doublePriceTicketId)){
                    ticket = item;
                }
            }
        )
        if (!ticket) {
            alert(`Ticket with ID ${doublePriceTicketId} not found`);
            return;
        }
        // Если билет уже типа "VIP", выводим сообщение и выходим
        if (ticket.type === 'VIP') {
            alert('Ticket is already VIP');
            return;
        }
        // Меняем тип на "VIP" и удваиваем цену
        ticket.type = 'VIP';
        ticket.price *= 2;

        try {
            const result = await addTicketRequest(serverPort, localStorage.getItem("token"), ticket);
            if (result.status !== 200) {
                const errMessage = result.headers.get('ErrMessage');
                alert(errMessage || "Error adding ticket");
            } else {
                setShowDoublePriceForm(false);
                fetchTickets();
            }
        } catch (error) {
            console.error("Error adding ticket:", error);
            alert("Error adding ticket");
        }
    }

    const handleCountUniqueComments = async () => {
        const uniqueComments = new Set();

        tickets.forEach(ticket => {
            if (ticket.comment) {
                uniqueComments.add(ticket.comment);
            }
        });
        // Выводим количество уникальных комментариев
        alert(`Total unique comments: ${uniqueComments.size}`);
    }

    useEffect(() => {
        handleFilterTicket();
        setCurrentPage(1);
    }, [idFilter, nameFilter, commentFilter, allTickets]);

    const handleFilterTicket = () => {
        let filteredTickets = allTickets;

        if (idFilter.trim() !== "") {
            const id = Number(idFilter);
            if (!isNaN(id)) {
                filteredTickets = filteredTickets.filter(ticket => ticket.id === id);
            }
        }

        if (nameFilter.trim() !== "") {
            const name = nameFilter.toLowerCase();
            filteredTickets = filteredTickets.filter(ticket => ticket.name.toLowerCase().includes(name));
        }

        if (commentFilter.trim() !== "") {
            const comment = commentFilter.toLowerCase();
            filteredTickets = filteredTickets.filter(ticket => ticket.comment.toLowerCase().includes(comment));
        }

        setTickets(filteredTickets);
    };

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    useEffect(() => {
        let sortedTickets = tickets; // Копируем координаты, чтобы не изменять оригинальный массив

        if (sortConfig.key) {
            sortedTickets.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }

        setTickets(sortedTickets);
    }, [sortConfig, tickets]);


    const indexOfLastTicket = currentPage * ticketsPerPage;
    const indexOfFirstTicket = indexOfLastTicket - ticketsPerPage;
    const currentTickets = tickets.slice(indexOfFirstTicket, indexOfLastTicket);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    if (loading) {
        return <div>Loading tickets...</div>;
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
                <div>
                    <label htmlFor="commentFilter">Filter by Comment:</label>
                    <input
                        id="commentFilter"
                        type="text"
                        placeholder="Enter comment"
                        value={commentFilter}
                        onChange={(e) => setCommentFilter(e.target.value)}
                        style={{ marginLeft: '10px', padding: '5px', width: '400px' }}
                    />
                </div>
            </div>
            <h2>Available Tickets</h2>
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
                        <th onClick={() => handleSort('name')}>
                            Name {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </th>
                        <th onClick={() => handleSort('coordinatesId')}>
                            Coordinates ID {sortConfig.key === 'coordinatesId' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </th>
                        <th onClick={() => handleSort('creationDate')}>
                            Creation Date {sortConfig.key === 'creationDate' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </th>
                        <th onClick={() => handleSort('personId')}>
                            Person Id {sortConfig.key === 'personId' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </th>
                        <th onClick={() => handleSort('eventId')}>
                            Event ID {sortConfig.key === 'eventId' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </th>
                        <th onClick={() => handleSort('price')}>
                            Price {sortConfig.key === 'price' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </th>
                        <th onClick={() => handleSort('type')}>
                            Type {sortConfig.key === 'type' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </th>
                        <th onClick={() => handleSort('discount')}>
                            Discount {sortConfig.key === 'discount' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </th>
                        <th onClick={() => handleSort('number')}>
                            Number {sortConfig.key === 'number' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </th>
                        <th onClick={() => handleSort('comment')}>
                            Comment {sortConfig.key === 'comment' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </th>
                        <th onClick={() => handleSort('refundable')}>
                            Refundable {sortConfig.key === 'refundable' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </th>
                        <th onClick={() => handleSort('venueId')}>
                            Venue Id {sortConfig.key === 'venueId' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {currentTickets.map(ticket => (
                        <tr key={ticket.id}>
                            <td>{ticket.id}</td>
                            <td>{ticket.creatorId}</td>
                            <td>{ticket.name}</td>
                            <td>{ticket.coordinatesId}</td>
                            <td>{new Date(ticket.creationDate).toLocaleString()}</td>
                            <td>{ticket.personId}</td>
                            <td>{ticket.eventId || 'N/A'}</td>
                            <td>{ticket.price}</td>
                            <td>{ticket.type || 'N/A'}</td>
                            <td>{ticket.discount || 'N/A'}</td>
                            <td>{ticket.number || 'N/A'}</td>
                            <td>{ticket.comment}</td>
                            <td>{ticket.refundable ? 'Yes' : 'No'}</td>
                            <td>{ticket.venueId}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="location-buttons" style={{ marginLeft: '20px' }}>
                <button className="btn" onClick={() => setShowAddForm(true)}>Add Ticket</button>
                <button className="btn" onClick={() => setShowDeleteForm(true)}>Delete Ticket</button>
                <button className="btn" onClick={() => setShowUpdateForm(true)}>Update Ticket</button>
                <button className="btn" onClick={() => handleCountUniqueComments()}>Get number of unique comments</button>
                <button className="btn" onClick={() => setShowDoublePriceForm(true)}>Double Price Ticket</button>
            </div>
        </div>

        <div className="pagination" style={{ marginTop: '20px' }}>
            {Array.from({ length: Math.ceil(tickets.length / ticketsPerPage) }, (_, i) => (
                <button key={i} onClick={() => paginate(i + 1)} className="btn" style={{ margin: '0 5px' }}>
                    {i + 1}
                </button>
            ))}
        </div>

        {/* Форма для добавления билета */}
        {showAddForm && (
            <div className="overlay">
                <div className="form-container">
                    <h3>Add Ticket</h3>
                        <input
                            type="text"
                            placeholder="Name"
                            value={newTicket.name}
                            onChange={(e) => setNewTicket({ ...newTicket, name: e.target.value })}
                        />
                        <input
                            type="number"
                            placeholder="Coordinates ID"
                            value={newTicket.coordinatesId}
                            onChange={(e) => setNewTicket({ ...newTicket, coordinatesId: e.target.value })}
                        />
                        <input
                            type="number"
                            placeholder="Person ID"
                            value={newTicket.personId}
                            onChange={(e) => setNewTicket({ ...newTicket, personId: e.target.value })}
                        />
                        <input
                            type="number"
                            placeholder="Event ID (optional)"
                            value={newTicket.eventId}
                            onChange={(e) => setNewTicket({ ...newTicket, eventId: e.target.value })}
                        />
                        <input
                            type="number"
                            placeholder="Price"
                            value={newTicket.price}
                            onChange={(e) => setNewTicket({ ...newTicket, price: e.target.value })}
                        />
                        <select
                            value={newTicket.type}
                            onChange={(e) => setNewTicket({ ...newTicket, type: e.target.value })}
                        >
                            <option value="">Select Type</option>
                            <option value="VIP">VIP</option>
                            <option value="USUAL">USUAL</option>
                            <option value="BUDGETARY">BUDGETARY</option>
                            <option value="CHEAP">CHEAP</option>
                        </select>
                        <input
                            type="number"
                            placeholder="Discount (optional)"
                            value={newTicket.discount}
                            onChange={(e) => setNewTicket({ ...newTicket, discount: e.target.value })}
                        />
                        <input
                            type="number"
                            placeholder="Number (optional)"
                            value={newTicket.number}
                            onChange={(e) => setNewTicket({ ...newTicket, number: e.target.value })}
                        />
                        <input
                            type="text"
                            placeholder="Comment"
                            value={newTicket.comment}
                            onChange={(e) => setNewTicket({ ...newTicket, comment: e.target.value })}
                        />
                        <select
                            value={newTicket.refundable}
                            onChange={(e) => setNewTicket({ ...newTicket, refundable: e.target.value === 'true' })}
                        >
                            <option value="">Refundable?</option>
                            <option value="true">Yes</option>
                            <option value="false">No</option>
                        </select>
                        <input
                            type="number"
                            placeholder="Venue ID"
                            value={newTicket.venueId}
                            onChange={(e) => setNewTicket({ ...newTicket, venueId: e.target.value })}
                        />
                        <button onClick={handleAddTicket} className="btn">Add</button>
                        <button onClick={() => setShowAddForm(false)} className="btn">Cancel</button>
                </div>
            </div>
        )}

        {/* Форма для удаления билета */}
        {showDeleteForm && (
            <div className="overlay">
                <div className="form-container">
                    <h3>Delete Ticket</h3>
                    <input
                        type="number"
                        placeholder="Enter ticket ID to delete"
                        value={deleteTicketId}
                        onChange={(e) => setDeleteTicketId(e.target.value)}
                    />
                    <button onClick={handleDeleteTicket} className="btn">Delete</button>
                    <button onClick={() => setShowDeleteForm(false)} className="btn">Cancel</button>
                </div>
            </div>
        )}

        {/* Форма для обновления билета */}
        {showUpdateForm && (
            <div className="overlay">
                <div className="form-container">
                    <h3>Update Ticket</h3>
                        <input
                            type="text"
                            placeholder="Name"
                            value={updateTicket.name}
                            onChange={(e) => setUpdateTicket({ ...updateTicket, name: e.target.value })}
                        />
                        <input
                            type="number"
                            placeholder="Coordinates ID"
                            value={updateTicket.coordinatesId}
                            onChange={(e) => setUpdateTicket({ ...updateTicket, coordinatesId: e.target.value })}
                        />
                        <input
                            type="number"
                            placeholder="Person ID"
                            value={updateTicket.personId}
                            onChange={(e) => setUpdateTicket({ ...updateTicket, personId: e.target.value })}
                        />
                        <input
                            type="number"
                            placeholder="Event ID (optional)"
                            value={updateTicket.eventId}
                            onChange={(e) => setUpdateTicket({ ...updateTicket, eventId: e.target.value })}
                        />
                        <input
                            type="number"
                            placeholder="Price"
                            value={updateTicket.price}
                            onChange={(e) => setUpdateTicket({ ...updateTicket, price: e.target.value })}
                        />
                        <select
                            value={updateTicket.type}
                            onChange={(e) => setUpdateTicket({ ...updateTicket, type: e.target.value })}
                        >
                            <option value="">Select Type</option>
                            <option value="VIP">VIP</option>
                            <option value="USUAL">USUAL</option>
                            <option value="BUDGETARY">BUDGETARY</option>
                            <option value="CHEAP">CHEAP</option>
                        </select>
                        <input
                            type="number"
                            placeholder="Discount (optional)"
                            value={updateTicket.discount}
                            onChange={(e) => setUpdateTicket({ ...updateTicket, discount: e.target.value })}
                        />
                        <input
                            type="number"
                            placeholder="Number (optional)"
                            value={updateTicket.number}
                            onChange={(e) => setUpdateTicket({ ...updateTicket, number: e.target.value })}
                        />
                        <input
                            type="text"
                            placeholder="Comment"
                            value={updateTicket.comment}
                            onChange={(e) => setUpdateTicket({ ...updateTicket, comment: e.target.value })}
                        />
                        <select
                            value={updateTicket.refundable}
                            onChange={(e) => setUpdateTicket({ ...updateTicket, refundable: e.target.value === 'true' })}
                        >
                            <option value="">Refundable?</option>
                            <option value="true">Yes</option>
                            <option value="false">No</option>
                        </select>
                        <input
                            type="number"
                            placeholder="Venue ID"
                            value={updateTicket.venueId}
                            onChange={(e) => setUpdateTicket({ ...updateTicket, venueId: e.target.value })}
                        />
                        <button onClick={handleUpdateTicket} className="btn">Update</button>
                        <button onClick={() => setShowUpdateForm(false)} className="btn">Cancel</button>
                </div>
            </div>
        )}

        {/* Форма для удаления билета */}
        {showDoublePriceForm && (
            <div className="overlay">
                <div className="form-container">
                    <h3>Delete Ticket</h3>
                    <input
                        type="number"
                        placeholder="Enter ticket ID to make VIP and double price"
                        value={doublePriceTicketId}
                        onChange={(e) => setDoublePriceTicketId(e.target.value)}
                    />
                    <button onClick={handleDoublePriceTicket} className="btn">Accept</button>
                    <button onClick={() => setShowDoublePriceForm(false)} className="btn">Cancel</button>
                </div>
            </div>
        )}

        </div>
    );
};

export default TicketsComponent;

// Получение списка билетов
const getTickets = async (serverPort, token) => {
    const url = `http://localhost:${serverPort}/api/tickets`;
    return await fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`, // Используем Bearer токен для авторизации
            'Content-Type': 'application/json',
        },
    });
};

// Добавление нового билета
const addTicketRequest = async (serverPort, token, ticketData) => {
    const url = `http://localhost:${serverPort}/api/tickets`;
    if(ticketData.type == ""){
        ticketData.type = null;
    }
    if(ticketData.eventId == ""){
        ticketData.eventId = null;
    }
    return await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            name: ticketData.name,
            coordinatesId: ticketData.coordinatesId,
            personId: ticketData.personId,
            eventId: ticketData.eventId,
            price: ticketData.price,
            type: ticketData.type,
            discount: ticketData.discount,
            number: ticketData.number,
            comment: ticketData.comment,
            refundable: ticketData.refundable,
            venueId: ticketData.venueId,
        }),  
    });
};

// Удаление билета по ID
const deleteTicketRequest = async (serverPort, token, ticketId) => {
    const url = `http://localhost:${serverPort}/api/tickets/${ticketId}`;
    return await fetch(url, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });
};

// Обновление билета
const updateTicketRequest = async (serverPort, token, ticketData) => {
    const url = `http://localhost:${serverPort}/api/tickets/${ticketData.id}`;
    if(ticketData.type == ""){
        ticketData.type = null;
    }
    if(ticketData.eventId == ""){
        ticketData.eventId = null;
    }
    return await fetch(url, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            name: ticketData.name,
            coordinatesId: ticketData.coordinatesId,
            personId: ticketData.personId,
            eventId: ticketData.eventId,
            price: ticketData.price,
            type: ticketData.type,
            discount: ticketData.discount,
            number: ticketData.number,
            comment: ticketData.comment,
            refundable: ticketData.refundable,
            venueId: ticketData.venueId,
        }), 
    });
};
