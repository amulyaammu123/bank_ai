package com.safebank.ai.ui

import androidx.compose.animation.*
import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.safebank.ai.data.FraudReport
import com.safebank.ai.data.LocalSafetyTip

@Composable
fun SafeBankApp(viewModel: SafeBankViewModel) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val localReports by viewModel.allReports.collectAsStateWithLifecycle()
    val cloudReports by viewModel.cloudReports.collectAsStateWithLifecycle()
    val tips by viewModel.allTips.collectAsStateWithLifecycle()

    // Combine reports for display
    val reports = if (state.isLoggedIn) cloudReports else localReports

    // High Contrast color values
    val isHighContrast = state.highContrast
    val backgroundColor = if (isHighContrast) Color(0xFF121212) else Color(0xFFF8F9FF)
    val cardBgColor = if (isHighContrast) Color(0xFF000000) else Color(0xFFFFFFFF)
    val textColor = if (isHighContrast) Color(0xFFFFFF00) else Color(0xFF1E293B) // Yellow against black, or Slate
    val subTextColor = if (isHighContrast) Color(0xFFFFFFFF) else Color(0xFF64748B)
    val dividerColor = if (isHighContrast) Color(0xFFFFFF00) else Color(0xFFE2E8F0)
    
    val primaryColor = if (isHighContrast) Color(0xFFFFFF00) else Color(0xFF0061A4) // Bento Grid Deep Blue brand
    val accentColor = if (isHighContrast) Color(0xFFFF3D00) else Color(0xFFBA1A1A) // Bento Grid Red SOS / Warning
    
    // Large, highly rounded card shape characteristic of Bento grid pattern
    val bentoCardShape = RoundedCornerShape(28.dp)

    val typographyModifier = Modifier.testTag("app_container")

    // Outer safe Scaffold
    Scaffold(
        modifier = Modifier
            .fillMaxSize()
            .background(backgroundColor),
        bottomBar = {
            // Elegant M3-style navigation bar supporting high contrast and custom edge requirements
            NavigationBar(
                containerColor = if (isHighContrast) Color.Black else Color.White,
                tonalElevation = 8.dp,
                modifier = Modifier.windowInsetsPadding(WindowInsets.navigationBars).testTag("bottom_nav")
            ) {
                    listOf(
                        Triple("dashboard", Translations.translate("home", state.language), Icons.Default.Home),
                        Triple("sms", Translations.translate("smsScanner", state.language), Icons.Default.Warning),
                        Triple("call", Translations.translate("callPrediction", state.language), Icons.Default.Phone),
                        Triple("learning", Translations.translate("learningHub", state.language), Icons.Default.Info),
                        Triple("profile", Translations.translate("profile", state.language), Icons.Default.Person)
                    ).forEach { (tab, labelText, icon) ->
                        val isSelected = state.currentTab == tab
                    NavigationBarItem(
                        selected = isSelected,
                        onClick = { viewModel.navigateTo(tab) },
                        icon = { 
                            Icon(
                                imageVector = icon, 
                                contentDescription = labelText,
                                tint = if (isSelected) {
                                    if (isHighContrast) Color.Black else primaryColor
                                } else {
                                    if (isHighContrast) Color.White else Color(0xFF64748B)
                                }
                            ) 
                        },
                        label = { 
                            Text(
                                text = labelText, 
                                fontSize = (11 * state.textScale).sp,
                                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                                color = if (isHighContrast) Color.White else Color.Black
                             ) 
                        },
                        colors = NavigationBarItemDefaults.colors(
                            indicatorColor = if (isHighContrast) Color(0xFFFFFF00) else Color(0xFFD1E4FF)
                        ),
                        modifier = Modifier.testTag("nav_item_$tab")
                    )
                }
            }
        }
    ) { innerPadding ->
        
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(backgroundColor)
                .padding(innerPadding)
        ) {
            
            // --- BENTO GRID STYLE TOP ACCESSIBLE HEADER BAR ---
            Card(
                colors = CardDefaults.cardColors(containerColor = cardBgColor),
                shape = RoundedCornerShape(0.dp),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
                border = BorderStroke(1.dp, if (isHighContrast) Color.Yellow else Color(0xFFE2E8F0)),
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 8.dp, vertical = 10.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    // Title section
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(6.dp),
                        modifier = Modifier.weight(1f)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(32.dp)
                                .background(primaryColor, RoundedCornerShape(16.dp)),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = "S",
                                color = if (isHighContrast) Color.Black else Color.White,
                                fontWeight = FontWeight.Black,
                                fontSize = 14.sp
                            )
                        }
                        Column {
                            Text(
                                text = Translations.translate("appName", state.language),
                                color = textColor,
                                fontSize = (15 * state.textScale).sp,
                                fontWeight = FontWeight.Bold,
                                maxLines = 1,
                                overflow = androidx.compose.ui.text.style.TextOverflow.Ellipsis
                            )
                            Text(
                                text = Translations.translate("appSubtitle", state.language),
                                color = subTextColor,
                                fontSize = (9 * state.textScale).sp,
                                fontWeight = FontWeight.SemiBold,
                                maxLines = 1,
                                overflow = androidx.compose.ui.text.style.TextOverflow.Ellipsis
                            )
                        }
                    }
                    
                    // Easy Global Language Switcher Panel
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(2.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        listOf(
                            AppLanguage.ENGLISH to "EN",
                            AppLanguage.TELUGU to "TEL",
                            AppLanguage.HINDI to "HIN",
                            AppLanguage.TAMIL to "TAM"
                        ).forEach { (lang, code) ->
                            val active = state.language == lang
                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(4.dp))
                                    .background(
                                        if (active) {
                                            if (isHighContrast) Color(0xFFFFFF00) else primaryColor
                                        } else {
                                            if (isHighContrast) Color(0xFF333333) else Color(0xFFF1F5F9)
                                        }
                                    )
                                    .clickable { viewModel.setLanguage(lang) }
                                    .padding(horizontal = 5.dp, vertical = 6.dp)
                            ) {
                                Text(
                                    text = code,
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = if (active) {
                                        if (isHighContrast) Color.Black else Color.White
                                    } else {
                                        textColor
                                    }
                                )
                            }
                        }
                    }
                }
            }

            // Top alert notification warning under emergency
            if (state.sosTriggered) {
                Card(
                    colors = CardDefaults.cardColors(containerColor = if (isHighContrast) Color(0xFFFF3030) else Color(0xFFFFEBEE)),
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(8.dp),
                    shape = RoundedCornerShape(8.dp),
                    border = BorderStroke(2.dp, if (isHighContrast) Color.Yellow else Color.Red)
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(12.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Warning, 
                            contentDescription = "SOS Warning actively triggered", 
                            tint = if (isHighContrast) Color.Black else Color.Red,
                            modifier = Modifier.size(36.dp)
                        )
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = Translations.translate("emergencySOSActive", state.language),
                                color = if (isHighContrast) Color.Black else Color.DarkGray,
                                fontSize = (14 * state.textScale).sp,
                                fontWeight = FontWeight.ExtraBold
                            )
                            Text(
                                text = Translations.translate("locationShare", state.language) + "\n" + state.sosLocation,
                                color = if (isHighContrast) Color.Black else Color.Red,
                                fontSize = (11 * state.textScale).sp,
                                fontWeight = FontWeight.SemiBold
                            )
                        }
                        Button(
                            onClick = { viewModel.triggerSosAlert() },
                            colors = ButtonDefaults.buttonColors(containerColor = if (isHighContrast) Color.Black else Color.Red),
                            modifier = Modifier.height(36.dp)
                        ) {
                            Text("OFF", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 11.sp)
                        }
                    }
                }
            }

            // --- SWITCHING PRIMARY SCREENS ---
            Box(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth()
                    .padding(horizontal = 8.dp)
            ) {
                when (state.currentTab) {
                    "login" -> LoginScreen(state, isHighContrast, textColor, subTextColor, cardBgColor, primaryColor, accentColor, viewModel)
                    "dashboard" -> DashboardScreen(state, reports, isHighContrast, textColor, subTextColor, cardBgColor, primaryColor, accentColor, viewModel)
                    "sms" -> SmsScanningScreen(state, isHighContrast, textColor, subTextColor, cardBgColor, primaryColor, accentColor, viewModel)
                    "call" -> CallAlertScreen(state, isHighContrast, textColor, subTextColor, cardBgColor, primaryColor, accentColor, viewModel)
                    "learning" -> LearningScreen(state, tips, isHighContrast, textColor, subTextColor, cardBgColor, primaryColor, accentColor, viewModel)
                    "chatbot" -> ChatbotScreen(state, isHighContrast, textColor, subTextColor, cardBgColor, primaryColor, accentColor, viewModel)
                    "report" -> ReportFraudScreen(state, reports, isHighContrast, textColor, subTextColor, cardBgColor, primaryColor, accentColor, viewModel)
                    "sos" -> EmergencySosScreen(state, isHighContrast, textColor, subTextColor, cardBgColor, primaryColor, accentColor, viewModel)
                    "settings" -> SettingsScreen(state, isHighContrast, textColor, subTextColor, cardBgColor, primaryColor, accentColor, viewModel)
                    "admin" -> AdminPanelScreen(state, reports, isHighContrast, textColor, subTextColor, cardBgColor, primaryColor, accentColor, viewModel)
                    "profile" -> ProfileScreen(state, isHighContrast, textColor, subTextColor, cardBgColor, primaryColor, accentColor, viewModel)
                }
            }
        }
    }
}

// ==================== PROFILE SCREEN ====================
@Composable
fun ProfileScreen(
    state: UIState,
    isHighContrast: Boolean,
    textColor: Color,
    subTextColor: Color,
    cardBgColor: Color,
    primaryColor: Color,
    accentColor: Color,
    viewModel: SafeBankViewModel
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(top = 20.dp, start = 16.dp, end = 16.dp, bottom = 16.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        Box(
            modifier = Modifier
                .size(100.dp)
                .background(primaryColor, RoundedCornerShape(50.dp)),
            contentAlignment = Alignment.Center
        ) {
            Icon(
                imageVector = Icons.Default.Person,
                contentDescription = null,
                tint = Color.White,
                modifier = Modifier.size(60.dp)
            )
        }

        Text(
            text = Translations.translate("profile", state.language),
            fontSize = (24 * state.textScale).sp,
            fontWeight = FontWeight.Bold,
            color = textColor
        )

        Card(
            colors = CardDefaults.cardColors(containerColor = cardBgColor),
            shape = RoundedCornerShape(16.dp),
            elevation = CardDefaults.cardElevation(defaultElevation = 4.dp),
            border = BorderStroke(1.dp, if (isHighContrast) Color.Yellow else Color(0xFFE2E8F0)),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(
                modifier = Modifier.padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Text(
                    text = Translations.translate("userDetails", state.language),
                    fontWeight = FontWeight.Bold,
                    fontSize = (18 * state.textScale).sp,
                    color = textColor
                )

                Divider(color = if (isHighContrast) Color.Yellow else Color(0xFFE2E8F0))

                ProfileInfoRow(Translations.translate("email", state.language), state.loginEmail, textColor, state.textScale)
                ProfileInfoRow(Translations.translate("accountStatus", state.language), Translations.translate("active", state.language), textColor, state.textScale)
                ProfileInfoRow(Translations.translate("memberSince", state.language), "Oct 2023", textColor, state.textScale)
            }
        }

        Spacer(modifier = Modifier.height(24.dp))

        Button(
            onClick = { viewModel.logout() },
            colors = ButtonDefaults.buttonColors(containerColor = accentColor),
            modifier = Modifier.fillMaxWidth().height(56.dp),
            shape = RoundedCornerShape(12.dp)
        ) {
            Text(
                text = Translations.translate("logout", state.language),
                fontWeight = FontWeight.Bold,
                fontSize = (16 * state.textScale).sp,
                color = Color.White
            )
        }
    }
}

