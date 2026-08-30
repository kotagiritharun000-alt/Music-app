package com.example.muse.permission

import android.Manifest
import android.app.Activity
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.provider.Settings
import androidx.activity.result.ActivityResultLauncher
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

enum class MicrophonePermissionStatus {
    NOT_REQUESTED,
    GRANTED,
    DENIED,
    PERMANENTLY_DENIED
}

data class MicrophonePermissionUiState(
    val status: MicrophonePermissionStatus = MicrophonePermissionStatus.NOT_REQUESTED,
    val showRationaleDialog: Boolean = false,
    val showSettingsDialog: Boolean = false,
    val hasRequestedBefore: Boolean = false
) {
    val isGranted: Boolean get() = status == MicrophonePermissionStatus.GRANTED
}

class MicrophonePermissionManager(
    private val context: Context
) {
    private val _uiState = MutableStateFlow(
        MicrophonePermissionUiState(
            status = if (isPermissionGranted(context)) {
                MicrophonePermissionStatus.GRANTED
            } else {
                MicrophonePermissionStatus.NOT_REQUESTED
            }
        )
    )
    val uiState: StateFlow<MicrophonePermissionUiState> = _uiState.asStateFlow()

    fun isPermissionGranted(ctx: Context = context): Boolean {
        return ContextCompat.checkSelfPermission(
            ctx,
            Manifest.permission.RECORD_AUDIO
        ) == PackageManager.PERMISSION_GRANTED
    }

    fun syncCurrentState(ctx: Context = context) {
        val granted = isPermissionGranted(ctx)
        if (granted) {
            _uiState.value = _uiState.value.copy(
                status = MicrophonePermissionStatus.GRANTED,
                showRationaleDialog = false,
                showSettingsDialog = false
            )
        } else if (_uiState.value.status == MicrophonePermissionStatus.GRANTED) {
            _uiState.value = _uiState.value.copy(
                status = MicrophonePermissionStatus.DENIED
            )
        }
    }

    fun onPermissionRequested() {
        _uiState.value = _uiState.value.copy(
            hasRequestedBefore = true,
            showRationaleDialog = false
        )
    }

    fun onPermissionResult(
        isGranted: Boolean,
        activity: Activity? = null
    ) {
        if (isGranted) {
            _uiState.value = _uiState.value.copy(
                status = MicrophonePermissionStatus.GRANTED,
                showRationaleDialog = false,
                showSettingsDialog = false,
                hasRequestedBefore = true
            )
        } else {
            val shouldShowRationale = if (activity != null) {
                ActivityCompat.shouldShowRequestPermissionRationale(
                    activity,
                    Manifest.permission.RECORD_AUDIO
                )
            } else {
                false
            }

            if (shouldShowRationale) {
                _uiState.value = _uiState.value.copy(
                    status = MicrophonePermissionStatus.DENIED,
                    showRationaleDialog = true,
                    showSettingsDialog = false,
                    hasRequestedBefore = true
                )
            } else if (_uiState.value.hasRequestedBefore) {
                _uiState.value = _uiState.value.copy(
                    status = MicrophonePermissionStatus.PERMANENTLY_DENIED,
                    showRationaleDialog = false,
                    showSettingsDialog = true,
                    hasRequestedBefore = true
                )
            } else {
                _uiState.value = _uiState.value.copy(
                    status = MicrophonePermissionStatus.DENIED,
                    showRationaleDialog = true,
                    showSettingsDialog = false,
                    hasRequestedBefore = true
                )
            }
        }
    }

    fun requestOrExecute(
        activity: Activity,
        launcher: ActivityResultLauncher<String>,
        onGrantedAction: () -> Unit
    ) {
        if (isPermissionGranted(activity)) {
            _uiState.value = _uiState.value.copy(
                status = MicrophonePermissionStatus.GRANTED,
                showRationaleDialog = false,
                showSettingsDialog = false
            )
            onGrantedAction()
            return
        }

        val shouldShowRationale = ActivityCompat.shouldShowRequestPermissionRationale(
            activity,
            Manifest.permission.RECORD_AUDIO
        )

        if (shouldShowRationale) {
            _uiState.value = _uiState.value.copy(
                status = MicrophonePermissionStatus.DENIED,
                showRationaleDialog = true,
                showSettingsDialog = false
            )
        } else if (_uiState.value.hasRequestedBefore) {
            _uiState.value = _uiState.value.copy(
                status = MicrophonePermissionStatus.PERMANENTLY_DENIED,
                showRationaleDialog = false,
                showSettingsDialog = true
            )
        } else {
            onPermissionRequested()
            launcher.launch(Manifest.permission.RECORD_AUDIO)
        }
    }

    fun dismissRationale() {
        _uiState.value = _uiState.value.copy(showRationaleDialog = false)
    }

    fun dismissSettingsDialog() {
        _uiState.value = _uiState.value.copy(showSettingsDialog = false)
    }

    fun launchDirectRequest(launcher: ActivityResultLauncher<String>) {
        dismissRationale()
        onPermissionRequested()
        launcher.launch(Manifest.permission.RECORD_AUDIO)
    }

    fun openAppSettings(ctx: Context) {
        dismissSettingsDialog()
        try {
            val intent = Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS).apply {
                data = Uri.fromParts("package", ctx.packageName, null)
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            ctx.startActivity(intent)
        } catch (e: Exception) {
            val genericIntent = Intent(Settings.ACTION_SETTINGS).apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            ctx.startActivity(genericIntent)
        }
    }
}
