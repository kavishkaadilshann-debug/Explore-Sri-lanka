/* ==========================================================================
   1. GLOBAL SYSTEM SETTINGS & INITIALIZATION
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
    // 1. Theme Controller Setup
    initTheme();

    // 2. Scroll Reveal Animation Setup
    initScrollReveal();

    // 3. Page Specific Logic router
    const path = window.location.pathname;
    const pageName = path.substring(path.lastIndexOf('/') + 1);

    if (pageName === "destinations.html") {
        initDestinationsFilter();
        initDestinationsModal();
    } else if (pageName === "gallery.html") {
        initGalleryFilter();
        initLightbox();
    } else if (pageName === "travel-tips.html") {
        initTravelTips();
    } else if (pageName === "contact.html") {
        initContactForm();
    }
});

/* ==========================================================================
   1b. NEWSLETTER SUBSCRIPTION HANDLER
   ========================================================================== */
function subscribeNewsletter() {
    const emailInput = document.getElementById('newsletter-email');
    const messageDisplay = document.getElementById('subscribe-msg');
    if (!emailInput || !messageDisplay) return;

    const emailValue = emailInput.value.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (emailValue === "") {
        messageDisplay.innerText = "Please enter your email address.";
        messageDisplay.style.color = "#dc2626";
        messageDisplay.style.display = "block";
        return;
    }

    if (!emailPattern.test(emailValue)) {
        messageDisplay.innerText = "Please enter a valid email address.";
        messageDisplay.style.color = "#dc2626";
        messageDisplay.style.display = "block";
        return;
    }

    messageDisplay.innerText = "✓ You're subscribed! Welcome aboard.";
    messageDisplay.style.color = "#16a34a";
    messageDisplay.style.display = "block";
    emailInput.value = "";

    setTimeout(() => {
        messageDisplay.style.display = "none";
    }, 5000);
}

/* ==========================================================================
   2. GLOBAL THEME CONTROLLER (LIGHT/DARK MODE)
   ========================================================================== */
function initTheme() {
    const headerActions = document.querySelector(".header-actions");
    if (!headerActions) return;

    let toggleBtn = document.querySelector(".theme-toggle");
    if (!toggleBtn) {
        toggleBtn = document.createElement("button");
        toggleBtn.className = "theme-toggle";
        toggleBtn.setAttribute("aria-label", "Toggle dark/light mode");
        toggleBtn.innerHTML = "🌙";
        headerActions.insertBefore(toggleBtn, headerActions.firstChild);
    }

    const savedTheme = localStorage.getItem("theme") || "light";
    document.documentElement.setAttribute("data-theme", savedTheme);
    updateThemeIcon(savedTheme);

    toggleBtn.addEventListener("click", () => {
        const currentTheme = document.documentElement.getAttribute("data-theme");
        const newTheme = currentTheme === "dark" ? "light" : "dark";
        
        document.documentElement.setAttribute("data-theme", newTheme);
        localStorage.setItem("theme", newTheme);
        updateThemeIcon(newTheme);
    });
}

/* Update Theme icon representation */
function updateThemeIcon(theme) {
    const toggleBtn = document.querySelector(".theme-toggle");
    if (toggleBtn) {
        toggleBtn.innerHTML = theme === "dark" ? "☀️" : "🌙";
    }
}

/* ==========================================================================
   3. SCROLL REVEAL ANIMATIONS (INTERSECTION OBSERVER)
   ========================================================================== */
function initScrollReveal() {
    const elementsToReveal = document.querySelectorAll(
        "section, .card, .gallery-item, .tips .card, .about-section, form"
    );

    elementsToReveal.forEach(el => {
        el.classList.add("reveal");
    });

    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("active");
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    elementsToReveal.forEach(el => {
        observer.observe(el);
    });
}

/* ==========================================================================
   4. NAVIGATION MENU TOGGLE (MOBILE)
   ========================================================================== */
