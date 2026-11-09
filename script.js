const filterButtons = [...document.querySelectorAll(".filter-button")];
const photoCards = [...document.querySelectorAll(".photo-card")];
const visibleCount = document.querySelector("#visible-count");
const emptyState = document.querySelector(".empty-state");
const lightbox = document.querySelector(".lightbox");
const lightboxImage = document.querySelector(".lightbox-image");
const lightboxTitle = document.querySelector(".lightbox-title");
const lightboxMeta = document.querySelector(".lightbox-meta");
const lightboxDescription = document.querySelector(".lightbox-description");
const lightboxUrl = document.querySelector(".lightbox-url");
const lightboxCount = document.querySelector(".lightbox-count");
const shareStatus = document.querySelector(".share-status");
const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector("#site-nav");
const photoButtons = photoCards.map((card) => card.querySelector(".photo-open"));
let currentPhoto = 0;

function filterPhotos(filter) {
  let visible = 0;

  photoCards.forEach((card) => {
    const matches = filter === "tout" || card.dataset.category.split(" ").includes(filter);
    card.hidden = !matches;
    if (matches) visible += 1;
  });

  visibleCount.textContent = String(visible).padStart(2, "0");
  emptyState.hidden = visible !== 0;
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    filterButtons.forEach((item) => {
      const active = item === button;
      item.classList.toggle("is-active", active);
      item.setAttribute("aria-pressed", String(active));
    });
    filterPhotos(button.dataset.filter);
  });
});

function showPhoto(index) {
  currentPhoto = (index + photoButtons.length) % photoButtons.length;
  const card = photoCards[currentPhoto];
  const image = card.querySelector("img");
  const title = card.querySelector("h3").textContent;

  lightboxImage.src = card.dataset.originalUrl;
  lightboxImage.alt = image.alt;
  lightboxTitle.textContent = title;
  lightboxMeta.textContent = card.dataset.details;
  lightboxDescription.textContent = card.dataset.description;
  lightboxUrl.value = card.dataset.originalUrl;
  document.querySelector(".download-button").href = card.dataset.downloadUrl;
  shareStatus.textContent = "";
  lightboxCount.textContent = `${String(currentPhoto + 1).padStart(2, "0")} / ${String(photoButtons.length).padStart(2, "0")}`;
}

async function copyImageUrl() {
  try {
    await navigator.clipboard.writeText(lightboxUrl.value);
    shareStatus.textContent = "L’URL Cloudinary a été copiée.";
  } catch {
    lightboxUrl.focus();
    lightboxUrl.select();
    let copied = false;
    try {
      copied = document.execCommand("copy");
    } catch {
      copied = false;
    }
    lightboxUrl.setSelectionRange(0, 0);
    if (copied) {
      shareStatus.textContent = "L’URL Cloudinary a été copiée.";
      return;
    }

    shareStatus.textContent = "Copie impossible dans ce navigateur. Sélectionnez l’URL et copiez-la manuellement.";
  }
}

photoButtons.forEach((button, index) => {
  button.addEventListener("click", () => {
    showPhoto(index);
    lightbox.showModal();
  });
});

document.querySelector(".hero-photo-open").addEventListener("click", () => {
  showPhoto(0);
  lightbox.showModal();
});

document.querySelector(".lightbox-close").addEventListener("click", () => lightbox.close());
document.querySelector(".lightbox-prev").addEventListener("click", () => showPhoto(currentPhoto - 1));
document.querySelector(".lightbox-next").addEventListener("click", () => showPhoto(currentPhoto + 1));
document.querySelector(".copy-button").addEventListener("click", copyImageUrl);

document.querySelector(".share-button").addEventListener("click", async () => {
  if (!navigator.share) {
    await copyImageUrl();
    if (shareStatus.textContent === "L’URL Cloudinary a été copiée.") {
      shareStatus.textContent = "Le partage direct n’est pas disponible ici : l’URL a été copiée.";
    }
    return;
  }

  try {
    await navigator.share({
      title: lightboxTitle.textContent,
      text: lightboxDescription.textContent,
      url: lightboxUrl.value,
    });
    shareStatus.textContent = "La photo a été partagée.";
  } catch (error) {
    if (error.name !== "AbortError") {
      shareStatus.textContent = "Le partage a échoué. Vous pouvez copier l’URL de la photo.";
    }
  }
});

lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) lightbox.close();
});

document.addEventListener("keydown", (event) => {
  if (!lightbox.open) return;
  if (event.key === "Escape") lightbox.close();
  if (event.key === "ArrowLeft") showPhoto(currentPhoto - 1);
  if (event.key === "ArrowRight") showPhoto(currentPhoto + 1);
});

menuToggle.addEventListener("click", () => {
  const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isExpanded));
  menuToggle.setAttribute("aria-label", isExpanded ? "Ouvrir le menu" : "Fermer le menu");
  siteNav.classList.toggle("is-open", !isExpanded);
});

siteNav.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Ouvrir le menu");
    siteNav.classList.remove("is-open");
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape" || !siteNav.classList.contains("is-open")) return;
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Ouvrir le menu");
  siteNav.classList.remove("is-open");
});

document.querySelectorAll(".photo-open img, .hero-image-frame img").forEach((image) => {
  image.addEventListener("error", () => {
    image.alt = "Image momentanément indisponible sur Cloudinary";
    image.closest("button, .hero-image-frame").classList.add("image-error");
  });
});
