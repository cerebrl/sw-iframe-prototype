/**
 * ========= SW & LISTENER REGISTRATION ============
 */

const secretForm = document.getElementById('secretForm');
const fetchBtn  = document.getElementById('fetchData');
const broadcast = new BroadcastChannel('fetchChannel');

broadcast.onmessage = (event) => {
	console.log(event.data);
};

fetchBtn.addEventListener('click', async (e) => {
  await fetch('/sw.js');
});

secretForm.addEventListener('submit', (event) => {
  event.preventDefault();
	const secret = event.target.children[1].value;
  broadcast.postMessage(secret);
});

const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      navigator.serviceWorker.register('sw.js', { type: 'module' });
    } catch (error) {
      console.error(`SW registration failed with ${error}`);
    }
  }
};

registerServiceWorker();
