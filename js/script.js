/* ==========================================================================
   1. GLOBAL SYSTEM SETTINGS & INITIALIZATION
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    initScrollReveal();

    const pageName = window.location.pathname.split("/").pop();
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
    const msg = document.getElementById('subscribe-msg');
    if (!emailInput || !msg) return;

    const val = emailInput.value.trim();
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

    msg.innerText = val === "" ? "Please enter your email address." 
                  : !isValid ? "Please enter a valid email address." 
                  : "✓ You're subscribed! Welcome aboard.";
    msg.style.color = val && isValid ? "#16a34a" : "#dc2626";
    msg.style.display = "block";

    if (val && isValid) {
        emailInput.value = "";
        setTimeout(() => msg.style.display = "none", 5000);
    }
}

/* ==========================================================================
   2. GLOBAL THEME CONTROLLER (LIGHT/DARK MODE)
   ========================================================================== */
function initTheme() {
    const darkThemeMq = window.matchMedia("(prefers-color-scheme: dark)");
    const applyTheme = (e) => {
        document.documentElement.setAttribute("data-theme", e.matches ? "dark" : "light");
    };
    applyTheme(darkThemeMq);
    if (darkThemeMq.addEventListener) {
        darkThemeMq.addEventListener("change", applyTheme);
    } else {
        darkThemeMq.addListener(applyTheme);
    }
}

/* ==========================================================================
   3. SCROLL REVEAL ANIMATIONS (INTERSECTION OBSERVER)
   ========================================================================== */
function initScrollReveal() {
    const elements = document.querySelectorAll("section, .card, .gallery-item, .tips .card, .about-section, form");
    elements.forEach(el => el.classList.add("reveal"));
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("active");
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });
    elements.forEach(el => observer.observe(el));
}

/* ==========================================================================
   4. NAVIGATION MENU TOGGLE (MOBILE)
   ========================================================================== */
function toggleMenu() {
    const menu = document.getElementById('nav-menu');
    const btn = document.querySelector('.menu-toggle');    
    if (menu && btn) {
        const isShow = menu.classList.toggle('show');    
        btn.innerHTML = isShow ? "✕" : "☰";
    }
}

/* ==========================================================================
   5. DESTINATIONS PAGE - SEARCH, DYNAMIC FILTER & DETAILED MODALS
   ========================================================================== */
