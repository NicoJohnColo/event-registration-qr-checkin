import { Check, Copy, Maximize2, Minimize2, Ticket, X, ZoomIn } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

interface TicketQRProps {
  ticketCode: string
  qrPayload?: string | null
  caption?: string
  eventTitle?: string
  attendeeName?: string
}

export function TicketQR({
  ticketCode,
  qrPayload,
  caption = 'Show this QR code at the venue entrance',
  eventTitle,
  attendeeName,
}: TicketQRProps) {
  const [copied, setCopied] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [maxZoom, setMaxZoom] = useState(false)

  useEffect(() => {
    if (!copied) return
    const timer = window.setTimeout(() => setCopied(false), 2000)
    return () => window.clearTimeout(timer)
  }, [copied])

  useEffect(() => {
    if (!modalOpen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setModalOpen(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [modalOpen])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(ticketCode)
      setCopied(true)
    } catch {
      // Clipboard API unavailable in non-HTTPS contexts
    }
  }

  const qrValue = qrPayload || ticketCode

  return (
    <>
      <div className="flex flex-col items-center text-center">
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          aria-label={`Open enlarged QR code for ticket ${ticketCode}`}
          className="group relative inline-flex cursor-pointer items-center justify-center rounded-[var(--radius-card)] border border-border/80 bg-white p-2 shadow-xs transition-colors hover:border-brand-primary focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-brand-primary/25 sm:p-2.5"
        >
          <QRCodeSVG
            value={qrValue}
            size={144}
            level="M"
            fgColor="#000000"
            bgColor="#FFFFFF"
            marginSize={2}
            title={`QR code for ticket ${ticketCode}`}
          />
          <span className="absolute right-1.5 bottom-1.5 inline-flex h-6 w-6 items-center justify-center rounded-full border border-border bg-white/95 text-brand-primary shadow-xs transition-colors group-hover:bg-brand-primary group-hover:text-white">
            <ZoomIn className="h-3.5 w-3.5" />
          </span>
        </button>

        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="mt-2 inline-flex h-8 items-center gap-1.5 rounded-full border border-brand-sky bg-white px-3 text-xs font-bold text-brand-primary shadow-2xs transition-colors hover:border-brand-primary hover:bg-sky-50 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-brand-primary/20"
        >
          <ZoomIn className="h-3.5 w-3.5 shrink-0" />
          <span>Enlarge QR</span>
        </button>

        <p className="mt-2.5 text-xs font-bold uppercase tracking-[0.12em] text-brand-navy/70">
          Ticket Code
        </p>

        <div className="mt-1 inline-flex max-w-full flex-nowrap items-center justify-center gap-1.5 rounded-[var(--radius-control)] border border-brand-sky bg-sky-50/75 px-2.5 py-1 sm:gap-2">
          <Ticket className="h-3.5 w-3.5 shrink-0 text-brand-primary" />
          <span className="font-code whitespace-nowrap text-sm font-bold tracking-wider text-brand-navy sm:text-base">
            {ticketCode}
          </span>
          <button
            type="button"
            onClick={handleCopy}
            aria-label={copied ? 'Ticket code copied' : 'Copy ticket code'}
            className="inline-flex h-8 shrink-0 items-center gap-1 whitespace-nowrap rounded-[6px] border border-border/80 bg-white px-2.5 text-xs font-bold text-brand-navy transition-colors hover:border-brand-primary hover:text-brand-primary sm:h-8.5 sm:rounded-[8px]"
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

      {modalOpen &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`Enlarged QR code for ${ticketCode}`}
            className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-brand-navy/80 p-3 backdrop-blur-sm sm:p-4"
            onClick={() => setModalOpen(false)}
          >
            <div
              className="animate-modal-in relative my-auto flex max-h-[calc(100svh-1.5rem)] w-full max-w-[360px] flex-col items-center overflow-y-auto rounded-[18px] border border-border bg-white p-4 text-center shadow-2xl sm:p-5"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex w-full items-start justify-between gap-3">
                <div className="min-w-0 text-left">
                  <p className="section-eyebrow">Door Scan Pass</p>
                  {eventTitle && (
                    <p className="heading-card mt-0.5 truncate font-heading font-extrabold text-brand-navy">
                      {eventTitle}
                    </p>
                  )}
                  {attendeeName && (
                    <p className="truncate text-xs font-semibold text-brand-navy/70">{attendeeName}</p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  aria-label="Close enlarged QR pass"
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-page text-brand-navy transition-colors hover:border-brand-primary hover:text-brand-primary"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div
                className={`mt-3 flex w-full items-center justify-center rounded-[14px] border-2 border-brand-sky bg-white shadow-xs transition-all ${
                  maxZoom ? 'p-1.5' : 'p-2.5 sm:p-3.5'
                }`}
              >
                <QRCodeSVG
                  value={qrValue}
                  size={300}
                  level="M"
                  fgColor="#000000"
                  bgColor="#FFFFFF"
                  marginSize={maxZoom ? 1 : 2}
                  title={`Enlarged QR code for ticket ${ticketCode}`}
                  className={`h-auto w-full ${
                    maxZoom
                      ? 'max-w-[min(54svh,300px)]'
                      : 'max-w-[min(46svh,240px)]'
                  }`}
                />
              </div>

              <div className="mt-3 inline-flex max-w-full flex-nowrap items-center justify-center gap-2 rounded-[var(--radius-control)] border border-brand-sky bg-sky-50 px-3 py-1.5">
                <Ticket className="h-4 w-4 shrink-0 text-brand-primary" />
                <span className="font-code whitespace-nowrap text-base font-extrabold tracking-wider text-brand-navy sm:text-lg">
                  {ticketCode}
                </span>
                <button
                  type="button"
                  onClick={handleCopy}
                  aria-label={copied ? 'Ticket code copied' : 'Copy ticket code'}
                  className="inline-flex h-8 shrink-0 items-center gap-1 whitespace-nowrap rounded-[6px] border border-border bg-white px-2.5 text-xs font-bold text-brand-navy transition-colors hover:border-brand-primary hover:text-brand-primary"
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

              <div className="mt-3.5 grid w-full grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMaxZoom((prev) => !prev)}
                  className="inline-flex h-10 items-center justify-center gap-1.5 rounded-[var(--radius-control)] border border-brand-sky bg-sky-50/75 px-3 text-xs font-bold text-brand-primary transition-colors hover:bg-sky-100"
                >
                  {maxZoom ? (
                    <>
                      <Minimize2 className="h-3.5 w-3.5" />
                      <span>Standard Size</span>
                    </>
                  ) : (
                    <>
                      <Maximize2 className="h-3.5 w-3.5" />
                      <span>Zoom In More</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="inline-flex h-10 items-center justify-center rounded-[var(--radius-control)] bg-brand-navy px-3 text-xs font-bold text-white transition-colors hover:bg-brand-royal"
                >
                  Done
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  )
}
