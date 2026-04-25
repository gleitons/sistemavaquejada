<script lang="ts">
    import { onMount } from 'svelte';
    import { db } from '$lib/db/local';
    import { browser } from '$app/environment';

    let isOnline = browser ? navigator.onLine : true;
    let isSyncing = false;
    let lastSyncStatus = '';

    async function syncData() {
        if (!isOnline || isSyncing) return;

        isSyncing = true;
        lastSyncStatus = 'Sincronizando...';

        try {
            // 1. Process sync queue
            const actions = await db.sync_queue.toArray();
            
            for (const action of actions) {
                try {
                    const response = await fetch(action.url, {
                        method: action.method,
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(action.body)
                    });

                    if (response.ok) {
                        await db.sync_queue.delete(action.id!);
                    }
                } catch (e) {
                    console.error('Failed to sync action', action, e);
                    // Stop processing if we hit a network error (not a 400/500 error)
                    if (e instanceof TypeError && e.message === 'Failed to fetch') {
                        break;
                    }
                }
            }

            // 2. Fetch fresh data from server to update local DB
            const response = await fetch('/api/sync');
            if (response.ok) {
                const data = await response.json();
                
                await db.transaction('rw', db.vaqueiros, db.animais, db.senhas, db.lotes, async () => {
                    await db.vaqueiros.clear();
                    await db.vaqueiros.bulkAdd(data.vaqueiros);
                    
                    await db.animais.clear();
                    await db.animais.bulkAdd(data.animais);
                    
                    await db.senhas.clear();
                    await db.senhas.bulkAdd(data.senhas);

                    await db.lotes.clear();
                    await db.lotes.bulkAdd(data.lotes);
                });
                
                lastSyncStatus = 'Sincronizado';
                setTimeout(() => { lastSyncStatus = ''; }, 3000);
            }
        } catch (e) {
            console.error('Sync error:', e);
            lastSyncStatus = 'Erro na sincronização';
        } finally {
            isSyncing = false;
        }
    }

    function handleConnectionChange() {
        isOnline = navigator.onLine;
        if (isOnline) {
            syncData();
        }
    }

    onMount(() => {
        window.addEventListener('online', handleConnectionChange);
        window.addEventListener('offline', handleConnectionChange);

        // Initial sync/fetch
        syncData();

        return () => {
            window.removeEventListener('online', handleConnectionChange);
            window.removeEventListener('offline', handleConnectionChange);
        };
    });
</script>

{#if !isOnline}
    <div class="fixed bottom-4 left-4 bg-red-600 text-white px-4 py-2 rounded-full shadow-lg z-50 flex items-center gap-2 text-sm font-medium animate-pulse">
        <span class="w-2 h-2 bg-white rounded-full"></span>
        Modo Offline
    </div>
{:else if isSyncing}
    <div class="fixed bottom-4 left-4 bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg z-50 flex items-center gap-2 text-sm font-medium">
        <svg class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Sincronizando...
    </div>
{:else if lastSyncStatus}
     <div class="fixed bottom-4 left-4 bg-green-600 text-white px-4 py-2 rounded-full shadow-lg z-50 flex items-center gap-2 text-sm font-medium">
        {lastSyncStatus}
    </div>
{/if}
