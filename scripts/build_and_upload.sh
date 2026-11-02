#!/bin/bash
set -e

echo "=== Step 1: Ensuring ExportOptions.plist exists ==="
cat << 'EOF' > ./ExportOptions.plist
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>destination</key>
	<string>upload</string>
	<key>method</key>
	<string>app-store-connect</string>
	<key>signingStyle</key>
	<string>automatic</string>
	<key>teamID</key>
	<string>6B62X8D275</string>
	<key>testFlightInternalTestingOnly</key>
	<true/>
</dict>
</plist>
EOF

echo "=== Step 2: Cleaning previous archive ==="
rm -rf ./build/TheScriptCraft.xcarchive

echo "=== Step 3: Archiving TheScriptCraft ==="
xcodebuild archive \
  -workspace ios/TheScriptCraft.xcworkspace \
  -scheme TheScriptCraft \
  -configuration Release \
  -destination generic/platform=iOS \
  -archivePath ./build/TheScriptCraft.xcarchive \
  CODE_SIGNING_ALLOWED=NO CODE_SIGNING_REQUIRED=NO CODE_SIGN_IDENTITY=

echo "=== Step 4: Injecting Entitlements into App Archive ==="
codesign -s - --force --entitlements ios/TheScriptCraft/TheScriptCraftRelease.entitlements ./build/TheScriptCraft.xcarchive/Products/Applications/TheScriptCraft.app

echo "=== Step 5: Verifying Embedded Entitlements ==="
codesign -d --entitlements :- ./build/TheScriptCraft.xcarchive/Products/Applications/TheScriptCraft.app | grep "com.apple.developer.applesignin"
echo "Entitlements verified successfully!"

echo "=== Step 6: Exporting & Uploading to TestFlight ==="
xcodebuild -exportArchive \
  -archivePath ./build/TheScriptCraft.xcarchive \
  -exportOptionsPlist ./ExportOptions.plist \
  -allowProvisioningUpdates \
  -authenticationKeyPath /Users/kirang/Downloads/AuthKey_6GSY2B58H6.p8 \
  -authenticationKeyID 6GSY2B58H6 \
  -authenticationKeyIssuerID ee4e274f-dc8e-4b30-addb-ac8abe8d436f

echo "=== Upload Succeeded! ==="
