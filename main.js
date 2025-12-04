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
    emailInfo: $('#email-info'),
    customCountrySelect: $('#customCountrySelect'),
    customRoleSelect: $('#customRoleSelect'),
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
  populateRoles(); // Call populateRoles here
  showSplashScreen();
  setupReserveButton();
  setupEventListeners();
  setupAccessibility();
  watchForTouch(); // Set up touch detection for hover effects
});

document.addEventListener('click', closeAllSelect);

// --- Functions ---

function createCustomSelect(selectElement, customSelectDiv) {
  const selectSelectedDiv = customSelectDiv.querySelector('.select-selected');
  const selectItemsDiv = customSelectDiv.querySelector('.select-items');
  const originalOptions = selectElement.querySelectorAll('option');

  // Add ARIA attributes
  selectSelectedDiv.setAttribute('aria-haspopup', 'listbox');
  selectSelectedDiv.setAttribute('aria-expanded', 'false');
  selectSelectedDiv.setAttribute('role', 'combobox');
  selectSelectedDiv.setAttribute('tabindex', '0');
  selectItemsDiv.setAttribute('role', 'listbox');

  // Set initial selected value
  const initialSelectedOption = originalOptions[selectElement.selectedIndex];
  if (initialSelectedOption && initialSelectedOption.value !== "") {
    selectSelectedDiv.innerHTML = initialSelectedOption.innerHTML;
    selectSelectedDiv.classList.remove('placeholder');
  } else {
    selectSelectedDiv.innerHTML = originalOptions[0].innerHTML; // "Choose a country" or "Select your role"
    selectSelectedDiv.classList.add('placeholder');
  }

  // Clear existing custom items (if repopulating)
  selectItemsDiv.innerHTML = '';

  // Create custom options
  for (let i = 0; i < originalOptions.length; i++) {
    const option = originalOptions[i];
    const itemDiv = document.createElement('div');
    itemDiv.innerHTML = option.innerHTML;
    itemDiv.setAttribute('data-value', option.value);
    itemDiv.setAttribute('role', 'option');
    itemDiv.setAttribute('tabindex', '-1'); // Not focusable by default

    if (option.selected) {
      itemDiv.classList.add('same-as-selected');
      itemDiv.setAttribute('aria-selected', 'true');
    } else {
      itemDiv.setAttribute('aria-selected', 'false');
    }

    // Handle placeholder option (first option)
    if (i === 0 && option.value === "") { // Assuming first option is placeholder
      itemDiv.style.display = 'none'; // Hide placeholder in custom list
    }

    itemDiv.addEventListener('click', function(e) {
      // Prevent default to avoid form submission if this is part of a form
      e.preventDefault(); 
      e.stopPropagation(); // Stop propagation to prevent document click from closing immediately

      const prevSelected = selectItemsDiv.querySelector('.same-as-selected');
      if (prevSelected) {
        prevSelected.classList.remove('same-as-selected');
        prevSelected.setAttribute('aria-selected', 'false');
      }
      this.classList.add('same-as-selected');
      this.setAttribute('aria-selected', 'true');

      selectSelectedDiv.innerHTML = this.innerHTML;
      selectSelectedDiv.classList.remove('placeholder');

      // Update the original select box
      selectElement.value = this.getAttribute('data-value');
      selectElement.dispatchEvent(new Event('change', { bubbles: true })); // Trigger change event, allow it to bubble

      closeAllSelect();
      selectSelectedDiv.focus(); // Return focus to the selected div
    });
    selectItemsDiv.appendChild(itemDiv);
  }

  selectSelectedDiv.addEventListener('click', function(e) {
    e.stopPropagation();
    const wasOpen = !selectItemsDiv.classList.contains('visually-hidden');
    closeAllSelect(selectSelectedDiv); // Pass selectSelectedDiv to keep it open if it was already open
    
    if (!wasOpen) {
      this.classList.toggle('select-arrow-active');
      selectItemsDiv.classList.toggle('visually-hidden');
      this.setAttribute('aria-expanded', 'true');
      selectItemsDiv.focus(); // Focus the dropdown list itself
    } else {
      this.setAttribute('aria-expanded', 'false');
    }
  });

  // Keyboard navigation for selectSelectedDiv
  selectSelectedDiv.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault(); // Prevent scrolling or default action
      this.click(); // Simulate a click to open the dropdown
      setTimeout(() => {
        const firstOption = selectItemsDiv.querySelector('[role="option"]:not([style*="display: none"])');
        if (firstOption) {
          firstOption.focus();
        }
      }, 0);
    }
  });

  // Keyboard navigation for selectItemsDiv (and its children)
  selectItemsDiv.addEventListener('keydown', function(e) {
    const options = Array.from(this.querySelectorAll('[role="option"]:not([style*="display: none"])'));
    if (options.length === 0) return;

    let currentIndex = options.indexOf(document.activeElement);
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      currentIndex = (currentIndex + 1) % options.length;
      options[currentIndex].focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      currentIndex = (currentIndex - 1 + options.length) % options.length;
      options[currentIndex].focus();
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (document.activeElement && document.activeElement.getAttribute('role') === 'option') {
        document.activeElement.click(); // Simulate click to select
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      closeAllSelect();
      selectSelectedDiv.focus();
    }
  });
}

function closeAllSelect(elmnt) {
  /* A function that will close all select boxes in the document,
  except the current select box clicked on */
  const customSelects = document.querySelectorAll('.select-items');
  const selectSelecteds = document.querySelectorAll('.select-selected');
  let i, arrNo = [];
  for (i = 0; i < selectSelecteds.length; i++) {
    if (elmnt == selectSelecteds[i]) {
      arrNo.push(i)
    } else {
      selectSelecteds[i].classList.remove('select-arrow-active');
      selectSelecteds[i].setAttribute('aria-expanded', 'false');
    }
  }
  for (i = 0; i < customSelects.length; i++) {
    if (arrNo.indexOf(i)) {
      customSelects[i].classList.add('visually-hidden');
    }
  }
}

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

    // Initialize custom select for country
    createCustomSelect(elements.countrySelect, elements.customCountrySelect);
}

function populateRoles() {
  // Clear existing options, including the default "Select your role"
  elements.roleSelect.innerHTML = `
    <option value="" disabled selected>Select your role</option>
    <option>Entrepreneur</option>
    <option>CEO</option>
    <option>HR</option>
    <option>Developer</option>
    <option>Student</option>
    <option>Others</option>
  `;
  // Initialize custom select for role
  createCustomSelect(elements.roleSelect, elements.customRoleSelect);
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

    elements.emailInput.addEventListener('focus', () => {
        elements.emailInfo.classList.remove('hidden');
    }, { once: true });

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
function handleSubmit(ev){
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
  sendLeadsRequest(bodyObj);
  console.log('Leads request sent. Opening popup1...');
  openPopup1();
  console.log('openPopup1 called.');
}

function onSkip(e){
  e.preventDefault();
  hidePopup1();
  showFinalPopup(false);
}

function onSolveClicked(e){
  e.preventDefault();
  if(elements.solveBtn.disabled) return;

  hidePopup1();

  const formData = gatherFormData();
  if(!formData.email){ alert('Email not found, cannot submit notes.'); return; }

  sendNotesRequest(formData.email, elements.notesEl.value.trim());
  showFinalPopup(true);
}
