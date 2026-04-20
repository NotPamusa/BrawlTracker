1. Project Architecture & Stack
The application is a full-stack web app built with a "Serverless First" approach to maintain zero costs and high quality.
Framework: Next.js (App Router) with TypeScript and Tailwind CSS.
Hosting: Vercel (Hobby). All logic must fit within 1 million monthly function invocations.
Database & Auth: Supabase. 
Development Environment: Developed on macOS, using AntiGravity IDE.

2. The Official API & RoyaleAPI Proxy
The most critical technical hurdle is Supercell’s static IP requirement. Since Vercel uses dynamic IPs, you are routing all requests through the RoyaleAPI proxy.
API Whitelist: The official Brawl Stars API key is whitelisted for the proxy IP: 45.79.218.79.
Base URL: Instead of api.brawlstars.com, the agent must use https://bsproxy.royaleapi.dev/v1/.
Tag Pre-processing: Player tags (e.g., #98VC8YUR) must be converted to uppercase, stripped of the #, and then URL-encoded as %23 before being appended to the endpoint (e.g., /players/%2398VC8YUR).
Secure Routing: The agent must never call the Brawl API from the client (browser). It must use a Next.js API Route (e.g., /app/api/brawl/route.ts) to attach the Authorization: Bearer header securely using the BRAWL_API_KEY environment variable.

3. Database Schema Context
The agent should work with the following tables created via your Supabase SQL setup:
profiles: Links the Supabase auth.uid() to a player_tag (Primary identity).

resource_entries: A ledger of manual inputs.
-coins: (Integer) Manually entered count.
-power_points: (Integer) Manually entered count.
-created_at: (Timestamp) Automatic, used to calculate time deltas between entries.

Security Note: RLS is enabled. The agent must use the Supabase Auth context to ensure users only SELECT or INSERT rows where user_id = auth.uid().

5. Environment Variables Configuration
The agent should assume the following variables are available in .env.local and Vercel:
NEXT_PUBLIC_SUPABASE_URL: Your Supabase Project URL.
NEXT_PUBLIC_SUPABASE_ANON_KEY: The Publishable/Anon key from your Supabase dashboard.
BRAWL_API_KEY: Your private key from the Supercell portal (Server-side only).

6. Implementation Strategy for the Agent
UI/UX: Use Tailwind for a "Brawl-themed" dashboard (yellow/blue accents, heavy rounded corners).
State Management: Use standard React hooks (useState, useEffect) to handle player data and "Free to Play vs. Brawl Pass" toggles.
Input Frequency: Recommend the agent implement a "Last Updated" display to encourage users to log their resources frequently for more accurate rate calculations.
