import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import RegisterUser from './RegisterUser';
import RecipeManager from './RecipeManager';
import RecipeReport from './RecipeReport'; 

function App() {
  return (
    <Router>
      <div className="container">
        <nav className="mb-4">
          <Link to="/" className="me-3">Home</Link>
          <Link to="/register" className="me-3">Register</Link>
          <Link to="/report" className="me-3">Recipe Report</Link> 
        </nav>

        <Routes>
          <Route path="/" element={<RecipeManager />} />
          <Route path="/register" element={<RegisterUser />} />
          <Route path="/report" element={<RecipeReport />} />  
        </Routes>
      </div>
    </Router>
  );
}

export default App;