function toggleMenu() {
    const navMenu = document.getElementById('nav-menu');
    const toggleBtn = document.querySelector('.menu-toggle');    
    
    if (!navMenu || !toggleBtn) return;
    
    navMenu.classList.toggle('show');    
    
    if (navMenu.classList.contains('show')) {
        toggleBtn.innerHTML = "✕";
    } else {
        toggleBtn.innerHTML = "☰";
    }
}

/* ==========================================================================
   5. DESTINATIONS PAGE - SEARCH, DYNAMIC FILTER & DETAILED MODALS
   ========================================================================== */
function initDestinationsFilter() {
    const searchInput = document.getElementById("dest-search");
    const filterButtons = document.querySelectorAll(".filter-btn");
    const cards = document.querySelectorAll(".cards .card");

    if (!searchInput && filterButtons.length === 0) return;

    function filterCards() {
        const query = searchInput ? searchInput.value.toLowerCase().trim() : "";
        const activeFilterBtn = document.querySelector(".filter-btn.active");
        const category = activeFilterBtn ? activeFilterBtn.dataset.filter : "all";

        cards.forEach(card => {
            const title = card.querySelector("h3").innerText.toLowerCase();
            const subtitle = card.querySelector(".card-subtitle").innerText.toLowerCase();
            const desc = card.querySelector(".card-desc").innerText.toLowerCase();
            const cardCategory = card.dataset.category;

            const matchesSearch = title.includes(query) || subtitle.includes(query) || desc.includes(query);
            const matchesCategory = category === "all" || cardCategory === category;

            if (matchesSearch && matchesCategory) {
                card.style.display = "flex";
                setTimeout(() => { card.style.opacity = "1"; card.style.transform = "scale(1)"; }, 50);
            } else {
                card.style.opacity = "0";
                card.style.transform = "scale(0.95)";
                setTimeout(() => { card.style.display = "none"; }, 300);
            }
        });
    }

    if (searchInput) {
        searchInput.addEventListener("input", filterCards);
    }

    filterButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            filterButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            filterCards();
        });
    });
}

