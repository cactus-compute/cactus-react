#!/bin/bash -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

PUBLISH=false
while [[ $# -gt 0 ]]; do
    case $1 in
        --publish)
            PUBLISH=true
            shift
            ;;
        *)
            echo "Unknown option: $1"
            echo "Usage: $0 [--publish]"
            exit 1
            ;;
    esac
done

###################

echo "Pulling from Cactus core repo..."
rm -rf cactus_temp
git clone --depth 1 -b legacy https://github.com/cactus-compute/cactus.git cactus_temp || {
    echo "Error: Failed to clone cactus repository (legacy branch)"
    exit 1
}

if [ ! -d "cactus_temp" ]; then
    echo "Error: Clone directory not created"
    exit 1
fi

cd cactus_temp

echo "Copying iOS frameworks..."
if [ -d "./ios/cactus.xcframework" ]; then
    cp -R ./ios/cactus.xcframework "$ROOT_DIR/ios/"
    cp -R ./ios/CMakeLists.txt "$ROOT_DIR/ios/"
else
    echo "Warning: iOS xcframework not found"
fi

cp -R ./cpp "$ROOT_DIR/"

echo "Cleaning up temporary clone..."
cd "$ROOT_DIR"
rm -rf cactus_temp

##################


if [ -z "$ANDROID_HOME" ]; then
    export ANDROID_HOME=~/Library/Android/sdk
fi

NDK_VERSION=27.0.12077973
CMAKE_TOOLCHAIN_FILE=$ANDROID_HOME/ndk/$NDK_VERSION/build/cmake/android.toolchain.cmake
ANDROID_PLATFORM=android-21
CMAKE_BUILD_TYPE=Release

if [ ! -d "$ANDROID_HOME/ndk/$NDK_VERSION" ]; then
  echo "NDK $NDK_VERSION not found, available versions: $(ls $ANDROID_HOME/ndk)"
  echo "Run \$ANDROID_HOME/tools/bin/sdkmanager \"ndk;$NDK_VERSION\""
  CMAKE_VERSION=3.10.2.4988404
  echo "and \$ANDROID_HOME/tools/bin/sdkmanager \"cmake;$CMAKE_VERSION\""
  exit 1
fi

if ! command -v cmake &> /dev/null; then
  echo "cmake could not be found, please install it"
  exit 1
fi

n_cpu=1
if uname -a | grep -q "Darwin"; then
  n_cpu=$(sysctl -n hw.logicalcpu)
elif uname -a | grep -q "Linux"; then
  n_cpu=$(nproc)
fi

t0=$(date +%s)

cd "$ROOT_DIR/android/src/main"

cmake -DCMAKE_TOOLCHAIN_FILE="$CMAKE_TOOLCHAIN_FILE" \
  -DANDROID_ABI=arm64-v8a \
  -DANDROID_PLATFORM="$ANDROID_PLATFORM" \
  -DCMAKE_BUILD_TYPE="$CMAKE_BUILD_TYPE" \
  -B build-arm64

cmake --build build-arm64 --config Release -j "$n_cpu"

mkdir -p jniLibs/arm64-v8a

cp build-arm64/*.so jniLibs/arm64-v8a/

rm -rf build-arm64

cmake -DCMAKE_TOOLCHAIN_FILE="$CMAKE_TOOLCHAIN_FILE" \
  -DANDROID_ABI=x86_64 \
  -DANDROID_PLATFORM="$ANDROID_PLATFORM" \
  -DCMAKE_BUILD_TYPE="$CMAKE_BUILD_TYPE" \
  -B build-x86_64

cmake --build build-x86_64 --config Release -j "$n_cpu"

mkdir -p jniLibs/x86_64

cp build-x86_64/*.so jniLibs/x86_64/

rm -rf build-x86_64
rm -R "$ROOT_DIR/cpp"

t1=$(date +%s)
echo "Total time: $((t1 - t0)) seconds"
echo "Native libraries successfully built in $ROOT_DIR/android/src/main/jniLibs"

##################

export LEFTHOOK=0 

[ -d node_modules ] && rm -rf node_modules
[ -d lib ] && rm -rf lib 

echo "Building React Native package..." 
yarn 
yarn build 

echo "React Native package built successfully!" 

if [ "$PUBLISH" = true ]; then
    echo "Publishing to pub.dev..."
    rm -rf "$ROOT_DIR/android/src/main/jniLibs/x86_64" 
    npm version patch
    npm publish
else
    echo "Build complete. Use --publish flag to publish to NPM"
fi 