package com.rnscriptcarft

import com.android.installreferrer.api.InstallReferrerClient
import com.android.installreferrer.api.InstallReferrerStateListener
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class InstallReferrerModule(private val ctx: ReactApplicationContext) :
  ReactContextBaseJavaModule(ctx) {

  override fun getName() = "InstallReferrer"

  @ReactMethod
  fun getInstallReferrer(promise: Promise) {
    try {
      val client = InstallReferrerClient.newBuilder(ctx).build()
      client.startConnection(object : InstallReferrerStateListener {
        override fun onInstallReferrerSetupFinished(code: Int) {
          try {
            if (code == InstallReferrerClient.InstallReferrerResponse.OK) {
              promise.resolve(client.installReferrer.installReferrer ?: "")
            } else {
              promise.reject("REFERRER_UNAVAILABLE", "Response code $code")
            }
          } catch (e: Exception) {
            promise.reject("REFERRER_ERROR", e)
          } finally {
            try { client.endConnection() } catch (_: Exception) {}
          }
        }

        override fun onInstallReferrerServiceDisconnected() {}
      })
    } catch (e: Exception) {
      promise.reject("REFERRER_ERROR", e)
    }
  }
}
