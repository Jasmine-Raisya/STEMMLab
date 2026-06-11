$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $projectRoot

if (-not $env:STEMM_SKIP_SHORT_PATH_BUILD) {
  $shortBuildBase = if ($env:STEMM_ANDROID_BUILD_ROOT) { $env:STEMM_ANDROID_BUILD_ROOT } else { "C:\stemm-apk-build" }
  $shortProjectRoot = Join-Path $shortBuildBase "source"
  $resolvedProjectRoot = (Resolve-Path $projectRoot).Path.TrimEnd("\")
  $resolvedShortRoot = $shortProjectRoot.TrimEnd("\")

  if ($resolvedProjectRoot -ne $resolvedShortRoot) {
    Write-Host "Mirroring project to short build path: $shortProjectRoot"
    if (Test-Path $shortProjectRoot) {
      $shortBuildBaseFull = [System.IO.Path]::GetFullPath($shortBuildBase).TrimEnd("\")
      $shortProjectRootFull = [System.IO.Path]::GetFullPath($shortProjectRoot).TrimEnd("\")
      if (-not $shortProjectRootFull.StartsWith($shortBuildBaseFull, [System.StringComparison]::OrdinalIgnoreCase)) {
        throw "Refusing to clean unexpected build path: $shortProjectRootFull"
      }
      Remove-Item -Recurse -Force -LiteralPath $shortProjectRoot
    }
    New-Item -ItemType Directory -Force -Path $shortProjectRoot | Out-Null

    $robocopyArgs = @(
      $projectRoot,
      $shortProjectRoot,
      "/MIR",
      "/XD",
      ".git",
      "node_modules",
      ".expo",
      ".gradle",
      ".idea",
      ".kotlin",
      ".cxx",
      "dist",
      "coverage",
      ".codex-backups",
      "build",
      "/XF",
      "*.apk",
      "*.aab",
      "*.ap_",
      "hs_err_pid*.log",
      "replay_pid*.log"
    )

    & robocopy @robocopyArgs | Out-Host
    if ($LASTEXITCODE -gt 7) {
      throw "Robocopy failed with exit code $LASTEXITCODE"
    }

    $env:STEMM_SKIP_SHORT_PATH_BUILD = "1"
    powershell -ExecutionPolicy Bypass -File (Join-Path $shortProjectRoot "scripts\build-android-release-apk.ps1")

    $shortApk = Join-Path $shortProjectRoot "dist\stemm-lab-release.apk"
    if (-not (Test-Path $shortApk)) {
      throw "Short-path build completed without an APK at $shortApk"
    }

    $distDir = Join-Path $projectRoot "dist"
    New-Item -ItemType Directory -Force -Path $distDir | Out-Null
    $copyPath = Join-Path $distDir "stemm-lab-release.apk"
    Copy-Item -Force -Path $shortApk -Destination $copyPath
    Write-Host "Release APK ready: $copyPath"
    exit 0
  }
}

if (-not $env:JAVA_HOME) {
  $androidStudioJdk = "C:\Program Files\Android\Android Studio\jbr"
  if (Test-Path (Join-Path $androidStudioJdk "bin\java.exe")) {
    $env:JAVA_HOME = $androidStudioJdk
  } else {
    throw "JAVA_HOME is not set and Android Studio JBR was not found at $androidStudioJdk"
  }
}

$env:Path = "$env:JAVA_HOME\bin;$env:Path"

if (-not $env:ANDROID_HOME) {
  $defaultSdk = Join-Path $env:LOCALAPPDATA "Android\Sdk"
  if (Test-Path $defaultSdk) {
    $env:ANDROID_HOME = $defaultSdk
  }
}

if (-not $env:ANDROID_SDK_ROOT -and $env:ANDROID_HOME) {
  $env:ANDROID_SDK_ROOT = $env:ANDROID_HOME
}

Write-Host "Using JAVA_HOME=$env:JAVA_HOME"
if ($env:ANDROID_HOME) {
  Write-Host "Using ANDROID_HOME=$env:ANDROID_HOME"
}

npm.cmd install --include=dev
$env:NODE_ENV = "production"
npx.cmd expo prebuild --platform android --no-install

Push-Location android
try {
  .\gradlew.bat clean assembleRelease --no-daemon --max-workers=2
} finally {
  Pop-Location
}

$apkPath = Join-Path $projectRoot "android\app\build\outputs\apk\release\app-release.apk"
if (-not (Test-Path $apkPath)) {
  throw "Release APK was not found at $apkPath"
}

$distDir = Join-Path $projectRoot "dist"
New-Item -ItemType Directory -Force -Path $distDir | Out-Null
$copyPath = Join-Path $distDir "stemm-lab-release.apk"
Copy-Item -Force -Path $apkPath -Destination $copyPath

Write-Host "Release APK ready: $copyPath"
