export function RouteGraphic({ label }: { label: string }) {
  return <svg className="route-line" viewBox="0 0 560 300" role="img" aria-label={label}>
    <path d="M42 238 C110 238 116 118 192 118 S267 236 342 236 422 64 520 64" fill="none" stroke="var(--yellow)" strokeWidth="7" strokeLinecap="round" />
    {[{x:42,y:238},{x:192,y:118},{x:342,y:236},{x:520,y:64}].map((point, index) => <g key={index}><circle cx={point.x} cy={point.y} r="17" fill="var(--ink)" stroke="var(--white)" strokeWidth="3"/><circle cx={point.x} cy={point.y} r={index === 3 ? 9 : 5} fill="var(--yellow)" /></g>)}
    <text x="36" y="275" fill="var(--white)" fontSize="13" fontFamily="Oxploria Mono">41°23′ N</text><text x="430" y="35" fill="var(--white)" fontSize="13" fontFamily="Oxploria Mono">2°10′ E</text>
  </svg>
}
