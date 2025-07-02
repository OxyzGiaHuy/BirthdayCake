// Enhanced Birthday Cake Animation with Error Handling
// Fixed version addressing potential issues

// Check if GSAP is loaded
if (typeof gsap === 'undefined') {
  console.error('GSAP library not loaded');
  throw new Error('GSAP is required for this animation');
}

// Safely register MorphSVG plugin (handle license issues)
try {
  if (window.MorphSVGPlugin) {
    gsap.registerPlugin(MorphSVGPlugin);
  } else {
    console.warn('MorphSVGPlugin not available - some animations may not work');
  }
} catch (error) {
  console.warn('MorphSVGPlugin registration failed:', error.message);
}

// Safe destructuring with fallbacks
const {
  gsap,
  gsap: { to, timeline, set, delayedCall } = {},
  Splitting
} = window;

// Initialize Splitting with error handling
try {
  if (typeof Splitting === 'function') {
    Splitting();
  } else {
    console.warn('Splitting library not available');
  }
} catch (error) {
  console.error('Splitting initialization failed:', error);
}

// Safe element selection with null checks
const BTN = document.querySelector('.birthday-button__button');
const EYES = document.querySelector('.cake__eyes');
const VOLUME_CONTROL = document.querySelector('#volume');

// Validate critical elements
if (!BTN) {
  console.error('Birthday button not found');
  throw new Error('Critical element missing: .birthday-button__button');
}

// Audio loading with error handling and fallbacks
const createAudioWithFallback = (url, name) => {
  const audio = new Audio();
  
  audio.addEventListener('error', (e) => {
    console.warn(`Failed to load ${name} audio from ${url}:`, e);
  });
  
  audio.addEventListener('canplaythrough', () => {
    console.log(`${name} audio loaded successfully`);
  });
  
  // Set source after setting up listeners
  audio.src = url;
  audio.preload = 'auto';
  
  return audio;
};

const SOUNDS = {
  CHEER: createAudioWithFallback(
    'https://s3-us-west-2.amazonaws.com/s.cdpn.io/605876/cheer.mp3',
    'CHEER'
  ),
  MATCH: createAudioWithFallback(
    'https://s3-us-west-2.amazonaws.com/s.cdpn.io/605876/match-strike-trimmed.mp3',
    'MATCH'
  ),
  TUNE: createAudioWithFallback(
    'https://s3-us-west-2.amazonaws.com/s.cdpn.io/605876/happy-birthday-trimmed.mp3',
    'TUNE'
  ),
  ON: createAudioWithFallback(
    'https://assets.codepen.io/605876/switch-on.mp3',
    'ON'
  ),
  BLOW: createAudioWithFallback(
    'https://s3-us-west-2.amazonaws.com/s.cdpn.io/605876/blow-out.mp3',
    'BLOW'
  ),
  POP: createAudioWithFallback(
    'https://s3-us-west-2.amazonaws.com/s.cdpn.io/605876/pop-trimmed.mp3',
    'POP'
  ),
  HORN: createAudioWithFallback(
    'https://s3-us-west-2.amazonaws.com/s.cdpn.io/605876/horn.mp3',
    'HORN'
  )
};

// Safe audio play function
const safePlayAudio = (audio, name) => {
  if (audio && typeof audio.play === 'function') {
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(error => {
        console.warn(`Failed to play ${name} audio:`, error);
      });
    }
  }
};

// Enhanced BLINK function with cleanup
let blinkTimelineId = null;
const BLINK = (eyes) => {
  if (!eyes) {
    console.warn('Eyes element not found for blinking animation');
    return;
  }
  
  gsap.set(eyes, { scaleY: 1 });
  
  // Cleanup previous timeline
  if (eyes.BLINK_TL) {
    eyes.BLINK_TL.kill();
  }
  
  // Clear any existing timeout
  if (blinkTimelineId) {
    clearTimeout(blinkTimelineId);
  }
  
  eyes.BLINK_TL = new gsap.timeline({
    delay: Math.floor(Math.random() * 4) + 1,
    onComplete: () => {
      // Use timeout instead of immediate recursion to prevent stack overflow
      blinkTimelineId = setTimeout(() => BLINK(eyes), 100);
    }
  });
  
  eyes.BLINK_TL.to(eyes, {
    duration: 0.05,
    transformOrigin: '50% 50%',
    scaleY: 0,
    yoyo: true,
    repeat: 1
  });
};

