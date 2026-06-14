import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface Props {
  content: string
  className?: string
}

export default function MarkdownContent({ content, className }: Props) {
  return (
    <div
      className={className}
      style={{
        fontSize: '16px',
        lineHeight: 1.7,
        color: '#1a1a1a',
      }}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 style={{ fontSize: '20px', fontWeight: 500, marginBottom: '16px', marginTop: '32px' }}>{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 style={{ fontSize: '17px', fontWeight: 500, marginBottom: '12px', marginTop: '28px' }}>{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 style={{ fontSize: '15px', fontWeight: 500, marginBottom: '10px', marginTop: '24px' }}>{children}</h3>
          ),
          p: ({ children }) => (
            <p style={{ marginBottom: '16px' }}>{children}</p>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              style={{ color: '#1a1a1a', textDecoration: 'underline', textDecorationColor: 'rgba(0,0,0,0.3)' }}
              target={href?.startsWith('http') ? '_blank' : undefined}
              rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
            >
              {children}
            </a>
          ),
          strong: ({ children }) => <strong style={{ fontWeight: 500 }}>{children}</strong>,
          ul: ({ children }) => <ul style={{ paddingLeft: '20px', marginBottom: '16px', listStyleType: 'disc' }}>{children}</ul>,
          ol: ({ children }) => <ol style={{ paddingLeft: '20px', marginBottom: '16px' }}>{children}</ol>,
          li: ({ children }) => <li style={{ marginBottom: '6px' }}>{children}</li>,
          blockquote: ({ children }) => (
            <blockquote
              style={{
                borderLeft: '3px solid rgba(0,0,0,0.15)',
                paddingLeft: '20px',
                marginBottom: '16px',
                color: '#888888',
                fontStyle: 'italic',
              }}
            >
              {children}
            </blockquote>
          ),
          img: ({ src, alt }) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={src}
              alt={alt ?? ''}
              style={{ maxWidth: '100%', marginTop: '16px', marginBottom: '16px' }}
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
