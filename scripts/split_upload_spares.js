// #!/usr/bin/env node
// /**
//  * Script: split_upload_spares.js
//  * Purpose: Read assets/spares.json, split into N parts (default 5), and upload each part
//  * as a document into Firestore collection 'entire_spares' using firebase-admin.
//  *
//  * Usage:
//  * 1. Install dependency: npm install firebase-admin
//  * 2. Obtain a Firebase service account JSON file and save it locally.
//  * 3. Run:
//  *    node scripts/split_upload_spares.js /path/to/serviceAccount.json [parts]
//  *
//  * Notes:
//  * - This script will overwrite documents named part-1 .. part-N in the 'entire_spares' collection.
//  * - You can set the environment variable GOOGLE_APPLICATION_CREDENTIALS instead of passing path.
//  */

// const fs = require('fs');
// const path = require('path');
// const admin = require('firebase-admin');

// async function main() {
//   try {
//     const serviceAccountPath = process.argv[2] || process.env.GOOGLE_APPLICATION_CREDENTIALS;
//     const partsArg = parseInt(process.argv[3], 10) || 5;
//     const parts = Math.max(1, partsArg);

//     if (!serviceAccountPath) {
//       console.error('ERROR: Missing service account JSON path.');
//       console.error('Usage: node scripts/split_upload_spares.js /path/to/serviceAccount.json [parts]');
//       process.exit(1);
//     }

//     const absServicePath = path.resolve(serviceAccountPath);
//     if (!fs.existsSync(absServicePath)) {
//       console.error('ERROR: service account file not found at', absServicePath);
//       process.exit(1);
//     }

//     const serviceAccount = require(absServicePath);

//     admin.initializeApp({
//       credential: admin.credential.cert(serviceAccount),
//     });

//     const db = admin.firestore();

//     const sparesPath = path.resolve(__dirname, '..', 'assets', 'spares.json');
//     if (!fs.existsSync(sparesPath)) {
//       console.error('ERROR: spares.json not found at', sparesPath);
//       process.exit(1);
//     }

//     const raw = fs.readFileSync(sparesPath, 'utf8');
//     const all = JSON.parse(raw);
//     if (!Array.isArray(all)) {
//       console.error('ERROR: expected an array in spares.json');
//       process.exit(1);
//     }

//     const total = all.length;
//     const size = Math.ceil(total / parts);

//     console.log(`Total items: ${total}. Splitting into ${parts} parts (approx ${size} each).`);

//     const chunks = [];
//     for (let i = 0; i < parts; i++) {
//       const start = i * size;
//       const end = Math.min(start + size, total);
//       const slice = all.slice(start, end);
//       chunks.push(slice);
//     }

//     const collectionRef = db.collection('entire_spares');

//     for (let i = 0; i < chunks.length; i++) {
//       // Check approximate size to avoid Firestore 1MiB document limit
//       const approxBytes = Buffer.byteLength(JSON.stringify(chunks[i]), 'utf8');
//       if (approxBytes > 900000) {
//         console.error(`ERROR: chunk ${i + 1} is approximately ${approxBytes} bytes which may exceed Firestore document size limits. Consider increasing number of parts.`);
//         process.exit(1);
//       }
//       const docId = `part-${i + 1}`;
//       const docData = {
//         part: i + 1,
//         totalParts: chunks.length,
//         itemsCount: chunks[i].length,
//         items: chunks[i],
//         createdAt: admin.firestore.FieldValue.serverTimestamp(),
//       };
//       console.log(`Writing doc ${docId} (${docData.itemsCount} items)...`);
//       await collectionRef.doc(docId).set(docData, { merge: false });
//     }

//     console.log('Done. Wrote', chunks.length, 'documents to collection entire_spares.');
//     process.exit(0);
//   } catch (err) {
//     console.error('Fatal error:', err);
//     process.exit(2);
//   }
// }

// main();
