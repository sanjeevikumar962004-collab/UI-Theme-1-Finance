/**
 * Stackly Financial - Global Premium Form Validation & State System
 * Handles:
 * 1. Premium live validation (real-time validation on blur/input)
 * 2. Newsletter validation & modals
 * 3. Settings updates & state binding (name, email) in user/admin dashboards
 * 4. Allowed pages check in global click handler to navigate to 404.html properly
 */

// Load GSAP and Text Animations dynamically if not already loaded
(function() {
    window.stacklyAnimLoaded = window.stacklyAnimLoaded || false;
    if (!window.stacklyAnimLoaded) {
        window.stacklyAnimLoaded = true;
        const gsapScript = document.createElement("script");
        gsapScript.src = "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js";
        gsapScript.onload = () => {
            const animScript = document.createElement("script");
            animScript.src = "text-animations.js";
            document.head.appendChild(animScript);
        };
        document.head.appendChild(gsapScript);
    }
})();

document.addEventListener("DOMContentLoaded", () => {
    // 1. Inject Premium Validation CSS Styles Dynamically
    const style = document.createElement("style");
    style.textContent = `
        /* Live Validation Styling */
        .auth-input-wrapper input.is-valid,
        .form-group input.is-valid,
        .form-group-input input.is-valid,
        .form-group-input textarea.is-valid,
        input.is-valid,
        textarea.is-valid {
            border-color: #2ebd59 !important; /* Soft premium green */
            background-color: #f7fdf9 !important;
            box-shadow: 0 4px 12px rgba(46, 189, 89, 0.08) !important;
        }

        .auth-input-wrapper input.is-invalid,
        .form-group input.is-invalid,
        .form-group-input input.is-invalid,
        .form-group-input textarea.is-invalid,
        input.is-invalid,
        textarea.is-invalid {
            border-color: #E07A5F !important; /* Soft luxury terracotta red */
            background-color: #FFFDFD !important;
            box-shadow: 0 4px 12px rgba(224, 122, 95, 0.12) !important;
        }

        /* Error Label styling */
        .validation-error {
            display: block;
            font-size: 11px;
            font-weight: 600;
            color: #E07A5F;
            margin-top: 4px;
            opacity: 0;
            max-height: 0;
            overflow: hidden;
            transform: translateY(-5px);
            transition: all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
            pointer-events: none;
            text-align: left;
            width: 100%;
            word-break: break-word;
            box-sizing: border-box;
        }

        /* Error activation */
        input.is-invalid ~ .validation-error,
        textarea.is-invalid ~ .validation-error {
            opacity: 1;
            max-height: 40px;
            transform: translateY(0);
        }

        /* Shake animation for invalid fields */
        @keyframes fieldShake {
            0%, 100% { transform: translateX(0); }
            20%, 60% { transform: translateX(-6px); }
            40%, 80% { transform: translateX(6px); }
        }

        .is-invalid-shake {
            animation: fieldShake 0.4s ease-in-out;
        }

        /* Premium Success Modal Overlay */
        .success-overlay {
            position: fixed;
            top: 0; left: 0; width: 100%; height: 100vh;
            background: rgba(20, 37, 48, 0.95);
            backdrop-filter: blur(12px);
            z-index: 99999;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.4s ease;
        }

        .success-overlay.is-active {
            opacity: 1;
            pointer-events: all;
        }

        .success-card {
            background: #FFFFFF;
            width: 90%;
            max-width: 440px;
            padding: 3rem 2rem;
            border-radius: 24px;
            text-align: center;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
            transform: scale(0.85);
            transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .success-overlay.is-active .success-card {
            transform: scale(1);
        }

        .success-icon-wrap {
            width: 72px;
            height: 72px;
            border-radius: 50%;
            background: rgba(35, 166, 240, 0.1);
            color: #23A6F0;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 1.5rem;
        }

        .success-icon-wrap svg {
            width: 36px;
            height: 36px;
            stroke-dasharray: 100;
            stroke-dashoffset: 100;
            transition: stroke-dashoffset 0.8s ease 0.2s;
        }

        .success-overlay.is-active svg {
            stroke-dashoffset: 0;
        }

        .success-card h3 {
            font-family: 'Montserrat', sans-serif;
            font-size: 1.5rem;
            font-weight: 700;
            color: #252B42;
            margin-bottom: 0.75rem;
        }

        .success-card p {
            font-family: 'Montserrat', sans-serif;
            color: #737373;
            font-size: 0.9rem;
            line-height: 1.6;
            margin-bottom: 1.5rem;
        }

        .success-close-btn {
            background: #000000;
            color: #FFFFFF;
            border: none;
            padding: 0.85rem 2rem;
            font-family: 'Montserrat', sans-serif;
            font-weight: 700;
            font-size: 0.85rem;
            border-radius: 6px;
            cursor: pointer;
            transition: opacity 0.2s ease;
            width: 100%;
        }

        .success-close-btn:hover {
            opacity: 0.9;
        }

        /* Toast notification */
        .premium-toast {
            position: fixed;
            bottom: 30px;
            right: 30px;
            background: #142530;
            color: #ffffff;
            padding: 16px 24px;
            border-radius: 12px;
            font-family: 'Montserrat', sans-serif;
            font-size: 13px;
            font-weight: 700;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            z-index: 10000;
            display: flex;
            align-items: center;
            gap: 12px;
            transform: translateY(100px);
            opacity: 0;
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            pointer-events: none;
        }

        .premium-toast.show {
            transform: translateY(0);
            opacity: 1;
            pointer-events: all;
        }

        .premium-toast-icon {
            color: #2ebd59;
            font-size: 15px;
            display: inline-flex;
            align-items: center;
        }

        /* Premium Global Hover Effects for all buttons, links styled as buttons, and inputs */
        button, 
        .btn-member, 
        .btn-primary, 
        .btn-secondary, 
        .btn-role-tab, 
        .btn-support-talk, 
        .btn-contact-hero, 
        .btn-back-home, 
        .hero-btn,
        input[type="submit"] {
            transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1) !important;
        }

        button:hover, 
        .btn-member:hover, 
        .btn-primary:hover, 
        .btn-secondary:hover, 
        .btn-support-talk:hover, 
        .btn-contact-hero:hover, 
        .btn-back-home:hover, 
        .hero-btn:hover,
        input[type="submit"]:hover {
            transform: translateY(-3px) scale(1.03) !important;
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2) !important;
            filter: brightness(1.1) !important;
        }

        button:active, 
        .btn-member:active, 
        .btn-primary:active, 
        .btn-secondary:active, 
        .btn-support-talk:active, 
        .btn-contact-hero:active, 
        .btn-back-home:active, 
        .hero-btn:active,
        input[type="submit"]:active {
            transform: translateY(-1px) scale(0.98) !important;
            box-shadow: 0 5px 10px rgba(0, 0, 0, 0.15) !important;
        }
    `;
    document.head.appendChild(style);

    // 2. Build Modal Overlay elements dynamically in DOM
    const genericOverlay = document.createElement("div");
    genericOverlay.className = "success-overlay";
    genericOverlay.id = "stackly-success-overlay";
    genericOverlay.innerHTML = `
        <div class="success-card">
            <div class="success-icon-wrap">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
            </div>
            <h3 id="overlay-title">Action Successful</h3>
            <p id="overlay-message">Your details have been successfully processed.</p>
            <button class="success-close-btn" id="overlay-close-btn">Continue</button>
        </div>
    `;
    document.body.appendChild(genericOverlay);

    const closeBtn = document.getElementById("overlay-close-btn");
    if (closeBtn) {
        closeBtn.addEventListener("click", () => {
            genericOverlay.classList.remove("is-active");
            document.body.style.overflow = "";
        });
    }

    // Function to show success modal
    const showSuccessModal = (title, message) => {
        document.getElementById("overlay-title").textContent = title;
        document.getElementById("overlay-message").textContent = message;
        genericOverlay.classList.add("is-active");
        document.body.style.overflow = "hidden";
    };

    // Function to show inline success message
    const showInlineSuccess = (form, message) => {
        const existing = form.querySelector(".inline-success-alert");
        if (existing) {
            existing.remove();
        }

        const alertDiv = document.createElement("div");
        alertDiv.className = "inline-success-alert";
        alertDiv.style.cssText = `
            margin-top: 20px;
            padding: 15px 20px;
            background: #E8F5E9;
            color: #2E7D32;
            border-left: 5px solid #4CAF50;
            border-radius: 4px;
            font-family: 'Montserrat', sans-serif;
            font-weight: 600;
            font-size: 14px;
            text-align: left;
            width: 100%;
            grid-column: 1 / -1;
            box-sizing: border-box;
            opacity: 0;
            transition: opacity 0.3s ease;
            display: flex;
            align-items: center;
            gap: 10px;
        `;
        alertDiv.innerHTML = `
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" style="flex-shrink: 0;">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            <span>${message}</span>
        `;
        
        form.appendChild(alertDiv);
        
        // Trigger reflow
        alertDiv.offsetHeight;
        alertDiv.style.opacity = "1";

        // Scroll to the alert message smoothly
        alertDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

        // Hide message after 8 seconds
        setTimeout(() => {
            alertDiv.style.opacity = "0";
            setTimeout(() => {
                alertDiv.remove();
            }, 300);
        }, 8000);
    };

    // Function to show toast
    const showToast = (message) => {
        let toast = document.getElementById("stackly-toast");
        if (!toast) {
            toast = document.createElement("div");
            toast.id = "stackly-toast";
            toast.className = "premium-toast";
            toast.innerHTML = `
                <span class="premium-toast-icon">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                </span>
                <span class="toast-msg"></span>
            `;
            document.body.appendChild(toast);
        }
        toast.querySelector(".toast-msg").textContent = message;
        toast.classList.add("show");
        setTimeout(() => {
            toast.classList.remove("show");
        }, 3000);
    };

    // Helper functions for validation
    const validateEmail = (email) => {
        const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return regex.test(email.trim());
    };

    const validatePhone = (phone) => {
        const regex = /^\+?[0-9\s\-()]{7,15}$/;
        return regex.test(phone.trim());
    };

    const addErrorMsgElement = (inputEl, errorMsg) => {
        const parent = inputEl.parentElement;
        let errSpan = parent.querySelector(".validation-error");
        if (!errSpan) {
            errSpan = document.createElement("span");
            errSpan.className = "validation-error";
            parent.appendChild(errSpan);
        }
        errSpan.textContent = errorMsg;
    };

    const checkField = (input, validateFn, errorMsg) => {
        const val = input.value;
        const isValid = validateFn(val);
        addErrorMsgElement(input, errorMsg);
        
        if (!isValid) {
            input.classList.remove("is-valid");
            input.classList.add("is-invalid");
            return false;
        } else {
            input.classList.remove("is-invalid");
            input.classList.add("is-valid");
            return true;
        }
    };

    // Generic form initialization
    const registerLiveValidation = (inputEl, validateFn, errorMsg) => {
        if (!inputEl) return;
        
        const performVal = () => checkField(inputEl, validateFn, errorMsg);
        
        inputEl.addEventListener("blur", performVal);
        inputEl.addEventListener("input", () => {
            if (inputEl.classList.contains("is-invalid") || inputEl.classList.contains("is-valid")) {
                performVal();
            }
        });
        
        // Save trigger on DOM node
        inputEl.triggerVal = performVal;
    };

    // Setup input validation bindings on all visible page forms
    const setupAllFormsValidation = () => {
        // 1. Contact Forms (.contact-form, .contact-form-grid)
        const contactForms = document.querySelectorAll(".contact-form, .contact-form-grid");
        contactForms.forEach(form => {
            const nameInput = form.querySelector('input[type="text"][placeholder*="Name"]');
            const emailInput = form.querySelector('input[type="email"]');
            const subjectInput = form.querySelector('input[type="text"][placeholder*="Subject"]');
            const msgTextarea = form.querySelector('textarea');

            registerLiveValidation(nameInput, val => val.trim().length >= 2, "Full Name must be at least 2 characters.");
            registerLiveValidation(emailInput, val => validateEmail(val), "Please enter a valid email address.");
            registerLiveValidation(subjectInput, val => val.trim().length >= 3, "Subject must be at least 3 characters.");
            registerLiveValidation(msgTextarea, val => val.trim().length >= 10, "Please describe your message (min 10 characters).");

            form.addEventListener("submit", (e) => {
                e.preventDefault();
                let isValid = true;
                
                [nameInput, emailInput, subjectInput, msgTextarea].forEach(inp => {
                    if (inp && typeof inp.triggerVal === "function") {
                        if (!inp.triggerVal()) isValid = false;
                    }
                });

                if (isValid) {
                    // Inline Success Message
                    showInlineSuccess(form, "Thank you! Our financial advisors have received your query and will contact you shortly.");
                    form.reset();
                    [nameInput, emailInput, subjectInput, msgTextarea].forEach(inp => {
                        if (inp) inp.classList.remove("is-valid", "is-invalid");
                    });
                } else {
                    // Shake form
                    form.classList.add("is-invalid-shake");
                    setTimeout(() => form.classList.remove("is-invalid-shake"), 400);
                }
            });
        });

        // 2. Newsletter Subscription Footer Forms (.footer-newsletter-form)
        const newsletterForms = document.querySelectorAll(".footer-newsletter-form");
        newsletterForms.forEach(form => {
            const emailInput = form.querySelector('input[type="email"]');
            
            registerLiveValidation(emailInput, val => validateEmail(val), "Please enter a valid email address.");

            form.addEventListener("submit", (e) => {
                e.preventDefault();
                
                if (emailInput && typeof emailInput.triggerVal === "function") {
                    const isValid = emailInput.triggerVal();
                    if (isValid) {
                        showSuccessModal("Digest Engaged", "Your subscription is now active! Welcome to Stackly Financial insights.");
                        form.reset();
                        emailInput.classList.remove("is-valid", "is-invalid");
                    } else {
                        form.classList.add("is-invalid-shake");
                        setTimeout(() => form.classList.remove("is-invalid-shake"), 400);
                    }
                }
            });
        });

        // 3. User Dashboard Profile Form settings
        const saveProfileBtn = document.getElementById("save-profile-btn");
        if (saveProfileBtn) {
            const nameInput = document.getElementById("profile-name");
            const emailInput = document.getElementById("profile-email");

            registerLiveValidation(nameInput, val => val.trim().length >= 2, "Full Name is required (min 2 chars).");
            registerLiveValidation(emailInput, val => validateEmail(val), "Please enter a valid email address.");

            saveProfileBtn.addEventListener("click", (e) => {
                e.preventDefault();
                let isValid = true;

                [nameInput, emailInput].forEach(inp => {
                    if (inp && typeof inp.triggerVal === "function") {
                        if (!inp.triggerVal()) isValid = false;
                    }
                });

                if (isValid) {
                    // Save to local storage
                    const newName = nameInput.value.trim();
                    const newEmail = emailInput.value.trim();

                    localStorage.setItem('email', newEmail);
                    localStorage.setItem('name', newName);

                    // Update UI text display variables dynamically
                    const userDisplays = document.querySelectorAll(".user-display-name");
                    userDisplays.forEach(el => el.textContent = newName);

                    const welcomeName = document.getElementById("welcome-name");
                    if (welcomeName) welcomeName.textContent = newName;

                    showToast("Profile Settings Saved Successfully!");
                    
                    // Clear visual indicators after success
                    [nameInput, emailInput].forEach(inp => {
                        if (inp) inp.classList.remove("is-valid", "is-invalid");
                    });
                } else {
                    const formContainer = saveProfileBtn.parentElement;
                    if (formContainer) {
                        formContainer.classList.add("is-invalid-shake");
                        setTimeout(() => formContainer.classList.remove("is-invalid-shake"), 400);
                    }
                }
            });
        }

        // 4. Admin Dashboard settings
        const adminSaveBtn = document.getElementById("admin-save-btn");
        if (adminSaveBtn) {
            const nameInput = document.getElementById("admin-settings-name");
            const emailInput = document.getElementById("admin-settings-email");

            registerLiveValidation(nameInput, val => val.trim().length >= 2, "Full Name is required (min 2 chars).");
            registerLiveValidation(emailInput, val => validateEmail(val), "Please enter a valid email address.");

            adminSaveBtn.addEventListener("click", (e) => {
                e.preventDefault();
                let isValid = true;

                [nameInput, emailInput].forEach(inp => {
                    if (inp && typeof inp.triggerVal === "function") {
                        if (!inp.triggerVal()) isValid = false;
                    }
                });

                if (isValid) {
                    const newName = nameInput.value.trim();
                    const newEmail = emailInput.value.trim();

                    localStorage.setItem('email', newEmail);
                    localStorage.setItem('name', newName);

                    // Update Admin UI displays
                    const adminNameDisplay = document.getElementById("admin-display-name");
                    if (adminNameDisplay) adminNameDisplay.textContent = newName;

                    const adminWelcomeName = document.getElementById("admin-welcome-name");
                    if (adminWelcomeName) adminWelcomeName.textContent = newName;

                    showToast("Admin Settings Saved Successfully!");

                    [nameInput, emailInput].forEach(inp => {
                        if (inp) inp.classList.remove("is-valid", "is-invalid");
                    });
                } else {
                    const formContainer = adminSaveBtn.closest('form');
                    if (formContainer) {
                        formContainer.classList.add("is-invalid-shake");
                        setTimeout(() => formContainer.classList.remove("is-invalid-shake"), 400);
                    }
                }
            });
        }
    };

    // Load Localized State into Inputs & Welcomes dynamically
    const loadStateFromLocalStorage = () => {
        const storedEmail = localStorage.getItem('email');
        const storedName = localStorage.getItem('name');

        // User Dashboard loading
        if (document.getElementById("profile-email") && storedEmail) {
            document.getElementById("profile-email").value = storedEmail;
        }
        if (storedName) {
            if (document.getElementById("profile-name")) {
                document.getElementById("profile-name").value = storedName;
            }
            const welcomeSpan = document.getElementById("welcome-name");
            if (welcomeSpan) welcomeSpan.textContent = storedName;

            const userDisplays = document.querySelectorAll(".user-display-name");
            userDisplays.forEach(el => el.textContent = storedName);
        }

        // Admin Dashboard loading
        if (document.getElementById("admin-settings-email") && storedEmail) {
            document.getElementById("admin-settings-email").value = storedEmail;
        }
        if (storedName) {
            if (document.getElementById("admin-settings-name")) {
                document.getElementById("admin-settings-name").value = storedName;
            }
            const adminWelcomeSpan = document.getElementById("admin-welcome-name");
            if (adminWelcomeSpan) adminWelcomeSpan.textContent = storedName;

            const adminDisplaySpan = document.getElementById("admin-display-name");
            if (adminDisplaySpan) adminDisplaySpan.textContent = storedName;
        }
    };

    // Setup input character restrictions
    const enforceRestrictions = () => {
        // Find name inputs: Full Name, username, etc.
        const nameInputs = document.querySelectorAll(
            'input[id*="name"], input[id*="username"], input[placeholder*="Name"], input[placeholder*="name"]'
        );
        nameInputs.forEach(input => {
            input.addEventListener("input", (e) => {
                const start = e.target.selectionStart;
                const end = e.target.selectionEnd;
                const oldVal = e.target.value;
                const newVal = oldVal.replace(/[^a-zA-Z\s]/g, "");
                if (newVal !== oldVal) {
                    e.target.value = newVal;
                    // Restore cursor position
                    const diff = oldVal.length - newVal.length;
                    e.target.setSelectionRange(start - diff, end - diff);
                }
            });
        });

        // Find phone inputs
        const phoneInputs = document.querySelectorAll(
            'input[type="tel"], input[id*="phone"], input[placeholder*="Phone"], input[placeholder*="phone"]'
        );
        phoneInputs.forEach(input => {
            input.addEventListener("input", (e) => {
                const oldVal = e.target.value;
                let newVal = oldVal.replace(/[^0-9]/g, "");
                if (newVal.length > 10) {
                    newVal = newVal.substring(0, 10);
                }
                if (newVal !== oldVal) {
                    e.target.value = newVal;
                }
            });
        });
    };

    // Hook Search Inputs to 404 on non-empty query submission
    const setupSearchValidation = () => {
        document.addEventListener("click", (e) => {
            // 1. Check if clicked a search icon
            const icon = e.target.closest(".fa-magnifying-glass, .fa-search");
            if (icon) {
                const container = icon.parentElement;
                if (container) {
                    const input = container.querySelector('input[placeholder*="Search"], input[placeholder*="search"]');
                    if (input && input.value.trim() !== "") {
                        window.location.href = "404.html";
                        return;
                    }
                }
            }

            // 2. Check if clicked a button (like Filter) next to a search input
            const button = e.target.closest("button");
            if (button) {
                const container = button.parentElement;
                if (container) {
                    const input = container.querySelector('input[placeholder*="Search"], input[placeholder*="search"]');
                    if (input && input.value.trim() !== "") {
                        window.location.href = "404.html";
                        return;
                    }
                }
            }
        });

        document.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                const input = e.target;
                if (input && input.tagName === "INPUT" && (input.placeholder.toLowerCase().includes("search") || input.id.toLowerCase().includes("search"))) {
                    if (input.value.trim() !== "") {
                        window.location.href = "404.html";
                    }
                }
            }
        });
    };

    // Initialize logic
    setupAllFormsValidation();
    loadStateFromLocalStorage();
    enforceRestrictions();
    setupSearchValidation();

    // ================= GLOBAL CLICK-TO-404 NAVIGATOR =================
    document.body.addEventListener("click", (e) => {
        let target = e.target;
        let shouldGoTo404 = false;

        const currentPath = decodeURIComponent(window.location.pathname).toLowerCase();
        const isDashboard = currentPath.includes("dashboard") || currentPath.includes("user dashboard");

        while (target && target !== document.body) {
            // Always ignore mobile menu toggles, hamburgers and close sidebar buttons
            if (target.closest) {
                const isMenuToggle = target.closest("#mobile-menu-btn") !== null ||
                                     target.closest("#close-sidebar") !== null ||
                                     target.closest("#hamburger") !== null ||
                                     target.closest(".hamburger") !== null ||
                                     target.closest(".mobile-menu-btn") !== null;
                if (isMenuToggle) {
                    shouldGoTo404 = false;
                    break;
                }
            }

            if (isDashboard) {
                // Dashboard specific strict 404 logic
                if (target.tagName === "A" || target.tagName === "BUTTON") {
                    const isAllowed = target.closest("aside") !== null || 
                                     target.closest("#mobile-menu-btn") !== null || 
                                     target.closest("#close-sidebar") !== null || 
                                     target.closest("#save-profile-btn") !== null || 
                                     target.closest("#admin-save-btn") !== null;
                    
                    const href = target.getAttribute("href");
                    if (!isAllowed || href === "404.html") {
                        shouldGoTo404 = true;
                    }
                    break;
                }
            } else {
                // Non-dashboard standard logic
                // Check links
                if (target.tagName === "A") {
                    const href = target.getAttribute("href");
                    const onclickStr = target.getAttribute("onclick") || "";
                    
                    // Keep footer nav links routing to 404.html unless allowed
                    if (target.closest("footer") || target.closest(".modern-footer")) {
                        if (!target.classList.contains("footer-logo-link") && !target.closest(".footer-logo-link")) {
                            shouldGoTo404 = true;
                            break;
                        }
                    }

                    if (href && !onclickStr) {
                        const cleanHref = decodeURIComponent(href.split("#")[0].split("?")[0].replace(/^\.\//, ''));
                        const allowedHrefs = [
                            "index.html",
                            "about.html",
                            "services.html",
                            "blog.html",
                            "contact.html",
                            "login.html",
                            "signup.html",
                            "forgotpassword.html",
                            "user dashboard.html",
                            "admindashboard.html",
                            "pricing.html",
                            "product.html"
                        ];
                        
                        if (cleanHref === "404.html" || cleanHref === "" || cleanHref === "#" || !allowedHrefs.includes(cleanHref)) {
                            shouldGoTo404 = true;
                        }
                    } else if (!onclickStr) {
                        shouldGoTo404 = true;
                    }
                    break;
                }

                // Check buttons
                if (target.tagName === "BUTTON") {
                    const isFormRelated = target.type === "submit" || target.closest("form");
                    const onclickStr = target.getAttribute("onclick") || "";
                    if (onclickStr.includes("404.html")) {
                        shouldGoTo404 = true;
                    } else if (!isFormRelated && !onclickStr) {
                        shouldGoTo404 = true;
                    }
                    break;
                }
            }

            // Move up
            target = target.parentElement;
        }

        if (shouldGoTo404) {
            const isNative404Link = e.target.closest("a") && e.target.closest("a").getAttribute("href") === "404.html";
            if (!isNative404Link && !window.location.pathname.includes("404.html")) {
                e.preventDefault();
                e.stopPropagation();
                window.location.href = "404.html";
            }
        }
    });
});

// Hide preloader when window is fully loaded (for pages running validation.js)
window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    if (preloader) {
        setTimeout(() => {
            preloader.classList.add('fade-out');
            setTimeout(() => {
                if (preloader.parentNode) {
                    preloader.parentNode.removeChild(preloader);
                }
            }, 600);
        }, 2000); // Let preloader animation last for 2 seconds
    }
});
