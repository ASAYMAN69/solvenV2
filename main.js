console.log('main.js is executing!'); // Added console.log
import { countries } from './data.js';
import { sendLeadsRequest, sendNotesRequest } from './api.js';
import { init as uiInit, showSplashScreen, setupReserveButton, openPopup1, hidePopup1, showFinalPopup, setupAccessibility } from './ui.js';

// --- DOM Element Selection ---
const $ = s => document.querySelector(s);
const elements = {
    preForm: $('#preForm'),
    nameInput: $('#name'),
    countrySelect: $('#country'),
    prefixEl: $('#prefix'),
    phoneInput: $('#phone'),
    roleSelect: $('#role'),
    otherRoleWrap: $('#otherRoleWrap'),
    otherRoleInput: $('#otherRole'),
    emailInput: $('#email'),
    reserveBtn: $('#reserveBtn'),
    uniqueToolsLinkMain: $('#uniqueToolsLinkMain'), // Unique main tools link
    // UI module elements
    splash: $('#splash'),
    overlay1: $('#overlay1'),
    overlay2: $('#overlay2'),
    skipBtn: $('#skipBtn'),
    solveBtn: $('#solveBtn'),
    notesEl: $('#notes'),
    closeFinal: $('#closeFinal'), // This will be removed later, but keep for now to avoid errors
    toolsBtnPopup1: $('#toolsBtnPopup1'), // New element
    toolsBtnPopup2: $('#toolsBtnPopup2'), // New element
    p2title: $('#p2title'),
    p2lead: $('#p2lead'),
    p2text: $('#p2text'),
};

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
  uiInit(elements);
  populateCountries();
  showSplashScreen();
  setupReserveButton();
  setupEventListeners();
  setupAccessibility();
  watchForTouch(); // Set up touch detection for hover effects
});

// --- Functions ---
function populateCountries(){
    // Clear existing options, including the default "Choose a country"
    elements.countrySelect.innerHTML = '<option value="" disabled selected>Choose a country</option>';
    
    countries.forEach(c => {
        const o = document.createElement('option');
        o.value = c.name; o.dataset.code = c.code; o.textContent = c.name;
        elements.countrySelect.appendChild(o);
    });
    console.log('Country select element:', elements.countrySelect);
    console.log('Number of options after population:', elements.countrySelect.options.length);
}

function setupEventListeners(){
    elements.countrySelect.addEventListener('change', e => {
        const opt = e.target.selectedOptions[0];
        elements.prefixEl.textContent = opt?.dataset?.code || '+--';
    });

    elements.roleSelect.addEventListener('change', e => {
        if(e.target.value === 'Others') {
            elements.otherRoleWrap.classList.remove('hidden');
            elements.otherRoleInput.focus();
        } else {
            elements.otherRoleWrap.classList.add('hidden');
            elements.otherRoleInput.value = '';
        }
    });

    elements.phoneInput.addEventListener('input', e => {
        let value = e.target.value;

        // 1. Filter allowed characters and prevent multiple spaces
        let cleanedValue = '';
        let lastCharWasSpace = false;
        for (let i = 0; i < value.length; i++) {
            const char = value[i];
            if (/[0-9()\-\s]/.test(char)) { // Allowed characters
                if (char === ' ') {
                    if (!lastCharWasSpace) {
                        cleanedValue += char;
                        lastCharWasSpace = true;
                    }
                } else {
                    cleanedValue += char;
                    lastCharWasSpace = false;
                }
            }
        }

        // 2. Enforce maximum 11 digits
        const digitsOnly = cleanedValue.replace(/[^0-9]/g, '');
        if (digitsOnly.length > 11) {
            let newCleanedValue = '';
            let digitCount = 0;
            for (let i = 0; i < cleanedValue.length; i++) {
                const char = cleanedValue[i];
                if (/[0-9]/.test(char)) {
                    if (digitCount < 11) {
                        newCleanedValue += char;
                        digitCount++;
                    }
                } else {
                    newCleanedValue += char;
                }  
            }
            cleanedValue = newCleanedValue;
        }
        
        e.target.value = cleanedValue;
    });

    elements.emailInput.addEventListener('input', e => {
        const email = e.target.value;
        const emailRegex = /^[^@]+@[^@]+\.[^@]+$/; // Basic email regex

        if (emailRegex.test(email)) {
            e.target.setCustomValidity(''); // Clear custom validity if valid
        } else {
            e.target.setCustomValidity('Please enter a valid email address.'); // Set custom validity if invalid
        }
    });

    elements.preForm.addEventListener('submit', handleSubmit);
    elements.skipBtn.addEventListener('click', onSkip);
    elements.solveBtn.addEventListener('click', onSolveClicked);
    

    elements.toolsBtnPopup1.addEventListener('click', () => {
        window.open('https://tools.solven.app', '_blank');
    });
    elements.toolsBtnPopup2.addEventListener('click', () => {
        window.open('https://tools.solven.app', '_blank');
    });
    // Removed elements.closeFinal listener as it's replaced by toolsBtnPopup2
}

