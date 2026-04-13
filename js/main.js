const header = document.getElementById("header");
const navToggle = document.getElementById("navToggle");
const siteNav = document.getElementById("siteNav");
const counters = document.querySelectorAll(".counter");
const bookingForm = document.getElementById("bookingForm");
const bookingMessage = document.getElementById("bookingMessage");
const testimonials = Array.from(document.querySelectorAll(".testimonial"));
const dotsContainer = document.getElementById("testimonialDots");
const hotelGrid = document.getElementById("hotelGrid");
const locationFilter = document.getElementById("locationFilter");
const heroSearchForm = document.getElementById("heroSearchForm");
const heroCityInput = document.getElementById("heroCityInput");
const heroCityOptions = document.getElementById("heroCityOptions");
const heroSearchMessage = document.getElementById("heroSearchMessage");
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
let heroSpotlightInterval = null;

function iconMarkup(name) {
  const icons = {
    location:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-6-4.35-6-10a6 6 0 1 1 12 0c0 5.65-6 10-6 10Z"></path><circle cx="12" cy="11" r="2.2"></circle></svg>',
    phone:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16.2v3a2 2 0 0 1-2.18 2 19.82 19.82 0 0 1-8.64-3.08 19.5 19.5 0 0 1-6-6A19.82 19.82 0 0 1 1.1 3.44 2 2 0 0 1 3.09 1.3h3a2 2 0 0 1 2 1.72l.34 2.57a2 2 0 0 1-.57 1.72L6.5 8.66a16 16 0 0 0 8.84 8.84l1.35-1.36a2 2 0 0 1 1.72-.57l2.57.34A2 2 0 0 1 21 16.2Z"></path></svg>',
    email:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"></rect><path d="m4 7 8 6 8-6"></path></svg>',
    amenity:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m5 13 4 4L19 7"></path></svg>'
  };

  return `<span class="ui-icon ui-icon--${name}" aria-hidden="true">${icons[name] || icons.amenity}</span>`;
}

function getHotels() {
  return Array.isArray(window.hotelCatalog) ? window.hotelCatalog : [];
}

function extractCityFromLocation(location) {
  const normalizedLocation = String(location || "").trim();
  if (!normalizedLocation) return "Other";

  const cityAliases = [
    { match: /mysuru|mysore/i, label: "Mysuru" },
    { match: /gonikoppa|gonikoppal|coorg|kodagu/i, label: "Coorg" },
    { match: /thamarassery|thamrasheery|kozhikode|calicut/i, label: "Kozhikode" },
    { match: /mangalore|mangaluru|thokkotu/i, label: "Mangalore" },
    { match: /mumbai|kurla/i, label: "Mumbai" }
  ];

  const aliasMatch = cityAliases.find((item) => item.match.test(normalizedLocation));
  if (aliasMatch) return aliasMatch.label;

  const parts = normalizedLocation
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  const filteredParts = parts.filter((part) => !/karnataka|india|\d{6}/i.test(part));
  return filteredParts[filteredParts.length - 1] || parts[parts.length - 1] || "Other";
}

function getSortedCities() {
  const cities = Array.from(
    new Set(getHotels().map((hotel) => extractCityFromLocation(hotel.location)))
  );

  return cities.sort((a, b) => {
    const aPriority = /mysuru|mysore/i.test(a) ? 0 : 1;
    const bPriority = /mysuru|mysore/i.test(b) ? 0 : 1;
    if (aPriority !== bPriority) return aPriority - bPriority;
    return a.localeCompare(b);
  });
}

function initHeroSpotlight() {
  const title = document.querySelector("[data-hero-hotel-name]");
  const image = document.querySelector("[data-hero-hotel-image]");
  const cardLink = document.querySelector("[data-hero-hotel-link]");
  const footerLink = document.querySelector("[data-hero-hotel-link-text]");
  const counter = document.querySelector("[data-hero-hotel-counter]");

  if (!title || !image || !cardLink) return;

  const hotelMap = new Map(getHotels().map((hotel) => [hotel.slug, hotel]));
  const spotlightHotels = [
    { slug: "haya-residency", image: "assets/images/hero-spotlight/haya-residency.webp" },
    { slug: "pergola-lodge", image: "assets/images/hero-spotlight/tm-residency.webp" },
    { slug: "tm-residency", image: "assets/images/hero-spotlight/pergola-lodge.webp" }
  ]
    .map((item) => {
      const hotel = hotelMap.get(item.slug);
      return hotel ? { ...hotel, spotlightImage: item.image } : null;
    })
    .filter(Boolean);

  const hotels = spotlightHotels.length ? spotlightHotels : getHotels().filter((hotel) => hotel.heroImage).slice(0, 5);
  if (!hotels.length) return;

  let activeIndex = 0;

  function renderSpotlight(index) {
    const hotel = hotels[index];
    title.textContent = hotel.name;
    image.src = hotel.spotlightImage || hotel.heroImage;
    image.alt = `${hotel.name} preview`;
    const href = `hotel-details.html?hotel=${hotel.slug}`;
    cardLink.href = href;
    if (footerLink) footerLink.href = href;
    if (counter) counter.textContent = `${index + 1} / ${hotels.length}`;
  }

  renderSpotlight(activeIndex);

  if (heroSpotlightInterval) {
    clearInterval(heroSpotlightInterval);
  }

  heroSpotlightInterval = setInterval(() => {
    activeIndex = (activeIndex + 1) % hotels.length;
    renderSpotlight(activeIndex);
  }, 3200);
}

