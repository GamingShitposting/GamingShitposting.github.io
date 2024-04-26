const cachables = {
	"/SalaMuseoGames/": "networkFirst",
	"/ext-bin-1/": "cacheFirst",
};

const checkUrlCaching = (url) => (cachables[url] || cachables[`/${url.split('://').slice(1).join('://').split('/')[1]}/`]);

const putResponseInCache = (request, response) => {
	if (response.ok) {
		caches.open('GamingShitposting/v1').then((cache) => cache.put(request, response.clone()));
	}
}

const strategies = {
	networkFirst: async (request) => {
		try {
			const networkResponse = await fetch(request);
			putResponseInCache(request, networkResponse);
			return networkResponse;
		} catch (error) {
			return ((await caches.match(request)) || Response.error());
		}
	},
	cacheFirst: async (request) => {
		const fetchResponsePromise = fetch(request).then(async (networkResponse) => {
			putResponseInCache(request, networkResponse);
			return networkResponse;
		});
		return (await caches.match(request)) || (await fetchResponsePromise);
	},
}

self.addEventListener('activate', () => self.clients.claim());
self.addEventListener('fetch', (event) => {
	const strategy = strategies[checkUrlCaching(event.request.url)];
	if (strategy) {
		return event.respondWith(strategy(event.request));
	}
});
/* self.addEventListener('fetch', async (event) => {
	try {
		const networkResponse = await fetch(event.request);
		if (networkResponse.ok && checkUrlCachable(event.request.url)) {
			caches.open('GamingShitposting/v1').then((cache) => cache.put(event.request, networkResponse.clone()));
		}
		event.respondWith(networkResponse);
	} catch (error) {
		event.respondWith((await caches.match(event.request)) || Response.error());
	}
}); */