@Composable
fun ProfileInfoRow(label: String, value: String, textColor: Color, textScale: Float) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(text = label, color = textColor.copy(alpha = 0.7f), fontSize = (14 * textScale).sp)
        Text(text = value, color = textColor, fontWeight = FontWeight.Bold, fontSize = (14 * textScale).sp)
    }
}

// ==================== LOGIN SCREEN ====================
@Composable
fun LoginScreen(
    state: UIState,
    isHighContrast: Boolean,
    textColor: Color,
    subTextColor: Color,
    cardBgColor: Color,
    primaryColor: Color,
    accentColor: Color,
    viewModel: SafeBankViewModel
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(top = 20.dp, start = 16.dp, end = 16.dp, bottom = 16.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        Box(
            modifier = Modifier
                .size(80.dp)
                .background(primaryColor, RoundedCornerShape(40.dp)),
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = "S",
                color = Color.White,
                fontWeight = FontWeight.Black,
                fontSize = 40.sp
            )
        }

        Text(
            text = Translations.translate("welcome", state.language),
            fontSize = (24 * state.textScale).sp,
            fontWeight = FontWeight.Bold,
            color = textColor
        )

        Text(
            text = Translations.translate("appSubtitle", state.language),
            fontSize = (16 * state.textScale).sp,
            color = subTextColor
        )

        Spacer(modifier = Modifier.height(16.dp))

        Card(
            colors = CardDefaults.cardColors(containerColor = cardBgColor),
            shape = RoundedCornerShape(16.dp),
            elevation = CardDefaults.cardElevation(defaultElevation = 4.dp),
            border = BorderStroke(1.dp, if (isHighContrast) Color.Yellow else Color(0xFFE2E8F0)),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(
                modifier = Modifier.padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Text(
                    text = if (state.isSigningUp) {
                        "Create New Account"
                    } else {
                        if (state.loginWithOtp) Translations.translate("loginWithOtp", state.language) else "Login to Your Account"
                    },
                    fontWeight = FontWeight.Bold,
                    fontSize = (18 * state.textScale).sp,
                    color = textColor
                )

                TextField(
                    value = state.loginEmail,
                    onValueChange = { viewModel.updateLoginEmail(it) },
                    label = { Text(Translations.translate("email", state.language)) },
                    modifier = Modifier.fillMaxWidth(),
                    keyboardOptions = androidx.compose.foundation.text.KeyboardOptions(
                        keyboardType = androidx.compose.ui.text.input.KeyboardType.Email
                    ),
                    singleLine = true,
                    enabled = !state.authLoading && !state.otpSent
                )

                if (state.isSigningUp || !state.loginWithOtp) {
                    TextField(
                        value = state.loginPassword,
                        onValueChange = { viewModel.updateLoginPassword(it) },
                        label = { Text(Translations.translate("password", state.language)) },
                        modifier = Modifier.fillMaxWidth(),
                        visualTransformation = androidx.compose.ui.text.input.PasswordVisualTransformation(),
                        keyboardOptions = androidx.compose.foundation.text.KeyboardOptions(
                            keyboardType = androidx.compose.ui.text.input.KeyboardType.Password
                        ),
                        singleLine = true,
                        enabled = !state.authLoading
                    )
                } else {
                    if (state.otpSent) {
                        TextField(
                            value = state.otpInput,
                            onValueChange = { viewModel.updateOtpInput(it) },
                            label = { Text(Translations.translate("enterOtp", state.language)) },
                            placeholder = { Text("6 Digits Code") },
                            modifier = Modifier.fillMaxWidth().testTag("otp_input_field"),
                            supportingText = { Text(Translations.translate("demoOtpNote", state.language), fontSize = 11.sp, color = subTextColor) },
                            keyboardOptions = androidx.compose.foundation.text.KeyboardOptions(
                                keyboardType = androidx.compose.ui.text.input.KeyboardType.Number
                            ),
                            singleLine = true,
                            enabled = !state.authLoading
                        )
                        
                        TextButton(
                            onClick = { viewModel.toggleLoginWithOtp() },
                            modifier = Modifier.align(Alignment.End),
                            enabled = !state.authLoading
                        ) {
                            Text(Translations.translate("changeEmail", state.language), color = primaryColor, fontSize = (12 * state.textScale).sp)
                        }
                    }
                }

                if (state.authError != null) {
                    Text(
                        text = state.authError!!,
                        color = Color.Red,
                        fontSize = (12 * state.textScale).sp,
                        fontWeight = FontWeight.Bold
                    )
                }

                if (state.authMessage != null) {
                    Text(
                        text = state.authMessage!!,
                        color = if (isHighContrast) Color.Yellow else Color(0xFF2E7D32),
                        fontSize = (12 * state.textScale).sp,
                        fontWeight = FontWeight.Bold
                    )
                }

                Button(
                    onClick = { 
                        if (state.isSigningUp) {
                            viewModel.signUp()
                        } else {
                            if (state.loginWithOtp) {
                                if (state.otpSent) viewModel.verifyOtpLogin() else viewModel.sendOtp()
                            } else {
                                viewModel.loginWithPassword()
                            }
                        }
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = primaryColor),
                    modifier = Modifier.fillMaxWidth().height(56.dp).testTag("login_submit_btn"),
                    shape = RoundedCornerShape(12.dp),
                    enabled = !state.authLoading
                ) {
                    if (state.authLoading) {
                        CircularProgressIndicator(color = Color.White, modifier = Modifier.size(24.dp))
                    } else {
                        val btnLabel = if (state.isSigningUp) {
                            "Sign Up"
                        } else {
                            if (state.loginWithOtp) {
                                if (state.otpSent) Translations.translate("verifyLogin", state.language) else Translations.translate("getOtp", state.language)
                            } else {
                                "Login"
                            }
                        }
                        Text(
                            text = btnLabel,
                            fontWeight = FontWeight.Bold,
                            fontSize = (16 * state.textScale).sp
                        )
                    }
                }

                if (!state.isSigningUp) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        TextButton(
                            onClick = { viewModel.toggleLoginWithOtp() },
                            enabled = !state.authLoading
                        ) {
                            val toggleLabel = if (state.loginWithOtp) {
                                Translations.translate("usePassword", state.language)
                            } else {
                                Translations.translate("useOtp", state.language)
                            }
                            Text(toggleLabel, color = primaryColor, fontSize = (12 * state.textScale).sp)
                        }

                        if (!state.loginWithOtp) {
                            TextButton(
                                onClick = { viewModel.resetPassword() },
                                enabled = !state.authLoading
                            ) {
                                Text(Translations.translate("forgotPassword", state.language), color = primaryColor, fontSize = (12 * state.textScale).sp)
                            }
                        }
                    }
                }

                TextButton(
                    onClick = { viewModel.toggleSignUpMode() },
                    enabled = !state.authLoading,
                    modifier = Modifier.align(Alignment.CenterHorizontally)
                ) {
                    Text(
                        text = if (state.isSigningUp) "Already have an account? Login" else "New here? Sign Up",
                        color = primaryColor,
                        fontSize = 12.sp
                    )
                }

                HorizontalDivider(color = if (isHighContrast) Color.Yellow else Color(0xFFE2E8F0))

                Button(
                    onClick = { viewModel.loginAsDemo() },
                    colors = ButtonDefaults.buttonColors(containerColor = if (isHighContrast) Color.Yellow else Color(0xFF78909C)),
                    modifier = Modifier.fillMaxWidth().height(48.dp).testTag("demo_guest_login_btn"),
                    shape = RoundedCornerShape(12.dp),
                    enabled = !state.authLoading
                ) {
                    Text(
                        text = "Try Offline Demo Mode",
                        fontWeight = FontWeight.Bold,
                        color = if (isHighContrast) Color.Black else Color.White,
                        fontSize = (14 * state.textScale).sp
                    )
                }
            }
        }
        
        Spacer(modifier = Modifier.height(20.dp))
    }
}

