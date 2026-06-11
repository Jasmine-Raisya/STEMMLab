# STEMM Games User Manual

## 1. Introduction

STEMM Games is a mobile learning application that helps students complete guided STEMM experiments using a smartphone. The app turns common device features such as sensors, microphone, camera/video upload, GPS, vibration, local storage, and Firebase account sync into a portable experiment toolkit.

The app is designed for classroom or home-based learning. Students work in teams, follow step-by-step experiment instructions, collect data, compare results, and save reflections.

## 2. Getting Started

### 2.1 Device Requirements

Use an Android phone or tablet with:

- Android installed and enough storage for the APK.
- Internet connection for account sign-in, Firebase sync, maps, and AdMob.
- Microphone access for the Sound Pollution Hunter activity.
- Location access for GPS tagging.
- Motion sensors such as accelerometer or gyroscope for sensor-based activities.
- Vibration support for the Earthquake Structure activity.

### 2.2 Install the App

1. Open the APK file on the Android device.
2. Allow installation from the selected source if Android asks for permission.
3. Tap Install.
4. Open STEMM Games after installation is complete.

If the app was previously installed, uninstall the old version before installing a new APK to avoid stale data or older native settings.

### 2.3 Create or Sign In to a Team Account

When the app opens for the first time:

1. Tap Get Started.
2. Choose Create Team Account or Sign In.
3. Enter the representative email.
4. Enter a password with at least 6 characters.
5. Enter the team name.
6. Add team members.
7. Select the grade/year level.
8. Submit the form.

After successful registration, the app shows a team ID. Keep this ID because it identifies the team profile and experiment records.

### 2.4 Permissions

The app may ask for permissions while activities are used:

- Microphone: needed for sound level measurement.
- Location: needed for GPS tagging and mapped sound records.
- Camera/media library: needed when uploading or selecting experiment evidence.
- Notifications/background features: used for app reminders or background sync where supported.

Allowing permissions gives the most complete experience. If a permission is denied, some activities may still open, but the related feature may not work.

## 3. Main Navigation

### 3.1 Dashboard

The dashboard is the main screen after login. It contains:

- Engineering: opens engineering experiment activities.
- Health: opens health experiment activities.
- Team Profile: shows team information and experiment records.
- Settings: opens theme, language, permission, and app preference controls.
- AdMob banner area: displays the configured banner ad placement when available.

### 3.2 Engineering Activities

The Engineering section contains experiments focused on physical systems, design, sound, and structures.

#### Parachute Drop

Purpose: Test how parachute designs affect falling speed, landing safety, and G-force.

Basic flow:

1. Read the objective and equipment list.
2. Upload or review a drop video.
3. Enter drop height and measured fall time.
4. Mark the impact point if using video analysis.
5. Review calculated results such as fall time, speed, G-force, and predicted landing effect.
6. Save iterations and compare results.
7. Complete the reflection.

#### Sound Pollution Hunter

Purpose: Measure classroom noise levels and identify possible hearing risk.

Basic flow:

1. Read the activity instructions.
2. Start the decibel meter.
3. Record an action name, such as dropping a book or clapping.
4. Add the action record.
5. Review the decibel range and risk prediction.
6. Map logged actions to locations if GPS/location tagging is enabled.
7. Complete the reflection.

#### Hand Fan Challenge

Purpose: Test how airflow affects flexible materials and estimate force using material stiffness and bend angle.

Basic flow:

1. Read the setup guide.
2. Select or enter material information.
3. Upload a video of the material bending.
4. Capture or reference a frame.
5. Adjust the angle guide to match the bend.
6. Enter results for the iteration.
7. Review calculations and complete the reflection.

#### Earthquake Structure

Purpose: Build and test a structure that reduces movement during simulated shaking.

Basic flow:

1. Read the structure-building instructions.
2. Enter the number of folds and paper cups used.
3. Enter movement distance and turn angle after the shake test.
4. Start the shake/vibration recording where supported.
5. Review peak shake and turn-rate information.
6. Save the iteration.
7. Complete the reflection.

### 3.3 Health Activities

