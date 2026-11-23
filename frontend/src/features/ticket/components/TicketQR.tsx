import { Check, Copy, Ticket } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { useEffect, useState } from 'react'

interface TicketQRProps {
  ticketCode: string
  caption?: string
}

export function TicketQR({
  ticketCode,
  caption = 'Show this QR code at the venue entrance',
}: TicketQRProps) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const timer = window.setTimeout(() => setCopied(false), 2000)
    return () => window.clearTimeout(timer)
  }, [copied])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(ticketCode)
      setCopied(true)
    } catch {
      // Clipboard API unavailable in non-HTTPS contexts
    }
  }

  return (
    <div className="flex flex-col items-center text-center">
      <div className="inline-flex items-center justify-center rounded-[var(--radius-card)] border border-border/80 bg-white p-2 shadow-xs">
        <QRCodeSVG
          value={ticketCode}
          size={136}
          level="M"
          fgColor="#000000"
          bgColor="#FFFFFF"
          marginSize={2}
          title={`QR code for ticket ${ticketCode}`}
        />
      </div>

      <p className="mt-2.5 text-[11px] font-bold uppercase tracking-[0.14em] text-brand-navy/70">
        Ticket Code
      </p>

      <div className="mt-1 inline-flex max-w-full flex-wrap items-center justify-center gap-2 rounded-[var(--radius-control)] border border-brand-sky bg-sky-50/75 px-2.5 py-1.5">
        <Ticket className="h-3.5 w-3.5 shrink-0 text-brand-primary" />
        <span className="font-code text-sm font-bold tracking-wider text-brand-navy sm:text-base">
          {ticketCode}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          aria-label={copied ? 'Ticket code copied' : 'Copy ticket code'}
          className="inline-flex h-10 min-h-[40px] items-center gap-1 rounded-[8px] border border-border/80 bg-white px-2.5 text-xs font-bold text-brand-navy transition-colors hover:border-brand-primary hover:text-brand-primary"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-status-green" />
              <span className="text-status-green">Copied</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      <p className="mt-2 text-xs text-brand-navy/75">{caption}</p>
    </div>
  )
}
