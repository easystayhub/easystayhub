const header = document.getElementById("header");
const navToggle = document.getElementById("navToggle");
const siteNav = document.getElementById("siteNav");
const counters = document.querySelectorAll(".counter");
const bookingForm = document.getElementById("bookingForm");
const bookingMessage = document.getElementById("bookingMessage");
const testimonials = Array.from(document.querySelectorAll(".testimonial"));
const dotsContainer = document.getElementById("testimonialDots");
const hotelGrid = document.getElementById("hotelGrid");
const galleryState = {
  images: [],
  hotelName: "",
  activeIndex: 0,
  modal: null,
  modalImage: null,
  modalCounter: null,
  rail: null,
  stageImage: null,
  stageCounter: null
};

function getHotels() {
  return Array.isArray(window.hotelCatalog) ? window.hotelCatalog : [];
}

function renderHotelCards() {
  if (!hotelGrid) return;

  const hotels = getHotels();
  hotelGrid.innerHTML = hotels
    .map(
      (hotel) => `
        <article class="hotel-card">
          <img src="${hotel.heroImage}" alt="${hotel.name}">
          <div class="hotel-card__body">
            <div class="hotel-card__top">
              <h3>${hotel.name}</h3>
              <p>${hotel.shortDescription}</p>
            </div>
            <div class="hotel-card__meta">
              <span>${hotel.location}</span>
              <span>${hotel.contactPhone}</span>
            </div>
            <div class="hotel-card__amenities">
              ${hotel.amenities.slice(0, 3).map((item) => `<span>${item}</span>`).join("")}
            </div>
            <div class="hotel-card__actions">
              <a class="text-link" href="hotel-details.html?hotel=${hotel.slug}">View Details</a>
              <a class="button button--sm" href="https://wa.me/${hotel.whatsapp}" target="_blank" rel="noreferrer">WhatsApp</a>
            </div>
          </div>
        </article>
      `
    )
    .join("");
}

