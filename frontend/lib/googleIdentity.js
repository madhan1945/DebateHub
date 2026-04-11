import { getGoogleClientId } from './env';

let googleScriptPromise = null;

function loadGoogleScript() {
  if (typeof window === 'undefined') return Promise.reject(new Error('Google login requires a browser.'));
  if (window.google?.accounts?.id) return Promise.resolve(window.google);
  if (googleScriptPromise) return googleScriptPromise;

  googleScriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    if (existing) {
      if (window.google?.accounts?.id) {
        resolve(window.google);
        return;
      }

      existing.addEventListener('load', () => resolve(window.google), { once: true });
      existing.addEventListener('error', () => reject(new Error('Failed to load Google Identity Services.')), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google?.accounts?.id) {
        resolve(window.google);
        return;
      }

      reject(new Error('Google Identity Services loaded but was unavailable in this browser.'));
    };
    script.onerror = () => reject(new Error('Failed to load Google Identity Services.'));
    document.body.appendChild(script);
  });

  googleScriptPromise = googleScriptPromise.catch((error) => {
    googleScriptPromise = null;
    throw error;
  });

  return googleScriptPromise;
}

export async function renderGoogleButton({ elementId, text, callback, onError }) {
  const clientId = getGoogleClientId();
  if (!clientId) throw new Error('GOOGLE_CLIENT_ID is missing.');

  const google = await loadGoogleScript();
  if (!google?.accounts?.id) {
    throw new Error('Google Identity Services is unavailable in this browser.');
  }

  const element = document.getElementById(elementId);
  if (!element) return;

  element.innerHTML = '';
  const width = Math.max(240, Math.min(400, Math.floor(element.getBoundingClientRect().width || 320)));
  google.accounts.id.initialize({
    client_id: clientId,
    callback: (response) => {
      if (!response?.credential) {
        onError?.('Google did not return a sign-in credential. Check the authorised JavaScript origin for this domain.');
        return;
      }
      callback(response);
    },
    ux_mode: 'popup',
    context: text === 'signup_with' ? 'signup' : 'signin',
    auto_select: false,
    use_fedcm_for_prompt: false,
    itp_support: true,
  });
  google.accounts.id.renderButton(element, {
    theme: 'outline',
    size: 'large',
    width,
    text,
  });
}
