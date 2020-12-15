npm i
npm run build

npm install -g cordova@5

export JAVA_HOME=/Library/Java/JavaVirtualMachines/jdk1.8.0_261.jdk/Contents/Home/
wget https://dl.google.com/android/repository/tools_r25.2.3-macosx.zip

cd cordova
cordova platform add android@5
cordova requirements
cordova clean android
cordova build android --release -- --keystore="/Users/manel/devel/microdisseny/android-keystore/android-pkcs12.jks" --storePassword=XXXXXXXX --alias=key0 --password=Manel123 --keystoreType=pkcs12

adb install /Users/manel/devel/ajgirona/feines_proveidors/feines-proveidors-client/cordova/platforms/android/build/outputs/apk/android-armv7-release.apk


Error: cordovaProject.projectConfig.getFileResources is not a function
=> Baixar versions
