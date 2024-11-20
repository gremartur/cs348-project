import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function RecipeManager() {
  const [recipes, setRecipes] = useState([]);
  const [newRecipe, setNewRecipe] = useState({
    name: '',
    ingredients: '',
    instructions: '',
    createdBy: ''
  });
  const [users, setUsers] = useState([]);
  const [usernames, setUsernames] = useState({});
  const [message, setMessage] = useState('');
  const [editRecipeId, setEditRecipeId] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:8081/recipes')
      .then((response) => {
        const recipesData = Array.isArray(response.data) ? response.data : [];
        setRecipes(recipesData);

        recipesData.forEach(recipe => {
          if (recipe.createdBy) {
            axios.get(`http://localhost:8081/users/${recipe.createdBy}`)
              .then((res) => {
                setUsernames(prevUsernames => ({
                  ...prevUsernames,
                  [recipe.createdBy]: res.data.name
                }));
              })
              .catch((error) => console.error('Error fetching username:', error));
          }
        });
      })
      .catch((error) => console.error('Error fetching recipes:', error));

    axios.get('http://localhost:8081/users')
      .then((response) => {
        const usersData = Array.isArray(response.data) ? response.data : [];
        setUsers(usersData);
      })
      .catch((error) => console.error('Error fetching users:', error));
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewRecipe({ ...newRecipe, [name]: value });
    console.log("New Recipe Data:", { ...newRecipe, [name]: value }); // Debug log
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Check that `createdBy` is selected
    if (!newRecipe.createdBy) {
      setMessage("Please select a user for 'Created By'");
      return;
    }

    console.log("Submitting new recipe:", newRecipe); // Debug log

    if (editRecipeId) {
      // Update recipe
      axios.put(`http://localhost:8081/recipes/${editRecipeId}`, newRecipe)
        .then((response) => {
          setRecipes(recipes.map(r => r._id === editRecipeId ? response.data : r));
          setNewRecipe({ name: '', ingredients: '', instructions: '', createdBy: '' });
          setMessage('Recipe updated successfully!');
          setEditRecipeId(null);
        })
        .catch((error) => {
          console.error('Error updating recipe:', error);
          setMessage(`Error: ${error.response?.data?.error || 'Unknown error'}`);
        });
    } else {
      // Create new recipe
      axios.post('http://localhost:8081/recipes', newRecipe)
        .then((response) => {
          setRecipes([...recipes, response.data]);
          setNewRecipe({ name: '', ingredients: '', instructions: '', createdBy: '' });
          setMessage('Recipe created successfully!');
          window.location.reload();
        })
        .catch((error) => {
          console.error('Error creating recipe:', error);
          setMessage(`Error: ${error.response?.data?.error || 'Unknown error'}`);
        });
    }
  };

  const handleEdit = (recipe) => {
    setNewRecipe({
      name: recipe.name,
      ingredients: recipe.ingredients.join(', '),
      instructions: recipe.instructions,
      createdBy: recipe.createdBy
    });
    setEditRecipeId(recipe._id);
  };

  const handleDelete = (id) => {
    axios.delete(`http://localhost:8081/recipes/${id}`)
      .then(() => {
        setRecipes(recipes.filter((recipe) => recipe._id !== id));
      })
      .catch((error) => {
        console.error('Error deleting recipe:', error);
      });
  };

  return (
    <div className="container">
      <h1>Recipe Manager</h1>

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Name:</label>
          <input
            type="text"
            className="form-control"
            name="name"
            value={newRecipe.name}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Ingredients (comma-separated):</label>
          <input
            type="text"
            className="form-control"
            name="ingredients"
            value={newRecipe.ingredients}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Instructions:</label>
          <textarea
            className="form-control"
            name="instructions"
            value={newRecipe.instructions}
            onChange={handleInputChange}
            required
          ></textarea>
        </div>
        <div className="mb-3">
          <label className="form-label">Created By:</label>
          <select
            className="form-control"
            name="createdBy"
            value={newRecipe.createdBy}
            onChange={handleInputChange}
            required
          >
            <option value="">Select User</option>
            {users.map(user => (
              <option key={user._id} value={user._id}>
                {user.name}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="btn btn-primary">
          {editRecipeId ? 'Update Recipe' : 'Add Recipe'}
        </button>
      </form>

      {message && <p>{message}</p>}

      <h2>Recipe List</h2>
      <ul className="recipe-list">
        {recipes.map((recipe) => (
          <li key={recipe._id}>
            <strong>{recipe.name}</strong> - {recipe.ingredients.join(', ')}
            <p>{recipe.instructions}</p>
            <p className="createdBy"><strong>Created By:</strong> {usernames[recipe.createdBy] || 'Unknown'}</p>
            
            <div className="recipe-actions">
              <button className="btn btn-warning" onClick={() => handleEdit(recipe)}>Edit</button>
              <button className="btn btn-danger" onClick={() => handleDelete(recipe._id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default RecipeManager;
