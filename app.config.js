const fs = require("node:fs");
const path = require("node:path");
const {
  withAppBuildGradle,
  withDangerousMod,
  withGradleProperties,
  withMainApplication,
} = require("expo/config-plugins");

// Memória da build Android: com muitos núcleos o Gradle abre vários compiladores Kotlin em paralelo e estoura a
// RAM em máquinas de ~12 GB (OutOfMemoryError no :compileReleaseKotlin). Menos tarefas paralelas, Kotlin no mesmo
// processo do Gradle e mais memória para ele. Vale para a build local e para a da nuvem (a pasta android/ é gerada).
const GRADLE_PROPERTIES = {
  "org.gradle.jvmargs": "-Xmx4096m -XX:MaxMetaspaceSize=1024m",
  "org.gradle.workers.max": "4",
  "kotlin.compiler.execution.strategy": "in-process",
};

const PLAY_APP_UPDATE_DEPENDENCY = 'implementation("com.google.android.play:app-update:2.1.0")';

const IPEBOOK_PLAY_UPDATE_MODULE_KT = `package com.ipebook.app

import android.os.Build
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.google.android.play.core.appupdate.AppUpdateManagerFactory
import com.google.android.play.core.appupdate.AppUpdateOptions
import com.google.android.play.core.install.model.AppUpdateType
import com.google.android.play.core.install.model.UpdateAvailability

class IpebookPlayUpdateModule(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String = "IpebookPlayUpdate"

  private fun readInstalledRelease(): Pair<Int, String> {
    return try {
      val pkg = reactApplicationContext.packageManager.getPackageInfo(
        reactApplicationContext.packageName,
        0
      )
      val code = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
        pkg.longVersionCode.toInt()
      } else {
        @Suppress("DEPRECATION")
        pkg.versionCode
      }
      Pair(code, pkg.versionName ?: "0.1.0")
    } catch (_: Throwable) {
      Pair(0, "0.1.0")
    }
  }

  @ReactMethod
  fun checkStoreUpdate(promise: Promise) {
    val (installedCode, installedName) = readInstalledRelease()
    try {
      val manager = AppUpdateManagerFactory.create(reactApplicationContext)
      manager.appUpdateInfo
        .addOnSuccessListener { info ->
          val availability = info.updateAvailability()
          val isAvailable =
            availability == UpdateAvailability.UPDATE_AVAILABLE ||
              availability == UpdateAvailability.DEVELOPER_TRIGGERED_UPDATE_IN_PROGRESS
          val availableCode = info.availableVersionCode()
          val result = Arguments.createMap().apply {
            putBoolean("isUpdateAvailable", isAvailable && availableCode > installedCode)
            putInt("versionCode", availableCode)
            putString(
              "versionName",
              if (availableCode > 0) "$installedName+$availableCode" else installedName
            )
            putInt("installedVersionCode", installedCode)
            putString("installedVersionName", installedName)
          }
          promise.resolve(result)
        }
        .addOnFailureListener {
          val fallback = Arguments.createMap().apply {
            putBoolean("isUpdateAvailable", false)
            putInt("installedVersionCode", installedCode)
            putString("installedVersionName", installedName)
          }
          promise.resolve(fallback)
        }
    } catch (_: Throwable) {
      val fallback = Arguments.createMap().apply {
        putBoolean("isUpdateAvailable", false)
        putInt("installedVersionCode", installedCode)
        putString("installedVersionName", installedName)
      }
      promise.resolve(fallback)
    }
  }

  @ReactMethod
  fun startUpdateFlow(promise: Promise) {
    val activity = reactApplicationContext.currentActivity
    if (activity == null) {
      promise.resolve(false)
      return
    }
    try {
      val manager = AppUpdateManagerFactory.create(reactApplicationContext)
      manager.appUpdateInfo
        .addOnSuccessListener { info ->
          val availability = info.updateAvailability()
          val canStart =
            availability == UpdateAvailability.UPDATE_AVAILABLE ||
              availability == UpdateAvailability.DEVELOPER_TRIGGERED_UPDATE_IN_PROGRESS
          if (!canStart) {
            promise.resolve(false)
            return@addOnSuccessListener
          }
          val updateType = when {
            info.isUpdateTypeAllowed(AppUpdateType.IMMEDIATE) -> AppUpdateType.IMMEDIATE
            info.isUpdateTypeAllowed(AppUpdateType.FLEXIBLE) -> AppUpdateType.FLEXIBLE
            else -> {
              promise.resolve(false)
              return@addOnSuccessListener
            }
          }
          try {
            val started = manager.startUpdateFlowForResult(
              info,
              activity,
              AppUpdateOptions.defaultOptions(updateType),
              9128
            )
            promise.resolve(started)
          } catch (_: Throwable) {
            promise.resolve(false)
          }
        }
        .addOnFailureListener {
          promise.resolve(false)
        }
    } catch (_: Throwable) {
      promise.resolve(false)
    }
  }
}
`;

