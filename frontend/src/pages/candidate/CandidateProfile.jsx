import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios.js'

function CandidateNavbar() {
  const navigate = useNavigate()
  function logout() { localStorage.clear(); navigate('/') }
  return (
    <nav className="navbar navbar-expand-lg navbar-dark px-4" style={{ backgroundColor: '#0f172a' }}>
      <span className="navbar-brand fw-bold" style={{ color: '#60a5fa', letterSpacing: '-0.5px' }}>RecPro</span>
      <div className="navbar-nav ms-auto d-flex flex-row gap-3">
        <button className="btn btn-link text-white text-decoration-none" onClick={() => navigate('/candidate/profile')}>Profile</button>
        <button className="btn btn-link text-white text-decoration-none" onClick={() => navigate('/candidate/jobs')}>Job Search</button>
        <button className="btn btn-link text-white text-decoration-none" onClick={() => navigate('/candidate/applications')}>My Applications</button>
        <button className="btn btn-outline-light btn-sm" onClick={logout}>Logout</button>
      </div>
    </nav>
  )
}

export default function CandidateProfile() {
  const [profile, setProfile] = useState(null)
  const [msg, setMsg] = useState({ text: '', type: '' })

  useEffect(() => {
    api.get('/candidate/profile').then(r => setProfile(r.data)).catch(() => setProfile({}))
  }, [])

  function setField(field, value) {
    setProfile(p => ({ ...p, [field]: value }))
  }

  function setSkill(i, key, value) {
    const skills = [...(profile.skills || [])]
    skills[i] = { ...skills[i], [key]: value }
    setField('skills', skills)
  }

  function addSkill() {
    setField('skills', [...(profile.skills || []), { skillName: '', proficiency: '' }])
  }

  function removeSkill(i) {
    setField('skills', profile.skills.filter((_, idx) => idx !== i))
  }

  function setListItem(key, i, value) {
    const arr = [...(profile[key] || [])]
    arr[i] = value
    setField(key, arr)
  }

  function addListItem(key) {
    setField(key, [...(profile[key] || []), ''])
  }

  function removeListItem(key, i) {
    setField(key, profile[key].filter((_, idx) => idx !== i))
  }

  async function handleSave(e) {
    e.preventDefault()
    setMsg({ text: '', type: '' })
    try {
      await api.put('/candidate/profile', profile)
      setMsg({ text: 'Profile saved successfully!', type: 'success' })
    } catch {
      setMsg({ text: 'Failed to save profile.', type: 'danger' })
    }
  }

  if (!profile) return <><CandidateNavbar /><div className="container mt-4">Loading...</div></>

  return (
    <>
      <CandidateNavbar />
      <div className="container mt-4" style={{ maxWidth: '700px' }}>
        <h4 className="mb-4">My Profile</h4>
        {msg.text && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}
        <form onSubmit={handleSave}>
          <h6 className="text-muted mt-3 mb-2">Personal</h6>
          {[['fullName','Full Name'],['phone','Phone'],['dob','Date of Birth'],['gender','Gender'],['address','Address']].map(([k,l]) => (
            <div className="mb-3" key={k}>
              <label className="form-label">{l}</label>
              <input className="form-control" value={profile[k] || ''} onChange={e => setField(k, e.target.value)} />
            </div>
          ))}

          <h6 className="text-muted mt-3 mb-2">Academic</h6>
          {[['degree','Degree'],['institution','Institution'],['yearOfPassing','Year of Passing'],['percentage','Percentage'],['totalExpYrs','Total Experience (Yrs)']].map(([k,l]) => (
            <div className="mb-3" key={k}>
              <label className="form-label">{l}</label>
              <input className="form-control" value={profile[k] || ''} onChange={e => setField(k, e.target.value)} />
            </div>
          ))}

          <h6 className="text-muted mt-3 mb-2">Salary Expectations</h6>
          <div className="row">
            <div className="col mb-3">
              <label className="form-label">Min (₹)</label>
              <input type="number" className="form-control" value={profile.expectedSalMin || ''} onChange={e => setField('expectedSalMin', e.target.value)} />
            </div>
            <div className="col mb-3">
              <label className="form-label">Max (₹)</label>
              <input type="number" className="form-control" value={profile.expectedSalMax || ''} onChange={e => setField('expectedSalMax', e.target.value)} />
            </div>
          </div>

          <h6 className="text-muted mt-3 mb-2">Skills</h6>
          {(profile.skills || []).map((s, i) => (
            <div className="d-flex gap-2 mb-2" key={i}>
              <input className="form-control" placeholder="Skill" value={s.skillName || ''} onChange={e => setSkill(i, 'skillName', e.target.value)} />
              <input className="form-control" placeholder="Proficiency" value={s.proficiency || ''} onChange={e => setSkill(i, 'proficiency', e.target.value)} />
              <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => removeSkill(i)}>✕</button>
            </div>
          ))}
          <button type="button" className="btn btn-outline-secondary btn-sm mb-3" onClick={addSkill}>+ Add Skill</button>

          <h6 className="text-muted mt-3 mb-2">Location Preferences</h6>
          {(profile.locationPrefs || []).map((v, i) => (
            <div className="d-flex gap-2 mb-2" key={i}>
              <input className="form-control" value={v} onChange={e => setListItem('locationPrefs', i, e.target.value)} />
              <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => removeListItem('locationPrefs', i)}>✕</button>
            </div>
          ))}
          <button type="button" className="btn btn-outline-secondary btn-sm mb-3" onClick={() => addListItem('locationPrefs')}>+ Add Location</button>

          <h6 className="text-muted mt-3 mb-2">Role Preferences</h6>
          {(profile.rolePrefs || []).map((v, i) => (
            <div className="d-flex gap-2 mb-2" key={i}>
              <input className="form-control" value={v} onChange={e => setListItem('rolePrefs', i, e.target.value)} />
              <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => removeListItem('rolePrefs', i)}>✕</button>
            </div>
          ))}
          <button type="button" className="btn btn-outline-secondary btn-sm mb-3" onClick={() => addListItem('rolePrefs')}>+ Add Role</button>

          <div className="mt-4">
            <button type="submit" className="btn btn-primary">Save Profile</button>
          </div>
        </form>
      </div>
    </>
  )
}
