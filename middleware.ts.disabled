import { withAuth } from "next-auth/middleware"

export default withAuth(
  function middleware(req) {
    // Add any additional middleware logic here
    console.log("Protected route accessed:", req.nextUrl.pathname)
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl
        
        // Public routes - no auth required
        if (pathname === '/') {
          return true
        }
        
        // Always allow access to auth pages
        if (pathname.startsWith('/auth/')) {
          return true
        }
        
        // Allow access to API routes (they handle their own auth)
        if (pathname.startsWith('/api/')) {
          return true
        }
        
        // Allow access to static files and images
        if (pathname.startsWith('/_next/') || 
            pathname.startsWith('/images/') || 
            pathname.startsWith('/models/') ||
            pathname.includes('.')) {
          return true
        }
        
        // For all other routes, require authentication
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files (images, models, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|glb|gltf)$).*)",
  ],
} 