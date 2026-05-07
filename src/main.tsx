import React from 'react'
import ReactDOM from 'react-dom/client'

function App() {
  return (
    <div style={{padding: 40}}>
      <h1>GN Tracker Running ✅</h1>
      <p>Your Vercel deployment works.</p>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
