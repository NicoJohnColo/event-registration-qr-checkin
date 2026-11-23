import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from '../features/auth'
import { EventDetailsPage } from '../pages/EventDetailsPage'
import { EventsPage } from '../pages/EventsPage'
import { HowItWorksPage } from '../pages/HowItWorksPage'
import { LandingPage } from '../pages/LandingPage'
import { RegisterPage } from '../pages/RegisterPage'
import { TicketLookupPage } from '../pages/TicketLookupPage'
import { TicketPage } from '../pages/TicketPage'
import { StaffCheckInPage } from '../pages/staff/StaffCheckInPage'
import { StaffLoginPage } from '../pages/staff/StaffLoginPage'
import { StaffPortalPlaceholderPage } from '../pages/staff/StaffPortalPlaceholderPage'
import { PublicLayout } from './PublicLayout'
import { StaffLayout } from './StaffLayout'

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/events/:id" element={<EventDetailsPage />} />
          <Route path="/events/:id/register" element={<RegisterPage />} />
          <Route path="/ticket/:code" element={<TicketPage />} />
          <Route path="/lookup" element={<TicketLookupPage />} />
        </Route>

        <Route path="/staff/login" element={<StaffLoginPage />} />
        <Route path="/login" element={<Navigate to="/staff/login" replace />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<StaffLayout />}>
            <Route path="/staff" element={<Navigate to="/staff/check-in" replace />} />
            <Route path="/staff/check-in" element={<StaffCheckInPage />} />
            <Route
              path="/staff/attendees"
              element={<StaffPortalPlaceholderPage section="attendees" />}
            />
            <Route
              path="/staff/events/:id/attendees"
              element={<StaffPortalPlaceholderPage section="attendees" />}
            />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
