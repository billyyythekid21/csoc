self.addEventListener('push', (event) => {
    const data = event.data ? event.data.json() : {};
    const options = {
        body: data.body,
        icon: '/favicon.ico',
    };
    event.waitUntil(self.registration.showNotification(data.title, options));
});