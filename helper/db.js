// import * as FileSystem from 'expo-file-system';

// export async function loadSparesJSON() {
//     try {
//       // Local file in assets
//       const jsonUri = FileSystem.documentDirectory + 'spares.json';
//       const fileInfo = await FileSystem.getInfoAsync(jsonUri);

//       let jsonString;

//       if (fileInfo.exists) {
//         jsonString = await FileSystem.readAsStringAsync(jsonUri);
//       } else {
//         // If file not exists locally, load bundled asset
//         jsonString = await FileSystem.readAsStringAsync(
//           require('./assets/spares.json')
//         );
//       }

//       const data = JSON.parse(jsonString);
//       setAllSpares(data);
//       setSpares(data);
//     } catch (err) {
//       console.error('Error loading JSON:', err);
//     }
//   }