const IPEBOOK_PLAY_UPDATE_PACKAGE_KT = `package com.ipebook.app

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager

class IpebookPlayUpdatePackage : ReactPackage {
  override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> =
    listOf(IpebookPlayUpdateModule(reactContext))

  override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> =
    emptyList()
}
`;

function withBuildMemory(config) {
  return withGradleProperties(config, (gradle) => {
    for (const [key, value] of Object.entries(GRADLE_PROPERTIES)) {
      gradle.modResults = gradle.modResults.filter((item) => !(item.type === "property" && item.key === key));
      gradle.modResults.push({ type: "property", key, value });
    }
    return gradle;
  });
}

// Spec 129 / ADR 0100: módulo nativo Google Play In-App Updates (com.google.android.play:app-update:2.1.0).
function withPlayInAppUpdates(config) {
  let next = withAppBuildGradle(config, (gradle) => {
    if (!gradle.modResults.contents.includes("com.google.android.play:app-update:")) {
      gradle.modResults.contents = gradle.modResults.contents.replace(
        'implementation("com.facebook.react:react-android")',
        `implementation("com.facebook.react:react-android")\n    ${PLAY_APP_UPDATE_DEPENDENCY}`,
      );
    }
    return gradle;
  });

  next = withMainApplication(next, (mainApp) => {
    if (!mainApp.modResults.contents.includes("IpebookPlayUpdatePackage")) {
      mainApp.modResults.contents = mainApp.modResults.contents.replace(
        "PackageList(this).packages.apply {",
        "PackageList(this).packages.apply {\n          add(IpebookPlayUpdatePackage())",
      );
    }
    return mainApp;
  });

  next = withDangerousMod(next, [
    "android",
    async (modConfig) => {
      const pkgDir = path.join(
        modConfig.modRequest.platformProjectRoot,
        "app/src/main/java/com/ipebook/app",
      );
      fs.mkdirSync(pkgDir, { recursive: true });
      fs.writeFileSync(path.join(pkgDir, "IpebookPlayUpdateModule.kt"), IPEBOOK_PLAY_UPDATE_MODULE_KT);
      fs.writeFileSync(path.join(pkgDir, "IpebookPlayUpdatePackage.kt"), IPEBOOK_PLAY_UPDATE_PACKAGE_KT);
      return modConfig;
    },
  ]);

  return next;
}

// Spec 106: o google-services.json não vai para o Git; na build do EAS ele chega pela variável de arquivo
// GOOGLE_SERVICES_JSON (eas env:create --type file). Localmente, usa o arquivo da raiz definido no app.json.
module.exports = ({ config }) =>
  withPlayInAppUpdates(
    withBuildMemory({
      ...config,
      android: {
        ...config.android,
        googleServicesFile: process.env.GOOGLE_SERVICES_JSON ?? config.android?.googleServicesFile,
      },
    }),
  );