function initDestinationsFilter() {
    const search = document.getElementById("dest-search");
    const btns = document.querySelectorAll(".filter-btn");
    const cards = document.querySelectorAll(".cards .card");

    if (!search && !btns.length) return;

    const filter = () => {
        const query = search ? search.value.toLowerCase().trim() : "";
        const cat = document.querySelector(".filter-btn.active")?.dataset.filter || "all";

        cards.forEach(card => {
            const matchesSearch = ["h3", ".card-subtitle", ".card-desc"].some(sel => card.querySelector(sel)?.innerText.toLowerCase().includes(query));
            const matchesCat = cat === "all" || card.dataset.category === cat;

            if (matchesSearch && matchesCat) {
                card.style.display = "flex";
                setTimeout(() => { card.style.opacity = "1"; card.style.transform = "scale(1)"; }, 50);
            } else {
                card.style.opacity = "0";
                card.style.transform = "scale(0.95)";
                setTimeout(() => { card.style.display = "none"; }, 300);
            }
        });
    };

    search?.addEventListener("input", filter);
    btns.forEach(btn => btn.addEventListener("click", () => {
        btns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        filter();
    }));
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
                    <div class="meta-item"><span>Best Season</span><span class="meta-season">-</span></div>
                    <div class="meta-item"><span>Entrance Fee</span><span class="meta-fee">-</span></div>
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
        sigiriya: ["Sigiriya Fortress", "Heritage & History", "January to April", "$36 USD (Foreigners)", "Sigiriya is a stunning 200m high rock fortress surrounded by vast water gardens. Once a Buddhist monastery and later the royal fortress palace of King Kashyapa, it showcases incredible architecture and world-renowned wall paintings (frescoes).", ["Climb 1,200 steep metal steps to the summit", "Admire the ancient colorful frescoes", "View the giant carved Lion Paw entrance", "Explore the surrounding landscaped water gardens"]],
        ella: ["Ella Highlands", "Nature & Hiking", "January to May", "Free (Trek paths)", "Ella is a cozy mountainous town blessed with fresh pine forests, panoramic cliff viewpoints, and beautiful tea valleys. It serves as the ultimate base camp for nature hikes, scenic rail crossings, and chasing waterfalls.", ["Take a sunset walk across Nine Arch Bridge", "Hike up Little Adam's Peak for sunrise views", "Take the legendary scenic train ride from Kandy", "Visit the powerful Ravana Falls and rock cave"]],
        galle: ["Galle Fort", "Heritage & Coastal", "November to April", "Free Entry", "Galle Fort is a magnificent seaside fortified enclave built in 1588 by the Portuguese and later heavily fortified by the Dutch. Its streets are lined with beautifully restored colonial structures, boutique galleries, and stylish cafes.", ["Walk along the stone fort walls during sunset", "Photograph the iconic Galle Lighthouse", "Explore the Dutch Reformed Church and Hospital", "Browse artisan shops in the historic center"]],
        kandy: ["Kandy City", "Culture & Heritage", "December to April", "$15 USD (Tooth Temple)", "Kandy is the sacred mountain capital of Sri Lanka and home to the sacred Relic of the Tooth of Buddha. Surrounded by mist-clad peaks and primary rain forest, it represents the crown of traditional Sinhalese culture.", ["Visit the Temple of the Tooth Relic", "Stroll around Kandy Lake at dusk", "Walk the suspension bridge in Royal Botanical Gardens", "Attend a traditional Kandyan dance drumming show"]],
        anuradhapura: ["Anuradhapura ruins", "Heritage & Culture", "January to April", "Free Entry", "Anuradhapura was the glorious capital of ancient Sri Lanka for over a millennium. Today it houses colossal white brick dome temples (stupas), ruined temples, sacred trees, and incredibly advanced irrigation systems.", ["Pay respects at the Jaya Sri Maha Bodhi tree", "Marvel at the giant Ruwanweliseya Stupa dome", "See the beautifully detailed Twin Ponds (Kuttam Pokuna)", "Explore the Samadhi Buddha rock statue"]],
        trincomalee: ["Trincomalee Shores", "Coastal & Nature", "May to September", "Free (Pigeon Island boat extra)", "Trincomalee is a coastal crown jewel in eastern Sri Lanka featuring pristine white sands, quiet lagoons, and deep natural harbors. It has a rich spiritual history and offers excellent whale watching opportunities.", ["Relax on Nilaveli Beach golden sand", "Snorkel around Pigeon Island national marine park", "Visit Koneswaram Temple perched on Swami Rock", "Take a morning boat cruise to spot Blue Whales"]],
        jaffna: ["Jaffna Peninsula", "Culture & Cuisine", "January to September", "Free Entry", "Jaffna represents the unique Tamil heritage of northern Sri Lanka. It displays a spectacular, colorful Hindu Kovil culture, historic forts, pristine shallow lagoons, and delicious spice-packed northern seafood dishes.", ["Admire the massive gold Nallur Kandaswamy Kovil", "Take a ferry to Delft Island to see wild horses", "Walk the ruins of the star-shaped Jaffna Fort", "Enjoy a authentic Jaffna spicy crab curry feast"]],
        yala: ["Yala National Park", "Nature & Wildlife", "February to June", "$25 USD (Safari drive extra)", "Yala National Park is the most visited and second largest national park in Sri Lanka. Famed for its high concentration of leopards, it borders the Indian Ocean and offers spectacular shrubland, lagoon, and beach habitats.", ["Embark on a morning leopard tracking safari", "Spot herds of wild elephants and spotted deer", "See crocodiles near the national lagoons", "Observe hundreds of nesting bird species"]],
        munneswaram: ["Munneswaram Temple", "Heritage & Culture", "Year-round (Aug/Sept festival)", "Free (Donations welcome)", "Munneswaram Temple is an important historic Hindu temple complex dedicated to Lord Shiva. It has existed since at least the 10th century and represents a unique point of shared worship between Hindus and Buddhists.", ["Admire Dravidian-style colorful Gopuram towers", "Observe daily Shiva Puja prayer rituals", "Walk around the holy pond and ancient Bo tree", "Participate in the grand annual chariot festival"]],
        arugambay: ["Arugam Bay", "Beaches & Surfing", "April to October", "Free (Surf rentals extra)", "Arugam Bay is a world-renowned surf break on the southeastern coast of Sri Lanka. Famed for its laid-back bohemian vibe, sweeping sand bays, and perfect point breaks, it is the ultimate haven for surf enthusiasts.", ["Catch point break waves at the Main Point", "Enjoy scenic sunset views at Elephant Rock", "Take a peaceful Pottuvil lagoon boat safari", "Relax in the seaside surf cafes and bars"]],
        colombo: ["Colombo City", "Culture & Urban Life", "Year-round", "Free (Museums extra)", "Colombo is the vibrant commercial capital of Sri Lanka. It blends sleek skyscrapers with 19th-century colonial architectures, bustling local bazaars in Pettah, and beautiful temples reflecting a diverse mix of religions.", ["Walk along Galle Face Green at sunset", "Explore the historic colonial Dutch Hospital shops", "Visit the unique Gangaramaya Temple on Beira Lake", "Shop for spices and fabrics in the Pettah bazaar"]]
    };

    document.querySelectorAll(".card-action-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const card = btn.closest(".card");
            const data = destData[card ? card.id : ""];

            if (data) {
                const [title, tag, season, fee, desc, activities] = data;
                modalTitle.innerText = title;
                modalTag.innerText = tag;
                modalSeason.innerText = season;
                modalFee.innerText = fee;
                modalDesc.innerText = desc;

                modalList.innerHTML = "";
                activities.forEach(act => {
                    modalList.appendChild(Object.assign(document.createElement("li"), { innerText: act }));
                });

                modal.classList.add("active");
                document.body.style.overflow = "hidden";
            }
        });
    });

    const close = () => {
        modal.classList.remove("active");
        document.body.style.overflow = "";
    };

    modalClose.addEventListener("click", close);
    modal.addEventListener("click", (e) => { if (e.target === modal) close(); });
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && modal.classList.contains("active")) close();
    });
}

