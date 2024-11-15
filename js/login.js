// Theme handling
const themeToggle = document.getElementById('themeToggle');
const themeToggleMobile = document.getElementById('themeToggle-mobile');

const root = document.documentElement;

function setTheme(theme) {
    root.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    themeToggle.innerHTML = theme === 'dark'
        ? '<i class="fas fa-sun"></i>'
        : '<i class="fas fa-moon"></i>';
}

// Initialize theme
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
});

themeToggle.addEventListener('click', () => {
    const currentTheme = root.getAttribute('data-theme');
    setTheme(currentTheme === 'dark' ? 'light' : 'dark');
});
themeToggleMobile.addEventListener('click', () => {
    const currentTheme = root.getAttribute('data-theme');
    setTheme(currentTheme === 'dark' ? 'light' : 'dark');
});
// Mobile menu handling
const mobileMenuButton = document.getElementById('mobile-menu-button');
const mobileMenuClose = document.getElementById('mobile-menu-close');
const mobileMenu = document.getElementById('mobile-menu');
const menuContent = document.querySelector('.menu-content');

// Handle mobile menu
function toggleMobileMenu(show) {
    if (show) {
        mobileMenu.classList.remove('hidden');
        setTimeout(() => {
            mobileMenu.classList.add('menu-overlay', 'active');

        }, 10);
        // document.body.style.overflow = 'hidden'; // Prevent background scrolling
    } else {
        mobileMenu.classList.remove('active');
        setTimeout(() => {
            mobileMenu.classList.add('hidden');
            document.body.style.overflow = '';
        }, 300);
    }
}

if (mobileMenuButton) {
    mobileMenuButton.addEventListener('click', () => toggleMobileMenu(true));
}

if (mobileMenuClose) {
    mobileMenuClose.addEventListener('click', () => toggleMobileMenu(false));
}

// Close menu on outside click
if (mobileMenu) {
    mobileMenu.addEventListener('click', (e) => {
        if (e.target === mobileMenu) {
            toggleMobileMenu(false);
        }
    });
}

// Handle smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            // Close mobile menu if open
            toggleMobileMenu(false);

            // Smooth scroll to target
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Create toast container
const toastContainer = document.createElement('div');
toastContainer.className = 'toast-container';
document.body.appendChild(toastContainer);

// Updated Toast Functionality
function showToast(message, type = 'success') {
    // Create toast container if it doesn't exist
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container';
        document.body.appendChild(toastContainer);
    }

    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;


    // Add message
    const messageSpan = document.createElement('span');
    messageSpan.textContent = message;

    // Assemble toast

    toast.appendChild(messageSpan);

    // Add to container
    toastContainer.appendChild(toast);

    // Show toast with animation
    requestAnimationFrame(() => {
        toast.classList.add('show');
    });

    // Auto dismiss after 5 seconds
    const dismissTimeout = setTimeout(() => {
        dismissToast(toast);
    }, 5000);

    // Click to dismiss
    toast.addEventListener('click', () => {
        clearTimeout(dismissTimeout);
        dismissToast(toast);
    });
}

function dismissToast(toast) {
    toast.classList.add('hide');
    setTimeout(() => {
        toast.remove();
        const container = document.querySelector('.toast-container');
        if (container && container.children.length === 0) {
            container.remove();
        }
    }, 300);
}




// Password Toggle
const togglePassword = () => {
    const passwordInput = document.getElementById('password');
    const toggleIcon = document.querySelector('.password-toggle');
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleIcon.textContent = '🔒';
    } else {
        passwordInput.type = 'password';
        toggleIcon.textContent = '👀';
    }
};

// Initialize form elements
const loginForm = document.getElementById('loginForm');
const verificationForm = document.getElementById('verificationForm');
const verifyButton = document.getElementById('verifyButton');
const phoneNumberInput = document.getElementById('phoneNumber');
const verificationInputs = document.querySelectorAll('.verification-input');
const submitButton = document.getElementById('submitButton');
let storedPassword = '';

