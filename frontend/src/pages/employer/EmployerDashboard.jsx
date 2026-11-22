import { useNavigate } from 'react-router-dom';
import { FaBriefcase, FaUsers, FaCalendarCheck, FaSearch } from 'react-icons/fa';

function EmployerDashboard() {
  const navigate = useNavigate();
  const name = localStorage.getItem('name') || 'Employer';

  function handleLogout() {
    localStorage.clear();
    navigate('/login');
  }

  const quickActions = [
    {
      icon: <FaBriefcase size={36} color="#2563eb" />,
      label: 'Manage Vacancies',
      path: '/employer/vacancies',
    },
    {
      icon: <FaUsers size={36} color="#10b981" />,
      label: 'Applications',
      path: '/employer/applications',
    },
    {
      icon: <FaCalendarCheck size={36} color="#f59e0b" />,
      label: 'Interviews',
      path: '/employer/interviews',
    },
    {
      icon: <FaSearch size={36} color="#8b5cf6" />,
      label: 'Find Candidates',
      path: '/employer/search',
    },
  ];

  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-4">
        <span className="navbar-brand recpro-brand" style={{ color: '#fff', fontSize: '1.3rem' }}>RecPro</span>
        <div className="navbar-nav">
          <button className="btn btn-link nav-link text-white" onClick={() => navigate('/employer/vacancies')}>Vacancies</button>
          <button className="btn btn-link nav-link text-white" onClick={() => navigate('/employer/applications')}>Applications</button>
          <button className="btn btn-link nav-link text-white" onClick={() => navigate('/employer/interviews')}>Interviews</button>
          <button className="btn btn-link nav-link text-white" onClick={() => navigate('/employer/search')}>Search Candidates</button>
          <button className="btn btn-outline-light ms-3" onClick={handleLogout}>Logout</button>
        </div>
      </nav>
      <div className="container mt-5">
        <h2 className="mb-1">Welcome, {name}!</h2>
        <p className="text-muted mb-4">Here's a quick overview of your recruitment tools.</p>

        <div className="row g-4 mb-4">
          {quickActions.map(action => (
            <div className="col-md-3" key={action.label}>
              <div
                className="card recpro-card text-center p-4 h-100"
                style={{ cursor: 'pointer' }}
                onClick={() => navigate(action.path)}
              >
                <div className="mb-3">{action.icon}</div>
                <div className="fw-semibold">{action.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default EmployerDashboard;
