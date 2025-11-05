# PRD: Alex Adriano Portfolio — MVP Front Page

**Author:** John Mark Adriano  
**Hosting Target:** GitHub Pages  
**Primary Stack:** Pure HTML, CSS, and vanilla JS  
**Progressive Enhancement (optional):** GSAP or WebGL tilt for smoother motion

---

## 1) Project Summary
Create a minimalist, cinematic portfolio for **Alex Adriano**, Filipino fashion designer based in Dubai. The landing page is a scrolling or sliding gallery of collections that mimics the provided reference look: dark canvas, central 3D cards, subtle motion, and crisp typography. Top navigation links to About and Contact.

---

## 2) Goals
- Showcase collections with a 3D-style gallery that the user can scroll or click through.
- Keep the code simple for GitHub Pages: no build tools and no server.
- Make the site fast, responsive, and accessible.
- Include About and Contact pages reachable from the top menu.

---

## 3) Pages and Navigation
- **Home**: 3D gallery of collections with title and prev/next controls.
- **About**: Bio and portrait, optional client logos.
- **Contact**: Email link and a simple form that submits via `mailto:` or Formspree.

**Top Nav:** Logo at left, links at right: Home, About, Contact.  
**Mobile:** Collapsible menu icon that reveals links.

---

## 4) Visual Direction
- **Background:** Solid black `#000`.
- **Cards:** 5 to 7 images in the viewport. Center card is largest. Left and right cards are rotated with CSS transforms for depth.
- **Typography:** Bold geometric sans for titles, neutral sans for body. Use system fonts or a single hosted font from Google Fonts to avoid heavy bundles.
- **Hover/Focus:** Slight scale up and brightness increase on the active card.
- **Controls:** Subtle “PREV” and “NEXT” text buttons at the lower corners.

---

## 5) Content
### 5.1 Bio (About page)
Use this copy verbatim:

I am a Filipino fashion designer currently residing in Dubai, UAE. I specialize in kidswear and am currently looking for avenues where I can expand to sportswear. My long years of experience allow me to understand and adapt to the needs of the industry.

For me, fashion is a sharing discipline which favors being open and being able to change through the trends. This is why it is essential to be a lookout for trends and changes in the industry. For me, it is also a top priority to participate in various collaborations that go beyond borders and culture that is parallel to my work in the industry.

After more than 15 years of experience, I am now more eager for newer and harder challenges. I work effortlessly to diversify my artistic and technical skills and experience. And now, I feel more than ever ready to go further in this process by finding projects and collaborations abroad.

I love meeting new people and collaborating with new faces in different artistic projects. Feel free to contact me about any questions, proposals, or potential collaborations!

### 5.2 Assets from repo
- `/assets/logo.png`
- `/assets/gallery/*.jpg` collections or projects
- `/assets/profile.jpg` Alex portrait
- `/assets/clients/*.png` optional client logos

---

## 6) Information Architecture and File Tree
/
├─ index.html # Home with gallery
├─ about.html # Bio and portrait
├─ contact.html # Email and simple form
├─ /assets/
│ ├─ logo.png
│ ├─ profile.jpg
│ ├─ /gallery/
│ │ ├─ collection-01.jpg
│ │ ├─ collection-02.jpg
│ │ └─ ...
│ └─ /clients/
│ ├─ client-01.png
│ └─ ...
├─ /css/
│ └─ styles.css
└─ /js/
└─ app.js

---

## 7) Interactions and Behavior
### 7.1 Gallery
- **Layout:** Card strip centered on the page. The active card is centered and scaled to 1.0. Adjacent cards are scaled to 0.85 with `rotateY` and `translateX` to mimic depth.
- **Navigation:** Mouse wheel triggers a smooth snap to the next or previous card. Prev and Next buttons do the same. On mobile, drag or swipe horizontally.
- **Keyboard:** Left and Right arrows step the gallery.
- **Performance:** Use `transform` and `will-change: transform` to keep 60 fps. Use `requestAnimationFrame` for custom animation ticks.