// ==================== DASHBOARD SCREEN ====================
@Composable
fun DashboardScreen(
    state: UIState,
    reports: List<FraudReport>,
    isHighContrast: Boolean,
    textColor: Color,
    subTextColor: Color,
    cardBgColor: Color,
    primaryColor: Color,
    accentColor: Color,
    viewModel: SafeBankViewModel
) {
    val bentoCardShape = RoundedCornerShape(28.dp)
    val now = System.currentTimeMillis()
    val twentyFourHoursAgo = now - 24 * 60 * 60 * 1000
    val recentReports = reports.filter { it.timestamp >= twentyFourHoursAgo }
    
    val fraudCount = recentReports.count { 
        it.status == "Verified Fraud" || it.riskScore >= 75
    }
    val suspiciousCount = recentReports.count { 
        it.status == "Suspicious" || (it.riskScore >= 35 && it.riskScore < 75)
    }
    
    val safetyPercentage = (100 - (fraudCount * 25) - (suspiciousCount * 10)).coerceIn(0, 100)

    val cardColor = when {
        isHighContrast -> Color.Black
        safetyPercentage == 100 -> Color(0xFFE7F5E9)
        safetyPercentage >= 70 -> Color(0xFFFFF4E5)
        else -> Color(0xFFFFEBEE)
    }

    val borderColor = when {
        isHighContrast -> Color.Yellow
        safetyPercentage == 100 -> Color(0xFF2E7D32)
        safetyPercentage >= 70 -> Color(0xFFED6C02)
        else -> Color(0xFFC62828)
    }

    val textColorForCard = when {
        isHighContrast -> Color.Yellow
        safetyPercentage == 100 -> Color(0xFF1B5E20)
        safetyPercentage >= 70 -> Color(0xFF663C00)
        else -> Color(0xFFC62828)
    }

    val checkmarkColor = when {
        safetyPercentage == 100 -> Color(0xFF2E7D32)
        safetyPercentage >= 70 -> Color(0xFFED6C02)
        else -> Color(0xFFC62828)
    }

    val checkmarkText = when {
        safetyPercentage == 100 -> "✓"
        safetyPercentage >= 70 -> "!"
        else -> "⚠"
    }

    val statusText = when {
        safetyPercentage == 100 -> when (state.language) {
            AppLanguage.TELUGU -> "100% సురక్షితం"
            AppLanguage.HINDI -> "100% सुरक्षित"
            AppLanguage.TAMIL -> "100% பாதுகாப்பு"
            AppLanguage.ENGLISH -> "100% Safe"
        }
        safetyPercentage >= 70 -> when (state.language) {
            AppLanguage.TELUGU -> "$safetyPercentage% సురక్షితం"
            AppLanguage.HINDI -> "$safetyPercentage% सुरक्षित"
            AppLanguage.TAMIL -> "$safetyPercentage% பாதுகாப்பு"
            AppLanguage.ENGLISH -> "$safetyPercentage% Secure"
        }
        else -> when (state.language) {
            AppLanguage.TELUGU -> "$safetyPercentage% ప్రమాదంలో ఉంది"
            AppLanguage.HINDI -> "$safetyPercentage% जोखिम में"
            AppLanguage.TAMIL -> "$safetyPercentage% ஆபத்து"
            AppLanguage.ENGLISH -> "$safetyPercentage% At Risk"
        }
    }

    val subtitleText = when {
        safetyPercentage == 100 -> Translations.translate("noSuspicious", state.language)
        safetyPercentage >= 70 -> when (state.language) {
            AppLanguage.TELUGU -> "జాగ్రత్త: గత 24 గంటల్లో $suspiciousCount అనుమానాస్పద హెచ్చరికలు ఉన్నాయి."
            AppLanguage.HINDI -> "सावधान: पिछले 24 घंटों में $suspiciousCount संदिग्ध अलर्ट हैं।"
            AppLanguage.TAMIL -> "எச்சரிக்கை: கடந்த 24 மணிநேரத்தில் $suspiciousCount சந்தேகத்திற்குரிய அறிவிப்புகள்."
            AppLanguage.ENGLISH -> "Caution: $suspiciousCount suspicious alerts in the last 24 hours."
        }
        else -> when (state.language) {
            AppLanguage.TELUGU -> "హెచ్చరిక: గత 24 గంటల్లో $fraudCount ఆర్థిక మోసాలు కనుగొనబడ్డాయి!"
            AppLanguage.HINDI -> "चेतावनी: पिछले 24 घंटों में $fraudCount धोखाधड़ी के खतरे पाए गए!"
            AppLanguage.TAMIL -> "எச்சரிக்கை: கடந்த 24 மணிநேரத்தில் $fraudCount மோசடி அச்சுறுத்தல்கள் கண்டறியப்பட்டுள்ளன!"
            AppLanguage.ENGLISH -> "Warning: $fraudCount fraud threats detected in the last 24 hours!"
        }
    }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .testTag("dashboard_scroll_list")
            .padding(top = 8.dp),
        verticalArrangement = Arrangement.spacedBy(10.dp)
    ) {
        
        // VOICE ASSISTANT Bento Card (Bento Feature #1 - Pulsing Voice Guide)
        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = cardBgColor),
                shape = bentoCardShape,
                border = BorderStroke(2.dp, primaryColor),
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable { 
                        viewModel.speakGuidance(
                            "Welcome to Safe Bank AI. Your friendly guide is here to read warnings out loud. Tap the menu below anytime.",
                            "సెఫ్‌బ్యాంక్ కృత్రిమ రక్షణ వ్యవస్థకు స్వాగతం. మోసపూరిత కాల్స్ మరియు మెసేజ్‌ల నుండి మిమ్మల్ని రక్షించడానికి మేము సిద్ధంగా ఉన్నాము.",
                            "सेफबैंक एआई सुरक्षा में आपका स्वागत है। आवाज सहायक चालू है, सुरक्षित बैंकिंग शुरू करें।",
                            "சேஃப்பேங்க் AI-க்கு உங்களை வரவேறுகிறோம். போலி செய்திகளை கண்டறிய நாங்கள் உதவுகிறோம்."
                        )
                    }
                    .testTag("voice_assistant_bento")
            ) {
                Row(
                    modifier = Modifier.padding(18.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    Box(
                        contentAlignment = Alignment.Center,
                        modifier = Modifier
                            .size(56.dp)
                            .background(if (isHighContrast) Color.Yellow else Color(0xFFD1E4FF), RoundedCornerShape(28.dp))
                    ) {
                        Box(
                            contentAlignment = Alignment.Center,
                            modifier = Modifier
                                .size(32.dp)
                                .background(primaryColor, RoundedCornerShape(16.dp))
                        ) {
                            Icon(
                                imageVector = Icons.Default.PlayArrow, 
                                contentDescription = "Voice assistant play pulse",
                                tint = if (isHighContrast) Color.Black else Color.White,
                                modifier = Modifier.size(20.dp)
                            )
                        }
                    }
                    Column {
                        Text(
                            text = Translations.translate("voiceAssistant", state.language),
                            fontSize = (11 * state.textScale).sp,
                            fontWeight = FontWeight.Bold,
                            color = primaryColor,
                            letterSpacing = 1.sp
                        )
                        Text(
                            text = Translations.translate("tapToTalk", state.language),
                            fontSize = (18 * state.textScale).sp,
                            fontWeight = FontWeight.Bold,
                            color = textColor
                        )
                        Text(
                            text = Translations.translate("availableLangs", state.language),
                            fontSize = (12 * state.textScale).sp,
                            color = subTextColor
                        )
                    }
                }
            }
        }

        // SAFETY STATUS Bento Card (Bento Feature #2 - Green/Amber/Red Dynamic Shield Banner)
        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = cardColor),
                shape = bentoCardShape,
                border = BorderStroke(1.dp, borderColor),
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("safety_status_bento")
            ) {
                Row(
                    modifier = Modifier.padding(20.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = Translations.translate("safetyStatus", state.language),
                            fontSize = (11 * state.textScale).sp,
                            fontWeight = FontWeight.Bold,
                            color = textColorForCard,
                            letterSpacing = 1.sp
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = statusText,
                            fontSize = (26 * state.textScale).sp,
                            fontWeight = FontWeight.Black,
                            color = textColorForCard
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = subtitleText,
                            fontSize = (12 * state.textScale).sp,
                            color = if (isHighContrast) Color.White else textColorForCard.copy(alpha = 0.8f)
                        )
                    }
                    Box(
                        modifier = Modifier
                            .size(48.dp)
                            .background(Color.White, RoundedCornerShape(24.dp))
                            .border(4.dp, checkmarkColor, RoundedCornerShape(24.dp)),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = checkmarkText,
                            fontSize = 20.sp,
                            fontWeight = FontWeight.Black,
                            color = checkmarkColor
                        )
                    }
                }
            }
        }

        // BENTO GRID ACTION CARDS (Bento Rows #3 & #4)
        item {
            Text(
                text = Translations.translate("actionModules", state.language),
                fontWeight = FontWeight.ExtraBold,
                fontSize = (16 * state.textScale).sp,
                color = textColor,
                modifier = Modifier.padding(vertical = 4.dp, horizontal = 4.dp)
            )
        }

        // Row 1: Scan SMS & Call Alert Grid Cells
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                // SMS Scanner Tile (Bento Cell 1)
                Card(
                    colors = CardDefaults.cardColors(containerColor = cardBgColor),
                    shape = bentoCardShape,
                    modifier = Modifier
                        .weight(1f)
                        .height(140.dp)
                        .clickable { viewModel.navigateTo("sms") }
                        .testTag("sms_tile_btn"),
                    elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
                    border = BorderStroke(1.dp, if (isHighContrast) Color.Yellow else Color(0xFFE2E8F0))
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(16.dp),
                        verticalArrangement = Arrangement.Center,
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text(
                            text = "✉️",
                            fontSize = 28.sp,
                            modifier = Modifier.padding(bottom = 6.dp)
                        )
                        Text(
                            text = Translations.translate("smsScanner", state.language),
                            fontWeight = FontWeight.Bold,
                            color = textColor,
                            fontSize = (14 * state.textScale).sp,
                            textAlign = TextAlign.Center
                        )
                        Text(
                            text = Translations.translate("checkScams", state.language),
                            color = subTextColor,
                            fontSize = (10 * state.textScale).sp,
                            textAlign = TextAlign.Center
                        )
                    }
                }

                // Call detector Tile (Bento Cell 2)
                Card(
                    colors = CardDefaults.cardColors(containerColor = cardBgColor),
                    shape = bentoCardShape,
                    modifier = Modifier
                        .weight(1f)
                        .height(140.dp)
                        .clickable { viewModel.navigateTo("call") }
                        .testTag("call_tile_btn"),
                    elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
                    border = BorderStroke(1.dp, if (isHighContrast) Color.Yellow else Color(0xFFE2E8F0))
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(16.dp),
                        verticalArrangement = Arrangement.Center,
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text(
                            text = "📞",
                            fontSize = 28.sp,
                            modifier = Modifier.padding(bottom = 6.dp)
                        )
                        Text(
                            text = Translations.translate("callAlert", state.language),
                            fontWeight = FontWeight.Bold,
                            color = textColor,
                            fontSize = (14 * state.textScale).sp,
                            textAlign = TextAlign.Center
                        )
                        Text(
                            text = Translations.translate("identifySpammers", state.language),
                            color = subTextColor,
                            fontSize = (10 * state.textScale).sp,
                            textAlign = TextAlign.Center
                        )
                    }
                }
            }
        }

        // Row 2: Safety Tips & Quick Report Grid Cells
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                // Tutorials Hub / Safety Tips (Bento Cell 3)
                Card(
                    colors = CardDefaults.cardColors(containerColor = cardBgColor),
                    shape = bentoCardShape,
                    modifier = Modifier
                        .weight(1f)
                        .height(140.dp)
                        .clickable { viewModel.navigateTo("learning") }
                        .testTag("learning_tile_btn"),
                    elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
                    border = BorderStroke(1.dp, if (isHighContrast) Color.Yellow else Color(0xFFE2E8F0))
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(16.dp),
                        verticalArrangement = Arrangement.Center,
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text(
                            text = "🎓",
                            fontSize = 28.sp,
                            modifier = Modifier.padding(bottom = 6.dp)
                        )
                        Text(
                            text = Translations.translate("safetyTips", state.language),
                            fontWeight = FontWeight.Bold,
                            color = textColor,
                            fontSize = (14 * state.textScale).sp,
                            textAlign = TextAlign.Center
                        )
                        Text(
                            text = Translations.translate("learnBanking", state.language),
                            color = subTextColor,
                            fontSize = (10 * state.textScale).sp,
                            textAlign = TextAlign.Center
                        )
                    }
                }

                // Quick Report (Bento Cell 4 - Custom alerts amber warning styling)
                Card(
                    colors = CardDefaults.cardColors(
                        containerColor = if (isHighContrast) Color.Black else Color(0xFFFFF4E5)
                    ),
                    shape = bentoCardShape,
                    modifier = Modifier
                        .weight(1f)
                        .height(140.dp)
                        .clickable { viewModel.navigateTo("report") }
                        .testTag("report_tile_btn"),
                    elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
                    border = BorderStroke(
                        width = 1.dp,
                        color = if (isHighContrast) Color.Yellow else Color(0xFFED6C02)
                    )
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(16.dp),
                        verticalArrangement = Arrangement.Center,
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text(
                            text = "🚨",
                            fontSize = 28.sp,
                            modifier = Modifier.padding(bottom = 6.dp)
                        )
                        Text(
                            text = Translations.translate("reportFraud", state.language),
                            fontWeight = FontWeight.Bold,
                            color = if (isHighContrast) Color.Yellow else Color(0xFF663C00),
                            fontSize = (14 * state.textScale).sp,
                            textAlign = TextAlign.Center
                        )
                        Text(
                            text = Translations.translate("quickReport", state.language),
                            color = if (isHighContrast) Color.White else Color(0xFF663C00).copy(alpha = 0.8f),
                            fontSize = (10 * state.textScale).sp,
                            textAlign = TextAlign.Center
                        )
                    }
                }
            }
        }

        // Row 3: AI Chatbot helper card (Wide Bento item)
        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = cardBgColor),
                shape = bentoCardShape,
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable { viewModel.navigateTo("chatbot") }
                    .testTag("chatbot_tile_btn"),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
                border = BorderStroke(1.dp, if (isHighContrast) Color.Yellow else Color(0xFFE2E8F0))
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(18.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(14.dp)
                ) {
                    Text(text = "🤖", fontSize = 32.sp)
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = Translations.translate("aiHelper", state.language),
                            fontWeight = FontWeight.Bold,
                            color = textColor,
                            fontSize = (15 * state.textScale).sp
                        )
                        Text(
                            text = Translations.translate("aiChatDesc", state.language),
                            color = subTextColor,
                            fontSize = (11 * state.textScale).sp
                        )
                    }
                    Icon(
                        imageVector = Icons.Default.PlayArrow, 
                        contentDescription = "Open Chat", 
                        tint = primaryColor
                    )
                }
            }
        }

        // Accessibility controls shortcut
        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = if (isHighContrast) Color(0xFF1E1E1E) else Color(0xFFE8F5E9)),
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable { viewModel.navigateTo("settings") },
                shape = RoundedCornerShape(8.dp),
                border = if (isHighContrast) BorderStroke(1.dp, Color.Yellow) else null
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(12.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        imageVector = Icons.Default.Settings, 
                        contentDescription = "Access Settings", 
                        tint = if (isHighContrast) Color.Yellow else Color(0xFF2E7D32)
                    )
                    Spacer(modifier = Modifier.width(10.dp))
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = Translations.translate("settingsSupport", state.language),
                            fontWeight = FontWeight.Bold,
                            color = textColor,
                            fontSize = (14 * state.textScale).sp
                        )
                        Text(
                            text = Translations.translate("settingsDesc", state.language),
                            color = subTextColor,
                            fontSize = (11 * state.textScale).sp
                        )
                    }
                    Icon(imageVector = Icons.Default.PlayArrow, contentDescription = "Go", tint = textColor)
                }
            }
        }

        // Cyber crime helpline banner
        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = if (isHighContrast) Color.Black else Color(0xFFFFEBEE)),
                modifier = Modifier.fillMaxWidth(),
                border = BorderStroke(2.dp, if (isHighContrast) Color.Yellow else Color(0xFFEF9A9A))
            ) {
                Column(modifier = Modifier.padding(14.dp)) {
                    Text(
                        text = Translations.translate("cybercrimeDesk", state.language),
                        fontWeight = FontWeight.ExtraBold,
                        color = if (isHighContrast) Color.Yellow else Color(0xFFC62828),
                        fontSize = (15 * state.textScale).sp
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = Translations.translate("cybercrimeDesc", state.language),
                        color = textColor,
                        fontSize = (12 * state.textScale).sp
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Button(
                            onClick = { viewModel.speakGuidance("Dialing 1930 Helpline now. This service is toll-free 24 hours.") },
                            colors = ButtonDefaults.buttonColors(containerColor = if (isHighContrast) Color.Yellow else Color(0xFFC62828)),
                            modifier = Modifier.weight(1f)
                        ) {
                            Text(
                                Translations.translate("dial1930", state.language),
                                color = if (isHighContrast) Color.Black else Color.White,
                                fontWeight = FontWeight.Bold,
                                fontSize = 12.sp
                            )
                        }
                        
                        Button(
                            onClick = { viewModel.navigateTo("admin") },
                            colors = ButtonDefaults.buttonColors(containerColor = if (isHighContrast) Color(0xFF555555) else Color(0xFF546E7A)),
                            modifier = Modifier.weight(1f)
                        ) {
                            Text(
                                Translations.translate("admin", state.language),
                                color = Color.White,
                                fontWeight = FontWeight.Bold,
                                fontSize = 12.sp
                            )
                        }
                    }
                }
            }
        }
        
        // Brief space spacer
        item {
            Spacer(modifier = Modifier.height(40.dp))
        }
    }
}


