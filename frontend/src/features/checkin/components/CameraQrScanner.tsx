import { Camera, CameraOff, CheckCircle2, RefreshCw } from 'lucide-react'
import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { Alert } from '../../../components/ui/Alert'
import { Button } from '../../../components/ui/Button'

interface CameraQrScannerProps {
  active: boolean
  disabled?: boolean
  onClose: () => void
  onScanPayload: (payload: string) => void
}

type ScannerPhase = 'starting' | 'scanning' | 'cooldown' | 'error'

const SCAN_COOLDOWN_MS = 2100

function mapCameraError(err: unknown): string {
  const raw = err instanceof Error ? `${err.name} ${err.message}`.toLowerCase() : String(err).toLowerCase()
  if (raw.includes('notallowed') || raw.includes('permission') || raw.includes('denied')) {
    return 'Camera permission was blocked. Allow camera access in browser settings or use manual ticket code entry above.'
  }
  if (raw.includes('notfound') || raw.includes('no camera') || raw.includes('overconstrained')) {
    return 'No usable camera was found on this device. Use manual ticket code entry above.'
  }
  if (raw.includes('notreadable') || raw.includes('in use') || raw.includes('trackstart')) {
    return 'Camera is currently in use by another app. Close the other app or use manual entry above.'
  }
  return 'Could not start camera scanner. Use manual ticket code entry above.'
}

/**
 * Mobile-ready live QR camera viewfinder powered by dynamically loaded `html5-qrcode`.
 * Holds scan result for ~2 seconds before automatically resuming for the next attendee.
 */
