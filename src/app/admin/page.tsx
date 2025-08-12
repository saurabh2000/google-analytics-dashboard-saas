import { redirect } from 'next/navigation'

export default function AdminRedirect() {
  // Server-side redirect to dashboard
  redirect('/admin/dashboard')
}