The Health section contains experiments focused on body movement, reaction, and breathing.

#### Human Performance

Purpose: Measure body movement quality using motion sensor data.

Basic flow:

1. Read the objective, equipment, and safety tips.
2. Follow the guided movement image.
3. Wait for the countdown.
4. Perform the movement while the app records sensor data.
5. Repeat for the remaining guided movements.
6. Use the optional Skip button only when testing or when the current movement cannot be completed.
7. Review the performance summary and complete the reflection.

#### Reaction Board

Purpose: Measure reaction time and tracing accuracy.

Basic flow:

1. Select the reaction or tracing challenge.
2. For reaction testing, tap as soon as the target appears.
3. Review logs for dominant and non-dominant hand attempts.
4. For tracing, follow the path on the screen as accurately as possible.
5. Review accuracy and performance.
6. Complete the reflection.

#### Breathing Pace

Purpose: Compare breathing pace at rest and after exercise.

Basic flow:

1. Read the placement guide.
2. Place the phone gently on the chest while lying still.
3. Predict breathing pace for rest, jogging, and star jumps.
4. Record breathing at rest for 60 seconds.
5. Jog in place for 60 seconds.
6. Return to the breathing position and record breathing again.
7. Complete the star jump exercise.
8. Return to the breathing position and record breathing again.
9. Compare predicted and actual breathing pace.
10. Complete the reflection.

## 4. Settings

Open Settings from the dashboard.

Available settings may include:

- Theme: switch between light mode and dark mode.
- Language: switch between English and Indonesian.
- GPS tagging: enable or disable location tagging for activities that use maps or locations.
- Sound/audio feedback: control read-aloud and app audio behavior.
- Notifications: enable or disable notification behavior where supported.

Dark mode changes supported screen backgrounds, cards, text, and form fields to a darker theme. Indonesian language changes visible app labels and instructions to Bahasa Indonesia.

## 5. Team Profile and Records

The Team Profile screen shows:

- Team name.
- Team ID.
- Representative email.
- Registered members.
- Experiment records.

Experiment records are saved locally first and can sync to Firebase when the device is online and Firebase is configured. Records may include reflections, sensor samples, scores, timestamps, and activity details.

If duplicate records appear, refresh the profile or check whether the same experiment was submitted more than once.

## 6. Data Storage and Sync

STEMM Games uses local storage for offline safety and Firebase for cloud-based team records.

General behavior:

- Activity data is saved locally first.
- When online, pending data can sync to Firebase.
- Team profile data is connected to Firebase Authentication and Firestore.
- Experiment history is stored as team-linked records.

If internet connection is unavailable, students can continue working locally and sync later when online.

## 7. Accessibility and Usability Tips

- Use the Read aloud button to hear activity instructions.
- Use dark mode in low-light environments.
- Use Indonesian language if students are more comfortable with Bahasa Indonesia.
- Keep the phone stable during sensor measurements.
- Follow safety guidance before performing movement or exercise activities.
- For group work, assign one student to handle the phone and another to record observations.

## 8. Common Issues and Troubleshooting

### App Will Not Install

Possible causes:

- The APK is blocked by Android security settings.
- An older version is already installed.
- The device has low storage.

Try:

1. Allow installation from the file manager or browser source.
2. Uninstall the previous version.
3. Free storage space.
4. Install the APK again.

### Cannot Register or Sign In

Possible causes:

- Email format is invalid.
- Password has fewer than 6 characters.
- Internet connection is unavailable.
- Firebase configuration is unavailable.
- The account already exists.

Try:

1. Check the email and password.
2. Use a stronger password such as at least 6 characters.
3. Check Wi-Fi or mobile data.
4. Use Sign In if the account was already registered.

### Team ID Looks Wrong or Is Missing

Possible causes:

- Registration did not complete.
- Firebase sync failed.
- Local data did not load correctly.

Try:

1. Return to the dashboard and open Team Profile again.
2. Sign out and sign back in.
3. Check internet connection.
4. Re-register only if the original account was not created.

### Dark Mode Text Is Hard to Read

Possible causes:

- Some activity screens may still be using light colors.
- The app needs to be restarted after changing theme.

