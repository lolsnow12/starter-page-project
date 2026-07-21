/* ==========================================================================
   THE PAGE PROJECT - script.js
   Team & gallery content management
   ========================================================================== */

// --------------------------------------------------------------------------
// FIREBASE SETUP (shared data for all visitors)
// 1. Go to https://console.firebase.google.com -> Create a project (free).
// 2. In the project, click "Build" -> "Realtime Database" -> Create Database
//    -> start in "test mode" (we lock it down with rules below).
// 3. Click the gear icon -> Project settings -> scroll to "Your apps" ->
//    click the </> (web) icon -> register an app (no hosting needed) ->
//    copy the firebaseConfig object it gives you and paste it below,
//    replacing the placeholder values.
// 4. In Realtime Database Rules, paste this and click Publish:
//    {
//      "rules": {
//        "teamOverrides": { "read": true, "write": true },
//        "gallery": { "read": true, "write": true }
//      }
//    }
// NOTE: Like the developer passcode below, this is a practical speed bump,
// not real security — anyone with the config could technically write bad data.
// For a nonprofit site this is an acceptable tradeoff for "no backend to maintain."
// If it's ever abused, tighten the rules (e.g. Firebase App Check, or require
// sign-in) or add server-side validation via Cloud Functions.
// --------------------------------------------------------------------------

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT-default-rtdb.firebaseio.com",
  projectId: "YOUR_PROJECT",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Firebase is optional. The public Team and Gallery sections render immediately
// from the default data below, even when Firebase has not been configured yet.
const FIREBASE_CONFIGURED = !Object.values(firebaseConfig).some(value =>
  String(value).includes('YOUR_') || String(value).includes('YOUR_PROJECT')
);

let db = null;
if (FIREBASE_CONFIGURED && typeof firebase !== 'undefined') {
  try {
    firebase.initializeApp(firebaseConfig);
    db = firebase.database();
  } catch (error) {
    console.error('Firebase could not be initialized. Using public fallback content.', error);
  }
}

// --------------------------------------------------------------------------
// STATIC IMPACT NUMBERS
// These reflect totals from completed book drives. Update these two
// constants by hand whenever a drive wraps up and you have a new count.
// --------------------------------------------------------------------------
const BOOKS_ALREADY_COLLECTED = 802;
const DONORS_ALREADY_COUNTED = 15;

// --------------------------------------------------------------------------
// SAMPLE DRIVES DATA
// --------------------------------------------------------------------------
const DRIVES = [
  {
    title: 'Fall Book Drive',
    date: 'October 19, 2025 1:00 PM - 4:00 PM',
    location: 'Morgan Spur Dr, Fulshear, TX 77441',
    books: 300,
    status: 'past',
    description: 'Community book drive supporting local literacy initiatives.'
  },
  {
    title: 'Fall Book Drive',
    date: 'October 26, 2025 1:00 PM - 4:00 PM',
    location: 'Morgan Spur Dr, Fulshear, TX 77441',
    books: 502,
    status: 'past',
    description: 'Second collection event with an even greater community turnout.'
  },
  {
    title: 'Summer Book Drive',
    date: 'July 18, 2026 1:00 PM - 4:00 PM',
    location: 'Morgan Spur Dr, Fulshear, TX 77441',
    books: null,
    status: 'past',
    pending: true,
    description: 'Thanks to everyone who came out! Final book count is still being tallied, check back soon.'
  },
  {
    title: 'Summer Book Drive',
    date: 'July 25, 2026 6:30 PM - 8:30 PM',
    location: 'Morgan Spur Dr, Fulshear, TX 77441',
    books: null,
    status: 'upcoming',
    description: 'Our second summer collection event. Every donated book helps inspire another young reader!'
  }
];

// --------------------------------------------------------------------------
// TEAM DATA
// Default roster (names/roles/groups). Photos and bios are stored in
// Firebase so any edit made by a developer shows up for every visitor.
// Visitors always see this section; only editing requires the passcode.
// --------------------------------------------------------------------------
const TEAM =