function initDestinationsModal() {
    let modal = document.querySelector(".modal");
    if (!modal) {
        modal = document.createElement("div");
        modal.className = "modal";
        modal.innerHTML = `
            <div class="modal-content">
                <button class="modal-close" aria-label="Close modal">✕</button>
                <h3 class="modal-title">Destination Info</h3>
                <p class="modal-tag" style="font-weight:600; color:var(--brand-secondary); text-transform:uppercase; font-size:0.85rem; letter-spacing:1px;"></p>
                <div class="modal-meta-grid">
                    <div class="meta-item">
                        <span>Best Season</span>
                        <span class="meta-season">-</span>
                    </div>
                    <div class="meta-item">
                        <span>Entrance Fee</span>
                        <span class="meta-fee">-</span>
                    </div>
                </div>
                <div class="modal-description" style="font-size:0.95rem; color:var(--text-muted); margin-bottom:1.5rem;"></div>
                <h4 class="modal-section-title">🌟 Top Activities:</h4>
                <ul class="modal-list"></ul>
            </div>
        `;
        document.body.appendChild(modal);
    }

    const modalClose = modal.querySelector(".modal-close");
    const modalTitle = modal.querySelector(".modal-title");
    const modalTag = modal.querySelector(".modal-tag");
    const modalSeason = modal.querySelector(".meta-season");
    const modalFee = modal.querySelector(".meta-fee");
    const modalDesc = modal.querySelector(".modal-description");
    const modalList = modal.querySelector(".modal-list");

    const destData = {
        "sigiriya": {
            title: "Sigiriya Fortress",
            tag: "Heritage & History",
            season: "January to April",
            fee: "$36 USD (Foreigners)",
            desc: "Sigiriya is a stunning 200m high rock fortress surrounded by vast water gardens. Once a Buddhist monastery and later the royal fortress palace of King Kashyapa, it showcases incredible architecture and world-renowned wall paintings (frescoes).",
            activities: ["Climb 1,200 steep metal steps to the summit", "Admire the ancient colorful frescoes", "View the giant carved Lion Paw entrance", "Explore the surrounding landscaped water gardens"]
        },
        "ella": {
            title: "Ella Highlands",
            tag: "Nature & Hiking",
            season: "January to May",
            fee: "Free (Trek paths)",
            desc: "Ella is a cozy mountainous town blessed with fresh pine forests, panoramic cliff viewpoints, and beautiful tea valleys. It serves as the ultimate base camp for nature hikes, scenic rail crossings, and chasing waterfalls.",
            activities: ["Take a sunset walk across Nine Arch Bridge", "Hike up Little Adam's Peak for sunrise views", "Take the legendary scenic train ride from Kandy", "Visit the powerful Ravana Falls and rock cave"]
        },
        "galle": {
            title: "Galle Fort",
            tag: "Heritage & Coastal",
            season: "November to April",
            fee: "Free Entry",
            desc: "Galle Fort is a magnificent seaside fortified enclave built in 1588 by the Portuguese and later heavily fortified by the Dutch. Its streets are lined with beautifully restored colonial structures, boutique galleries, and stylish cafes.",
            activities: ["Walk along the stone fort walls during sunset", "Photograph the iconic Galle Lighthouse", "Explore the Dutch Reformed Church and Hospital", "Browse artisan shops in the historic center"]
        },
        "kandy": {
            title: "Kandy City",
            tag: "Culture & Heritage",
            season: "December to April",
            fee: "$15 USD (Tooth Temple)",
            desc: "Kandy is the sacred mountain capital of Sri Lanka and home to the sacred Relic of the Tooth of Buddha. Surrounded by mist-clad peaks and primary rain forest, it represents the crown of traditional Sinhalese culture.",
            activities: ["Visit the Temple of the Tooth Relic", "Stroll around Kandy Lake at dusk", "Walk the suspension bridge in Royal Botanical Gardens", "Attend a traditional Kandyan dance drumming show"]
        },
        "anuradhapura": {
            title: "Anuradhapura ruins",
            tag: "Heritage & Culture",
            season: "January to April",
            fee: "$30 USD",
            desc: "Anuradhapura was the glorious capital of ancient Sri Lanka for over a millennium. Today it houses colossal white brick dome temples (stupas), ruined temples, sacred trees, and incredibly advanced irrigation systems.",
            activities: ["Pay respects at the Jaya Sri Maha Bodhi tree", "Marvel at the giant Ruwanweliseya Stupa dome", "See the beautifully detailed Twin Ponds (Kuttam Pokuna)", "Explore the Samadhi Buddha rock statue"]
        },
        "trincomalee": {
            title: "Trincomalee Shores",
            tag: "Coastal & Nature",
            season: "May to September",
            fee: "Free (Pigeon Island boat extra)",
            desc: "Trincomalee is a coastal crown jewel in eastern Sri Lanka featuring pristine white sands, quiet lagoons, and deep natural harbors. It has a rich spiritual history and offers excellent whale watching opportunities.",
            activities: ["Relax on Nilaveli Beach golden sand", "Snorkel around Pigeon Island national marine park", "Visit Koneswaram Temple perched on Swami Rock", "Take a morning boat cruise to spot Blue Whales"]
        },
        "jaffna": {
            title: "Jaffna Peninsula",
            tag: "Culture & Cuisine",
            season: "January to September",
            fee: "Free Entry",
            desc: "Jaffna represents the unique Tamil heritage of northern Sri Lanka. It displays a spectacular, colorful Hindu Kovil culture, historic forts, pristine shallow lagoons, and delicious spice-packed northern seafood dishes.",
            activities: ["Admire the massive gold Nallur Kandaswamy Kovil", "Take a ferry to Delft Island to see wild horses", "Walk the ruins of the star-shaped Jaffna Fort", "Enjoy a authentic Jaffna spicy crab curry feast"]
        },
        "yala": {
            title: "Yala National Park",
            tag: "Nature & Wildlife",
            season: "February to June",
            fee: "$25 USD (Safari drive extra)",
            desc: "Yala National Park is the most visited and second largest national park in Sri Lanka. Famed for its high concentration of leopards, it borders the Indian Ocean and offers spectacular shrubland, lagoon, and beach habitats.",
            activities: ["Embark on a morning leopard tracking safari", "Spot herds of wild elephants and spotted deer", "See crocodiles near the national lagoons", "Observe hundreds of nesting bird species"]
        },
        "munneswaram": {
            title: "Munneswaram Temple",
            tag: "Heritage & Culture",
            season: "Year-round (Aug/Sept festival)",
            fee: "Free (Donations welcome)",
            desc: "Munneswaram Temple is an important historic Hindu temple complex dedicated to Lord Shiva. It has existed since at least the 10th century and represents a unique point of shared worship between Hindus and Buddhists.",
            activities: ["Admire Dravidian-style colorful Gopuram towers", "Observe daily Shiva Puja prayer rituals", "Walk around the holy pond and ancient Bo tree", "Participate in the grand annual chariot festival"]
        },
        "arugambay": {
            title: "Arugam Bay",
            tag: "Beaches & Surfing",
            season: "April to October",
            fee: "Free (Surf rentals extra)",
            desc: "Arugam Bay is a world-renowned surf break on the southeastern coast of Sri Lanka. Famed for its laid-back bohemian vibe, sweeping sand bays, and perfect point breaks, it is the ultimate haven for surf enthusiasts.",
            activities: ["Catch point break waves at the Main Point", "Enjoy scenic sunset views at Elephant Rock", "Take a peaceful Pottuvil lagoon boat safari", "Relax in the seaside surf cafes and bars"]
        },
        "colombo": {
            title: "Colombo City",
            tag: "Culture & Urban Life",
            season: "Year-round",
            fee: "Free (Museums extra)",
            desc: "Colombo is the vibrant commercial capital of Sri Lanka. It blends sleek skyscrapers with 19th-century colonial architectures, bustling local bazaars in Pettah, and beautiful temples reflecting a diverse mix of religions.",
            activities: ["Walk along Galle Face Green at sunset", "Explore the historic colonial Dutch Hospital shops", "Visit the unique Gangaramaya Temple on Beira Lake", "Shop for spices and fabrics in the Pettah bazaar"]
        }
    };

    const actionBtns = document.querySelectorAll(".card-action-btn");
    actionBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            const card = btn.closest(".card");
            const id = card ? card.id : null;
            const data = destData[id];

            if (data) {
                modalTitle.innerText = data.title;
                modalTag.innerText = data.tag;
                modalSeason.innerText = data.season;
                modalFee.innerText = data.fee;
                modalDesc.innerText = data.desc;

                modalList.innerHTML = "";
                data.activities.forEach(act => {
                    const li = document.createElement("li");
                    li.innerText = act;
                    modalList.appendChild(li);
                });

                modal.classList.add("active");
                document.body.style.overflow = "hidden";
            }
        });
    });

    function closeModal() {
        modal.classList.remove("active");
        document.body.style.overflow = "auto";
    }

    modalClose.addEventListener("click", closeModal);
    modal.addEventListener("click", (e) => {
        if (e.target === modal) closeModal();
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && modal.classList.contains("active")) closeModal();
    });
}