// Initialize phone input
const phoneInput = window.intlTelInput(phoneNumberInput, {
    utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/utils.js",
    preferredCountries: ["pk", "ng", "in", "za", "ke", "tz", "nl"],
    separateDialCode: true,
});

// Detect user's country
fetch('https://ipapi.co/json/')
    .then(response => response.json())
    .then(data => {
        const countryCode = data.country_code.toLowerCase();
        phoneInput.setCountry(countryCode);
    })
    .catch(error => {
        console.error('Error fetching IP data:', error);
    });

// Setup verification inputs
function setupVerificationInputs() {
    verificationInputs.forEach((input, index) => {
        // Clear any existing values
        input.value = '';

        // Handle input
        input.addEventListener('input', (e) => {
            if (e.target.value.length === 1) {
                if (index < verificationInputs.length - 1) {
                    verificationInputs[index + 1].focus();
                } else {
                    // All inputs filled, trigger verify
                    document.getElementById('verifyButton').click();
                }
            }
        });
        // Handle keydown
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && e.target.value.length === 0 && index > 0) {
                verificationInputs[index - 1].focus();
            }
        });

        // Handle paste
        input.addEventListener('paste', (e) => {
            e.preventDefault();
            const pastedData = e.clipboardData.getData('text').slice(0, verificationInputs.length);
            [...pastedData].forEach((char, i) => {
                if (i < verificationInputs.length) {
                    verificationInputs[i].value = char;
                }
            });
            if (pastedData.length === verificationInputs.length) {
                verifyButton.focus();
            }
        });
    });
}
// Frontend: Updated login form handler
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    submitButton.disabled = true;
    submitButton.innerHTML = 'Logging in... <div class="loading"></div>';

    const phoneNumber = phoneInput.getNumber().replace(/\s+/g, '').replace('+', '');
    const password = document.getElementById('password').value;

    storedPassword = password;

    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phoneNumber, password })
        });

        const data = await response.json();

        if (response.ok) {
            if (data.requireVerification) {
                // Show the verification form if needed
                if (data.message.includes('sent')) {
                    showToast('Verification code sent to your WhatsApp', 'success');
                } else {
                    showToast('Please enter verification code', 'info');
                }
                loginForm.style.display = 'none';
                verificationForm.style.display = 'block';
                setupVerificationInputs();
            } else {
                showToast('Login successful! Redirecting...', 'success');
                setTimeout(() => {
                    window.location.href = '/dashboard'; // Redirect after successful login
                }, 1500);
            }
    
        } else {
            showToast(data.error || 'Login failed. Please try again.', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('An error occurred. Please try again.', 'error');
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Login';
    }
});

// Verification submission
verifyButton.addEventListener('click', async () => {
    const phoneNumber = phoneInput.getNumber().replace(/\s+/g, '').replace('+', '');
    let code = '';
    verificationInputs.forEach((input) => {
        code += input.value;
    });

    if (code.length !== verificationInputs.length) {
        showToast('Please enter the complete verification code', 'error');
        return;
    }

    verifyButton.disabled = true;
    verifyButton.innerHTML = 'Verifying... <div class="loading"></div>';

    try {
        const response = await fetch('/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                phoneNumber,
                code,
                password: storedPassword
            })
        });
        const data = await response.json();

        if (response.ok) {
            showToast('Verification successful! Redirecting...', 'success');
            setTimeout(() => {
                window.location.href = '/dashboard';
            }, 1500);
        } else {
            showToast(data.message || 'Verification failed', 'error');
            verificationInputs.forEach(input => input.value = '');
            verificationInputs[0].focus();
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('An error occurred during verification', 'error');
    } finally {
        verifyButton.disabled = false;
        verifyButton.textContent = 'Verify';
    }
});

// Check login status on page load
async function checkLogin() {
    try {
        const response = await fetch('/check-login');
        if (response.ok) {
            window.location.href = '/dashboard';
        }
    } catch (error) {
        console.log('Not logged in');
    }
}

// Clear password on page unload
window.addEventListener('unload', () => {
    storedPassword = '';
});

// Initialize the page
checkLogin();
setupVerificationInputs();
