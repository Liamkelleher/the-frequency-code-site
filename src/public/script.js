// Glow button effect
const glowButtons = document.querySelectorAll(".glow-btn");
glowButtons.forEach((btn) => {
  btn.addEventListener("mouseenter", () => btn.classList.add("active-glow"));
  btn.addEventListener("mouseleave", () => btn.classList.remove("active-glow"));
});

// Typewriter effect
const heading = document.querySelector(".hero-content h1");
const typewriterText = heading.textContent;
heading.textContent = "";
let i = 0;
function typeWriter() {
  if (i < typewriterText.length) {
    heading.textContent += typewriterText.charAt(i);
    i++;
    setTimeout(typeWriter, 40);
  }
}
window.addEventListener("load", typeWriter);

// Modal functionality
const bonusCards = document.querySelectorAll(".bonus-card");
const modals = document.querySelectorAll(".modal");
const closeBtns = document.querySelectorAll(".close");

bonusCards.forEach((card) => {
  const modalId = card.dataset.modal;
  const modal = document.getElementById(modalId);
  if (modal) {
    card.addEventListener("click", () => {
      modal.classList.add("show");
      document.body.classList.add("modal-open");
    });
  }
});

closeBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    modals.forEach((m) => m.classList.remove("show"));
    document.body.classList.remove("modal-open");
  });
});

window.addEventListener("click", (e) => {
  modals.forEach((m) => {
    if (e.target === m) {
      m.classList.remove("show");
      document.body.classList.remove("modal-open");
    }
  });
});

// Mobile menu toggle
const toggle = document.querySelector(".menu-toggle");
const nav = document.querySelector(".nav-menu");
toggle.addEventListener("click", () => {
  nav.classList.toggle("active");
});

// Scroll-triggered flip effect for cards
const cards = document.querySelectorAll(".card");

const flipObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("flip-in");
      }
    });
  },
  {
    threshold: 0.2,
  }
);

cards.forEach((card) => {
  flipObserver.observe(card);
});

document.addEventListener("DOMContentLoaded", function () {
  const buySection = document.querySelector("#buy");
  const floatingBtn = document.querySelector(".floating-buy");

  function checkFloatingButtonVisibility() {
    const rect = buySection.getBoundingClientRect();
    const isInBuySection = rect.top < window.innerHeight && rect.bottom > 0;

    if (window.scrollY > 400 && window.scrollY < 3500) {
      floatingBtn.style.opacity = "1";
      floatingBtn.style.pointerEvents = "auto";
    } else {
      floatingBtn.style.opacity = "0";
      floatingBtn.style.pointerEvents = "none";
    }
  }

  checkFloatingButtonVisibility();
  window.addEventListener("scroll", checkFloatingButtonVisibility);
  window.addEventListener("resize", checkFloatingButtonVisibility);
});

document.querySelectorAll(".faq-question").forEach((btn) => {
  btn.addEventListener("click", () => {
    const item = btn.closest(".faq-item");
    const icon = btn.querySelector(".icon");

    item.classList.toggle("active");
    icon.textContent = item.classList.contains("active") ? "−" : "+";
  });
});

document.querySelectorAll(".footer-toggle").forEach((btn) => {
  btn.addEventListener("click", () => {
    const targetId = btn.dataset.target;
    const targetSection = document.getElementById(targetId);

    document.querySelectorAll(".footer-section").forEach((sec) => {
      if (sec !== targetSection) sec.classList.remove("active");
    });

    const isVisible = targetSection.classList.contains("active");
    targetSection.classList.toggle("active");

    if (!isVisible) {
      setTimeout(() => {
        targetSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 50);
    }
  });
});

// Stripe Checkout Integration
document
  .getElementById("checkout-button")
  .addEventListener("click", async () => {
    try {
      console.log("🟢 Checkout button clicked");
      const res = await fetch("/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("❌ Server error:", text);
        alert("Server error: " + text);
        return;
      }

      const data = await res.json();
      if (!data.id) {
        console.error("❌ No session ID returned");
        alert("Stripe session failed.");
        return;
      }

      console.log("🧾 Session ID:", data.id);

      const stripe = Stripe(
        "pk_test_51RUUV4GKkazdgaPt68YjO0DunMAjoyLfF0prZhOI9WoDYEUHgs6SWxoOt2bVaZe5vh7pwWLoXE4MhA0uqoQ25ULc00uj2oFKW5"
      );
      await stripe.redirectToCheckout({ sessionId: data.id });
    } catch (err) {
      console.error("❌ Error redirecting to checkout:", err);
      alert("Something went wrong while redirecting.");
    }
  });