function watchForTouch() {
  // Add a class to the body on the first touch event
  window.addEventListener('touchstart', function onFirstTouch() {
    document.body.classList.add('has-touch');
    // Remove the event listener so it only runs once
    window.removeEventListener('touchstart', onFirstTouch, false);
  }, { once: true, passive: true });
}

function gatherFormData(){
  const name = elements.nameInput.value.trim();
  const country = elements.countrySelect.value;
  const email = elements.emailInput.value.trim();
  let role = elements.roleSelect.value;
  if (role === 'Others') {
    role = `Others - ${elements.otherRoleInput.value.trim()}`;
  }
  const prefix = elements.prefixEl.textContent || '';
  const phone = prefix + (elements.phoneInput.value.trim() ? (' ' + elements.phoneInput.value.trim()) : '');
  
  return { name, country, email, role, phone };
}

// --- Event Handlers ---
async function handleSubmit(ev){
  ev.preventDefault();
  console.log('handleSubmit called');

  elements.reserveBtn.disabled = true; // Disable button to prevent multiple clicks

  // Validation
  if (!elements.nameInput.value.trim()) {
    elements.reserveBtn.disabled = false; // Re-enable if validation fails
    console.log('Validation failed: nameInput');
    return elements.nameInput.focus();
  }
  if (!elements.countrySelect.value) {
    elements.reserveBtn.disabled = false; // Re-enable if validation fails
    console.log('Validation failed: countrySelect');
    return elements.countrySelect.focus();
  }
  if (!elements.phoneInput.value.trim() || !/^[\d\s\-\(\)\+]{7,}$/.test(elements.phoneInput.value.trim())) {
    elements.reserveBtn.disabled = false; // Re-enable if validation fails
    console.log('Validation failed: phoneInput');
    return elements.phoneInput.focus();
  }
  if (!elements.roleSelect.value) {
    elements.reserveBtn.disabled = false; // Re-enable if validation fails
    console.log('Validation failed: roleSelect');
    return elements.roleSelect.focus();
  }
  if (elements.roleSelect.value === 'Others' && !elements.otherRoleInput.value.trim()) {
    elements.reserveBtn.disabled = false; // Re-enable if validation fails
    console.log('Validation failed: otherRoleInput');
    return elements.otherRoleInput.focus();
  }
  if (!elements.emailInput.value.trim() || !/^\S+@\S+\.\S+$/.test(elements.emailInput.value.trim())) {
    elements.reserveBtn.disabled = false; // Re-enable if validation fails
    console.log('Validation failed: emailInput');
    return elements.emailInput.focus();
  }

  console.log('Validation passed. Sending leads request...');
  const bodyObj = gatherFormData();
  await sendLeadsRequest(bodyObj);
  console.log('Leads request sent. Opening popup1...');
  openPopup1();
  console.log('openPopup1 called.');
}

function onSkip(e){
  e.preventDefault();
  hidePopup1();
  showFinalPopup(false);
}

async function onSolveClicked(e){
  e.preventDefault();
  if(elements.solveBtn.disabled) return;

  hidePopup1();

  const formData = gatherFormData();
  if(!formData.email){ alert('Email not found, cannot submit notes.'); return; }

  await sendNotesRequest(formData.email, elements.notesEl.value.trim());
  showFinalPopup(true);
}
