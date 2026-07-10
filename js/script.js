// 1. SYSTEM INITIALIZATION
document.addEventListener("DOMContentLoaded", () => {
    const path = window.location.pathname;
    if (path.includes("travel-tips.html")) {
        initTravelTips();
    } else if (path.includes("contact.html")) {
        initContactForm();
    } else if (path.includes("destinations.html")) {
        initDestinationsFilter();
    }
});

// 2. NAVIGATION MOBILE MENU
function toggleMenu() {
    const menu = document.getElementById('nav-menu');
    const btn = document.querySelector('.menu-toggle');    
    if (menu && btn) {
        btn.innerHTML = menu.classList.toggle('show') ? "✕" : "☰";
    }
}

// 3. CURRENCY CONVERTER & FAQ ACCORDION
function initTravelTips() {
    // Currency Converter
    document.getElementById("convert-btn")?.addEventListener("click", () => {
        const amt = parseFloat(document.getElementById("convert-amount").value);
        const cur = document.getElementById("convert-currency").value;
        const res = document.querySelector(".converter-results");
        if (isNaN(amt) || amt <= 0) {
            res.innerText = "Please enter a valid amount.";
            res.style.color = "#dc2626";
            return;
        }
        const rates = { "USD": 305.5, "EUR": 331.2, "GBP": 387.8 };
        res.innerText = `${amt} ${cur} ≈ ${(amt * rates[cur]).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} LKR`;
        res.style.color = "var(--brand-primary)";
    });

    // FAQ Accordion Toggle
    const accordionHeaders = document.querySelectorAll(".accordion-header");
    accordionHeaders.forEach(header => {
        header.addEventListener("click", () => {
            const item = header.closest(".accordion-item");
            
            // Close other items
            document.querySelectorAll(".accordion-item").forEach(i => {
                if (i !== item) i.classList.remove("active");
            });

            item.classList.toggle("active");
        });
    });
}

// 4. CONTACT FORM VALIDATOR
function initContactForm() {
    const form = document.querySelector("form");
    if (!form) return;

    const fields = {
        name: [document.getElementById("name"), v => v.trim().length >= 3, "Name must be at least 3 characters."],
        email: [document.getElementById("email"), v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()), "Please enter a valid email address."],
        message: [document.getElementById("message"), v => v.trim().length >= 10, "Message must be at least 10 characters."]
    };

    const validate = (input, check, errText) => {
        const group = input.parentElement;
        let err = group.querySelector(".form-error") || group.appendChild(Object.assign(document.createElement("p"), { className: "form-error" }));
        const ok = check(input.value);
        group.classList.toggle("valid", ok);
        group.classList.toggle("invalid", !ok);
        err.innerText = errText;
        err.style.display = ok ? "none" : "block";
        return ok;
    };

    Object.values(fields).forEach(([input, check, err]) => {
        input?.addEventListener("input", () => validate(input, check, err));
    });

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const ok = Object.values(fields).every(([input, check, err]) => validate(input, check, err));
        if (ok) {
            form.style.display = "none";
            const success = document.createElement("div");
            success.style.cssText = "background: var(--bg-card); padding: 3.5rem; text-align: center; border-radius: var(--radius-box); border: 1px solid var(--border-color); box-shadow: var(--shadow-lg); max-width: 550px; margin: 0 auto;";
            success.innerHTML = `
                <div style="font-size: 4rem; color: #16a34a; margin-bottom: 1.5rem;">✓</div>
                <h3 style="font-size: 1.6rem; font-weight: 700; margin-bottom: 0.8rem;">Thank You!</h3>
                <p style="color: var(--text-muted); font-size: 0.95rem; margin-bottom: 1.5rem;">Your message has been sent successfully. We will get back to you shortly.</p>
                <button class="planner-btn" onclick="location.reload()" style="max-width: 200px; margin: 0 auto;">Send Another Message</button>
            `;
            form.parentElement.appendChild(success);
        }
    });
}

// 5. DESTINATIONS CATEGORY FILTER
function initDestinationsFilter() {
    const filterButtons = document.querySelectorAll(".filter-btn");
    const cards = document.querySelectorAll(".cards .card");
    
    if (!filterButtons.length || !cards.length) return;

    filterButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            // Remove active class from all buttons
            filterButtons.forEach(b => b.classList.remove("active"));
            // Add active class to clicked button
            btn.classList.add("active");

            const filterValue = btn.getAttribute("data-filter");

            cards.forEach(card => {
                const category = card.getAttribute("data-category");
                
                // Reset card animations to trigger fade-in smoothly
                card.style.animation = 'none';
                card.offsetHeight; // force reflow
                
                if (filterValue === "all" || category === filterValue) {
                    card.classList.remove("hidden");
                    card.style.animation = 'cardFadeIn 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards';
                } else {
                    card.classList.add("hidden");
                }
            });
        });
    });
}
