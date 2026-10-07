import { Compass } from 'lucide-react'

export function EmptyState({ title, body, action }: { title: string; body: string; action?: React.ReactNode }) {
  return <div className="empty-state"><Compass size={34} aria-hidden="true" /><h3>{title}</h3><p className="muted">{body}</p>{action}</div>
}