function renderHotelDetailsPage() {
  const root = document.getElementById("hotelDetails");
  if (!root) return;

  const params = new URLSearchParams(window.location.search);
  const slug = params.get("hotel");
  const hotel = getHotels().find((item) => item.slug === slug) || getHotels()[0];

  if (!hotel) return;

  document.title = `${hotel.name} - EasyStayHub`;

  root.innerHTML = `
    <section class="detail-hero">
      <div class="container detail-hero__layout">
        <div class="detail-hero__copy">
          <span class="eyebrow">Hotel Details</span>
          <h1>${hotel.name}</h1>
          <p class="detail-hero__lead">${hotel.description}</p>
          <div class="detail-hero__info">
            <div><strong>Location</strong><span>${hotel.location}</span></div>
            <div><strong>Phone</strong><span>${hotel.contactPhone}</span></div>
            <div><strong>Email</strong><span>${hotel.contactEmail}</span></div>
          </div>
          <div class="hero__actions">
            <a class="button" href="https://wa.me/${hotel.whatsapp}" target="_blank" rel="noreferrer">Chat on WhatsApp</a>
            <a class="button button--ghost" href="index.html#rooms">Back to Hotels</a>
          </div>
        </div>
        <div class="detail-hero__visual">
          <img src="${hotel.heroImage}" alt="${hotel.name}">
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section-heading">
          <span class="eyebrow">Amenities</span>
          <h2>Everything included with your stay at ${hotel.name}.</h2>
        </div>
        <div class="detail-amenities">
          ${hotel.amenities.map((item) => `<div class="detail-amenity">${item}</div>`).join("")}
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section-heading">
          <span class="eyebrow">Gallery</span>
          <h2>Inside the hotel experience.</h2>
          <p>Browse room, exterior, and interior photos in a cleaner viewer designed for both wide and full-length images.</p>
        </div>
        <div class="detail-gallery" data-gallery-root>
          <div class="detail-gallery__stage">
            <div class="detail-gallery__stage-media">
              <img
                src="${hotel.gallery[0]}"
                alt="${hotel.name} gallery image 1"
                class="detail-gallery__stage-image"
                data-gallery-stage
              >
            </div>
            <div class="detail-gallery__stage-bar">
              <div>
                <span class="detail-gallery__label">Featured View</span>
                <strong class="detail-gallery__counter" data-gallery-stage-counter>1 / ${hotel.gallery.length}</strong>
              </div>
              <button class="button button--ghost detail-gallery__expand" type="button" data-gallery-open>
                View Fullscreen
              </button>
            </div>
          </div>
          <div class="detail-gallery__rail" data-gallery-rail>
            ${hotel.gallery
              .map(
                (image, index) => `
                  <button
                    class="detail-gallery__thumb${index === 0 ? " is-active" : ""}"
                    type="button"
                    data-gallery-index="${index}"
                    aria-label="View image ${index + 1}"
                    aria-pressed="${index === 0 ? "true" : "false"}"
                  >
                    <img src="${image}" alt="${hotel.name} thumbnail ${index + 1}">
                    <span class="detail-gallery__thumb-meta">Photo ${index + 1}</span>
                  </button>
                `
              )
              .join("")}
          </div>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container detail-contact">
        <div>
          <span class="eyebrow">Contact</span>
          <h2>Need direct support before booking?</h2>
          <p>Speak with the hotel team for room preferences, event planning, private transfers, or longer-stay requests.</p>
        </div>
        <div class="detail-contact__card">
          <p><strong>Phone:</strong> ${hotel.contactPhone}</p>
          <p><strong>Email:</strong> ${hotel.contactEmail}</p>
          <p><strong>Location:</strong> ${hotel.location}</p>
          <a class="button button--full" href="https://wa.me/${hotel.whatsapp}" target="_blank" rel="noreferrer">Contact on WhatsApp</a>
        </div>
      </div>
    </section>

    <div class="gallery-lightbox" data-gallery-modal hidden>
      <button class="gallery-lightbox__backdrop" type="button" aria-label="Close gallery" data-gallery-close></button>
      <div class="gallery-lightbox__dialog" role="dialog" aria-modal="true" aria-label="${hotel.name} image gallery">
        <button class="gallery-lightbox__close" type="button" aria-label="Close gallery" data-gallery-close>&times;</button>
        <button class="gallery-lightbox__nav gallery-lightbox__nav--prev" type="button" aria-label="Previous image" data-gallery-prev>&lsaquo;</button>
        <figure class="gallery-lightbox__figure">
          <img src="${hotel.gallery[0]}" alt="${hotel.name} gallery image 1" data-gallery-modal-image>
          <figcaption class="gallery-lightbox__caption">
            <span>${hotel.name}</span>
            <strong data-gallery-modal-counter>1 / ${hotel.gallery.length}</strong>
          </figcaption>
        </figure>
        <button class="gallery-lightbox__nav gallery-lightbox__nav--next" type="button" aria-label="Next image" data-gallery-next>&rsaquo;</button>
      </div>
    </div>
  `;

  initHotelGallery(hotel);
}

function updateGalleryView(index) {
  if (!galleryState.images.length) return;

  const total = galleryState.images.length;
  const normalizedIndex = (index + total) % total;
  galleryState.activeIndex = normalizedIndex;

  const imagePath = galleryState.images[normalizedIndex];
  const altText = `${galleryState.hotelName} gallery image ${normalizedIndex + 1}`;

  if (galleryState.stageImage) {
    galleryState.stageImage.src = imagePath;
    galleryState.stageImage.alt = altText;
  }

  if (galleryState.modalImage) {
    galleryState.modalImage.src = imagePath;
    galleryState.modalImage.alt = altText;
  }

  if (galleryState.stageCounter) {
    galleryState.stageCounter.textContent = `${normalizedIndex + 1} / ${total}`;
  }

  if (galleryState.modalCounter) {
    galleryState.modalCounter.textContent = `${normalizedIndex + 1} / ${total}`;
  }

  if (galleryState.rail) {
    Array.from(galleryState.rail.querySelectorAll("[data-gallery-index]")).forEach((thumb) => {
      const thumbIndex = Number(thumb.dataset.galleryIndex);
      const isActive = thumbIndex === normalizedIndex;
      thumb.classList.toggle("is-active", isActive);
      thumb.setAttribute("aria-pressed", String(isActive));
    });
  }
}

function openGalleryModal() {
  if (!galleryState.modal) return;
  galleryState.modal.hidden = false;
  document.body.classList.add("has-modal-open");
}

function closeGalleryModal() {
  if (!galleryState.modal) return;
  galleryState.modal.hidden = true;
  document.body.classList.remove("has-modal-open");
}

