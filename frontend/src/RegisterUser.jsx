import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css'; 

function RegisterUser() {
  const [user, setUser] = useState({ name: '', email: '' });
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState('');
  const [editUserId, setEditUserId] = useState(null); // Track which user is being edited

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    axios.get('http://localhost:8081/users')
      .then(response => setUsers(response.data))
      .catch(error => console.error('Error fetching users:', error));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editUserId) {
      // Update an existing user
      axios.put(`http://localhost:8081/users/${editUserId}`, user)
        .then((response) => {
          setMessage('User updated successfully!');
          setUser({ name: '', email: '' });
          setEditUserId(null); // Reset the edit mode
          fetchUsers(); // Refresh the user list
        })
        .catch((error) => {
          setMessage(`Error: ${error.response.data.error}`);
        });
    } else {
      // Create a new user
      axios.post('http://localhost:8081/users', user)
        .then((response) => {
          setMessage('User registered successfully!');
          setUser({ name: '', email: '' }); // Clear form
          fetchUsers(); // Refresh the user list
        })
        .catch((error) => {
          setMessage(`Error: ${error.response.data.error}`);
        });
    }
  };

  const handleEdit = (user) => {
    setUser({ name: user.name, email: user.email });
    setEditUserId(user._id); // Set the ID of the user being edited
    setMessage(''); // Clear any existing messages
  };

  const handleDelete = (userId) => {
    axios.delete(`http://localhost:8081/users/${userId}`)
      .then(() => {
        setMessage('User deleted successfully!');
        fetchUsers(); // Refresh the user list
      })
      .catch((error) => {
        setMessage(`Error: ${error.response.data.error}`);
      });
  };

  return (
    <div className="container">
      <h1>{editUserId ? 'Edit User' : 'Register User'}</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Name:</label>
          <input
            type="text"
            className="form-control"
            name="name"
            value={user.name}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Email:</label>
          <input
            type="email"
            className="form-control"
            name="email"
            value={user.email}
            onChange={handleInputChange}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary">
          {editUserId ? 'Update User' : 'Register'}
        </button>
      </form>
      {message && <p>{message}</p>}

      <h2>Registered Users</h2>
      <ul className="user-list">
        {users.map((user) => (
          <li key={user._id}>
            <strong>{user.name}</strong> - {user.email}
            <div className="user-actions">
              <button className="btn btn-warning" onClick={() => handleEdit(user)}>Edit</button>
              <button className="btn btn-danger" onClick={() => handleDelete(user._id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default RegisterUser;
