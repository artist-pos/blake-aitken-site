'use client'

import { useState, useRef } from 'react'
import { track } from '@vercel/analytics'

interface FormState {
  status: 'idle' | 'submitting' | 'success' | 'error'
  message: string
}

const inputStyle: React.CSSProperties = {
  display: 'block',
  width: '100%',
  padding: '10px 12px',
  fontSize: '13px',
  color: '#1a1a1a',
  backgroundColor: '#ffffff',
  border: '1px solid rgba(0,0,0,0.15)',
  outline: 'none',
  transition: 'border-color 150ms',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '11px',
  fontWeight: 400,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  color: '#1a1a1a',
  marginBottom: '6px',
}

interface FieldProps {
  label: string
  name: string
  type?: string
  required?: boolean
  disabled?: boolean
}

function Field({ label, name, type = 'text', required, disabled }: FieldProps) {
  const [focused, setFocused] = useState(false)
  return (
    <div>
      <label htmlFor={name} style={labelStyle}>
        {label}
        {required && <span style={{ color: '#888888' }}> *</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        disabled={disabled}
        style={{
          ...inputStyle,
          borderColor: focused ? '#1a1a1a' : 'rgba(0,0,0,0.15)',
          opacity: disabled ? 0.5 : 1,
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    </div>
  )
}

function TextAreaField({ label, name, required, disabled }: Omit<FieldProps, 'type'>) {
  const [focused, setFocused] = useState(false)
  return (
    <div>
      <label htmlFor={name} style={labelStyle}>
        {label}
        {required && <span style={{ color: '#888888' }}> *</span>}
      </label>
      <textarea
        id={name}
        name={name}
        required={required}
        disabled={disabled}
        rows={5}
        style={{
          ...inputStyle,
          resize: 'vertical',
          borderColor: focused ? '#1a1a1a' : 'rgba(0,0,0,0.15)',
          opacity: disabled ? 0.5 : 1,
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    </div>
  )
}

export default function ContactForm() {
  const [state, setState] = useState<FormState>({ status: 'idle', message: '' })
  const [cooldown, setCooldown] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (cooldown) return

    const data = new FormData(e.currentTarget)
    const body = {
      name: data.get('name') as string,
      email: data.get('email') as string,
      subject: data.get('subject') as string,
      message: data.get('message') as string,
    }

    setState({ status: 'submitting', message: '' })

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const json = await res.json()

      if (!res.ok) throw new Error(json.error ?? 'Submission failed')

      track('contact_form_submit')
      setState({ status: 'success', message: 'Message sent. I\'ll be in touch.' })
      formRef.current?.reset()
      setCooldown(true)
      setTimeout(() => setCooldown(false), 30000)
    } catch (err) {
      setState({
        status: 'error',
        message: err instanceof Error ? err.message : 'Something went wrong.',
      })
    }
  }

  const disabled = state.status === 'submitting' || state.status === 'success'

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
        <Field label="Name" name="name" required disabled={disabled} />
        <Field label="Email" name="email" type="email" required disabled={disabled} />
      </div>
      <Field label="Subject" name="subject" disabled={disabled} />
      <TextAreaField label="Message" name="message" required disabled={disabled} />

      <div className="flex flex-col gap-3">
        <button
          type="submit"
          disabled={disabled || cooldown}
          style={{
            display: 'inline-block',
            padding: '12px 24px',
            fontSize: '12px',
            fontWeight: 500,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: '#ffffff',
            backgroundColor: disabled || cooldown ? '#888888' : '#000000',
            border: 'none',
            cursor: disabled || cooldown ? 'not-allowed' : 'pointer',
            transition: 'opacity 150ms',
            alignSelf: 'flex-start',
          }}
          onMouseEnter={(e) => {
            if (!disabled && !cooldown)
              (e.currentTarget as HTMLElement).style.opacity = '0.8'
          }}
          onMouseLeave={(e) => {
            ;(e.currentTarget as HTMLElement).style.opacity = '1'
          }}
        >
          {state.status === 'submitting' ? 'Sending…' : 'Send Message'}
        </button>

        {state.message && (
          <p
            style={{
              fontSize: '12px',
              color: state.status === 'success' ? '#1a1a1a' : '#cc0000',
              letterSpacing: '0.02em',
            }}
          >
            {state.message}
          </p>
        )}
      </div>
    </form>
  )
}
