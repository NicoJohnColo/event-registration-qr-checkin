import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { PublicLayout } from './PublicLayout'
import { EventDetailsPage } from '../pages/EventDetailsPage'
import { EventsPage } from '../pages/EventsPage'
import { LandingPage } from '../pages/LandingPage'
import { PhaseComingSoonPage } from '../pages/PhaseComingSoonPage'

export function AppRouter() {
  return (
    <BrowserRouter>
      <PublicLayout>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/events/:id" element={<EventDetailsPage />} />
          <Route
            path="/events/:id/register"
            element={
              <PhaseComingSoonPage
                phase="Phase 3 · Registration Slice"
                title="Event Registration Form"
                description="Full name, email, and PH mobile validation + server capacity lock will be built in Phase 3."
              />
            }
          />
          <Route
            path="/lookup"
            element={
              <PhaseComingSoonPage
                phase="Phase 4 · Ticket & QR Lookup"
                title="Find My Ticket"
                description="Ticket lookup by ticket code and email will be built in Phase 4."
              />
            }
          />
          <Route
            path="/staff/login"
            element={
              <PhaseComingSoonPage
                phase="Phase 5 · Staff Authentication"
                title="Staff Sign In"
                description="Protected staff sign-in, check-in, and attendee list will be built in Phases 5–7."
              />
            }
          />
        </Routes>
      </PublicLayout>
    </BrowserRouter>
  )
}
