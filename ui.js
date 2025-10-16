let elements = {};
let skipTimer = null;

// Initialize the module with all the DOM elements it needs to control
export function init(els) {
    elements = els;
}

export function showSplashScreen() {
    elements.splash.classList.add('show');
    const splashVisibleMs = 1200;
    setTimeout(() => {
        elements.splash.classList.add('hide');
        setTimeout(()=> { elements.splash.style.display = 'none'; }, 480);
    }, splashVisibleMs);
}

export function setupReserveButton(){
  elements.reserveBtn.style.opacity = '1';
  elements.reserveBtn.style.cursor = 'pointer';
  elements.reserveBtn.classList.add('glowing');
}

export function openPopup1(){
  console.log('openPopup1 function called in ui.js');
  elements.overlay1.classList.add('visible');
  elements.overlay1.setAttribute('aria-hidden','false');
  elements.skipBtn.classList.remove('visible');
  elements.skipBtn.setAttribute('aria-hidden','true');
  
  updateSolveButtonState(); // This function is self-contained within the UI module
  elements.notesEl.addEventListener('input', updateSolveButtonState);
  elements.solveBtn.focus();

  clearTimeout(skipTimer);
  skipTimer = setTimeout(()=>{
    elements.skipBtn.classList.add('visible');
    elements.skipBtn.setAttribute('aria-hidden','false');
  }, 2500);
}

function updateSolveButtonState(){
  const hasText = elements.notesEl.value.trim().length > 0;
  elements.solveBtn.disabled = !hasText;
  elements.solveBtn.style.opacity = hasText ? '1' : '0.5';
  elements.solveBtn.style.cursor = hasText ? 'pointer' : 'not-allowed';
  elements.solveBtn.classList.toggle('glowing', hasText);
}

export function hidePopup1() {
    elements.overlay1.classList.remove('visible');
    elements.overlay1.setAttribute('aria-hidden','true');
    elements.skipBtn.classList.remove('visible');
    elements.skipBtn.setAttribute('aria-hidden','true');
}

export function showFinalPopup(solved){
  elements.p2title.innerHTML = solved
    ? 'Thank you for pre-registering and sharing your problems with <strong class="asimovian-regular" style="color:var(--accent-purple);font-weight:800">Solven.app</strong>'
    : 'Thank you for pre-registering';

  elements.p2lead.innerHTML = 'You will receive an email once our early version releases';
  elements.p2text.innerHTML = `Again, thanks for your <strong id="emph1" style="color:var(--accent-purple);font-weight:800">attention</strong>, a valuable <strong id="emph2" style="color:var(--accent-purple);font-weight:800">asset</strong>.`;
  
  elements.overlay2.classList.add('visible');
  elements.overlay2.setAttribute('aria-hidden','false');
  elements.closeFinal.focus();
}

export function setupAccessibility(){
    document.addEventListener('keydown', ev => {
        if(ev.key==='Escape'){
            elements.overlay1.classList.remove('visible');
            elements.overlay2.classList.remove('visible');
        }
    });

    elements.overlay1.addEventListener('click', e => { 
        if(e.target === elements.overlay1) elements.overlay1.classList.remove('visible'); 
    });
    elements.overlay2.addEventListener('click', e => { 
        if(e.target === elements.overlay2) elements.overlay2.classList.remove('visible'); 
    });
}