// ==================== SMS SCAM SCANNING SCREEN ====================
@Composable
fun SmsScanningScreen(
    state: UIState,
    isHighContrast: Boolean,
    textColor: Color,
    subTextColor: Color,
    cardBgColor: Color,
    primaryColor: Color,
    accentColor: Color,
    viewModel: SafeBankViewModel
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(top = 10.dp),
        verticalArrangement = Arrangement.spacedBy(10.dp)
    ) {
        Text(
            text = Translations.translate("smsScanTitle", state.language),
            fontWeight = FontWeight.Bold,
            fontSize = (18 * state.textScale).sp,
            color = textColor
        )

        Card(
            colors = CardDefaults.cardColors(containerColor = cardBgColor),
            elevation = CardDefaults.cardElevation(2.dp),
            modifier = Modifier.fillMaxWidth(),
            border = if (isHighContrast) BorderStroke(1.dp, Color.Yellow) else null
        ) {
            Column(modifier = Modifier.padding(14.dp)) {
                Text(
                    text = Translations.translate("smsScanTitle", state.language).replace("Desk", ""),
                    fontWeight = FontWeight.Bold,
                    fontSize = (14 * state.textScale).sp,
                    color = textColor
                )
                Spacer(modifier = Modifier.height(8.dp))
                
                TextField(
                    value = state.smsText,
                    onValueChange = { viewModel.updateSmsText(it) },
                    placeholder = { 
                        Text(
                            text = Translations.translate("smsScanPlaceholder", state.language), 
                            fontSize = (13 * state.textScale).sp,
                            color = subTextColor.copy(alpha = 0.8f)
                        ) 
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(130.dp)
                        .testTag("sms_input_field"),
                    textStyle = TextStyle(
                        fontSize = (15 * state.textScale).sp,
                        fontWeight = FontWeight.Medium,
                        color = textColor
                    ),
                    colors = TextFieldDefaults.colors(
                        focusedContainerColor = if (isHighContrast) Color.Black else Color(0xFFE2E8F0),
                        unfocusedContainerColor = if (isHighContrast) Color.Black else Color(0xFFF1F5F9),
                        focusedTextColor = textColor,
                        unfocusedTextColor = textColor
                    )
                )
                Spacer(modifier = Modifier.height(10.dp))
                
                // Demo load quick message pills
                Text(
                    text = Translations.translate("smsTemplates", state.language),
                    fontSize = (12 * state.textScale).sp,
                    fontWeight = FontWeight.Bold,
                    color = textColor
                )
                Spacer(modifier = Modifier.height(4.dp))
                Row(
                    modifier = Modifier.horizontalScroll(rememberScrollState()),
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    listOf(
                        "Your account is BLOCKED! Update Aadhaar KYC instantly at http://secure-sbi.com/1",
                        "CONGRATS! You won Rs.2,00,000 lottery cash prize. Send Rs.1,500 security tax to upi ID lucky@pay",
                        "Hi grandfather, please tell me the 6-digit OTP code sent to your phone number so I confirm SBI payment.",
                        "Standard SMS. Hi, please remember to buy organic milk and cattle feed on your way home."
                    ).forEach { sample ->
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(6.dp))
                                .background(if (isHighContrast) Color(0xFF333333) else Color(0xFFE2E8F0))
                                .clickable { viewModel.updateSmsText(sample) }
                                .padding(horizontal = 10.dp, vertical = 6.dp)
                        ) {
                            Text(
                                text = if (sample.length > 25) sample.take(22) + "..." else sample,
                                fontSize = 11.sp,
                                color = textColor,
                                fontWeight = FontWeight.SemiBold
                            )
                        }
                    }
                }
                
                Spacer(modifier = Modifier.height(12.dp))
                
                Button(
                    onClick = { viewModel.scanSmsText() },
                    colors = ButtonDefaults.buttonColors(containerColor = if (isHighContrast) Color.Yellow else Color(0xFF1E4620)),
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(48.dp)
                        .testTag("scan_submit_btn"),
                    enabled = !state.smsScanning
                ) {
                    if (state.smsScanning) {
                        CircularProgressIndicator(modifier = Modifier.size(24.dp), color = Color.Black)
                    } else {
                        Text(
                            text = Translations.translate("smsBtnAnalyze", state.language),
                            fontWeight = FontWeight.ExtraBold,
                            color = if (isHighContrast) Color.Black else Color.White,
                            fontSize = (14 * state.textScale).sp
                        )
                    }
                }
            }
        }

        // SCANNING RESULT DISPLAY
        if (state.smsRiskLevel != "IDLE") {
            val resultCardColor = when (state.smsRiskLevel) {
                "FRAUD" -> if (isHighContrast) Color.Black else Color(0xFFFFEBEE)
                "SUSPICIOUS" -> if (isHighContrast) Color.Black else Color(0xFFFFF3E0)
                "SCANNING" -> if (isHighContrast) Color.Black else Color(0xFFEDF2F7)
                else -> if (isHighContrast) Color.Black else Color(0xFFE8F5E9)
            }
            
            val resultOutline = when (state.smsRiskLevel) {
                "FRAUD" -> Color.Red
                "SUSPICIOUS" -> Color(0xFFE65100)
                else -> Color(0xFF2E7D32)
            }

            Card(
                colors = CardDefaults.cardColors(containerColor = resultCardColor),
                border = BorderStroke(2.dp, if (isHighContrast) Color.Yellow else resultOutline),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(14.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = Translations.translate("securityRisk", state.language),
                            fontSize = (12 * state.textScale).sp,
                            fontWeight = FontWeight.ExtraBold,
                            color = if (isHighContrast) Color.Yellow else resultOutline
                        )
                        
                        if (state.smsRiskScore > 0) {
                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(4.dp))
                                    .background(resultOutline)
                                    .padding(horizontal = 6.dp, vertical = 2.dp)
                            ) {
                                Text(
                                    text = "${Translations.translate("risk", state.language)}: ${state.smsRiskScore}%",
                                    color = Color.White,
                                    fontWeight = FontWeight.ExtraBold,
                                    fontSize = 11.sp
                                )
                            }
                        }
                    }
                    
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        text = state.smsResult,
                        fontSize = (14 * state.textScale).sp,
                        fontWeight = FontWeight.SemiBold,
                        color = textColor
                    )
                }
            }
        }
        
        Spacer(modifier = Modifier.height(30.dp))
    }
}


