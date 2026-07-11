import Link from 'next/link'

export default function ForbiddenPage() {
  return (
    <div className="forbidden-page">
      <div className="forbidden-card">
        <div className="forbidden-icon">🛑</div>
        <h1>403 Unauthorized</h1>
        <p>
          Your account does not have administrator or editor permissions. 
          Please contact the system owner if you believe this is an error.
        </p>
        <Link href="/login" className="btn btn-primary btn-lg">
          ← Back to Login
        </Link>
      </div>
    </div>
  )
}