/* ==========================================================================
   6. GALLERY PAGE - FILTER & DYNAMIC LIGHTBOX VIEWER
   ========================================================================== */
function initGalleryFilter() {
    const filterButtons = document.querySelectorAll(".filter-btn");
    const items = document.querySelectorAll(".gallery-item");

    if (filterButtons.length === 0 || items.length === 0) return;

    filterButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            filterButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            const filter = btn.dataset.filter;

            items.forEach(item => {
                const itemCategory = item.dataset.category;

                if (filter === "all" || itemCategory === filter) {
                    item.style.display = "block";
                    setTimeout(() => { item.style.opacity = "1"; item.style.transform = "scale(1)"; }, 50);
                } else {
                    item.style.opacity = "0";
                    item.style.transform = "scale(0.9)";
                    setTimeout(() => { item.style.display = "none"; }, 300);
                }
            });
        });
    });
}

function initLightbox() {
    let lightbox = document.querySelector(".lightbox");
    if (!lightbox) {
        lightbox = document.createElement("div");
        lightbox.className = "lightbox";
        lightbox.innerHTML = `
            <div class="lightbox-content-wrapper">
                <button class="lightbox-close" aria-label="Close gallery light box">✕</button>
                <img src="" alt="" />
                <div class="lightbox-caption">Caption text</div>
                <button class="lightbox-nav lightbox-prev" aria-label="Previous image">‹</button>
                <button class="lightbox-nav lightbox-next" aria-label="Next image">›</button>
            </div>
        `;
        document.body.appendChild(lightbox);
    }

    const lightboxImg = lightbox.querySelector("img");
    const lightboxCap = lightbox.querySelector(".lightbox-caption");
    const lightboxClose = lightbox.querySelector(".lightbox-close");
    const lightboxPrev = lightbox.querySelector(".lightbox-prev");
    const lightboxNext = lightbox.querySelector(".lightbox-next");

    let currentImages = [];
    let currentIndex = 0;

    const galleryItems = document.querySelectorAll(".gallery-item");
    galleryItems.forEach(item => {
        item.addEventListener("click", () => {
            const visibleItems = Array.from(galleryItems).filter(i => i.parentElement.style.display !== "none");
            currentImages = visibleItems.map(i => {
                const img = i.querySelector("img");
                return {
                    src: img.src,
                    alt: img.alt
                };
            });

            const clickedImg = item.querySelector("img");
            currentIndex = currentImages.findIndex(img => img.src === clickedImg.src);

            openLightbox();
        });
    });

    function openLightbox() {
        updateLightboxContent();
        lightbox.classList.add("active");
        document.body.style.overflow = "hidden";
    }

    function updateLightboxContent() {
        const image = currentImages[currentIndex];
        if (image) {
            lightboxImg.src = image.src;
            lightboxImg.alt = image.alt;
            lightboxCap.innerText = image.alt;
        }
    }

    function closeLightbox() {
        lightbox.classList.remove("active");
        document.body.style.overflow = "auto";
    }

    function navigate(direction) {
        if (currentImages.length === 0) return;
        currentIndex = (currentIndex + direction + currentImages.length) % currentImages.length;
        updateLightboxContent();
    }

    lightboxClose.addEventListener("click", closeLightbox);
    lightboxPrev.addEventListener("click", () => navigate(-1));
    lightboxNext.addEventListener("click", () => navigate(1));

    lightbox.addEventListener("click", (e) => {
        if (e.target === lightbox || e.target.classList.contains("lightbox-content-wrapper")) {
            closeLightbox();
        }
    });

    document.addEventListener("keydown", (e) => {
        if (!lightbox.classList.contains("active")) return;
        if (e.key === "Escape") closeLightbox();
        if (e.key === "ArrowLeft") navigate(-1);
        if (e.key === "ArrowRight") navigate(1);
    });
}