// ==================== SUSPICIOUS CALL ALERT SIMULATION ====================
@Composable
fun CallAlertScreen(
    state: UIState,
    isHighContrast: Boolean,
    textColor: Color,
    subTextColor: Color,
    cardBgColor: Color,
    primaryColor: Color,
    accentColor: Color,
    viewModel: SafeBankViewModel
) {
    if (state.incomingCallActive) {
        // CALL SIMULATOR RINGING GRAPHICS OVERLAY
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(if (isHighContrast) Color.Black else Color(0xFF0F172A))
                .padding(16.dp),
            verticalArrangement = Arrangement.SpaceBetween,
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                modifier = Modifier.padding(top = 40.dp)
            ) {
                Box(
                    modifier = Modifier
                        .size(90.dp)
                        .clip(RoundedCornerShape(45.dp))
                        .background(if (state.callRiskLevel == "FRAUD") Color.Red else Color.Green),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.Person, 
                        contentDescription = "Caller profile", 
                        tint = Color.White,
                        modifier = Modifier.size(50.dp)
                    )
                }
                Spacer(modifier = Modifier.height(16.dp))
                Text(
                    text = state.callerName,
                    color = Color.White,
                    fontWeight = FontWeight.Bold,
                    fontSize = (24 * state.textScale).sp,
                    textAlign = TextAlign.Center
                )
                Text(
                    text = state.callerNumber,
                    color = Color.LightGray,
                    fontSize = (16 * state.textScale).sp
                )
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = Translations.translate("simulatedCallActive", state.language),
                    color = Color(0xFFE2E8F0),
                    fontSize = (11 * state.textScale).sp,
                    fontWeight = FontWeight.SemiBold
                )
            }

            // SAFETY SCREEN ALERTS
            Card(
                colors = CardDefaults.cardColors(containerColor = if (state.callRiskLevel == "FRAUD") Color(0xFF7F1D1D) else Color(0xFF064E3B)),
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(8.dp),
                shape = RoundedCornerShape(12.dp),
                border = BorderStroke(2.dp, Color.Yellow)
            ) {
                Column(modifier = Modifier.padding(14.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(imageVector = Icons.Default.Warning, contentDescription = "Alert", tint = Color.Yellow)
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = Translations.translate("callActiveWarning", state.language),
                            fontWeight = FontWeight.ExtraBold,
                            color = Color.Yellow,
                            fontSize = (14 * state.textScale).sp
                        )
                    }
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        text = state.callAnalysisDetail,
                        color = Color.White,
                        fontSize = (13 * state.textScale).sp,
                        fontWeight = FontWeight.Medium
                    )
                }
            }

            // Decline/Reject buttons
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(bottom = 30.dp),
                horizontalArrangement = Arrangement.SpaceEvenly
            ) {
                Button(
                    onClick = { viewModel.endCallSimulation() },
                    colors = ButtonDefaults.buttonColors(containerColor = Color.Red),
                    modifier = Modifier
                        .height(54.dp)
                        .weight(1f)
                        .padding(horizontal = 8.dp)
                        .testTag("hangup_call_btn")
                ) {
                    Text(
                        text = Translations.translate("callDeclineBtn", state.language),
                        color = Color.White,
                        fontWeight = FontWeight.Bold,
                        fontSize = 12.sp
                    )
                }
            }
        }
    } else {
        // SELECT SUSPICIOUS CALL TYPES
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(top = 10.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            Text(
                text = Translations.translate("callTitle", state.language),
                fontWeight = FontWeight.Bold,
                fontSize = (18 * state.textScale).sp,
                color = textColor
            )
            
            Text(
                text = Translations.translate("callDesc", state.language),
                color = subTextColor,
                fontSize = (13 * state.textScale).sp
            )

            // Custom Number Scanner and Tracker card
            Card(
                colors = CardDefaults.cardColors(containerColor = cardBgColor),
                elevation = CardDefaults.cardElevation(4.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("custom_call_detector_card"),
                border = BorderStroke(2.dp, primaryColor)
            ) {
                Column(modifier = Modifier.padding(14.dp)) {
                    Text(
                        text = Translations.translate("scanPhoneRisk", state.language),
                        fontWeight = FontWeight.Bold,
                        fontSize = (15 * state.textScale).sp,
                        color = textColor
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = Translations.translate("scanPhoneDesc", state.language),
                        color = subTextColor,
                        fontSize = (11 * state.textScale).sp
                    )
                    Spacer(modifier = Modifier.height(10.dp))
                    
                    TextField(
                        value = state.callInputNumber,
                        onValueChange = { viewModel.updateCallInputNumber(it) },
                        placeholder = { Text("e.g. +91 97184 02091", fontSize = (12 * state.textScale).sp) },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(56.dp)
                            .testTag("call_number_input"),
                        leadingIcon = { Icon(imageVector = Icons.Default.Phone, contentDescription = "Phone icon", tint = primaryColor) },
                        textStyle = TextStyle(fontSize = (14 * state.textScale).sp),
                        colors = TextFieldDefaults.colors(
                            focusedContainerColor = if (isHighContrast) Color.Black else Color(0xFFF1F5F9),
                            unfocusedContainerColor = if (isHighContrast) Color.Black else Color(0xFFF8FAFC)
                        ),
                        singleLine = true
                    )
                    Spacer(modifier = Modifier.height(10.dp))
                    
                    Button(
                        onClick = { viewModel.detectCallNumber() },
                        colors = ButtonDefaults.buttonColors(containerColor = primaryColor),
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(44.dp)
                            .testTag("detect_number_btn"),
                        enabled = !state.callAnalyzing && state.callInputNumber.isNotBlank()
                    ) {
                        if (state.callAnalyzing) {
                            CircularProgressIndicator(modifier = Modifier.size(20.dp), color = Color.White)
                        } else {
                            Text(
                                text = Translations.translate("analyzeCaller", state.language),
                                fontWeight = FontWeight.Bold,
                                color = Color.White,
                                fontSize = (13 * state.textScale).sp
                            )
                        }
                    }
                }
            }

            // OPT Fraud Call simulation trigger
            Card(
                colors = CardDefaults.cardColors(containerColor = cardBgColor),
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable { viewModel.triggerCallSimulation("OTP Spoof") }
                    .testTag("trigger_otp_call"),
                elevation = CardDefaults.cardElevation(2.dp),
                border = if (isHighContrast) BorderStroke(1.dp, Color.Yellow) else null
            ) {
                Column(modifier = Modifier.padding(14.dp)) {
                    Text(
                        text = Translations.translate("triggerOtpCall", state.language),
                        fontWeight = FontWeight.Bold,
                        fontSize = (15 * state.textScale).sp,
                        color = textColor
                    )
                    Text(
                        text = Translations.translate("otpCallDesc", state.language),
                        color = subTextColor,
                        fontSize = (11 * state.textScale).sp
                    )
                }
            }

            // Lottery prize scam simulator
            Card(
                colors = CardDefaults.cardColors(containerColor = cardBgColor),
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable { viewModel.triggerCallSimulation("Lottery/UPI") }
                    .testTag("trigger_prize_call"),
                elevation = CardDefaults.cardElevation(2.dp),
                border = if (isHighContrast) BorderStroke(1.dp, Color.Yellow) else null
            ) {
                Column(modifier = Modifier.padding(14.dp)) {
                    Text(
                        text = Translations.translate("triggerPrizeCall", state.language),
                        fontWeight = FontWeight.Bold,
                        fontSize = (15 * state.textScale).sp,
                        color = textColor
                    )
                    Text(
                        text = Translations.translate("prizeCallDesc", state.language),
                        color = subTextColor,
                        fontSize = (11 * state.textScale).sp
                    )
                }
            }

            // Police CBI threat scam simulator
            Card(
                colors = CardDefaults.cardColors(containerColor = cardBgColor),
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable { viewModel.triggerCallSimulation("Police/Fear") }
                    .testTag("trigger_police_call"),
                elevation = CardDefaults.cardElevation(2.dp),
                border = if (isHighContrast) BorderStroke(1.dp, Color.Yellow) else null
            ) {
                Column(modifier = Modifier.padding(14.dp)) {
                    Text(
                        text = Translations.translate("triggerPoliceCall", state.language),
                        fontWeight = FontWeight.Bold,
                        fontSize = (15 * state.textScale).sp,
                        color = textColor
                    )
                    Text(
                        text = Translations.translate("policeCallDesc", state.language),
                        color = subTextColor,
                        fontSize = (11 * state.textScale).sp
                    )
                }
            }

            // Standard safe contact caller simulator
            Card(
                colors = CardDefaults.cardColors(containerColor = cardBgColor),
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable { viewModel.triggerCallSimulation("Normal Farmer") }
                    .testTag("trigger_normal_call"),
                elevation = CardDefaults.cardElevation(2.dp),
                border = if (isHighContrast) BorderStroke(1.dp, Color.Yellow) else null
            ) {
                Column(modifier = Modifier.padding(14.dp)) {
                    Text(
                        text = Translations.translate("triggerNormalCall", state.language),
                        fontWeight = FontWeight.Bold,
                        fontSize = (15 * state.textScale).sp,
                        color = textColor
                    )
                    Text(
                        text = Translations.translate("normalCallDesc", state.language),
                        color = subTextColor,
                        fontSize = (11 * state.textScale).sp
                    )
                }
            }
            
            Spacer(modifier = Modifier.height(30.dp))
        }
    }
}