### 7.2 Progressive Enhancement (optional)
- If GSAP is added, use it only to tween transforms and opacity. The base must work with vanilla JS and CSS transitions.
- No WebGL requirement for MVP. Optional tilt effect on hover can be added later.

---

## 8) Accessibility and SEO
- Semantic HTML: `header`, `nav`, `main`, `section`, `footer`.
- Each card has descriptive `alt` text. Use project titles in `aria-label` and `alt`.
- Focus states visible on all interactive elements.
- Skip link to main content.
- Titles and meta descriptions per page. Open Graph tags on Home.

---

## 9) CSS Requirements
- Mobile first. Breakpoints around 768px and 1200px.
- Use CSS variables for colors and spacing.
- Example card transforms:
  - Center: `transform: translateZ(0) scale(1)`
  - Left: `transform: translateX(-20vw) rotateY(12deg) scale(0.85)`
  - Right: `transform: translateX(20vw) rotateY(-12deg) scale(0.85)`
- Smooth transitions: `transition: transform 450ms ease, opacity 450ms ease, filter 450ms ease`
- Respect prefers-reduced-motion. If set, disable animations and show a simple horizontal slider.

---

## 10) JavaScript Requirements
- No frameworks. One `app.js` module.
- Build an array of gallery items by querying `.js-card` elements on `DOMContentLoaded`.
- Maintain `currentIndex`. On wheel or swipe, clamp and update transforms.
- Debounce wheel input to avoid skipping multiple cards.
- Add keyboard listeners. Add focus management so tabbing moves through controls and cards.
- Lazy load offscreen images with `loading="lazy"` and intersection observer to add a `is-visible` class.

---

## 11) Contact Page
- Present email as a link: `mailto:hello@alexadriano.com`
- Simple form with `name`, `email`, `message`
  - Default action: `mailto:` fallback
  - Optional: Formspree endpoint if provided later
- Include Instagram and LinkedIn icons if available in repo.

---

## 12) Acceptance Criteria
- [ ] Site runs on GitHub Pages with no build step.
- [ ] Gallery shows at least 5 images from `/assets/gallery/`.
- [ ] Prev and Next buttons work by click and keyboard.
- [ ] Mouse wheel or swipe advances one card at a time with snap.
- [ ] About page shows full bio and portrait.
- [ ] Contact page shows email and working simple form.
- [ ] All images have alt text. Focus states are visible.
- [ ] Mobile layout retains a readable carousel and working nav.
- [ ] Performance is smooth. Main thread work is minimal. No layout thrash.

---

## 13) Milestones
1. **MVP Skeleton**  
   Static pages, nav, basic layout and typography.
2. **Gallery Mechanics**  
   Card transforms, snap, prev/next, keyboard, lazy loading.
3. **Polish**  
   Hover states, brightness shift, reduced motion support, SEO tags.
4. **QA and Deploy**  
   Test on Chrome, Safari, iOS Safari, Android Chrome. Push to `main` and enable GitHub Pages.

---

## 14) Example HTML Snippets

### 14.1 Home gallery structure
```html
<main id="gallery" aria-label="Featured collections">
  <button class="nav-btn nav-prev" aria-label="Previous">PREV</button>

  <ul class="cards" role="list">
    <li class="card js-card is-active">
      <img src="/assets/gallery/collection-01.jpg" alt="Collection 1 title" loading="eager" />
      <h2 class="card-title">Collection 1</h2>
    </li>
    <li class="card js-card">
      <img src="/assets/gallery/collection-02.jpg" alt="Collection 2 title" loading="lazy" />
      <h2 class="card-title">Collection 2</h2>
    </li>
    <!-- more cards -->
  </ul>

  <button class="nav-btn nav-next" aria-label="Next">NEXT</button>
</main>
14.2 Contact form minimal
<form class="contact-form" action="mailto:hello@alexadriano.com" method="post" enctype="text/plain">
  <label>
    Name
    <input type="text" name="name" required />
  </label>
  <label>
    Email
    <input type="email" name="email" required />
  </label>
  <label>
    Message
    <textarea name="message" rows="5" required></textarea>
  </label>
  <button type="submit">Send</button>
</form>