/* ==========================================================================
   7. TRAVEL TIPS PAGE - FAQs & CURRENCY CONVERTER
   ========================================================================== */
function initTravelTips() {
    const accordionHeaders = document.querySelectorAll(".accordion-header");
    accordionHeaders.forEach(header => {
        header.addEventListener("click", () => {
            const item = header.closest(".accordion-item");
            const isActive = item.classList.contains("active");

            document.querySelectorAll(".accordion-item").forEach(i => {
                i.classList.remove("active");
                i.querySelector(".accordion-content").style.maxHeight = "0";
            });

            if (!isActive) {
                item.classList.add("active");
                const content = item.querySelector(".accordion-content");
                content.style.maxHeight = content.scrollHeight + "px";
            }
        });
    });

    const convertBtn = document.getElementById("convert-btn");
    if (convertBtn) {
        convertBtn.addEventListener("click", () => {
            const amount = parseFloat(document.getElementById("convert-amount").value);
            const currency = document.getElementById("convert-currency").value;
            const resultBox = document.querySelector(".converter-results");

            if (isNaN(amount) || amount <= 0) {
                resultBox.innerText = "Please enter a valid amount.";
                resultBox.style.color = "#dc2626";
                return;
            }

            const rates = {
                "USD": 305.50,
                "EUR": 331.20,
                "GBP": 387.80
            };

            const rate = rates[currency];
            const converted = (amount * rate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            resultBox.innerText = `${amount} ${currency} ≈ ${converted} LKR`;
            resultBox.style.color = "var(--brand-primary)";
        });
    }
}

/* ==========================================================================
   8. CONTACT PAGE - REAL-TIME VALIDATION & SUCCESS CHECKMARK ANIMATION
   ========================================================================== */
function initContactForm() {
    const contactForm = document.querySelector("form");
    if (!contactForm) return;

    const nameInput = document.getElementById("name");
    const emailInput = document.getElementById("email");
    const messageInput = document.getElementById("message");

    if (!nameInput || !emailInput || !messageInput) return;

    function validateField(input, condition, errorText) {
        const formGroup = input.parentElement;
        let errorEl = formGroup.querySelector(".form-error");

        if (!errorEl) {
            errorEl = document.createElement("p");
            errorEl.className = "form-error";
            formGroup.appendChild(errorEl);
        }

        if (condition) {
            formGroup.classList.remove("invalid");
            formGroup.classList.add("valid");
            errorEl.style.display = "none";
            return true;
        } else {
            formGroup.classList.remove("valid");
            formGroup.classList.add("invalid");
            errorEl.innerText = errorText;
            errorEl.style.display = "block";
            return false;
        }
    }

    nameInput.addEventListener("input", () => {
        validateField(nameInput, nameInput.value.trim().length >= 3, "Name must be at least 3 characters.");
    });

    emailInput.addEventListener("input", () => {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        validateField(emailInput, emailPattern.test(emailInput.value.trim()), "Please enter a valid email address.");
    });

    messageInput.addEventListener("input", () => {
        validateField(messageInput, messageInput.value.trim().length >= 10, "Message must be at least 10 characters.");
    });

    contactForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const isNameValid = validateField(nameInput, nameInput.value.trim().length >= 3, "Name must be at least 3 characters.");
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const isEmailValid = validateField(emailInput, emailPattern.test(emailInput.value.trim()), "Please enter a valid email address.");
        const isMessageValid = validateField(messageInput, messageInput.value.trim().length >= 10, "Message must be at least 10 characters.");

        if (isNameValid && isEmailValid && isMessageValid) {
            const parent = contactForm.parentElement;
            contactForm.style.transition = "opacity var(--anim-fast) ease";
            contactForm.style.opacity = "0";

            setTimeout(() => {
                contactForm.style.display = "none";

                const successCard = document.createElement("div");
                successCard.className = "reveal active";
                successCard.style.cssText = "background: var(--bg-card); padding: 3.5rem; text-align: center; border-radius: var(--radius-box); border: 1px solid var(--border-color); box-shadow: var(--shadow-lg); max-width: 550px; margin: 0 auto;";
                successCard.innerHTML = `
                    <div style="font-size: 4rem; color: #16a34a; margin-bottom: 1.5rem; animation: checkmarkScale 0.5s ease both;">✓</div>
                    <h3 style="font-size: 1.6rem; font-weight: 700; margin-bottom: 0.8rem;">Thank You!</h3>
                    <p style="color: var(--text-muted); font-size: 0.95rem; margin-bottom: 1.5rem;">Your message has been sent successfully. We will get back to you shortly.</p>
                    <button class="planner-btn" onclick="location.reload()" style="max-width: 200px; margin: 0 auto;">Send Another Message</button>
                `;
                parent.appendChild(successCard);
            }, 300);
        }
    });

    const style = document.createElement("style");
    style.innerHTML = `
        @keyframes checkmarkScale {
            0% { transform: scale(0); opacity: 0; }
            50% { transform: scale(1.2); }
            100% { transform: scale(1); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
}