// ==================== OFFLINE INFORMATION & EDUCATION ====================
@Composable
fun LearningScreen(
    state: UIState,
    tips: List<LocalSafetyTip>,
    isHighContrast: Boolean,
    textColor: Color,
    subTextColor: Color,
    cardBgColor: Color,
    primaryColor: Color,
    accentColor: Color,
    viewModel: SafeBankViewModel
) {
    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .testTag("tutorials_scroll_list")
            .padding(top = 10.dp),
        verticalArrangement = Arrangement.spacedBy(10.dp)
    ) {
        item {
            Text(
                text = Translations.translate("learningTitle", state.language),
                fontWeight = FontWeight.Bold,
                fontSize = (18 * state.textScale).sp,
                color = textColor
            )
        }
        item {
            Text(
                text = Translations.translate("learningLessons", state.language),
                color = subTextColor,
                fontSize = (13 * state.textScale).sp
            )
        }

        items(tips) { tip ->
            val langTitle = when (state.language) {
                AppLanguage.TELUGU -> tip.titleTe
                AppLanguage.HINDI -> tip.titleHi
                AppLanguage.TAMIL -> tip.titleTa
                else -> tip.titleEn
            }
            val langContent = when (state.language) {
                AppLanguage.TELUGU -> tip.contentTe
                AppLanguage.HINDI -> tip.contentHi
                AppLanguage.TAMIL -> tip.contentTa
                else -> tip.contentEn
            }
            val voiceEn = tip.voiceScriptEn
            val voiceTe = tip.voiceScriptTe
            val voiceHi = tip.voiceScriptHi
            val voiceTa = tip.voiceScriptTa

            Card(
                colors = CardDefaults.cardColors(containerColor = cardBgColor),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
                modifier = Modifier.fillMaxWidth(),
                border = if (isHighContrast) BorderStroke(1.dp, Color.Yellow) else null
            ) {
                Column(modifier = Modifier.padding(14.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = langTitle,
                            fontWeight = FontWeight.Bold,
                            color = textColor,
                            fontSize = (16 * state.textScale).sp
                        )
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(4.dp))
                                .background(if (isHighContrast) Color(0xFF333333) else Color(0xFFFFECE2))
                                .padding(horizontal = 6.dp, vertical = 2.dp)
                        ) {
                            Text(
                                text = tip.category,
                                fontWeight = FontWeight.Bold,
                                color = if (isHighContrast) Color.Yellow else Color(0xFFD35400),
                                fontSize = 11.sp
                            )
                        }
                    }
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = langContent,
                        color = textColor,
                        fontSize = (13 * state.textScale).sp,
                        lineHeight = (18 * state.textScale).sp
                    )
                    Spacer(modifier = Modifier.height(10.dp))
                    Button(
                        onClick = { viewModel.speakGuidance(voiceEn, voiceTe, voiceHi, voiceTa) },
                        colors = ButtonDefaults.buttonColors(containerColor = if (isHighContrast) Color.Yellow else Color(0xFF43A047)),
                        modifier = Modifier.fillMaxWidth(),
                        contentPadding = PaddingValues(vertical = 4.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.PlayArrow, 
                            contentDescription = "Speak voice instructions", 
                            tint = Color.Black,
                            modifier = Modifier.size(18.dp)
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = Translations.translate("playVoiceLesson", state.language),
                            fontWeight = FontWeight.Bold,
                            color = Color.Black,
                            fontSize = 12.sp
                        )
                    }
                }
            }
        }
        item {
            Spacer(modifier = Modifier.height(40.dp))
        }
    }
}


// ==================== AI CHATBOT SCREEN ====================
@Composable
fun ChatbotScreen(
    state: UIState,
    isHighContrast: Boolean,
    textColor: Color,
    subTextColor: Color,
    cardBgColor: Color,
    primaryColor: Color,
    accentColor: Color,
    viewModel: SafeBankViewModel
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(top = 10.dp)
    ) {
        Text(
            text = Translations.translate("chatTitle", state.language),
            fontWeight = FontWeight.Bold,
            fontSize = (18 * state.textScale).sp,
            color = textColor
        )
        Text(
            text = Translations.translate("chatDesc", state.language),
            color = subTextColor,
            fontSize = (12 * state.textScale).sp,
            modifier = Modifier.padding(bottom = 8.dp)
        )

        // Chat bubble records scroll section
        LazyColumn(
            modifier = Modifier
                .weight(1f)
                .fillMaxWidth()
                .testTag("chat_messages_flow"),
            verticalArrangement = Arrangement.spacedBy(8.dp),
            reverseLayout = true
        ) {
            // Reverse so list scrolls nicely
            val reversed = state.chatHistory.reversed()
            items(reversed) { msg ->
                val isBot = msg.sender == "assistant"
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = if (isBot) Arrangement.Start else Arrangement.End
                ) {
                    Box(
                        modifier = Modifier
                            .widthIn(max = 280.dp)
                            .clip(
                                RoundedCornerShape(
                                    topStart = 12.dp,
                                    topEnd = 12.dp,
                                    bottomStart = if (isBot) 0.dp else 12.dp,
                                    bottomEnd = if (isBot) 12.dp else 0.dp
                                )
                            )
                            .background(
                                if (isBot) {
                                    if (isHighContrast) Color.Black else Color(0xFFE2E8F0)
                                } else {
                                    if (isHighContrast) Color(0xFF333333) else Color(0xFFC8E6C9)
                                }
                            )
                            .border(
                                width = if (isHighContrast) 1.dp else 0.dp,
                                color = if (isHighContrast) Color.Yellow else Color.Transparent,
                                shape = RoundedCornerShape(12.dp)
                            )
                            .padding(10.dp)
                    ) {
                        Text(
                            text = msg.text,
                            fontSize = (13 * state.textScale).sp,
                            color = textColor,
                            fontWeight = if (isBot) FontWeight.Medium else FontWeight.SemiBold
                        )
                    }
                }
            }
        }

        if (state.chatLoading) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(8.dp),
                contentAlignment = Alignment.Center
            ) {
                CircularProgressIndicator(modifier = Modifier.size(24.dp), color = primaryColor)
            }
        }

        // Message input compose section
        Spacer(modifier = Modifier.height(6.dp))
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(bottom = 10.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            TextField(
                value = state.chatQuery,
                onValueChange = { viewModel.updateChatQuery(it) },
                placeholder = { Text(Translations.translate("chatPlaceholder", state.language), fontSize = (12 * state.textScale).sp) },
                modifier = Modifier
                    .weight(1f)
                    .testTag("chat_input_text")
                    .height(52.dp),
                textStyle = TextStyle(fontSize = (13 * state.textScale).sp),
                colors = TextFieldDefaults.colors(
                    focusedContainerColor = cardBgColor,
                    unfocusedContainerColor = cardBgColor
                )
            )
            Button(
                onClick = { viewModel.sendChatQuery() },
                colors = ButtonDefaults.buttonColors(containerColor = if (isHighContrast) Color.Yellow else Color(0xFF1E4620)),
                modifier = Modifier
                    .height(52.dp)
                    .width(64.dp)
                    .testTag("chat_send_btn")
            ) {
                Icon(
                    imageVector = Icons.Default.Send, 
                    contentDescription = "Send", 
                    tint = if (isHighContrast) Color.Black else Color.White
                )
            }
        }
    }
}


