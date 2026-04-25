import { db } from '$lib/db/local';
import { invalidateAll } from '$app/navigation';

export async function smartRequest(method: 'POST' | 'PUT' | 'DELETE' | 'PATCH', url: string, body: any, localUpdate: () => Promise<void>) {
    // 1. Perform local update immediately (Optimistic UI)
    await localUpdate();

    // 2. Add to sync queue
    await db.sync_queue.add({
        method,
        url,
        body,
        timestamp: Date.now()
    });

    // 3. Try to sync if online
    if (navigator.onLine) {
        try {
            const actions = await db.sync_queue.toArray();
            // Process the queue (simple version)
            for (const action of actions) {
                const response = await fetch(action.url, {
                    method: action.method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(action.body)
                });
                if (response.ok) {
                    await db.sync_queue.delete(action.id!);
                }
            }
            // After successful sync, refresh SvelteKit data
            invalidateAll();
        } catch (e) {
            console.error('Immediate sync failed', e);
        }
    }
}
