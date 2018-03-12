#!/usr/bin/env node

//goes in hooks/after_platform_add/

var fs = require('fs');
rootdir = process.argv[2],
android_dir = rootdir + '/platforms/android';
gradle_file = rootdir + '/build-extras.gradle';
dest_gradle_file = android_dir + '/build-extras.gradle';

if (fs.existsSync(android_dir) && fs.existsSync(gradle_file)) {
    console.log('Copy ' + gradle_file + ' to ' + android_dir);
    fs.createReadStream(gradle_file).pipe(fs.createWriteStream(dest_gradle_file));
} else {
    console.log(gradle_file + ' not found. Skipping');
}