// ==================== REPORT FRAUD SCREEN ====================
@Composable
fun ReportFraudScreen(
    state: UIState,
    reports: List<FraudReport>,
    isHighContrast: Boolean,
    textColor: Color,
    subTextColor: Color,
    cardBgColor: Color,
    primaryColor: Color,
    accentColor: Color,
    viewModel: SafeBankViewModel
) {
    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .testTag("report_scroll_list")
            .padding(top = 10.dp),
        verticalArrangement = Arrangement.spacedBy(10.dp)
    ) {
        item {
            Text(
                text = Translations.translate("reportTitle", state.language),
                fontWeight = FontWeight.Bold,
                fontSize = (18 * state.textScale).sp,
                color = textColor
            )
            Text(
                text = Translations.translate("reportSubtitle", state.language),
                color = subTextColor,
                fontSize = (12 * state.textScale).sp
            )

            if (state.authError != null) {
                Card(
                    colors = CardDefaults.cardColors(containerColor = Color(0xFFFFEBEE)),
                    modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp),
                    border = BorderStroke(1.dp, Color.Red)
                ) {
                    Text(
                        text = state.authError!!,
                        color = Color.Red,
                        fontSize = (12 * state.textScale).sp,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(8.dp)
                    )
                }
            }
        }

        // Submitting metadata form
        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = cardBgColor),
                elevation = CardDefaults.cardElevation(2.dp),
                modifier = Modifier.fillMaxWidth(),
                border = if (isHighContrast) BorderStroke(1.dp, Color.Yellow) else null
            ) {
                Column(modifier = Modifier.padding(14.dp)) {
                    Text(
                        text = "File Fraud incident Witness",
                        fontWeight = FontWeight.Bold,
                        color = textColor,
                        fontSize = (14 * state.textScale).sp
                    )
                    Spacer(modifier = Modifier.height(10.dp))

                    // Reporter name
                    Text(Translations.translate("fieldReporter", state.language), fontSize = (12 * state.textScale).sp, fontWeight = FontWeight.Bold, color = textColor)
                    TextField(
                        value = state.reporterName,
                        onValueChange = { viewModel.updateReporterName(it) },
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 4.dp)
                            .testTag("report_name_input"),
                        textStyle = TextStyle(fontSize = (13 * state.textScale).sp)
                    )

                    Spacer(modifier = Modifier.height(4.dp))

                    // Target targetValue
                    Text(Translations.translate("fieldTarget", state.language), fontSize = (12 * state.textScale).sp, fontWeight = FontWeight.Bold, color = textColor)
                    TextField(
                        value = state.reportTarget,
                        onValueChange = { viewModel.updateReportTarget(it) },
                        placeholder = { Text("e.g. +91 91930 xxxxx, or fraud@upi", fontSize = 12.sp) },
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 4.dp)
                            .testTag("report_target_input"),
                        textStyle = TextStyle(fontSize = (13 * state.textScale).sp)
                    )

                    Spacer(modifier = Modifier.height(4.dp))

                    // DescriptionDetails
                    Text(Translations.translate("fieldDetails", state.language), fontSize = (12 * state.textScale).sp, fontWeight = FontWeight.Bold, color = textColor)
                    TextField(
                        value = state.reportDetails,
                        onValueChange = { viewModel.updateReportDetails(it) },
                        placeholder = { Text("What did they request or say to you?", fontSize = 12.sp) },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(100.dp)
                            .padding(vertical = 4.dp)
                            .testTag("report_details_input"),
                        textStyle = TextStyle(fontSize = (13 * state.textScale).sp)
                    )

                    if (state.uploadSuccess) {
                        Spacer(modifier = Modifier.height(6.dp))
                        Text(
                            text = Translations.translate("reportSuccess", state.language),
                            color = if (isHighContrast) Color.Yellow else Color(0xFF2E7D32),
                            fontSize = (12 * state.textScale).sp,
                            fontWeight = FontWeight.Bold
                        )
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    Button(
                        onClick = { viewModel.submitFraudReport() },
                        colors = ButtonDefaults.buttonColors(containerColor = if (isHighContrast) Color.Yellow else Color(0xFF1E4620)),
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(48.dp)
                            .testTag("report_submit_btn"),
                        enabled = !state.uploadProgress
                    ) {
                        if (state.uploadProgress) {
                            CircularProgressIndicator(modifier = Modifier.size(24.dp), color = Color.Black)
                        } else {
                            Text(
                                text = Translations.translate("btnSubmitReport", state.language),
                                fontWeight = FontWeight.Bold,
                                color = if (isHighContrast) Color.Black else Color.White,
                                fontSize = (13 * state.textScale).sp
                            )
                        }
                    }
                }
            }
        }

        // HISTORICAL REPORTS SAVED VIEW
        item {
            Text(
                text = "Secure Local Witness Log (${reports.size})",
                fontWeight = FontWeight.ExtraBold,
                fontSize = (15 * state.textScale).sp,
                color = textColor,
                modifier = Modifier.padding(top = 10.dp)
            )
        }

        if (reports.isEmpty()) {
            item {
                Card(
                    colors = CardDefaults.cardColors(containerColor = cardBgColor),
                    modifier = Modifier.fillMaxWidth().padding(vertical = 2.dp),
                    border = if (isHighContrast) BorderStroke(1.dp, Color.Yellow) else null
                ) {
                    Text(
                        text = "No cases registered yet. Your filed witness records are safe here online/offline.",
                        color = subTextColor,
                        fontSize = (12 * state.textScale).sp,
                        textAlign = TextAlign.Center,
                        modifier = Modifier.padding(16.dp).fillMaxWidth()
                    )
                }
            }
        } else {
            items(reports) { item ->
                Card(
                    colors = CardDefaults.cardColors(containerColor = cardBgColor),
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 2.dp),
                    border = BorderStroke(1.dp, if (isHighContrast) Color.Yellow else Color(0xFFEF9A9A))
                ) {
                    Column(modifier = Modifier.padding(12.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "Category: ${item.category}",
                                fontWeight = FontWeight.Bold,
                                color = textColor,
                                fontSize = (14 * state.textScale).sp
                            )
                            IconButton(onClick = { viewModel.deleteReport(item.id) }, modifier = Modifier.size(24.dp)) {
                                Icon(imageVector = Icons.Default.Delete, contentDescription = "Delete record", tint = Color.Red)
                            }
                        }
                        Text(
                            text = "Target: ${item.targetValue}",
                            fontWeight = FontWeight.SemiBold,
                            color = if (isHighContrast) Color.Yellow else Color(0xFFC62828),
                            fontSize = (13 * state.textScale).sp
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = "Details: ${item.details}",
                            color = textColor,
                            fontSize = (12 * state.textScale).sp
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Row(
                            horizontalArrangement = Arrangement.SpaceBetween,
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text(
                                text = "Reporter: ${item.reporterName}",
                                fontSize = 11.sp,
                                color = subTextColor
                            )
                            Text(
                                text = "Status: ${item.status}",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color(0xFFE65100)
                            )
                        }
                    }
                }
            }
        }
        item {
            Spacer(modifier = Modifier.height(40.dp))
        }
    }
}


// ==================== EMERGENCY SOS SCREEN ====================
@Composable
fun EmergencySosScreen(
    state: UIState,
    isHighContrast: Boolean,
    textColor: Color,
    subTextColor: Color,
    cardBgColor: Color,
    primaryColor: Color,
    accentColor: Color,
    viewModel: SafeBankViewModel
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(top = 10.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(
            text = Translations.translate("sosHelp", state.language),
            fontWeight = FontWeight.Bold,
            fontSize = (18 * state.textScale).sp,
            color = textColor,
            modifier = Modifier.align(Alignment.Start)
        )
        
        Text(
            text = Translations.translate("sosDesc", state.language),
            color = subTextColor,
            fontSize = (13 * state.textScale).sp,
            modifier = Modifier.align(Alignment.Start)
        )

        if (state.authError != null) {
            Card(
                colors = CardDefaults.cardColors(containerColor = Color(0xFFFFEBEE)),
                modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp),
                border = BorderStroke(1.dp, Color.Red)
            ) {
                Text(
                    text = state.authError!!,
                    color = Color.Red,
                    fontSize = (12 * state.textScale).sp,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(8.dp)
                )
            }
        }

        Spacer(modifier = Modifier.height(10.dp))

        // Giant Red SOS Trigger Button
        Box(
            contentAlignment = Alignment.Center,
            modifier = Modifier
                .size(170.dp)
                .clip(RoundedCornerShape(85.dp))
                .background(
                    if (state.sosTriggered) {
                        if (isHighContrast) Color.Yellow else Color.Green
                    } else {
                        if (isHighContrast) Color.Red else Color(0xFFC62828)
                    }
                )
                .clickable { viewModel.triggerSosAlert() }
                .testTag("sos_giant_touch_btn")
        ) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Icon(
                    imageVector = Icons.Default.Notifications, 
                    contentDescription = "Alert logo", 
                    tint = if (state.sosTriggered) Color.Black else Color.White,
                    modifier = Modifier.size(46.dp)
                )
                Spacer(modifier = Modifier.height(6.dp))
                Text(
                    text = if (state.sosTriggered) "ACTIVE ACTIVE" else "TAP SOS",
                    fontWeight = FontWeight.ExtraBold,
                    fontSize = (16 * state.textScale).sp,
                    color = if (state.sosTriggered) Color.Black else Color.White
                )
            }
        }

        Spacer(modifier = Modifier.height(10.dp))

        Card(
            colors = CardDefaults.cardColors(containerColor = cardBgColor),
            modifier = Modifier.fillMaxWidth(),
            border = if (isHighContrast) BorderStroke(1.dp, Color.Yellow) else null
        ) {
            Column(modifier = Modifier.padding(14.dp)) {
                Text(
                    text = Translations.translate("savedContacts", state.language),
                    fontWeight = FontWeight.Bold,
                    fontSize = (14 * state.textScale).sp,
                    color = textColor
                )
                Spacer(modifier = Modifier.height(6.dp))
                
                if (state.emergencyContacts.isEmpty()) {
                    Text(
                        text = Translations.translate("noContacts", state.language),
                        color = subTextColor,
                        fontSize = (12 * state.textScale).sp,
                        textAlign = TextAlign.Center,
                        modifier = Modifier.padding(vertical = 10.dp).fillMaxWidth()
                    )
                }
                
                state.emergencyContacts.forEach { contact ->
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 4.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(text = contact, color = textColor, fontSize = (13 * state.textScale).sp)
                        IconButton(onClick = { viewModel.deleteEmergencyContact(contact) }, modifier = Modifier.size(24.dp)) {
                            Icon(imageVector = Icons.Default.Delete, contentDescription = "Delete", tint = Color.Red)
                        }
                    }
                }

                Divider(color = if (isHighContrast) Color.Yellow else Color(0xFFE2E8F0), modifier = Modifier.padding(vertical = 10.dp))

                Text(
                    text = Translations.translate("addContact", state.language),
                    fontWeight = FontWeight.Bold,
                    fontSize = (13 * state.textScale).sp,
                    color = textColor
                )
                
                TextField(
                    value = state.contactNameInput,
                    onValueChange = { viewModel.updateContactName(it) },
                    label = { Text(Translations.translate("contactName", state.language), fontSize = 11.sp) },
                    modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp),
                    textStyle = TextStyle(fontSize = 13.sp),
                    singleLine = true
                )

                TextField(
                    value = state.contactPhoneInput,
                    onValueChange = { viewModel.updateContactPhone(it) },
                    label = { Text(Translations.translate("contactPhone", state.language), fontSize = 11.sp) },
                    modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp),
                    textStyle = TextStyle(fontSize = 13.sp),
                    keyboardOptions = androidx.compose.foundation.text.KeyboardOptions(
                        keyboardType = androidx.compose.ui.text.input.KeyboardType.Phone
                    ),
                    singleLine = true
                )

                Button(
                    onClick = { viewModel.addEmergencyContact() },
                    colors = ButtonDefaults.buttonColors(containerColor = primaryColor),
                    modifier = Modifier.fillMaxWidth().padding(top = 8.dp),
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Text(Translations.translate("btnAddContact", state.language), fontSize = 12.sp, fontWeight = FontWeight.Bold)
                }
            }
        }

        // Quick hotline links
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Button(
                onClick = { viewModel.speakGuidance("Dialing 1930 Cyber helpline now") },
                colors = ButtonDefaults.buttonColors(containerColor = if (isHighContrast) Color.Yellow else Color.Black),
                modifier = Modifier.weight(1f).height(48.dp)
            ) {
                Text("1930 Help Line", fontSize = 11.sp, color = if (isHighContrast) Color.Black else Color.White)
            }

            Button(
                onClick = { viewModel.speakGuidance("Dialing 112 Police helpline now") },
                colors = ButtonDefaults.buttonColors(containerColor = if (isHighContrast) Color.Yellow else Color(0xFFEF6C00)),
                modifier = Modifier.weight(1f).height(48.dp)
            ) {
                Text("112 Urgent Desk", fontSize = 11.sp, color = if (isHighContrast) Color.Black else Color.White)
            }
        }
        
        Spacer(modifier = Modifier.height(30.dp))
    }
}


