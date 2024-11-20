import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';


function RecipeReport() {
  const [users, setUsers] = useState([]);
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [filters, setFilters] = useState({
    createdBy: '',
    name: '',
    ingredients: ''
  });
  const [reportStats, setReportStats] = useState({ totalRecipes: 0 });

  useEffect(() => {
    // Fetch users for the dropdown
    axios.get('http://localhost:8081/users')
      .then(response => setUsers(response.data))
      .catch(error => console.error('Error fetching users:', error));
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const handleGenerateReport = () => {
    axios.get('http://localhost:8081/recipes/report', { params: filters })
      .then(response => {
        setFilteredRecipes(response.data.recipes);
        setReportStats({ totalRecipes: response.data.totalRecipes });
      })
      .catch(error => console.error('Error generating report:', error));
  };

  return (
    <div className='container'>
      <h1>Recipe Report</h1>
      <div>
        <label className="form-label">Created By:</label>
        <select className="form-control" name="createdBy" value={filters.createdBy} onChange={handleInputChange}>
          <option value="">All Users</option>
          {users.map(user => (
            <option key={user._id} value={user._id}>
              {user.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="form-label">Recipe Name:</label>
        <input
            className="form-control"
            type="text"
            name="name"
            value={filters.name}
            onChange={handleInputChange}
            placeholder="Search by recipe name"
        />
      </div>
      <div>
        <label className="form-label">Ingredients:</label>
        <input
            className="form-control"
            type="text"
            name="ingredients"
            value={filters.ingredients}
            onChange={handleInputChange}
            placeholder="Search by ingredients"
        />
      </div>
      <button onClick={handleGenerateReport} className="btn btn-primary">Generate Report</button>

      <h3>Report Summary</h3>
      <p>Total Recipes: {reportStats.totalRecipes}</p>

      <h3>Filtered Recipes</h3>
      <ul>
        {filteredRecipes.map(recipe => (
          <li key={recipe._id}>{recipe.name} - {recipe.ingredients.join(', ')}</li>
        ))}
      </ul>
    </div>
  );
}

export default RecipeReport;
