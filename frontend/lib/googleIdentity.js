import { getGoogleClientId } from './env';

let googleScriptPromise = null;

function loadGoogleScript() {
  if (typeof window === 'undefined') return Promise.reject(new Error('Google login requires a browser.'));
  if (window.google?.accounts?.id) return Promise.resolve(window.google);
  if (googleScriptPromise) return googleScriptPromise;

  googleScriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    if (existing) {
      existing.addEventListener('load', () => resolve(window.google), { once: true });
      existing.addEventListener('error', () => reject(new Error('Failed to load Google Identity Services.')), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(window.google);
    script.onerror = () => reject(new Error('Failed to load Google Identity Services.'));
    document.body.appendChild(script);
  });

  return googleScriptPromise;
}

export async function renderGoogleButton({ elementId, text, callback }) {
  const clientId = getGoogleClientId();
  if (!clientId) throw new Error('GOOGLE_CLIENT_ID is missing.');

  const google = await loadGoogleScript();
  const element = document.getElementById(elementId);
  if (!element) return;

  element.innerHTML = '';
  google.accounts.id.initialize({
    client_id: clientId,
    callback,
  });
  google.accounts.id.renderButton(element, {
    theme: 'outline',
    size: 'large',
    width: 320,
    text,
  });
}