@Composable
fun SettingsScreen(
    state: UIState,
    isHighContrast: Boolean,
    textColor: Color,
    subTextColor: Color,
    cardBgColor: Color,
    primaryColor: Color,
    accentColor: Color,
    viewModel: SafeBankViewModel
) {
    val dividerColor = if (isHighContrast) Color(0xFFFFFF00) else Color(0xFFE2E8F0)

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(top = 10.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        Text(
            text = Translations.translate("settingsTitle", state.language),
            fontWeight = FontWeight.Bold,
            fontSize = (18 * state.textScale).sp,
            color = textColor
        )

        Card(
            colors = CardDefaults.cardColors(containerColor = cardBgColor),
            modifier = Modifier.fillMaxWidth(),
            border = if (isHighContrast) BorderStroke(1.dp, Color.Yellow) else null
        ) {
            Column(modifier = Modifier.padding(14.dp)) {
                
                // Voice Narration Toggle
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 10.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = Translations.translate("voiceGuideToggle", state.language),
                            fontWeight = FontWeight.Bold,
                            fontSize = (14 * state.textScale).sp,
                            color = textColor
                        )
                        Text(
                            text = Translations.translate("voiceGuideDesc", state.language),
                            fontSize = (11 * state.textScale).sp,
                            color = subTextColor
                        )
                    }
                    Switch(
                        checked = state.voiceNavigationEnabled,
                        onCheckedChange = { viewModel.toggleVoiceNavigation(it) },
                        modifier = Modifier.testTag("voice_assist_switch")
                    )
                }

                Divider(color = dividerColor)

                // High Contrast Mode Toggle
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 10.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = Translations.translate("highContrastToggle", state.language),
                            fontWeight = FontWeight.Bold,
                            fontSize = (14 * state.textScale).sp,
                            color = textColor
                        )
                        Text(
                            text = Translations.translate("highContrastDesc", state.language),
                            fontSize = (11 * state.textScale).sp,
                            color = subTextColor
                        )
                    }
                    Switch(
                        checked = state.highContrast,
                        onCheckedChange = { viewModel.toggleHighContrast() },
                        modifier = Modifier.testTag("high_contrast_switch")
                    )
                }

                Divider(color = dividerColor)

                // Enlarge fonts size spacing settings
                Column(modifier = Modifier.padding(vertical = 10.dp)) {
                    Text(
                        text = Translations.translate("textSizeTitle", state.language),
                        fontWeight = FontWeight.Bold,
                        fontSize = (14 * state.textScale).sp,
                        color = textColor
                    )
                    Spacer(modifier = Modifier.height(6.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        listOf(
                            1.0f to Translations.translate("sizeNormal", state.language),
                            1.25f to Translations.translate("sizeLarge", state.language),
                            1.5f to Translations.translate("sizeExtra", state.language)
                        ).forEach { (scale, labelHex) ->
                            val active = state.textScale == scale
                            Button(
                                onClick = { viewModel.setTextScale(scale) },
                                colors = ButtonDefaults.buttonColors(
                                    containerColor = if (active) {
                                        if (isHighContrast) Color.Yellow else Color(0xFF2E7D32)
                                    } else {
                                        if (isHighContrast) Color(0xFF333333) else Color(0xFFE2E8F0)
                                    }
                                ),
                                modifier = Modifier.weight(1f),
                                contentPadding = PaddingValues(horizontal = 4.dp, vertical = 6.dp)
                            ) {
                                Text(
                                    text = labelHex,
                                    fontSize = 11.sp,
                                    color = if (active) {
                                        if (isHighContrast) Color.Black else Color.White
                                    } else {
                                        textColor
                                    },
                                    fontWeight = FontWeight.Bold
                                )
                            }
                        }
                    }
                }
            }
        }
        
        Spacer(modifier = Modifier.height(30.dp))
    }
}


// ==================== ADMIN PANEL SCREEN ====================
@Composable
fun AdminPanelScreen(
    state: UIState,
    reports: List<FraudReport>,
    isHighContrast: Boolean,
    textColor: Color,
    subTextColor: Color,
    cardBgColor: Color,
    primaryColor: Color,
    accentColor: Color,
    viewModel: SafeBankViewModel
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(top = 10.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        Text(
            text = Translations.translate("adminTitle", state.language),
            fontWeight = FontWeight.Bold,
            fontSize = (18 * state.textScale).sp,
            color = textColor
        )

        Card(
            colors = CardDefaults.cardColors(containerColor = cardBgColor),
            modifier = Modifier.fillMaxWidth(),
            border = if (isHighContrast) BorderStroke(1.dp, Color.Yellow) else null
        ) {
            Column(modifier = Modifier.padding(14.dp)) {
                Text(
                    text = Translations.translate("adminTotalReports", state.language),
                    fontWeight = FontWeight.Bold,
                    color = textColor,
                    fontSize = (14 * state.textScale).sp
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = "${reports.size} Reports Logs Filed Globally",
                    fontSize = (28 * state.textScale).sp,
                    fontWeight = FontWeight.ExtraBold,
                    color = accentColor
                )
            }
        }

        // Crime categories split chart simulator
        Card(
            colors = CardDefaults.cardColors(containerColor = cardBgColor),
            modifier = Modifier.fillMaxWidth(),
            border = if (isHighContrast) BorderStroke(1.dp, Color.Yellow) else null
        ) {
            Column(modifier = Modifier.padding(14.dp)) {
                Text(
                    text = Translations.translate("adminCatDist", state.language),
                    fontWeight = FontWeight.Bold,
                    fontSize = (14 * state.textScale).sp,
                    color = textColor
                )
                Spacer(modifier = Modifier.height(10.dp))

                val smsCount = reports.filter { it.category == "SMS" }.size + 3
                val callCount = reports.filter { it.category == "Call" }.size + 2
                val upiCount = reports.filter { it.category == "UPI ID" }.size + 4

                listOf(
                    Triple("Adhara/SMS phishing", smsCount, Color(0xFFEF6C00)),
                    Triple("Fake calling threats", callCount, Color(0xFF1565C0)),
                    Triple("UPI QR scams", upiCount, Color(0xFF2E7D32))
                ).forEach { (category, count, color) ->
                    Column(modifier = Modifier.padding(vertical = 4.dp)) {
                        Row(
                            horizontalArrangement = Arrangement.SpaceBetween,
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text(text = category, fontSize = 12.sp, color = textColor, fontWeight = FontWeight.SemiBold)
                            Text(text = "$count Cases", fontSize = 12.sp, color = textColor, fontWeight = FontWeight.Bold)
                        }
                        Spacer(modifier = Modifier.height(4.dp))
                        val percentage = (count.toFloat() / (smsCount + callCount + upiCount)) * 100f
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(14.dp)
                                .clip(RoundedCornerShape(7.dp))
                                .background(if (isHighContrast) Color(0xFF333333) else Color(0xFFE2E8F0))
                        ) {
                            Box(
                                modifier = Modifier
                                    .fillMaxHeight()
                                    .fillMaxWidth(percentage / 100f)
                                    .background(if (isHighContrast) Color.Yellow else color)
                            )
                        }
                    }
                }
            }
        }

        // Recent User Login Activities
        Card(
            colors = CardDefaults.cardColors(containerColor = cardBgColor),
            modifier = Modifier.fillMaxWidth(),
            border = if (isHighContrast) BorderStroke(1.dp, Color.Yellow) else null
        ) {
            Column(modifier = Modifier.padding(14.dp)) {
                Text(
                    text = "Recent User Logins",
                    fontWeight = FontWeight.Bold,
                    fontSize = (14 * state.textScale).sp,
                    color = textColor
                )
                Spacer(modifier = Modifier.height(10.dp))

                if (state.userLogins.isEmpty()) {
                    Text(
                        text = "No login logs recorded.",
                        color = subTextColor,
                        fontSize = (12 * state.textScale).sp
                    )
                } else {
                    val sdf = java.text.SimpleDateFormat("dd MMM yyyy, hh:mm a", java.util.Locale.getDefault())
                    state.userLogins.take(5).forEach { login ->
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 4.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = login.email,
                                fontSize = (12 * state.textScale).sp,
                                color = textColor,
                                fontWeight = FontWeight.SemiBold
                            )
                            Text(
                                text = sdf.format(java.util.Date(login.loginTime)),
                                fontSize = (11 * state.textScale).sp,
                                color = subTextColor
                            )
                        }
                        HorizontalDivider(color = if (isHighContrast) Color.Yellow else Color(0xFFE2E8F0))
                    }
                }
            }
        }

        // Recent Feature Activities
        Card(
            colors = CardDefaults.cardColors(containerColor = cardBgColor),
            modifier = Modifier.fillMaxWidth(),
            border = if (isHighContrast) BorderStroke(1.dp, Color.Yellow) else null
        ) {
            Column(modifier = Modifier.padding(14.dp)) {
                Text(
                    text = "Recent Feature Activities",
                    fontWeight = FontWeight.Bold,
                    fontSize = (14 * state.textScale).sp,
                    color = textColor
                )
                Spacer(modifier = Modifier.height(10.dp))

                if (state.activityLogs.isEmpty()) {
                    Text(
                        text = "No feature usage logs recorded.",
                        color = subTextColor,
                        fontSize = (12 * state.textScale).sp
                    )
                } else {
                    val sdf = java.text.SimpleDateFormat("dd MMM yyyy, hh:mm a", java.util.Locale.getDefault())
                    state.activityLogs.take(5).forEach { log ->
                        Column(modifier = Modifier.padding(vertical = 4.dp)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(
                                    text = log.email,
                                    fontSize = (12 * state.textScale).sp,
                                    color = textColor,
                                    fontWeight = FontWeight.SemiBold
                                )
                                Text(
                                    text = sdf.format(java.util.Date(log.timestamp)),
                                    fontSize = (11 * state.textScale).sp,
                                    color = subTextColor
                                )
                            }
                            Row(
                                modifier = Modifier.fillMaxWidth().padding(top = 2.dp),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Text(
                                    text = "Feature: ${log.feature}",
                                    fontSize = (11 * state.textScale).sp,
                                    color = primaryColor,
                                    fontWeight = FontWeight.Bold
                                )
                                Text(
                                    text = log.details,
                                    fontSize = (11 * state.textScale).sp,
                                    color = subTextColor,
                                    maxLines = 1,
                                    overflow = androidx.compose.ui.text.style.TextOverflow.Ellipsis,
                                    modifier = Modifier.weight(1f, fill = false).padding(start = 8.dp)
                                )
                            }
                        }
                        HorizontalDivider(color = if (isHighContrast) Color.Yellow else Color(0xFFE2E8F0))
                    }
                }
            }
        }

        // Trigger push notifications signals
        Button(
            onClick = { viewModel.speakGuidance("Emergency community security notice dispatched: Urgent UPI QR scanning bait circulating in South rural blocks. Keep security PINs confidential.") },
            colors = ButtonDefaults.buttonColors(containerColor = accentColor),
            shape = RoundedCornerShape(8.dp),
            modifier = Modifier
                .fillMaxWidth()
                .height(48.dp)
        ) {
            Icon(imageVector = Icons.Default.Notifications, contentDescription = "Alert", tint = Color.White)
            Spacer(modifier = Modifier.width(6.dp))
            Text(
                Translations.translate("adminDangerSignal", state.language),
                color = Color.White,
                fontWeight = FontWeight.Bold,
                fontSize = (13 * state.textScale).sp
            )
        }
        
        Spacer(modifier = Modifier.height(30.dp))
    }
}