// Initialize blinking only if eyes element exists
if (EYES) {
  BLINK(EYES);
} else {
  console.warn('Cake eyes element not found - blinking animation disabled');
}

// Enhanced timeline functions with error handling
const FROSTING_TL = () => {
  const frostingElement = document.querySelector('#frosting');
  if (!frostingElement) {
    console.warn('Frosting element not found');
    return timeline(); // Return empty timeline
  }
  
  return timeline()
    .to('#frosting', {
      scaleX: 1.015,
      duration: 0.25
    }, 0)
    .to('#frosting', {
      scaleY: 1,
      duration: 1
    }, 0)
    .to('#frosting', {
      duration: 1,
      morphSVG: window.MorphSVGPlugin ? '.cake__frosting--end' : undefined
    }, 0);
};

const SPRINKLES_TL = () => {
  const sprinkles = document.querySelectorAll('.cake__sprinkle');
  if (sprinkles.length === 0) {
    console.warn('No sprinkle elements found');
    return timeline();
  }
  
  return timeline().to('.cake__sprinkle', { 
    scale: 1, 
    duration: 0.06, 
    stagger: 0.02 
  });
};

const SPIN_TL = () => timeline()
  .set('.cake__frosting-patch', { display: 'block' })
  .to(['.cake__frosting--duplicate', '.cake__sprinkles--duplicate'], { x: 0, duration: 1 }, 0)
  .to(['.cake__frosting--start', '.cake__sprinkles--initial'], { x: 65, duration: 1 }, 0)
  .to('.cake__face', { duration: 1, x: -48.82 }, 0);

const flickerSpeed = 0.1;
const FLICKER_TL = timeline()
  .to('.candle__flame-outer', {
    duration: flickerSpeed,
    repeat: -1,
    yoyo: true,
    morphSVG: window.MorphSVGPlugin ? '#flame-outer' : undefined
  })
  .to('.candle__flame-inner', {
    duration: flickerSpeed,
    repeat: -1,
    yoyo: true,
    morphSVG: window.MorphSVGPlugin ? '#flame-inner' : undefined
  }, 0);

const SHAKE_TL = () => timeline({ delay: 0.5 })
  .set('.cake__face', { display: 'none' })
  .set('.cake__face--straining', { display: 'block' })
  .to('.birthday-button', {
    onComplete: () => {
      set('.cake__face--straining', { display: 'none' });
      set('.cake__face', { display: 'block' });
    },
    x: 1,
    y: 1,
    repeat: 13,
    duration: 0.1
  }, 0)
  .to('.cake__candle', {
    onComplete: () => {
      FLICKER_TL.play();
    },
    onStart: () => {
      safePlayAudio(SOUNDS.POP, 'POP');
      delayedCall(0.2, () => safePlayAudio(SOUNDS.POP, 'POP'));
      delayedCall(0.4, () => safePlayAudio(SOUNDS.POP, 'POP'));
    },
    ease: 'Elastic.easeOut',
    duration: 0.2,
    stagger: 0.2,
    scaleY: 1
  }, 0.2);

const FLAME_TL = () => timeline({})
  .to('.cake__candle', { '--flame': 1, stagger: 0.2, duration: 0.1 })
  .to('body', { '--flame': 1, '--lightness': 5, duration: 0.2, delay: 0.2 });

const LIGHTS_OUT = () => timeline().to('body', {
  onStart: () => safePlayAudio(SOUNDS.BLOW, 'BLOW'),
  delay: 0.5,
  '--lightness': 0,
  duration: 0.1,
  '--glow-saturation': 0,
  '--glow-lightness': 0,
  '--glow-alpha': 1,
  '--transparency-alpha': 1
});

