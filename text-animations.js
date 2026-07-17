/**
 * Stackly Financial - SplitText Character Animations using GSAP
 */

// Fallback lightweight SplitText implementation
class SplitText {
  constructor(elementOrSelector, options = {}) {
    const elements = typeof elementOrSelector === 'string' 
      ? document.querySelectorAll(elementOrSelector) 
      : (elementOrSelector.length !== undefined && !elementOrSelector.nodeType ? elementOrSelector : [elementOrSelector]);
    
    this.elements = Array.from(elements);
    this.chars = [];
    this.words = [];
    this.lines = [];
    
    this.elements.forEach(el => {
      this.splitElement(el);
    });
  }

  splitElement(el) {
    if (el.dataset.originalHtml) {
      el.innerHTML = el.dataset.originalHtml;
    } else {
      el.dataset.originalHtml = el.innerHTML;
    }
    
    const processNode = (node, parent) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent;
        const tempDiv = document.createElement('div');
        const words = text.split(/(\s+)/);
        
        words.forEach(word => {
          if (word.trim() === '') {
            tempDiv.appendChild(document.createTextNode(word));
          } else {
            const wordSpan = document.createElement('span');
            wordSpan.className = 'split-word';
            wordSpan.style.display = 'inline-block';
            wordSpan.style.whiteSpace = 'nowrap';
            
            for (let i = 0; i < word.length; i++) {
              const charSpan = document.createElement('span');
              charSpan.className = 'split-char';
              charSpan.style.display = 'inline-block';
              charSpan.textContent = word[i];
              wordSpan.appendChild(charSpan);
              this.chars.push(charSpan);
            }
            this.words.push(wordSpan);
            tempDiv.appendChild(wordSpan);
          }
        });
        
        while (tempDiv.firstChild) {
          parent.appendChild(tempDiv.firstChild);
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const clone = node.cloneNode(false);
        parent.appendChild(clone);
        Array.from(node.childNodes).forEach(child => {
          processNode(child, clone);
        });
      }
    };

    const originalNodes = Array.from(el.childNodes);
    el.innerHTML = '';
    originalNodes.forEach(node => {
      processNode(node, el);
    });
  }

  revert() {
    this.elements.forEach(el => {
      if (el.dataset.originalHtml) {
        el.innerHTML = el.dataset.originalHtml;
        delete el.dataset.originalHtml;
      }
    });
  }

  static create(elementOrSelector, options = {}) {
    return new SplitText(elementOrSelector, options);
  }
}

// Expose globally
window.SplitText = SplitText;

// Global animation function
window.animateText = function(el) {
    if (typeof gsap === "undefined" || !el) return;
    
    el.style.perspective = "500px";
    const split = new SplitText(el);
    
    gsap.from(split.chars, {
        x: 100,
        opacity: 0,
        duration: 0.5, 
        ease: "power4.out",
        stagger: 0.015
    });
};

// Preloader state management
let preloaderFinished = false;
const queuedElements = [];

function triggerQueuedAnimations() {
    queuedElements.forEach(el => {
        if (el.dataset.shouldAnimate === "true" && !el.classList.contains("text-animated")) {
            el.classList.add("text-animated");
            window.animateText(el);
        }
    });
}

function initPreloaderObserver() {
    const preloader = document.getElementById("preloader");
    if (!preloader || preloader.classList.contains("fade-out")) {
        preloaderFinished = true;
        triggerQueuedAnimations();
        return;
    }

    // Fallback timeout to guarantee animations run after 3 seconds
    const fallbackTimeout = setTimeout(() => {
        if (!preloaderFinished) {
            preloaderFinished = true;
            triggerQueuedAnimations();
        }
    }, 3000);

    // Monitor when preloader fades out or is removed
    const classObserver = new MutationObserver(() => {
        if (preloader.classList.contains("fade-out")) {
            preloaderFinished = true;
            triggerQueuedAnimations();
            clearTimeout(fallbackTimeout);
            classObserver.disconnect();
        }
    });
    classObserver.observe(preloader, { attributes: true, attributeFilter: ["class"] });

    const domObserver = new MutationObserver(() => {
        if (!document.getElementById("preloader")) {
            preloaderFinished = true;
            triggerQueuedAnimations();
            clearTimeout(fallbackTimeout);
            domObserver.disconnect();
        }
    });
    domObserver.observe(document.body, { childList: true, subtree: true });
}

function initTextAnimations() {
    if (typeof gsap === "undefined") {
        console.warn("GSAP is not loaded. Text animations skipped.");
        return;
    }

    // Initialize preloader monitoring
    initPreloaderObserver();

    // Select targets based on page type to prevent animating dashboard data elements
    const isDashboard = window.location.pathname.toLowerCase().includes("dashboard");
    const selector = isDashboard 
        ? "h1, .text" 
        : "h1, h2, h3, .text";
    
    const allElements = document.querySelectorAll(selector);
    const targets = Array.from(allElements).filter(el => {
        if (el.classList.contains("logo-text")) return false;
        
        // Exclude interactive/navigational/layout containers
        if (el.closest("header") || el.closest("footer") || el.closest("button") || el.closest("a") || el.closest("form")) {
            return false;
        }
        
        if (!el.textContent.trim()) return false;
        return true;
    });

    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -20px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                
                if (!el.classList.contains("text-animated")) {
                    if (preloaderFinished) {
                        el.classList.add("text-animated");
                        window.animateText(el);
                    } else {
                        el.dataset.shouldAnimate = "true";
                        queuedElements.push(el);
                    }
                }
                
                observer.unobserve(el);
            }
        });
    }, observerOptions);

    targets.forEach(el => {
        observer.observe(el);
    });
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initTextAnimations);
} else {
    initTextAnimations();
}