Try:

1. Toggle theme off and on again in Settings.
2. Close and reopen the app.
3. Use light mode temporarily if a specific screen is hard to read.

### Microphone or Decibel Meter Does Not Work

Possible causes:

- Microphone permission was denied.
- Another app is using the microphone.
- The recording session is already active.
- The device does not provide reliable metering values.

Try:

1. Grant microphone permission in Android settings.
2. Close other apps that may use the microphone.
3. Stop the current recording before starting again.
4. Restart the app.
5. Test in a quiet room first to confirm the meter returns near 0 when not recording.

### GPS or Map Tagging Does Not Work

Possible causes:

- Location permission was denied.
- GPS tagging is turned off.
- The device cannot get a location indoors.
- Internet connection is unavailable for map loading.

Try:

1. Enable GPS tagging in Settings.
2. Grant location permission.
3. Move closer to a window or open area.
4. Check internet connection.

### Sensor Readings Look Too High or Too Low

Possible causes:

- The phone is moving before the test starts.
- The phone is held incorrectly.
- The surface is unstable.
- The device sensor has different sensitivity.

Try:

1. Keep the phone still before starting.
2. Follow the placement guide.
3. Repeat the test and compare relative results instead of relying on one reading.
4. Use the same device for all team comparisons when possible.

### Breathing Pace Does Not Measure Correctly

Possible causes:

- Phone is not placed securely on the chest.
- User is moving too much.
- Clothing or case reduces movement detection.

Try:

1. Place the phone flat on the chest.
2. Stay still while recording.
3. Remove a bulky phone case if safe to do so.
4. Repeat the 60-second measurement.

### Video Upload Does Not Work

Possible causes:

- Media permission was denied.
- The selected file is unsupported.
- The file is too large.

Try:

1. Grant media/photo/video permission.
2. Use a shorter video.
3. Record in a common format such as MP4.
4. Restart the activity and upload again.

### AdMob Banner Does Not Show

Possible causes:

- The device is offline.
- AdMob has no available ad for the device.
- A new ad unit has not started serving yet.
- Automated testing may block or limit ads.

Try:

1. Check internet connection.
2. Wait and reopen the app.
3. Test on another device.
4. Confirm that the app still shows the banner container.

### Notifications or Background Features Do Not Work in Expo Go

Some notification and background features are limited in Expo Go. Use a development build or APK build for full native behavior.

Try:

1. Install the latest APK build.
2. Allow notification permission.
3. Avoid judging notification support only from Expo Go.

### Firebase Test Lab Runs for a Long Time

Firebase Robo tests explore the app automatically and may keep navigating until the selected timeout ends.

Try:

1. Use one device for initial testing.
2. Set a shorter timeout such as 5 or 10 minutes.
3. Use screenshots, videos, logs, and Robo graph as evidence.
4. Do not repeatedly run real AdMob ads in automated testing.

## 9. Safety Notes

- Do not perform physical activities in a crowded or unsafe area.
- Stop movement activities if pain, dizziness, or discomfort occurs.
- Keep the phone secure during motion-based activities.
- Do not drop the phone during parachute, earthquake, or human performance experiments.
- Use classroom-safe objects for engineering tests.

## 10. Quick Reference

| Task | Where to Go |
| --- | --- |
| Create or sign in to a team | Start screen / Team Setup |
| Open engineering experiments | Dashboard > Engineering |
| Open health experiments | Dashboard > Health |
| View saved experiment records | Dashboard > Team Profile |
| Change language | Dashboard > Settings |
| Enable dark mode | Dashboard > Settings |
| Turn GPS tagging on/off | Dashboard > Settings |
| Use read-aloud support | Tap Read aloud inside an activity |
| Submit reflection | Final activity screen |

## 11. Support and Reporting Issues

When reporting an issue, include:

- Device model.
- Android version.
- Activity name.
- Step number.
- Screenshot or screen recording if possible.
- What you expected to happen.
- What actually happened.

This helps the development team identify whether the problem is caused by app logic, device permissions, sensor differences, network connection, or Firebase sync.