const RESET = () => {
  set('.char', {
    '--hue': () => Math.random() * 360,
    '--char-sat': 0,
    '--char-light': 0,
    x: 0,
    y: 0,
    opacity: 1
  });

  set('body', {
    '--glow-saturation': 50,
    '--glow-lightness': 35,
    '--glow-alpha': 0.4,
    '--transparency-alpha': 0,
    '--flame': 0
  });

  set('.cake__candle', { '--flame': 0 });
  to('body', {
    '--lightness': 50,
    duration: 0.25
  });

  set('.cake__frosting--end', { opacity: 0 });
  set('#frosting', {
    transformOrigin: '50% 10%',
    scaleX: 0,
    scaleY: 0
  });

  set('.cake__frosting-patch', { display: 'none' });
  set(['.cake__frosting--duplicate', '.cake__sprinkles--duplicate'], { x: -65 });
  set('.cake__face', { x: -110 });
  set('.cake__face--straining', { display: 'none' });
  set('.cake__sprinkle', {
    '--sprinkle-hue': () => Math.random() * 360,
    scale: 0,
    transformOrigin: '50% 50%'
  });

  set('.birthday-button', { scale: 0.6, x: 0, y: 0 });
  set('.birthday-button__cake', { display: 'none' });
  set('.cake__candle', { scaleY: 0, transformOrigin: '50% 100%' });
};

// Initialize
RESET();

// Enhanced master timeline with error handling
const MASTER_TL = timeline({
  onStart: () => {
    safePlayAudio(SOUNDS.ON, 'ON');
  },
  onComplete: () => {
    delayedCall(2, RESET);
    if (BTN) {
      BTN.removeAttribute('disabled');
    }
  },
  paused: true
})
.set('.birthday-button__cake', { display: 'block' })
.to('.birthday-button', {
  onStart: () => safePlayAudio(SOUNDS.CHEER, 'CHEER'),
  scale: 1,
  duration: 0.2
})
.to('.char', { '--char-sat': 70, '--char-light': 65, duration: 0.2 }, 0)
.to('.char', {
  onStart: () => safePlayAudio(SOUNDS.HORN, 'HORN'),
  delay: 0.75,
  y: () => gsap.utils.random(-100, -200),
  x: () => gsap.utils.random(-50, 50),
  duration: () => gsap.utils.random(0.5, 1)
})
.to('.char', { opacity: 0, duration: 0.25 }, '>-0.5')
.add(FROSTING_TL())
.add(SPRINKLES_TL())
.add(SPIN_TL())
.add(SHAKE_TL())
.add(FLAME_TL(), 'FLAME_ON')
.add(LIGHTS_OUT(), 'LIGHTS_OUT');

// Enhanced audio event handling
const setupAudioEvents = () => {
  SOUNDS.TUNE.onended = SOUNDS.MATCH.onended = () => MASTER_TL.play();
  MASTER_TL.addPause('FLAME_ON', () => safePlayAudio(SOUNDS.MATCH, 'MATCH'));
  MASTER_TL.addPause('LIGHTS_OUT', () => safePlayAudio(SOUNDS.TUNE, 'TUNE'));
};

setupAudioEvents();

// Enhanced button event listener
if (BTN) {
  BTN.addEventListener('click', () => {
    BTN.setAttribute('disabled', true);
    MASTER_TL.restart();
  });
} else {
  console.error('Birthday button not found - click functionality disabled');
}

// Set initial audio state (muted by default)
Object.values(SOUNDS).forEach(sound => {
  if (sound && typeof sound === 'object') {
    sound.muted = true;
  }
});

// Enhanced audio toggle with error handling
const toggleAudio = () => {
  try {
    const currentMutedState = SOUNDS.BLOW.muted;
    Object.values(SOUNDS).forEach(sound => {
      if (sound && typeof sound === 'object') {
        sound.muted = !currentMutedState;
      }
    });
    console.log(`Audio ${currentMutedState ? 'enabled' : 'disabled'}`);
  } catch (error) {
    console.error('Error toggling audio:', error);
  }
};

// Enhanced volume control event listener
if (VOLUME_CONTROL) {
  VOLUME_CONTROL.addEventListener('input', toggleAudio);
  VOLUME_CONTROL.addEventListener('change', toggleAudio); // Fallback for older browsers
} else {
  console.warn('Volume control not found - audio toggle disabled');
}

// Cleanup function for page unload
window.addEventListener('beforeunload', () => {
  // Clear blinking timeout
  if (blinkTimelineId) {
    clearTimeout(blinkTimelineId);
  }
  
  // Kill all timelines
  if (EYES && EYES.BLINK_TL) {
    EYES.BLINK_TL.kill();
  }
  
  MASTER_TL.kill();
  FLICKER_TL.kill();
  
  console.log('Cleanup completed');
});

// Export for debugging (optional)
if (typeof window !== 'undefined') {
  window.BirthdayCakeAnimation = {
    MASTER_TL,
    SOUNDS,
    toggleAudio,
    safePlayAudio
  };
}
