import { useNavigate } from 'react-router-dom'

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="d-flex flex-column align-items-center justify-content-center vh-100">
      <h1 className="mb-5">Recruitment Processing System</h1>
      <div className="d-flex gap-4">
        <button
          className="btn btn-primary btn-lg px-5 py-3"
          onClick={() => navigate('/login?role=EMPLOYER')}
        >
          I&apos;m an Employer
        </button>
        <button
          className="btn btn-success btn-lg px-5 py-3"
          onClick={() => navigate('/login?role=CANDIDATE')}
        >
          I&apos;m a Candidate
        </button>
      </div>
    </div>
  )
}
