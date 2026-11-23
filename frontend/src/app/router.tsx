import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { PublicLayout } from './PublicLayout'
import { EventDetailsPage } from '../pages/EventDetailsPage'
import { EventsPage } from '../pages/EventsPage'
import { HowItWorksPage } from '../pages/HowItWorksPage'
import { LandingPage } from '../pages/LandingPage'
import { PhaseComingSoonPage } from '../pages/PhaseComingSoonPage'
import { RegisterPage } from '../pages/RegisterPage'
import { TicketLookupPage } from '../pages/TicketLookupPage'
import { TicketPage } from '../pages/TicketPage'

export function AppRouter() {
  return (
    <BrowserRouter>
      <PublicLayout>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/events/:id" element={<EventDetailsPage />} />
          <Route path="/events/:id/register" element={<RegisterPage />} />
          <Route path="/ticket/:code" element={<TicketPage />} />
          <Route path="/lookup" element={<TicketLookupPage />} />
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
