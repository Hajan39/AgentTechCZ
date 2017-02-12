--  STEP 0
ionic build android --release
-- STEP 1
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore ~/Downloads/MyStore.keystore platforms/android/build/outputs/apk/android-release-unsigned.apk agentcz
-- STEP 2
/usr/local/Cellar/android-sdk/24.4.1_1/build-tools/23.0.2/zipalign -v 4 platforms/android/build/outputs/apk/android-release-unsigned.apk Cockpit18.apk
