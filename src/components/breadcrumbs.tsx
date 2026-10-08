import Link from 'next/link'

export function Breadcrumbs({ items, label = 'Breadcrumb' }: { items: { label: string; href?: string }[]; label?: string }) {
  return <nav className="breadcrumbs" aria-label={label}><ol>{items.map((item, index) => <li key={`${item.label}-${index}`}>{index > 0 && <span aria-hidden="true">/</span>}{item.href ? <Link href={item.href}>{item.label}</Link> : <span aria-current="page">{item.label}</span>}</li>)}</ol></nav>
}
