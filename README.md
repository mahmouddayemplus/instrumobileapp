# Instrumobile App

Instrumobile is a comprehensive mobile application for industrial maintenance teams, designed to manage PLC modifications, spares, preventive maintenance, overtime, and more. Built with React Native, Expo, and Firebase, it provides a modern, cross-platform experience for plant engineers and technicians.

---

## 🚀 Features

- **PLC Modification Management:** Add, edit, and cancel PLC modification requests. Track status and history.
- **Spares & Tools Tracking:** View, search, and manage spares and tools inventory.
- **Preventive Maintenance:** Log and review maintenance activities.
- **Overtime Management:** Record and review overtime requests and approvals.
- **User Authentication:** Secure login with Firebase Auth.
- **Cloud Firestore Integration:** Real-time data sync and offline support.
- **Modern UI:** Clean, responsive design using Expo and React Native components.

---


## 📱 Screenshots

<div align="center">

<img src="assets/screenshots/plc spares.png" alt="PLC Spares" width="220" />
<img src="assets/screenshots/all spares.png" alt="All Spares" width="220" />
<img src="assets/screenshots/overtime tracker.png" alt="Overtime Tracker" width="220" />
<img src="assets/screenshots/pm tasks.png" alt="PM Tasks" width="220" />
<img src="assets/screenshots/pressure converter.png" alt="Pressure Converter" width="220" />
<img src="assets/screenshots/pt100 calculator.png" alt="PT100 Calculator" width="220" />
<img src="assets/screenshots/tasks details.png" alt="Tasks Details" width="220" />
<img src="assets/screenshots/themorcouple tool.png" alt="Thermocouple Tool" width="220" />
<img src="assets/screenshots/Tools.png" alt="Tools" width="220" />
<img src="assets/screenshots/ventocheck.png" alt="VentoCheck" width="220" />
<img src="assets/screenshots/warehouse search.png" alt="Warehouse Search" width="220" />
<img src="assets/screenshots/weigh feeder calibration.png" alt="Weigh Feeder Calibration" width="220" />

</div>

---

## 🛠️ Technologies Used

- [React Native](https://reactnative.dev/)
- [Expo](https://expo.dev/)
- [Firebase (Firestore & Auth)](https://firebase.google.com/)
- [Redux Toolkit](https://redux-toolkit.js.org/) (for state management)
- [@expo/vector-icons](https://docs.expo.dev/guides/icons/)

---

## ⚡ Getting Started

### Prerequisites
- Node.js >= 16.x
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- A Firebase project (for Firestore and Auth)

### Installation
1. **Clone the repository:**
    ```bash
    git clone <your-repo-url>
    cd instrumobileapp
    ```
2. **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```
3. **Configure Firebase:**
    - Copy your Firebase config to `firebase/firebaseConfig.js`.
    - Set up Firestore security rules (see below).
4. **Start the development server:**
    ```bash
    npx expo start
    ```

---

## 🗂️ Project Structure

- `components/` — Reusable UI components (lists, headers, etc.)
- `screens/` — Main app screens (PLCs, Spares, Maintenance, etc.)
- `constants/` — Color palette and other constants
- `firebase/` — Firebase config and helper functions
- `store/` — Redux store and slices for state management
- `assets/` — App icons, images, and static files

---

## ⚙️ Configuration

- **Firebase:**
   - Update your Firebase credentials in `firebase/firebaseConfig.js`.
   - Enable Firestore and Authentication in your Firebase project.
- **Expo:**
   - Make sure to install the Expo Go app on your device for easy testing.
- **Security Rules:**
   - Set up Firestore security rules to control access (see example in `/firebase/firebaseConfig.js` or your Firebase Console).

---

## 🧑‍💻 Usage

1. **Login/Register:** Sign in with your credentials (Firebase Auth).
2. **Navigate:** Use the bottom tab or drawer navigation to access PLC Modifications, Spares, Maintenance, and more.
3. **Add/Edit:** Tap the plus or pencil icons to add or edit records.
4. **Search/Filter:** Use search bars and filters to quickly find items.
5. **Sync:** All changes are synced in real-time with Firestore.

---

## 🛡️ Troubleshooting

- **App won't start?**
   - Make sure all dependencies are installed and your Firebase config is correct.
- **Permission errors?**
   - Check your Firestore security rules and ensure your user has the right permissions.
- **UI issues?**
   - Run `expo start -c` to clear cache.
- **Android/iOS build issues?**
   - Make sure you have the latest Expo CLI and SDK versions.

---

## 🤝 Contributing

Contributions are welcome! To contribute:
1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature`)
3. Commit your changes
4. Push to your fork and submit a pull request

---

## 🙏 Credits

- Developed by Mahmoud Dayem .
- Thanks to the open-source community for libraries and inspiration

---

## 🌐 Connect

For more information, connect with me on [LinkedIn](https://linkedin.com/in/mahmoud-abdeldayem-abdelhaleem).

---



---

 


