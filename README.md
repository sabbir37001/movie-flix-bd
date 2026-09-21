# Jannat Flix Stream

Act as a Senior Full-Stack Developer and UI/UX Expert. I want to build a highly professional, mobile-responsive, and SEO-friendly movie download and streaming website named "JANNAT FLIX". Use React, Tailwind CSS, Lucide Icons, shadcn/ui components, and integrate a real backend database using Supabase. 

Please build the application with the following core features and structured layout:

1. GLOBAL UI & DESIGN (Frontend):

- Theme: Deep Dark theme (similar to Netflix or professional streaming sites) with red/crimson accents.

- Responsive: Fully mobile-first design.

- SEO Friendly: Ensure semantic HTML tags (header, main, footer, article, nav).

2. HEADER & NAVIGATION:

- Top Header containing the Logo ("JANNAT FLIX") on the left.

- A functional Search bar in the middle.

- Navigation Menu with categories: All, Action, Adventure, Sci-Fi, Horror, Comedy, Romance, Thriller, Animation, Drama. (Make these horizontally scrollable on mobile).

3. HERO SECTION (Featured Movie):

- A large featured movie section at the top displaying a high-quality backdrop image.

- Show Movie Title, Rating, Year, and a short description.

- Two buttons: "▶ Watch Trailer" (Opens YouTube trailer in a modal or plays inline) and "⬇ Download Movie" (Redirects to Google Drive link).

4. ADVERTISEMENT BANNERS:

- Place placeholder spaces for horizontal ad banners (e.g., between the Hero section and Movie Grid, and another above the footer). 

- The banner images and redirect links must be dynamically fetched from the database so the admin can change them.

5. MOVIE GRID (Latest Movies):

- A responsive grid displaying movie posters.

- Each movie card should show the Poster, Title, Year, and Category.

- Clicking a movie card opens a detailed view (or modal) showing full details, the YouTube trailer embed, and the Google Drive download button. 

6. LIVE TV SECTION:

- Located below the movie grid. 

- Create two side-by-side video cards/spaces (e.g., "Live Sports" and "Live News").

- These will embed live YouTube channel iframes. The YouTube URLs must be fetched from the database dynamically.

7. FOOTER & DEVELOPER INFO:

- A clean footer with copyright text and useful links.

- Dedicated "Developer Info" section at the bottom right. Display details like Developer Name, WhatsApp Number, and Portfolio URL. This data must be fetched from the database so it can be edited from the admin panel.

8. BACKEND & DATABASE (Supabase Integration):

- Set up a real database schema (simulate this in your generated code so I can easily connect my Supabase project).

- Required Tables/Collections: 

  - `movies`: id, title, description, poster_url, backdrop_url, category, youtube_trailer_id, gdrive_download_link, release_year.

  - `ads`: id, position, image_url, target_link.

  - `settings`: id, dev_name, dev_whatsapp, dev_website, live_tv_1_url, live_tv_2_url.

9. ADMIN PANEL:

- Create a protected `/admin` route (with basic auth or simulated login).

- Provide a dashboard with tabs to manage:

  - Add/Edit/Delete Movies (Input fields for Title, category, Google Drive Link, YouTube Trailer ID, etc.).

  - Update Ad Banners (Update image URLs and links).

  - Update Live TV YouTube URLs.

  - Update Developer Info (Name, WhatsApp number).

Generate a complete, working prototype that perfectly matches a modern streaming hub aesthetic. Focus on high-quality UI components and ensure the connection logic for the Supabase backend is clearly structured in the codebase.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://jannat-flix-stream.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/8749a780-ac14-4942-9434-b326eb947d13).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
