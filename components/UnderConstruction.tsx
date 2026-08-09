/**
 * Full-screen holding page shown over the landing page while the site is being
 * rebuilt. Deliberately blank — no nav, no links, nothing to explore.
 *
 * Only the landing page renders this, so /info, /blog, /<project> and /admin
 * all stay reachable.
 */
export default function UnderConstruction() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        backgroundColor: '#f5f5f5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <p
        style={{
          fontSize: '13px',
          fontWeight: 400,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: '#1a1a1a',
          margin: 0,
          textAlign: 'center',
        }}
      >
        Under Construction
      </p>
    </div>
  )
}
