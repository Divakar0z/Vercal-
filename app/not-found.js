import Link from 'next/link'
export default function NotFound() {
  return <div className="wrap narrow"><h2>Page not found</h2><Link href="/" className="btn">Back to home</Link></div>
}
