# Backend Fix Required: Expose x-correlation-id Header

## Problem
The backend is sending the `x-correlation-id` header in responses, but JavaScript in the frontend **cannot read it** because it's not exposed via CORS.

## Current Behavior
- Browser receives the header: `x-correlation-id: 898ba0ec-e609-4fbe-acaf-54be9ae8d26a`
- JavaScript tries to read it: `response.headers.get('x-correlation-id')` returns `null`
- Frontend shows: `⚠️ No x-correlation-id header in compare API response`

## Root Cause
By default, browsers only allow JavaScript to read these CORS response headers:
- Cache-Control
- Content-Language  
- Content-Type
- Expires
- Last-Modified
- Pragma

All other headers (including `x-correlation-id`) must be **explicitly exposed** via the `Access-Control-Expose-Headers` CORS configuration.

## Solution
The backend needs to add `x-correlation-id` to the `Access-Control-Expose-Headers` configuration.

### For ASP.NET Core (likely your backend):

#### Option 1: In Program.cs or Startup.cs
```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "https://your-production-domain.com")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials()
              .WithExposedHeaders("x-correlation-id"); // Add this line
    });
});

// Later in the file:
app.UseCors("AllowFrontend");
```

#### Option 2: Add to existing CORS middleware
If you already have CORS configured, just add `.WithExposedHeaders("x-correlation-id")` to your existing policy.

#### Option 3: Expose multiple custom headers
```csharp
.WithExposedHeaders("x-correlation-id", "x-request-id", "x-custom-header")
```

## Verification
After applying the fix, the browser will include this header in the response:
```
Access-Control-Expose-Headers: x-correlation-id
```

And the frontend console will show:
```
=== ALL RESPONSE HEADERS (available via headers.entries()) ===
...
x-correlation-id: 898ba0ec-e609-4fbe-acaf-54be9ae8d26a
...
Final correlationId value: 898ba0ec-e609-4fbe-acaf-54be9ae8d26a
```

## Frontend Changes Already Complete
The frontend has been updated to:
1. Extract `x-correlation-id` from response headers
2. Store it separately for Compare, Migrate, and Verify steps  
3. Display it in three hidden columns in the summary table (show via Columns button)
4. Log detailed debugging information

## Testing After Backend Fix
1. Reload the frontend application
2. Upload a CSV and run Compare
3. Check browser console - you should see:
   - List of all available headers (including `x-correlation-id`)
   - `Final correlationId value:` with actual UUID value (not null)
4. After migrations complete, click Columns button in summary table
5. Enable "Corr ID (Compare)", "Corr ID (Migrate)", "Corr ID (Verify)" columns
6. Verify correlation IDs are populated (not "-")

## References
- [MDN: Access-Control-Expose-Headers](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Expose-Headers)
- [ASP.NET Core CORS Documentation](https://learn.microsoft.com/en-us/aspnet/core/security/cors)

