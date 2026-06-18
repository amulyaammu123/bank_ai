package com.safebank.ai

import android.Manifest
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import androidx.lifecycle.ViewModelProvider
import com.safebank.ai.ui.SafeBankApp
import com.safebank.ai.ui.SafeBankViewModel
import com.safebank.ai.ui.theme.MyApplicationTheme
import androidx.compose.foundation.layout.Box
import androidx.compose.ui.ExperimentalComposeUiApi
import androidx.compose.ui.Modifier
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.semantics.testTagsAsResourceId

class MainActivity : ComponentActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    enableEdgeToEdge()

    // Request dynamic permissions for SMS receiving, phone calls, call logs, and notifications
    val permissions = mutableListOf(
      Manifest.permission.RECEIVE_SMS,
      Manifest.permission.READ_PHONE_STATE
    )
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
      permissions.add(Manifest.permission.READ_CALL_LOG)
    }
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
      permissions.add(Manifest.permission.POST_NOTIFICATIONS)
    }

    val permissionsToRequest = permissions.filter {
      ContextCompat.checkSelfPermission(this, it) != PackageManager.PERMISSION_GRANTED
    }

    if (permissionsToRequest.isNotEmpty()) {
      ActivityCompat.requestPermissions(this, permissionsToRequest.toTypedArray(), 101)
    }
    
    val viewModel = ViewModelProvider(this)[SafeBankViewModel::class.java]
    
    setContent {
      MyApplicationTheme {
        @OptIn(ExperimentalComposeUiApi::class)
        Box(modifier = Modifier.semantics {
          testTagsAsResourceId = true
        }) {
          SafeBankApp(viewModel = viewModel)
        }
      }
    }
  }
}