function renderHotelCards() {
  if (!hotelGrid) return;

  const selectedCity = String(locationFilter?.value || "");
  const hotels = getHotels().filter((hotel) => {
    if (!selectedCity) return true;
    return extractCityFromLocation(hotel.location) === selectedCity;
  });

  if (!hotels.length) {
    hotelGrid.innerHTML = '<p class="hotel-grid__empty">No hotels found for this location.</p>';
    return;
  }

  hotelGrid.innerHTML = hotels
    .map(
      (hotel) => {
        const mapQuery = `${hotel.name}, ${hotel.location}`;
        const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`;
        return `
        <article class="hotel-card">
          <a class="hotel-card__media" href="hotel-details.html?hotel=${hotel.slug}" aria-label="View details for ${hotel.name}">
            <img src="${hotel.heroImage}" alt="${hotel.name}" loading="lazy" decoding="async">
          </a>
          <div class="hotel-card__body">
            <div class="hotel-card__top">
              <h3><a class="hotel-card__title-link" href="hotel-details.html?hotel=${hotel.slug}">${hotel.name}</a></h3>
            </div>
            <div class="hotel-card__meta">
              <span>${iconMarkup("location")}<span>${hotel.location}</span></span>
              <span>${iconMarkup("phone")}<span>${hotel.contactPhone}</span></span>
            </div>
            <div class="hotel-card__amenities">
              ${hotel.amenities
                .slice(0, 3)
                .map((item) => `<span>${iconMarkup("amenity")}<span>${item}</span></span>`)
                .join("")}
            </div>
            <div class="hotel-card__actions">
              <div class="hotel-card__links">
                <a class="text-link" href="hotel-details.html?hotel=${hotel.slug}">View Details</a>
                <a class="text-link" href="${mapUrl}" target="_blank" rel="noreferrer">View on Map</a>
              </div>
              <a class="button button--sm button--full hotel-card__whatsapp" href="https://wa.me/${hotel.whatsapp}" target="_blank" rel="noreferrer">WhatsApp</a>
            </div>
          </div>
        </article>
      `;
      }
    )
    .join("");
}

function initLocationFilter() {
  if (!locationFilter) return;

  const uniqueCities = getSortedCities();

  locationFilter.innerHTML =
    '<option value="">All locations</option>' +
    uniqueCities.map((city) => `<option value="${city}">${city}</option>`).join("");

  locationFilter.addEventListener("change", renderHotelCards);
}

function initHeroLocationSearch() {
  if (!heroSearchForm || !heroCityInput || !heroCityOptions) return;

  const cities = getSortedCities();

  heroCityOptions.innerHTML = cities.map((city) => `<option value="${city}"></option>`).join("");

  heroSearchForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const enteredCity = String(heroCityInput.value || "").trim();
    const matchedCity = cities.find((city) => city.toLowerCase() === enteredCity.toLowerCase());

    if (locationFilter) {
      locationFilter.value = matchedCity || "";
    }

    renderHotelCards();

    if (heroSearchMessage) {
      heroSearchMessage.textContent = enteredCity && !matchedCity
        ? "No exact city match found. Showing all locations."
        : "";
    }

    const roomsSection = document.getElementById("rooms");
    if (roomsSection) {
      roomsSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
}

function renderHotelDetailsPage() {
  const root = document.getElementById("hotelDetails");
  if (!root) return;

  const params = new URLSearchParams(window.location.search);
  const slug = params.get("hotel");
  const hotel = getHotels().find((item) => item.slug === slug) || getHotels()[0];

  if (!hotel) return;

  const pageUrl = `https://www.easystayhub.in/hotel-details.html?hotel=${hotel.slug}`;
  const pageTitle = `${hotel.name} | EasyStayHub Mysore Hotel Details`;
  const pageDescription = `${hotel.name} in Mysore: amenities, room photos, contact details, map link, and direct WhatsApp support.`;
  document.title = pageTitle;

  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription) metaDescription.setAttribute("content", pageDescription);

  const canonical = document.querySelector('link[rel="canonical"]');
  if (canonical) canonical.setAttribute("href", pageUrl);

  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) ogTitle.setAttribute("content", pageTitle);

  const ogDescription = document.querySelector('meta[property="og:description"]');
  if (ogDescription) ogDescription.setAttribute("content", pageDescription);

  const ogUrl = document.querySelector('meta[property="og:url"]');
  if (ogUrl) ogUrl.setAttribute("content", pageUrl);

  const twitterTitle = document.querySelector('meta[name="twitter:title"]');
  if (twitterTitle) twitterTitle.setAttribute("content", pageTitle);

  const twitterDescription = document.querySelector('meta[name="twitter:description"]');
  if (twitterDescription) twitterDescription.setAttribute("content", pageDescription);

  const mapQuery = `${hotel.name}, ${hotel.location}`;
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`;

  root.innerHTML = `
    <section class="detail-hero">
      <div class="container detail-hero__layout">
        <div class="detail-hero__copy">
          <span class="eyebrow">Hotel Details</span>
          <h1>${hotel.name}</h1>
          <p class="detail-hero__lead">${hotel.description}</p>
          <div class="detail-hero__info">
            <div>${iconMarkup("location")}<div><strong>Location</strong><span><a class="text-link" href="${mapUrl}" target="_blank" rel="noreferrer">View on Map</a></span></div></div>
            <div>${iconMarkup("phone")}<div><strong>Phone</strong><span>${hotel.contactPhone}</span></div></div>
            <div>${iconMarkup("email")}<div><strong>Email</strong><span>${hotel.contactEmail}</span></div></div>
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
          ${hotel.amenities.map((item) => `<div class="detail-amenity">${iconMarkup("amenity")}<span>${item}</span></div>`).join("")}
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
                decoding="async"
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
                    <img src="${image}" alt="${hotel.name} thumbnail ${index + 1}" loading="lazy" decoding="async">
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
          <p><strong>Map:</strong> <a class="text-link" href="${mapUrl}" target="_blank" rel="noreferrer">Open in Google Maps</a></p>
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
          <img src="${hotel.gallery[0]}" alt="${hotel.name} gallery image 1" data-gallery-modal-image decoding="async">
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

  const hotelSelect = bookingForm.querySelector('select[name="hotel"]');
  if (hotelSelect) {
    const hotels = getHotels();
    const hasOnlyPlaceholder =
      hotelSelect.options.length === 1 && String(hotelSelect.options[0].value) === "";

    if (hasOnlyPlaceholder && hotels.length) {
      hotelSelect.innerHTML =
        '<option value="">Select</option>' +
        hotels.map((hotel) => `<option value="${hotel.slug}">${hotel.name}</option>`).join("");
    }
  }

  bookingForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(bookingForm);
    const name = String(formData.get("name") || "").trim();
    const phone = String(formData.get("phone") || "").trim();
    const checkin = String(formData.get("checkin") || "").trim();
    const checkout = String(formData.get("checkout") || "").trim();
    const guests = String(formData.get("guests") || "").trim();
    const details = String(formData.get("details") || "").trim();
    const hotelSlug = String(formData.get("hotel") || "").trim();

    let selectedHotelName = "";
    let whatsappNumber =
      bookingForm.dataset.whatsapp || "919741896133";
    if (hotelSlug) {
      const hotel = getHotels().find((item) => item.slug === hotelSlug);
      if (hotel?.whatsapp) whatsappNumber = hotel.whatsapp;
      if (hotel?.name) selectedHotelName = hotel.name;
    }
    whatsappNumber = String(whatsappNumber).replace(/[^\d]/g, "");

    if (!name || !phone) {
      bookingMessage.textContent = "Name and phone number are required.";
      return;
    }

    if (!whatsappNumber) {
      bookingMessage.textContent = "WhatsApp number is missing for the selected hotel.";
      return;
    }

    const enquiryLines = [
      "*New Enquiry - EasyStayHub*",
      "",
      `Name: ${name}`,
      `Phone: ${phone}`,
      `Hotel: ${selectedHotelName || hotelSlug || "Not provided"}`,
      `Checkin: ${checkin || "Not provided"}`,
      `Checkout: ${checkout || "Not provided"}`,
      `Guests: ${guests || "Not provided"}`,
      `Details: ${details || "Not provided"}`
    ];

    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(enquiryLines.join("\n"))}`;
    bookingMessage.textContent = "Redirecting to WhatsApp...";
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
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
initLocationFilter();
initHeroLocationSearch();
renderHotelCards();
renderHotelDetailsPage();
initHeroSpotlight();
initCounters();
initTestimonials();
initBookingForm();
