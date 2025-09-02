## Use this repo

First, clone the repo with `git clone https://github.com/cactus-compute/cactus.git`, cd into it and make scripts executable with `chmod +x build.sh`

- Build the package by running `scripts/build.sh`.
- Navigate to the example app with `cd react/example`.
- Setup your simulator via Xcode or Android Studio, [walkthrough](https://medium.com/@daspinola/setting-up-android-and-ios-emulators-22d82494deda) if you have not done this before.
- Always start app with this combo `yarn && yarn ios` or `yarn && yarn android`.
- Play with the app, and make changes either to the example app or package as desired.
- For now, if changes are made in the package, you would manually copy the files/folders into the `examples/react/node_modules/cactus-react-native`.