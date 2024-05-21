const cachables = {
	"/SalaMuseoGames/": "networkFirst",
	"/ext-bin-1/": "cacheFirst",
};

const checkUrlCaching = (url) => (cachables[url] || cachables[`/${url.split('://').slice(1).join('://').split('/')[1]}/`]);

const putResponseInCache = (request, response) => {
	if (request.method === 'GET' && response.ok) {
		return caches.open('GamingShitposting/v1').then((cache) => {
			try {
				return cache.put(request, response.clone());
			} catch(err) {}
		});
	}
}

const strategies = {
	networkFirst: async (request) => {
		try {
			const networkResponse = await fetch(request);
			await putResponseInCache(request, networkResponse);
			return networkResponse;
		} catch (error) {
			return ((await caches.match(request)) || Response.error());
		}
	},
	cacheFirst: async (request) => {
		const fetchResponsePromise = fetch(request).then(async (networkResponse) => {
			await putResponseInCache(request, networkResponse);
			return networkResponse;
		});
		return ((await caches.match(request)) || (await fetchResponsePromise));
	},
}

self.addEventListener('activate', () => self.clients.claim());
self.addEventListener('fetch', (event) => {
	const strategy = strategies[checkUrlCaching(event.request.url)];
	if (strategy) {
		return event.respondWith(strategy(event.request));
	}
});
