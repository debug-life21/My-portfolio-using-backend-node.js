// Subtle scroll reveal + back-to-top + mobile nav + scrollspy.

const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const $ = (sel, root = document) => root.querySelector(sel);

const year = $("#year");
if (year) year.textContent = String(new Date().getFullYear());

// Mobile nav
const toggle = $(".nav-toggle");
const links = $("#nav-links");
if (toggle && links) {
  toggle.addEventListener("click", () => {
    const isOpen = links.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  // Close on link click (mobile)
  $$("#nav-links a").forEach((a) => {
    a.addEventListener("click", () => {
      links.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });

  // Close on outside click / Esc (mobile)
  document.addEventListener("click", (e) => {
    if (!links.classList.contains("open")) return;
    const t = e.target;
    if (!(t instanceof Element)) return;
    if (links.contains(t) || toggle.contains(t)) return;
    links.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
  });

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (!links.classList.contains("open")) return;
    links.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.focus();
  });
}

// Reveal on scroll
const revealEls = $$(".reveal");
const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        const el = e.target;
        const delay = el.getAttribute("data-delay") || "0";
        setTimeout(() => {
          el.classList.add("in-view");
        }, Number(delay));
      }
    });
  },
  { threshold: 0.12 }
);

revealEls.forEach((el) => io.observe(el));

// Back to top
const backToTop = $("#backToTop");
const onScroll = () => {
  if (!backToTop) return;
  const show = window.scrollY > 600;
  backToTop.classList.toggle("show", show);
};
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

if (backToTop) {
  backToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

// Active nav link (scrollspy)
const sectionIds = ["services", "experience", "skills", "projects", "contact"];
const sections = sectionIds
  .map((id) => document.getElementById(id))
  .filter((el) => el instanceof HTMLElement);

const navAnchors = new Map(
  sectionIds
    .map((id) => [id, document.querySelector(`.nav-links a[href="#${id}"]`)])
    .filter(([, el]) => el instanceof HTMLAnchorElement)
);

const setActive = (id) => {
  navAnchors.forEach((a, key) => {
    if (!(a instanceof Element)) return;
    a.classList.toggle("active", key === id);
    if (key === id) a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  });
};

if (sections.length) {
  const spy = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => (a.intersectionRatio > b.intersectionRatio ? -1 : 1))[0];
      if (!visible) return;
      const id = visible.target.id;
      if (id) setActive(id);
    },
    { rootMargin: "-20% 0px -70% 0px", threshold: [0.05, 0.2, 0.35] }
  );

  sections.forEach((s) => spy.observe(s));
}

// --- የ API አድራሻን በራሱ የሚለይ ኮድ ---
const getBaseURL = () => {
    return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:5000'
        : 'https://my-portfolio-using-backend-node-js.onrender.com';
};

// Contact form submission
const contactForm = document.getElementById('contactForm');

if (contactForm) {
    contactForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // This stops the "email app" from opening

        const formData = {
            name: document.getElementById('full-name').value,
            email: document.getElementById('email-address').value,
            message: document.getElementById('user-message').value
        };

        try {
            // ተለዋዋጭ አድራሻን በመጠቀም መረጃ መላክ[cite: 4]
            const response = await fetch(`${getBaseURL()}/api/contact`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (response.ok) {
                alert("Success! Your message was saved to the database.");
                contactForm.reset(); // Clears the form[cite: 4]
            } else {
                alert("Server error: " + result.error);
            }
        } catch (error) {
            console.error("Connection failed:", error);
            alert("Could not connect to the backend server. Is it running?");
        }
    });
}

// Load projects from database
async function loadProjects() {
    try {
        // ተለዋዋጭ አድራሻን በመጠቀም ፕሮጀክቶችን መጫን[cite: 4]
        const response = await fetch(`${getBaseURL()}/api/projects`);
        const data = await response.json();
        console.log("Projects from database:", data);

        const projectsGrid = document.querySelector('.projects-grid');
        if (projectsGrid && Array.isArray(data)) {
            projectsGrid.innerHTML = data.map((project, idx) => `
              <article class="project${idx === 0 ? ' large' : idx === 1 ? ' wide' : ''} reveal" data-delay="${idx * 100}">
                <div class="thumb"></div>
                <div class="project-body">
                  <div class="project-num">${String(idx + 1).padStart(2, '0')}</div>
                  <div class="project-tags">
                    ${project.tags ? project.tags.split(',').map(tag => `<span class="tag">${tag.trim()}</span>`).join('') : ''}
                  </div>
                  <h3>${project.title}</h3>
                  <p>${project.description}</p>
                  <div class="project-links">
                    <a class="link" href="${project.link}" target="_blank">Live Visit</a>
                  </div>
                </div>
              </article>
            `).join('');
        }
    } catch (error) {
        console.error("Failed to load projects:", error);
    }
}

// ፕሮጀክቶቹ ገጹ ሲከፈት እንዲጫኑ ጥሪ ማድረግ
loadProjects();