/* ==========================================================================
   6. GALLERY PAGE - FILTER & DYNAMIC LIGHTBOX VIEWER
   ========================================================================== */
function initGalleryFilter() {
    const btns = document.querySelectorAll(".filter-btn");
    const items = document.querySelectorAll(".gallery-item");

    btns.forEach(btn => btn.addEventListener("click", () => {
        btns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        const filter = btn.dataset.filter;

        items.forEach(item => {
            if (filter === "all" || item.dataset.category === filter) {
                item.style.display = "block";
                setTimeout(() => { item.style.opacity = "1"; item.style.transform = "scale(1)"; }, 50);
            } else {
                item.style.opacity = "0";
                item.style.transform = "scale(0.9)";
                setTimeout(() => { item.style.display = "none"; }, 300);
            }
        });
    }));
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
                <div class="lightbox-caption"></div>
                <button class="lightbox-nav lightbox-prev" aria-label="Previous image">‹</button>
                <button class="lightbox-nav lightbox-next" aria-label="Next image">›</button>
            </div>
        `;
        document.body.appendChild(lightbox);
    }

    const img = lightbox.querySelector("img");
    const cap = lightbox.querySelector(".lightbox-caption");
    let imgs = [], idx = 0;

    const update = () => {
        if (imgs[idx]) {
            img.src = imgs[idx].src;
            img.alt = img.title = cap.innerText = imgs[idx].alt;
        }
    };

    const nav = d => {
        if (!imgs.length) return;
        idx = (idx + d + imgs.length) % imgs.length;
        update();
    };

    document.querySelectorAll(".gallery-item").forEach(item => {
        item.addEventListener("click", () => {
            const visible = Array.from(document.querySelectorAll(".gallery-item")).filter(i => i.style.display !== "none");
            imgs = visible.map(i => ({ src: i.querySelector("img").src, alt: i.querySelector("img").alt }));
            idx = imgs.findIndex(i => i.src === item.querySelector("img").src);
            update();
            lightbox.classList.add("active");
            document.body.style.overflow = "hidden";
        });
    });

    const close = () => {
        lightbox.classList.remove("active");
        document.body.style.overflow = "";
    };

    lightbox.querySelector(".lightbox-close").addEventListener("click", close);
    lightbox.querySelector(".lightbox-prev").addEventListener("click", () => nav(-1));
    lightbox.querySelector(".lightbox-next").addEventListener("click", () => nav(1));
    lightbox.addEventListener("click", e => { if (e.target === lightbox || e.target.classList.contains("lightbox-content-wrapper")) close(); });
    document.addEventListener("keydown", e => {
        if (!lightbox.classList.contains("active")) return;
        if (e.key === "Escape") close();
        if (e.key === "ArrowLeft") nav(-1);
        if (e.key === "ArrowRight") nav(1);
    });
}

/* ==========================================================================
   7. TRAVEL TIPS PAGE - FAQs & CURRENCY CONVERTER
   ========================================================================== */
function initTravelTips() {
    document.querySelectorAll(".accordion-header").forEach(hdr => {
        hdr.addEventListener("click", () => {
            const item = hdr.closest(".accordion-item");
            const active = item.classList.contains("active");
            document.querySelectorAll(".accordion-item").forEach(i => {
                i.classList.remove("active");
                i.querySelector(".accordion-content").style.maxHeight = "0";
            });
            if (!active) {
                item.classList.add("active");
                const content = item.querySelector(".accordion-content");
                content.style.maxHeight = content.scrollHeight + "px";
            }
        });
    });

    const convertBtn = document.getElementById("convert-btn");
    convertBtn?.addEventListener("click", () => {
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
}

/* ==========================================================================
   8. CONTACT PAGE - REAL-TIME VALIDATION & SUCCESS CHECKMARK ANIMATION
   ========================================================================== */
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
            form.style.transition = "opacity var(--anim-fast) ease";
            form.style.opacity = "0";
            setTimeout(() => {
                form.style.display = "none";
                const success = document.createElement("div");
                success.className = "reveal active";
                success.style.cssText = "background: var(--bg-card); padding: 3.5rem; text-align: center; border-radius: var(--radius-box); border: 1px solid var(--border-color); box-shadow: var(--shadow-lg); max-width: 550px; margin: 0 auto;";
                success.innerHTML = `
                    <div style="font-size: 4rem; color: #16a34a; margin-bottom: 1.5rem; animation: checkmarkScale 0.5s ease both;">✓</div>
                    <h3 style="font-size: 1.6rem; font-weight: 700; margin-bottom: 0.8rem;">Thank You!</h3>
                    <p style="color: var(--text-muted); font-size: 0.95rem; margin-bottom: 1.5rem;">Your message has been sent successfully. We will get back to you shortly.</p>
                    <button class="planner-btn" onclick="location.reload()" style="max-width: 200px; margin: 0 auto;">Send Another Message</button>
                `;
                form.parentElement.appendChild(success);
            }, 300);
        }
    });

    const style = document.createElement("style");
    style.innerHTML = `@keyframes checkmarkScale { 0% { transform: scale(0); opacity: 0; } 50% { transform: scale(1.2); } 100% { transform: scale(1); opacity: 1; } }`;
    document.head.appendChild(style);
}
