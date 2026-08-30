package com.example

import android.content.Context
import androidx.test.core.app.ApplicationProvider
import com.example.muse.permission.MicrophonePermissionManager
import com.example.muse.permission.MicrophonePermissionStatus
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotNull
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [36])
class MicrophonePermissionManagerTest {

    @Test
    fun `initial permission state initialization is valid`() {
        val context = ApplicationProvider.getApplicationContext<Context>()
        val manager = MicrophonePermissionManager(context)

        val state = manager.uiState.value
        assertNotNull(state)
        assertFalse(state.showRationaleDialog)
        assertFalse(state.showSettingsDialog)
    }

    @Test
    fun `permission result granted updates state to GRANTED`() {
        val context = ApplicationProvider.getApplicationContext<Context>()
        val manager = MicrophonePermissionManager(context)

        manager.onPermissionResult(isGranted = true)

        val state = manager.uiState.value
        assertEquals(MicrophonePermissionStatus.GRANTED, state.status)
        assertEquals(true, state.isGranted)
        assertFalse(state.showRationaleDialog)
    }

    @Test
    fun `dismissing rationale updates state`() {
        val context = ApplicationProvider.getApplicationContext<Context>()
        val manager = MicrophonePermissionManager(context)

        manager.onPermissionResult(isGranted = false)
        manager.dismissRationale()

        assertFalse(manager.uiState.value.showRationaleDialog)
    }
}