function initHotelGallery(hotel) {
  galleryState.images = hotel.gallery;
  galleryState.hotelName = hotel.name;
  galleryState.activeIndex = 0;
  galleryState.modal = document.querySelector("[data-gallery-modal]");
  galleryState.modalImage = document.querySelector("[data-gallery-modal-image]");
  galleryState.modalCounter = document.querySelector("[data-gallery-modal-counter]");
  galleryState.rail = document.querySelector("[data-gallery-rail]");
  galleryState.stageImage = document.querySelector("[data-gallery-stage]");
  galleryState.stageCounter = document.querySelector("[data-gallery-stage-counter]");

  if (!galleryState.images.length || !galleryState.rail || !galleryState.stageImage) return;

  galleryState.rail.querySelectorAll("[data-gallery-index]").forEach((thumb) => {
    thumb.addEventListener("click", () => {
      updateGalleryView(Number(thumb.dataset.galleryIndex));
    });
  });

  document.querySelectorAll("[data-gallery-open]").forEach((button) => {
    button.addEventListener("click", openGalleryModal);
  });

  galleryState.stageImage.addEventListener("click", openGalleryModal);

  document.querySelectorAll("[data-gallery-close]").forEach((button) => {
    button.addEventListener("click", closeGalleryModal);
  });

  document.querySelectorAll("[data-gallery-prev]").forEach((button) => {
    button.addEventListener("click", () => {
      updateGalleryView(galleryState.activeIndex - 1);
    });
  });

  document.querySelectorAll("[data-gallery-next]").forEach((button) => {
    button.addEventListener("click", () => {
      updateGalleryView(galleryState.activeIndex + 1);
    });
  });

  updateGalleryView(0);
}

function syncHeaderState() {
  if (!header) return;
  header.classList.toggle("is-scrolled", window.scrollY > 12);
}

function toggleNav() {
  if (!siteNav || !navToggle) return;
  const isOpen = siteNav.classList.toggle("is-open");
  navToggle.classList.toggle("is-active", isOpen);
  navToggle.setAttribute("aria-expanded", String(isOpen));
}

function closeNavOnSelect() {
  if (!siteNav || !navToggle) return;
  if (window.innerWidth > 820) return;
  siteNav.classList.remove("is-open");
  navToggle.classList.remove("is-active");
  navToggle.setAttribute("aria-expanded", "false");
}

function animateCounter(counter) {
  const target = Number(counter.dataset.target || 0);
  const duration = 1400;
  const startTime = performance.now();

  function update(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    counter.textContent = String(Math.round(target * eased));
    if (progress < 1) requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
}

function initCounters() {
  const observer = new IntersectionObserver(
    (entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animateCounter(entry.target);
        currentObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.45 }
  );

  counters.forEach((counter) => observer.observe(counter));
}

function showTestimonial(index) {
  testimonials.forEach((item, itemIndex) => {
    item.classList.toggle("is-active", itemIndex === index);
  });

  Array.from(dotsContainer.children).forEach((dot, dotIndex) => {
    dot.classList.toggle("is-active", dotIndex === index);
  });
}

function initTestimonials() {
  if (!testimonials.length || !dotsContainer) return;

  let activeIndex = 0;

  testimonials.forEach((_, index) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.setAttribute("aria-label", `Show testimonial ${index + 1}`);
    dot.addEventListener("click", () => {
      activeIndex = index;
      showTestimonial(activeIndex);
    });
    dotsContainer.appendChild(dot);
  });

  showTestimonial(activeIndex);

  setInterval(() => {
    activeIndex = (activeIndex + 1) % testimonials.length;
    showTestimonial(activeIndex);
  }, 5000);
}

function initBookingForm() {
  if (!bookingForm || !bookingMessage) return;

  bookingForm.addEventListener("submit", (event) => {
    event.preventDefault();
    bookingMessage.textContent = "Availability request received. Our concierge will follow up shortly.";
    bookingForm.reset();
  });
}

window.addEventListener("scroll", syncHeaderState);
window.addEventListener("resize", closeNavOnSelect);
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeNavOnSelect();
    closeGalleryModal();
  }

  if (document.body.classList.contains("has-modal-open")) {
    if (event.key === "ArrowLeft") updateGalleryView(galleryState.activeIndex - 1);
    if (event.key === "ArrowRight") updateGalleryView(galleryState.activeIndex + 1);
  }
});

if (navToggle && siteNav) {
  navToggle.addEventListener("click", toggleNav);
  siteNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeNavOnSelect);
  });
}

syncHeaderState();
renderHotelCards();
renderHotelDetailsPage();
initCounters();
initTestimonials();
initBookingForm();
