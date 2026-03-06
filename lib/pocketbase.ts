import PocketBase from 'pocketbase';

// Client-side instance (singleton)
const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL);

export default pb;
