import { Camera, CameraOff, CheckCircle2, RefreshCw, SwitchCamera } from 'lucide-react'
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
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment')

  const scannerRef = useRef<{
    pause: (shouldPauseVideo?: boolean) => void
    resume: () => void
    getState: () => number
    stop: () => Promise<void>
    clear: () => void
  } | null>(null)
  const stopChainRef = useRef<Promise<void>>(Promise.resolve())
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
        // Wait for any previous camera stop/clear teardown (e.g. Front <-> Back flip)
        await stopChainRef.current
        if (cancelled) return

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
          { facingMode },
          {
            fps: 10,
            qrbox: { width: 170, height: 170 },
            aspectRatio: 1,
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
      stopChainRef.current = stopSafely()
    }
  }, [active, disabled, regionId, retrySeed, facingMode, clearCooldown])

  if (!active) return null

  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'))
  }

  return (
    <div className="overflow-hidden rounded-[var(--radius-control)] border border-brand-sky bg-sky-50/55 p-2.5 sm:p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex h-6.5 w-6.5 shrink-0 items-center justify-center rounded-md bg-brand-primary/10 text-brand-primary">
            <Camera className="h-3.5 w-3.5" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-[11px] font-extrabold text-brand-navy sm:text-xs">
              Live QR Scanner · {facingMode === 'environment' ? 'Back Cam' : 'Front Cam'}
            </p>
            <p className="truncate text-[10.5px] text-brand-navy/70 sm:text-[11px]">
              {phase === 'starting' &&
                (facingMode === 'environment'
                  ? 'Starting back camera…'
                  : 'Starting front camera…')}
              {phase === 'scanning' && 'Align QR code inside frame'}
              {phase === 'cooldown' && 'Captured — readying next scan…'}
              {phase === 'error' && 'Camera paused — manual entry ready'}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={toggleFacingMode}
            title={
              facingMode === 'environment' ? 'Switch to front camera' : 'Switch to back camera'
            }
            aria-label={
              facingMode === 'environment' ? 'Switch to front camera' : 'Switch to back camera'
            }
            className="bg-white px-2"
          >
            <SwitchCamera className="h-3.5 w-3.5 text-brand-primary" />
            <span className="hidden min-[380px]:inline">Flip</span>
          </Button>

          <Button type="button" variant="outline" size="sm" onClick={onClose} className="bg-white px-2">
            <CameraOff className="h-3.5 w-3.5 text-brand-navy/70" />
            <span>Stop</span>
          </Button>
        </div>
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
        <div className="relative mx-auto h-[200px] w-full max-w-[300px] overflow-hidden rounded-[var(--radius-control)] border border-border bg-brand-navy/95 sm:h-[236px] sm:max-w-[340px]">
          <div
            id={regionId}
            className="h-full w-full [&>div]:!h-full [&>div]:!w-full [&_img]:hidden [&_video]:!h-full [&_video]:!w-full [&_video]:!rounded-[var(--radius-control)] [&_video]:!object-cover"
          />

          {phase === 'cooldown' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-brand-navy/80 p-3 text-center text-white backdrop-blur-xs">
              <CheckCircle2 className="h-6 w-6 text-brand-cyan" />
              <p className="text-[11px] font-extrabold tracking-wide sm:text-xs">
                Result captured — readying next scan…
              </p>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={resumeScanningNow}
                className="mt-0.5 bg-white text-brand-navy hover:bg-sky-50"
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
