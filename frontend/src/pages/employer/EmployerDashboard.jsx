import { useNavigate } from 'react-router-dom';

function EmployerDashboard() {
  const navigate = useNavigate();
  const name = localStorage.getItem('name') || 'Employer';

  function handleLogout() {
    localStorage.clear();
    navigate('/login');
  }

  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-4">
        <span className="navbar-brand fw-bold">RecruitPro</span>
        <div className="navbar-nav">
          <button className="btn btn-link nav-link text-white" onClick={() => navigate('/employer/vacancies')}>Vacancies</button>
          <button className="btn btn-link nav-link text-white" onClick={() => navigate('/employer/applications')}>Applications</button>
          <button className="btn btn-link nav-link text-white" onClick={() => navigate('/employer/interviews')}>Interviews</button>
          <button className="btn btn-link nav-link text-white" onClick={() => navigate('/employer/search')}>Search Candidates</button>
          <button className="btn btn-outline-light ms-3" onClick={handleLogout}>Logout</button>
        </div>
      </nav>
      <div className="container mt-5">
        <h2>Welcome, {name}!</h2>
        <p className="text-muted">Use the navigation bar to manage vacancies, review applications, and find candidates.</p>
      </div>
    </div>
  );
}

export default EmployerDashboard;
