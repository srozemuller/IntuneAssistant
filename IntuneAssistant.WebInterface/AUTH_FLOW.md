# Authentication & Onboarding Flow

## Overview

This document describes the streamlined authentication and onboarding flow that ensures users are properly registered before accessing the application.

## The Problem (Before)

Users were confused by the sign-in process:
- They would click "Sign In" and successfully authenticate
- Then immediately receive errors because their customer wasn't registered
- No clear guidance on what to do next
- Confusion between "sign in" and "onboarding/registration"

## The Solution (After)

### Unified Flow

1. **Single Entry Point**: User clicks "Sign In"
2. **Authentication**: MSAL handles Microsoft authentication
3. **Automatic Verification**: After auth, redirect to `/auth/verify`
4. **Smart Routing**: 
   - If customer exists → Dashboard
   - If customer doesn't exist → Onboarding page with clear instructions

### Flow Diagram

```
┌─────────────┐
│  Sign In    │
│   Button    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│    MSAL     │
│   Login     │
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│  /auth/verify       │
│  (New Page)         │
└──────┬──────────────┘
       │
       ├─── Check Customer Status
       │
       ├─── If Exists ──────────► Dashboard (/)
       │
       └─── If Not Exists ─────► Onboarding (/onboarding/customer)
                                  with clear message
```

## Implementation Details

### 1. Redirect URI Update

**File**: `lib/msalConfig.ts`

```typescript
redirectUri: `${window.location.origin}/auth/verify`
```

This ensures all successful logins redirect to the verification page.

### 2. Verification Page

**File**: `app/auth/verify/page.tsx`

**Purpose**: Automatically check if the user's customer is registered

**Features**:
- Calls `/customer/overview` API to check registration status
- Shows appropriate UI for each state:
  - **Checking**: Loading spinner
  - **Exists**: "Welcome back!" with auto-redirect
  - **Needs Onboarding**: Clear explanation with button
  - **Error**: Error message with retry option

**States**:
```typescript
type VerificationStatus = 
  | 'checking'           // Initial state, calling API
  | 'customer_exists'    // Registered, redirecting to dashboard
  | 'needs_onboarding'   // Not registered, show onboarding button
  | 'error';             // API error, show retry
```

### 3. Enhanced Onboarding Page

**File**: `app/onboarding/customer/page.tsx`

**Updates**:
- Clear "Registration Required" messaging
- Removed confusing "Why register?" link
- Blue theme for consistency
- Step-by-step process explanation
- Changed terminology from "customer" to "organization"

## User Experience

### First-Time User

1. Clicks "Sign In"
2. Completes Microsoft authentication
3. Lands on `/auth/verify`
4. Sees: "Registration Required" with explanation
5. Clicks "Start Onboarding"
6. Completes 4-step registration process
7. Can now use the application

### Returning User

1. Clicks "Sign In"
2. Completes Microsoft authentication
3. Lands on `/auth/verify`
4. Sees: "Welcome Back!" (1 second)
5. Automatically redirected to dashboard
6. Ready to use the application

### Error Handling

If verification fails:
- Shows clear error message
- Offers "Try Again" button
- Offers "Proceed to Onboarding" as alternative
- User is never stuck without options

## API Integration

### Customer Status Check

**Endpoint**: `GET /customer/overview`

**Success Response** (Customer exists):
```json
{
  "status": "Success",
  "data": {
    "id": "customer-guid",
    "isActive": true
  }
}
```

**Error Response** (Customer doesn't exist):
```json
{
  "status": "Error",
  "message": "Customer not found"
}
```

Or HTTP 404 status code.

## Configuration Required

### Azure AD App Registration

The redirect URI must be updated in your Azure AD app registration:

**Add**: `https://yourdomain.com/auth/verify`
**Dev**: `http://localhost:3000/auth/verify`

### Environment Variables

No changes required - uses existing configuration.

## Benefits

✅ **Clear User Journey** - No confusion about registration vs sign-in
✅ **Automatic Routing** - Users always land in the right place
✅ **Better Error Handling** - Clear messages and actionable options
✅ **Single Entry Point** - Just "Sign In" - system handles the rest
✅ **Professional UX** - Loading states, transitions, clear CTAs
✅ **No Dead Ends** - Always offers next steps

## Testing

### Test Scenarios

1. **New User Flow**
   - Clear browser cache/session
   - Click "Sign In"
   - Verify lands on `/auth/verify`
   - Verify shows "Registration Required"
   - Click "Start Onboarding"
   - Complete registration
   - Verify can access application

2. **Existing User Flow**
   - Sign out if already signed in
   - Click "Sign In"
   - Verify lands on `/auth/verify`
   - Verify shows "Welcome Back!"
   - Verify auto-redirects to dashboard

3. **Error Handling**
   - Simulate API error
   - Verify error message displays
   - Verify "Try Again" and "Proceed to Onboarding" buttons work

## Troubleshooting

### Issue: Redirect Loop

**Cause**: Redirect URI not configured in Azure AD
**Solution**: Add `/auth/verify` to redirect URIs in Azure AD app registration

### Issue: Stuck on Verification Page

**Cause**: API error or customer API not responding
**Solution**: Check browser console for errors, verify API endpoint is accessible

### Issue: Shows "Needs Onboarding" but Customer Exists

**Cause**: API not returning customer data correctly
**Solution**: Check API response format matches expected structure

## Future Enhancements

- [ ] Add progress bar during verification
- [ ] Cache verification result to avoid re-checking
- [ ] Add "Skip" option for development/testing
- [ ] Implement refresh token handling
- [ ] Add analytics tracking for each step