export function CameraQrScanner({
  active,
  disabled = false,
  onClose,
  onScanPayload,
}: CameraQrScannerProps) {
  const reactId = useId()
  const regionId = `qr-camera-${reactId.replace(/[^a-zA-Z0-9_-]/g, '')}`

  const [phase, setPhase] = useState<ScannerPhase>('starting')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [retrySeed, setRetrySeed] = useState(0)

  const scannerRef = useRef<{
    pause: (shouldPauseVideo?: boolean) => void
    resume: () => void
    getState: () => number
    stop: () => Promise<void>
    clear: () => void
  } | null>(null)
  const cooldownTimerRef = useRef<number | null>(null)
  const cooldownLockRef = useRef(false)
  const onScanRef = useRef(onScanPayload)

  useEffect(() => {
    onScanRef.current = onScanPayload
  }, [onScanPayload])

  const clearCooldown = useCallback(() => {
    if (cooldownTimerRef.current !== null) {
      window.clearTimeout(cooldownTimerRef.current)
      cooldownTimerRef.current = null
    }
    cooldownLockRef.current = false
  }, [])

  const resumeScanningNow = useCallback(() => {
    clearCooldown()
    const scanner = scannerRef.current
    if (scanner) {
      try {
        // Html5QrcodeScannerState.PAUSED === 3
        if (scanner.getState() === 3) {
          scanner.resume()
        }
      } catch {
        // Ignore state transition races if camera stopped
      }
    }
    setPhase('scanning')
  }, [clearCooldown])

  useEffect(() => {
    if (!active || disabled) {
      clearCooldown()
      return
    }

    const hostname = typeof window !== 'undefined' ? window.location.hostname : ''
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1'
    if (typeof window !== 'undefined' && !window.isSecureContext && !isLocalhost) {
      setPhase('error')
      setErrorMessage(
        'Camera scanning requires HTTPS (or localhost). Use manual ticket code entry above on plain HTTP.',
      )
      return
    }

    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setPhase('error')
      setErrorMessage('Camera API is unavailable in this browser. Use manual ticket code entry above.')
      return
    }

    let cancelled = false
    let startPromise: Promise<unknown> | null = null
    setPhase('starting')
    setErrorMessage(null)

    const boot = async () => {
      try {
        const { Html5Qrcode, Html5QrcodeSupportedFormats } = await import('html5-qrcode')
        if (cancelled) return

        const instance = new Html5Qrcode(regionId, {
          formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
          verbose: false,
        })
        scannerRef.current = instance

        const handleDecoded = (decodedText: string) => {
          const clean = decodedText.trim()
          if (!clean || cooldownLockRef.current || cancelled) {
            return
          }
          cooldownLockRef.current = true
          setPhase('cooldown')

          try {
            if (instance.getState() === 2) {
              instance.pause(true)
            }
          } catch {
            // Keep scanning lock even if pause fails
          }

          onScanRef.current(clean)

          cooldownTimerRef.current = window.setTimeout(() => {
            if (cancelled) return
            cooldownLockRef.current = false
            try {
              if (instance.getState() === 3) {
                instance.resume()
              }
            } catch {
              // Ignore if unmounted
            }
            setPhase('scanning')
          }, SCAN_COOLDOWN_MS)
        }

        startPromise = instance.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 210, height: 210 },
            aspectRatio: 1.333,
          },
          handleDecoded,
          () => {
            // Expected per-frame miss when no QR is in view
          },
        )

        await startPromise
        if (!cancelled) {
          setPhase('scanning')
        }
      } catch (err) {
        if (!cancelled) {
          setPhase('error')
          setErrorMessage(mapCameraError(err))
        }
      }
    }

    void boot()

    return () => {
      cancelled = true
      clearCooldown()
      const current = scannerRef.current
      scannerRef.current = null
      if (!current) return

      const stopSafely = async () => {
        if (startPromise) {
          try {
            await startPromise
          } catch {
            // Ignore startup failure on unmount
          }
        }
        try {
          const state = current.getState()
          if (state === 2 || state === 3) {
            await current.stop()
          }
        } catch {
          // Ignore stop race
        }
        try {
          current.clear()
        } catch {
          // Ignore DOM cleanup errors
        }
      }
      void stopSafely()
    }
  }, [active, disabled, regionId, retrySeed, clearCooldown])

  if (!active) return null

  return (
    <div className="overflow-hidden rounded-[var(--radius-card)] border border-brand-sky bg-sky-50/55 p-3 sm:p-3.5">
      <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-primary/10 text-brand-primary">
            <Camera className="h-4 w-4" />
          </span>
          <div>
            <p className="text-xs font-extrabold text-brand-navy">Live Camera QR Scanner</p>
            <p className="text-[11px] text-brand-navy/70">
              {phase === 'starting' && 'Requesting rear camera…'}
              {phase === 'scanning' && 'Point camera at an attendee QR pass'}
              {phase === 'cooldown' && 'Scanned — showing result for ~2 seconds…'}
              {phase === 'error' && 'Camera paused — manual entry ready above'}
            </p>
          </div>
        </div>

        <Button type="button" variant="outline" size="sm" onClick={onClose} className="bg-white">
          <CameraOff className="h-3.5 w-3.5 text-brand-navy/70" />
          <span>Stop Camera</span>
        </Button>
      </div>

      {phase === 'error' && errorMessage ? (
        <div className="space-y-2">
          <Alert tone="warning" title="Camera Scanner Unavailable">
            {errorMessage}
          </Alert>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setRetrySeed((s) => s + 1)}
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Retry Camera</span>
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={onClose} className="bg-white">
              <span>Use Manual Entry</span>
            </Button>
          </div>
        </div>
      ) : (
        <div className="relative overflow-hidden rounded-[var(--radius-control)] border border-border bg-brand-navy/95">
          <div
            id={regionId}
            className="mx-auto min-h-[220px] w-full max-w-[360px] [&_img]:hidden [&_video]:!w-full [&_video]:!rounded-[var(--radius-control)] [&_video]:object-cover"
          />

          {phase === 'cooldown' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-brand-navy/80 p-4 text-center text-white backdrop-blur-xs">
              <CheckCircle2 className="h-7 w-7 text-brand-cyan" />
              <p className="text-xs font-extrabold tracking-wide">
                Result captured — readying next scan…
              </p>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={resumeScanningNow}
                className="mt-1 bg-white text-brand-navy hover:bg-sky-50"
              >
                <span>Scan Next Now</span>
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
