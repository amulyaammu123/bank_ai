package com.safebank.ai.ui

import android.app.Application
import android.content.Context
import android.speech.tts.TextToSpeech
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.safebank.ai.data.*
import com.safebank.ai.data.SupabaseClient
import com.safebank.ai.data.SupabaseAuthRequest
import com.safebank.ai.data.SupabaseRecoverRequest
import com.safebank.ai.data.SupabaseReport
import com.safebank.ai.data.SupabaseContact
import com.safebank.ai.data.SupabaseEmergencyAlert
import com.safebank.ai.BuildConfig
import com.squareup.moshi.Moshi
import com.squareup.moshi.kotlin.reflect.KotlinJsonAdapterFactory
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import java.util.Locale

enum class AppLanguage(val code: String, val displayName: String) {
    ENGLISH("en", "English"),
    TELUGU("te", "తెలుగు (Telugu)"),
    HINDI("hi", "हिन्दी (Hindi)"),
    TAMIL("ta", "தமிழ் (Tamil)")
}

data class ChatMessage(val sender: String, val text: String, val timestamp: Long = System.currentTimeMillis())

data class UIState(
    val language: AppLanguage = AppLanguage.ENGLISH,
    val highContrast: Boolean = false,
    val textScale: Float = 1.0f, // 1.0f (Normal), 1.25f (Large), 1.5f (Extra Large)
    val voiceNavigationEnabled: Boolean = true,
    
    // SMS Screen State
    val smsText: String = "",
    val smsResult: String = "",
    val smsRiskLevel: String = "IDLE", // "IDLE", "SAFE", "SUSPICIOUS", "FRAUD"
    val smsRiskScore: Int = 0,
    val smsScanning: Boolean = false,

    // Call Screen State
    val incomingCallActive: Boolean = false,
    val callerName: String = "Unknown NetBanking Agent",
    val callerNumber: String = "+91 97184 02091",
    val callPatternType: String = "OTP Scam",
    val callRiskLevel: String = "FRAUD", // "SAFE", "SUSPICIOUS", "FRAUD"
    val callAnalysisDetail: String = "",
    val voiceWarningPlaying: Boolean = false,
    val callInputNumber: String = "",
    val callAnalyzing: Boolean = false,

    // AI Chatbot State
    val chatQuery: String = "",
    val chatHistory: List<ChatMessage> = listOf(
        ChatMessage("assistant", "Hello! I am your SafeBank AI assistant. You can voice chat or ask me any banking questions, KYC procedures, or scam message doubts here.")
    ),
    val chatLoading: Boolean = false,

    // Reporting Screen State
    val reportCategory: String = "UPI ID", // "UPI ID", "Call Phone", "SMS Link", "Other"
    val reportTarget: String = "",
    val reportDetails: String = "",
    val reporterName: String = "",
    val uploadProgress: Boolean = false,
    val uploadSuccess: Boolean = false,

    // SOS State
    val sosTriggered: Boolean = false,
    val sosLocation: String = "17.385040 N, 78.486671 E (Rural Hub, South India)",
    val emergencyContacts: List<String> = emptyList(),
    val contactNameInput: String = "",
    val contactPhoneInput: String = "",

    // Active Screen Selector
    val currentTab: String = "login", // "login", "dashboard", "sms", "call", "learning", "chatbot", "report", "sos", "settings", "admin"

    // Auth State
    val loginEmail: String = "",
    val loginPassword: String = "",
    val isSigningUp: Boolean = false,
    val isLoggedIn: Boolean = false,
    val authLoading: Boolean = false,
    val authError: String? = null,
    val authMessage: String? = null,
    val loginWithOtp: Boolean = false,
    val otpSent: Boolean = false,
    val otpInput: String = "",
    val userLogins: List<SupabaseUserLogin> = emptyList(),
    val activityLogs: List<SupabaseActivityLog> = emptyList()
)

class SafeBankViewModel(application: Application) : AndroidViewModel(application) {

    private val database = AppDatabase.getDatabase(application)
    private val dao = database.fraudDao()
    private val geminiRepository = GeminiRepository()
    
    private var sessionToken: String? = null
    private var userEmail: String? = null

    private val sharedPrefs = application.getSharedPreferences("safebank_prefs", Context.MODE_PRIVATE)

    private fun persistSession(email: String, token: String) {
        sharedPrefs.edit().apply {
            putString("session_token", token)
            putString("user_email", email)
            putBoolean("is_logged_in", true)
            apply()
        }
    }

    private fun clearPersistedSession() {
        sharedPrefs.edit().clear().apply()
    }

    private val moshi = Moshi.Builder().add(KotlinJsonAdapterFactory()).build()
    private val listAdapter = moshi.adapter<List<String>>(
        com.squareup.moshi.Types.newParameterizedType(List::class.java, String::class.java)
    )

    private fun listToJson(list: List<String>): String {
        return try {
            listAdapter.toJson(list)
        } catch (e: Exception) {
            "[]"
        }
    }

    private fun jsonToList(json: String): List<String> {
        return try {
            listAdapter.fromJson(json) ?: emptyList()
        } catch (e: Exception) {
            emptyList()
        }
    }

    private var tts: TextToSpeech? = null
    private var isTtsInitialized = false

    private val _uiState = MutableStateFlow(UIState())
    val uiState: StateFlow<UIState> = _uiState.asStateFlow()

    // Room DB reports flow
    val allReports: StateFlow<List<FraudReport>> = dao.getAllReports()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    private val _cloudReports = MutableStateFlow<List<FraudReport>>(emptyList())
    val cloudReports: StateFlow<List<FraudReport>> = _cloudReports.asStateFlow()

    // Room DB safety tips flow
    val allTips: StateFlow<List<LocalSafetyTip>> = dao.getAllTips()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    init {
        // Restore session
        val savedEmail = sharedPrefs.getString("user_email", null)
        val savedToken = sharedPrefs.getString("session_token", null)
        val savedLoggedIn = sharedPrefs.getBoolean("is_logged_in", false)
        if (savedLoggedIn && savedEmail != null && savedToken != null) {
            sessionToken = savedToken
            userEmail = savedEmail
            _uiState.update { 
                it.copy(
                    isLoggedIn = true,
                    loginEmail = savedEmail,
                    currentTab = "dashboard",
                    authMessage = "Welcome back!"
                ) 
            }
            fetchUserData(savedEmail)
        }

        // Prepopulate tips if empty
        viewModelScope.launch {
            if (dao.getTipsCount() == 0) {
                dao.insertTips(getPrepopulatedTips())
            }
        }

        // Initialize Cloud Data from Supabase
        fetchCloudReports()

        // Initialize Text-To-Speech engine
        tts = TextToSpeech(application) { status ->
            if (status == TextToSpeech.SUCCESS) {
                isTtsInitialized = true
                tts?.setPitch(1.0f)
                tts?.setSpeechRate(0.85f) // Slower speed for rural/elderly users
                speakGuidance("SafeBank AI security active. Simple safe banking starts here.")
            }
        }
    }

    fun fetchCloudReports() {
        viewModelScope.launch {
            try {
                val anonKey = try { BuildConfig.SUPABASE_ANON_KEY } catch (e: Exception) { "" }
                if (anonKey.isNotEmpty() && anonKey != "MY_SUPABASE_ANON_KEY" && anonKey != "placeholder") {
                    val authHeader = getAuthHeader(anonKey)
                    val reportsList = SupabaseClient.service.getReports(anonKey, authHeader)
                    _cloudReports.value = reportsList.map { it.toFraudReport() }
                }
            } catch (e: Exception) {
                _uiState.update { it.copy(authError = "Supabase Sync Error: ${e.message}") }
            }
        }
    }

    override fun onCleared() {
        super.onCleared()
        tts?.stop()
        tts?.shutdown()
    }

    // Dynamic Voice guidance depending on user state
    fun speakGuidance(enText: String, teText: String? = null, hiText: String? = null, taText: String? = null) {
        if (!_uiState.value.voiceNavigationEnabled) return
        val currentLanguage = _uiState.value.language
        val textToSpeak = when (currentLanguage) {
            AppLanguage.TELUGU -> teText ?: enText
            AppLanguage.HINDI -> hiText ?: enText
            AppLanguage.TAMIL -> taText ?: enText
            AppLanguage.ENGLISH -> enText
        }
        speakTextDirect(textToSpeak)
    }

    private fun speakTextDirect(text: String) {
        if (!isTtsInitialized) return
        viewModelScope.launch {
            val currentLanguage = _uiState.value.language
            val locale = when (currentLanguage) {
                AppLanguage.TELUGU -> Locale("te", "IN")
                AppLanguage.HINDI -> Locale("hi", "IN")
                AppLanguage.TAMIL -> Locale("ta", "IN")
                AppLanguage.ENGLISH -> Locale.US
            }
            tts?.language = locale
            tts?.speak(text, TextToSpeech.QUEUE_FLUSH, null, null)
        }
    }

    // Settings actions
    fun setLanguage(language: AppLanguage) {
        _uiState.update { it.copy(language = language) }
        val prompt = when (language) {
            AppLanguage.ENGLISH -> "Language changed to English."
            AppLanguage.TELUGU -> "భాష తెలుగులోకి మార్చబడింది."
            AppLanguage.HINDI -> "भाषा हिंदी में बदल दी गई है।"
            AppLanguage.TAMIL -> "மொழி தமிழுக்கு மாற்றப்பட்டது."
        }
        speakTextDirect(prompt)
    }

    fun toggleHighContrast() {
        _uiState.update { it.copy(highContrast = !it.highContrast) }
        val guide = if (_uiState.value.highContrast) {
            speakGuidance("High contrast mode turned on.", "అధిక కాంట్రాస్ట్ మోడ్ ఆన్ చేయబడింది.", "उच्च कंट्रास्ट मोड चालू किया गया।", "உயர் கான்ட்ராஸ்ட் பயன்முறை ஆன் செய்யப்பட்டது.")
        } else {
            speakGuidance("High contrast mode turned off.", "అధిక కాంట్రాస్ట్ మోడ్ ఆఫ్ చేయబడింది.", "उच्च कंट्रास्ट मोड बंद किया गया।", "உயர் கான்ட்ராஸ்ட் பயன்முறை ஆஃப் செய்யப்பட்டது.")
        }
    }

    fun setTextScale(scale: Float) {
        _uiState.update { it.copy(textScale = scale) }
        val txt = when (scale) {
            1.0f -> "Font size set to standard"
            1.25f -> "Font size set to large"
            else -> "Font size set to extra large"
        }
        speakTextDirect(txt)
    }

    fun toggleVoiceNavigation(enabled: Boolean) {
        _uiState.update { it.copy(voiceNavigationEnabled = enabled) }
        if (enabled) {
            speakTextDirect("Voice guide is now active.")
        }
    }

    fun navigateTo(tab: String) {
        if (!_uiState.value.isLoggedIn && tab != "login") {
            _uiState.update { it.copy(currentTab = "login") }
            return
        }
        _uiState.update { it.copy(currentTab = tab) }
        when (tab) {
            "dashboard" -> speakGuidance("Opening Home Dashboard", "హోమ్ స్క్రీన్ ఓపెన్ చేయబడింది", "मुख्य स्क्रीन खुली है", "முதன்மை திரை திறக்கப்பட்டது")
            "sms" -> speakGuidance("Message Scam Scanner. Type or paste your SMS here to check safety.", "సందేశాల స్కానర్. భద్రతను తనిఖీ చేయడానికి మీ SMSని ఇక్కడ టైప్ చేయండి.", "संदेश स्कैनर। सन्देश की जांच करने के लिए यहाँ टाइप करें।", "செய்தி ஸ்கேனர். சரிபார்க்க இங்கே தட்டச்சு செய்யவும்.")
            "call" -> speakGuidance("Phone Call Fraud Detector. Choose a scam type to simulate a warning alert.", "ఫోన్ కాల్ మోసాల డిటెక్టర్. హెచ్చరికను అనుకరించడానికి ఒక స్కామ్ రకాన్ని ఎంచుకోండి.", "कॉल फ्रॉड डिटेक्टर। चेतावनी देखने के लिए एक धोखाधड़ी प्रकार चुनें।", "அழைப்பு மோசடி கண்டறிதல். எச்சரிக்கையை உருவகப்படுத்த ஒரு மோசடி வகையைத் தேர்ந்தெடுக்கவும்.")
            "learning" -> speakGuidance("Interactive safety models. Tap any card to study safe banking offline.", "సురక్షిత బ్యాంకింగ్ పాఠాలు. ఏ కార్డునైనా నొక్కి సులువుగా చదవండి.", "सुरक्षित बैंकिंग पाठ। किसी भी कार्ड को दबाकर ऑफलाइन अध्ययन करें।", "பாதுகாப்பான வங்கித் தகவல். ஆஃப்லைனில் படிக்க ஏதேனும் கார்டைத் தட்டவும்.")
            "chatbot" -> speakGuidance("AI Financial Security Chatbot. Ask banking security questions here.", "ఏఐ రక్షణ సహాయకుడు. మీ బ్యాంకింగ్ భద్రతా ప్రశ్నలను ఇక్కడ అడగండి.", "एआई सुरक्षा सहायक। अपने बैंकिंग सुरक्षा प्रश्न यहाँ पूछें।", "AI பாதுகாப்பு உதவியாளர். உங்கள் வங்கி பாதுகாப்பு கேள்விகளை இங்கே கேளுங்கள்.")
            "report" -> speakGuidance("Report Fraud. Submit scam UPI IDs, messages, or numbers securely.", "మోసాలు నివేదించండి. స్కామ్ UPIలు, అనుమానాస్పద వివరాలను ఇక్కడ పంపండి.", "धोखाधड़ी की रिपोर्ट। यहाँ नकली नंबर, संदेश या यूपीआई आईडी साझा करें।", "மோசடி புகாரளிக்கவும். போலி எண்கள், செய்திகள் அல்லது யுபிஐ ஐடியை இங்கே பகிரவும்.")
            "sos" -> speakGuidance("Alert family or trigger an emergency SOS immediately.", "అత్యవసర SOS యాక్టివ్. మీ కుటుంబ సభ్యులకు హెచ్చరికలు పంపండి.", "आपातकालीन एसओएस। अपनी लाइव लोकेशन परिवार को भेजें।", "அவசர SOS. குடும்பத்திற்கு நேரடி இருப்பிடத்தை அனுப்பவும்.")
            "settings" -> speakGuidance("Adjust layout size, contrast, or app language parameters.", "సెట్టింగులు. ఇక్కడ వేరే భాష లేదా ఫాంట్ సైజు మార్చవచ్చు.", "सेटिंग्स। यहाँ फोंट साइज़ या भाषा बदलें।", "அமைப்புகள். இங்கே எழுத்துரு அளவு அல்லது மொழியை மாற்றவும்.")
            "admin" -> {
                fetchUserLogins()
                fetchActivityLogs()
                speakGuidance("Admin Controls Dashboard.", "అడ్మిన్ ప్యానెల్." , "एडमिन सेटिंग्स दर्ज किया।", "நிர்வாக குழு.")
            }
        }
    }

    // Auth Actions
    fun updateLoginEmail(email: String) {
        _uiState.update { it.copy(loginEmail = email, authError = null) }
    }

    fun updateLoginPassword(password: String) {
        _uiState.update { it.copy(loginPassword = password, authError = null) }
    }

    fun toggleSignUpMode() {
        _uiState.update { it.copy(isSigningUp = !it.isSigningUp, authError = null) }
    }

    fun signUp() {
        val state = _uiState.value
        if (state.loginEmail.isBlank() || state.loginPassword.isBlank()) {
            _uiState.update { it.copy(authError = "Please enter both email and password to sign up") }
            return
        }

        _uiState.update { it.copy(authLoading = true, authError = null, authMessage = null) }
        viewModelScope.launch {
            try {
                android.util.Log.d("SafeBankAuth", "Attempting registration for email: ${state.loginEmail}")
                val anonKey = BuildConfig.SUPABASE_ANON_KEY
                val response = SupabaseClient.service.signUp(
                    apiKey = anonKey,
                    request = SupabaseAuthRequest(state.loginEmail, state.loginPassword)
                )
                sessionToken = response.accessToken
                userEmail = state.loginEmail
                android.util.Log.d("SafeBankAuth", "Registration successful! Token: ${response.accessToken}")
                val autoLoggedIn = response.accessToken != null
                _uiState.update { 
                    it.copy(
                        authLoading = false, 
                        isLoggedIn = autoLoggedIn, 
                        currentTab = if (autoLoggedIn) "dashboard" else "login", 
                        isSigningUp = false,
                        authMessage = if (autoLoggedIn) "Registration successful!" else "Registration successful! Please check your email inbox to confirm registration."
                    ) 
                }
                if (autoLoggedIn) {
                    persistSession(state.loginEmail, response.accessToken ?: "")
                    fetchCloudReports()
                    fetchUserData(state.loginEmail)
                    saveLoginDetail(state.loginEmail)
                    speakTextDirect("Account created successfully.")
                } else {
                    speakTextDirect("Account created successfully. Please check your email to confirm registration.")
                }
            } catch (e: Exception) {
                android.util.Log.e("SafeBankAuth", "Registration failed with exception", e)
                val errorMsg = e.message ?: "Registration failed"
                _uiState.update { 
                    it.copy(
                        authLoading = false, 
                        authError = "Supabase Registration Error: $errorMsg"
                    ) 
                }
                speakTextDirect("Registration failed. Please check credentials or network.")
            }
        }
    }

    fun loginWithPassword() {
        val state = _uiState.value
        if (state.loginEmail.isBlank() || state.loginPassword.isBlank()) {
            _uiState.update { it.copy(authError = "Please enter both email and password") }
            return
        }

        _uiState.update { it.copy(authLoading = true, authError = null, authMessage = null) }
        viewModelScope.launch {
            try {
                android.util.Log.d("SafeBankAuth", "Attempting password login for email: ${state.loginEmail}")
                val anonKey = BuildConfig.SUPABASE_ANON_KEY
                val response = SupabaseClient.service.signIn(
                    apiKey = anonKey,
                    request = SupabaseAuthRequest(state.loginEmail, state.loginPassword)
                )
                sessionToken = response.accessToken
                userEmail = state.loginEmail
                android.util.Log.d("SafeBankAuth", "Login successful! Token: ${response.accessToken}")
                _uiState.update { 
                    it.copy(
                        authLoading = false, 
                        isLoggedIn = true, 
                        currentTab = "dashboard",
                        authMessage = "Login successful"
                    ) 
                }
                persistSession(state.loginEmail, response.accessToken ?: "")
                fetchCloudReports()
                fetchUserData(state.loginEmail)
                saveLoginDetail(state.loginEmail)
                speakTextDirect("Login successful. Welcome to SafeBank AI.")
            } catch (e: Exception) {
                android.util.Log.e("SafeBankAuth", "Login failed with exception", e)
                val errorMsg = e.message ?: "Login failed"
                _uiState.update { 
                    it.copy(
                        authLoading = false, 
                        authError = "Supabase Login Error: $errorMsg"
                    ) 
                }
                speakTextDirect("Login failed. Please verify email verification or login credentials.")
            }
        }
    }

    fun loginAsDemo() {
        android.util.Log.d("SafeBankAuth", "Logging in as local Guest/Demo mode")
        sessionToken = "demo-session-token"
        userEmail = "demo@safebank.ai"
        _uiState.update { 
            it.copy(
                isLoggedIn = true, 
                currentTab = "dashboard",
                authMessage = "Logged in under local Demo Mode"
            ) 
        }
        persistSession("demo@safebank.ai", "demo-session-token")
        saveLoginDetail("demo@safebank.ai")
        speakTextDirect("Welcome to SafeBank AI offline demo.")
    }

    fun toggleLoginWithOtp() {
        _uiState.update { 
            it.copy(
                loginWithOtp = !it.loginWithOtp, 
                authError = null, 
                authMessage = null, 
                otpSent = false, 
                otpInput = ""
            ) 
        }
    }

    fun updateOtpInput(otp: String) {
        _uiState.update { it.copy(otpInput = otp, authError = null) }
    }

    fun sendOtp() {
        val state = _uiState.value
        if (state.loginEmail.isBlank() || !android.util.Patterns.EMAIL_ADDRESS.matcher(state.loginEmail).matches()) {
            _uiState.update { it.copy(authError = "Please enter a valid email address to receive OTP") }
            return
        }

        _uiState.update { it.copy(authLoading = true, authError = null, authMessage = null) }
        viewModelScope.launch {
            try {
                android.util.Log.d("SafeBankAuth", "Requesting OTP for email: ${state.loginEmail}")
                _uiState.update { 
                    it.copy(
                        authLoading = false, 
                        otpSent = true,
                        authMessage = "OTP sent to ${state.loginEmail}"
                    ) 
                }
                speakTextDirect("OTP sent. Enter any 6 digits for demo verification.")
            } catch (e: Exception) {
                android.util.Log.e("SafeBankAuth", "Error requesting OTP", e)
                _uiState.update { 
                    it.copy(
                        authLoading = false, 
                        otpSent = true,
                        authError = "Error: ${e.message}. Switched to local demo mode."
                    ) 
                }
            }
        }
    }

    fun verifyOtpLogin() {
        val state = _uiState.value
        if (state.otpInput.length != 6) {
            _uiState.update { it.copy(authError = "Please enter a 6-digit OTP code") }
            return
        }

        _uiState.update { it.copy(authLoading = true, authError = null, authMessage = null) }
        viewModelScope.launch {
            android.util.Log.d("SafeBankAuth", "Verifying OTP: ${state.otpInput} for ${state.loginEmail}")
            sessionToken = "demo-otp-token"
            userEmail = state.loginEmail
            _uiState.update { 
                it.copy(
                    authLoading = false, 
                    isLoggedIn = true, 
                    currentTab = "dashboard",
                    authMessage = "Logged in via Demo OTP"
                ) 
            }
            persistSession(state.loginEmail, "demo-otp-token")
            fetchCloudReports()
            fetchUserData(state.loginEmail)
            saveLoginDetail(state.loginEmail)
            speakTextDirect("Verification successful. Welcome to SafeBank AI.")
        }
    }

    private fun fetchUserData(email: String) {
        viewModelScope.launch {
            try {
                val anonKey = BuildConfig.SUPABASE_ANON_KEY
                val authHeader = getAuthHeader(anonKey)
                val contactsList = SupabaseClient.service.getUserContacts(
                    apiKey = anonKey,
                    authHeader = authHeader,
                    emailFilter = "eq.$email"
                )
                if (contactsList.isNotEmpty()) {
                    val contacts = jsonToList(contactsList.first().contacts)
                    _uiState.update { it.copy(emergencyContacts = contacts) }
                } else {
                    _uiState.update { it.copy(emergencyContacts = emptyList()) }
                }
            } catch (e: Exception) {
                _uiState.update { it.copy(emergencyContacts = emptyList()) }
            }
        }
    }

    fun logout() {
        sessionToken = null
        userEmail = null
        clearPersistedSession()
        _uiState.update { 
            it.copy(
                isLoggedIn = false, 
                currentTab = "login", 
                loginEmail = "", 
                authMessage = null, 
                emergencyContacts = emptyList() 
            ) 
        }
        speakTextDirect("Logged out successfully.")
    }

    fun resetPassword() {
        val email = _uiState.value.loginEmail
        if (email.isBlank() || !android.util.Patterns.EMAIL_ADDRESS.matcher(email).matches()) {
            _uiState.update { it.copy(authError = "Please enter a valid email address to reset password") }
            return
        }

        _uiState.update { it.copy(authLoading = true, authError = null, authMessage = null) }
        viewModelScope.launch {
            try {
                val anonKey = BuildConfig.SUPABASE_ANON_KEY
                SupabaseClient.service.recoverPassword(
                    apiKey = anonKey,
                    request = SupabaseRecoverRequest(email)
                )
                _uiState.update { 
                    it.copy(
                        authLoading = false, 
                        authMessage = "Password reset email sent to $email" 
                    ) 
                }
                speakTextDirect("Password reset email sent. Please check your inbox.")
            } catch (e: Exception) {
                _uiState.update { 
                    it.copy(
                        authLoading = false, 
                        authError = e.message ?: "Failed to send reset email" 
                    ) 
                }
            }
        }
    }

    // SMS Scanning logic using Gemini REST API
    fun updateSmsText(text: String) {
        _uiState.update { it.copy(smsText = text) }
    }

    fun scanSmsText() {
        val text = _uiState.value.smsText
        if (text.isBlank()) return
        logFeatureUsage("SMS Scanner", "Scanned text: ${if (text.length > 60) text.take(60) + "..." else text}")

        val language = _uiState.value.language
        val currentLangName = language.displayName
        
        _uiState.update { it.copy(smsScanning = true, smsResult = Translations.translate("scanWait", language), smsRiskLevel = "SCANNING", smsRiskScore = 0) }
        
        viewModelScope.launch {
            val systemPrompt = """
                You are SafeBank AI Cyber Security Bot. Analyze the text for fraud.
                STRICT RULE: You MUST respond ONLY in $currentLangName. 
                Even the labels like 'RISK LEVEL', 'Reason', and 'Advice' MUST be translated into $currentLangName.
                Output format:
                First line: [RISK LEVEL translated to $currentLangName]: [Status] (Percentage%)
                Next lines: A clear explanation in 2 simple sentences in $currentLangName.
                Do not use markdown like asterisks or backticks.
            """.trimIndent()
            
            val prompt = "Analyze this message for financial fraud: \"$text\". Respond only in $currentLangName."
            
            val result = geminiRepository.analyzeText(prompt, systemPrompt, originalInput = text, languageCode = language.code)
            
            val cleanedResult = result.replace("*", "").replace("`", "")
            val (riskLevel, riskScore) = determineRiskFromResponse(cleanedResult)

            if (riskLevel == "FRAUD" || riskLevel == "SUSPICIOUS") {
                val report = FraudReport(
                    category = "SMS",
                    reporterName = "User Scan",
                    targetValue = "Manual Input",
                    details = text,
                    timestamp = System.currentTimeMillis(),
                    riskScore = riskScore,
                    status = if (riskLevel == "FRAUD") "Verified Fraud" else "Suspicious"
                )
                dao.insertReport(report)
            }

            _uiState.update { 
                it.copy(
                    smsScanning = false, 
                    smsResult = cleanedResult, 
                    smsRiskLevel = riskLevel,
                    smsRiskScore = riskScore
                ) 
            }
            
            // Speak the result in the correct language
            speakTextDirect(cleanedResult)
        }
    }

    private fun determineRiskFromResponse(response: String): Pair<String, Int> {
        val score = extractPercent(response)
        
        val lines = response.lines().map { it.trim() }.filter { it.isNotEmpty() }
        val riskLine = lines.find { it.lowercase().contains("risk level") || it.lowercase().contains("level:") }
                      ?: lines.firstOrNull()
                      ?: response
        val targetLine = riskLine.lowercase()

        val isExplicitlySafe = targetLine.contains("secure") || 
                targetLine.contains("low threat") || 
                targetLine.contains("low risk") || 
                targetLine.contains("safe") || 
                targetLine.contains("no scam") || 
                targetLine.contains("no fraud") || 
                targetLine.contains("not a scam") || 
                targetLine.contains("unflagged") ||
                targetLine.contains("clean")

        if (isExplicitlySafe) {
            return Pair("SAFE", score ?: 15)
        }

        if (score != null) {
            val level = when {
                score >= 75 -> "FRAUD"
                score >= 35 -> "SUSPICIOUS"
                else -> "SAFE"
            }
            return Pair(level, score)
        }

        return when {
            targetLine.contains("fraud") || targetLine.contains("scam") || targetLine.contains("severe") || targetLine.contains("critical") -> {
                Pair("FRAUD", 95)
            }
            targetLine.contains("suspicious") || targetLine.contains("medium") || targetLine.contains("detected") || targetLine.contains("warning") -> {
                Pair("SUSPICIOUS", 75)
            }
            else -> {
                Pair("SAFE", 15)
            }
        }
    }

    private fun extractPercent(text: String): Int? {
        val regex = "(\\d+)\\s*%".toRegex()
        val match = regex.find(text)
        return match?.groupValues?.get(1)?.toIntOrNull()
    }

    // Call Fraud simulation
    fun triggerCallSimulation(type: String) {
        val (name, number, rLevel) = when (type) {
            "OTP Spoof" -> Triple(
                "SBI Netbanking Support Service",
                "+91 1800 425 3800",
                Pair("FRAUD", "Urgent Threat! This caller claims to be an SBI manager requesting a 6-digit OTP code to stop immediate account closure. This is a severe phishing scam. Do not say any code.")
            )
            "Lottery/UPI" -> Triple(
                "Lucky Winner Mega Cash Prizes",
                "+91 74011 20293",
                Pair("FRAUD", "Bait Spam! Claims you won 1 Lakh rupees in Kaun Banega Crorepati. Demands you scan a UPI QR code or pay administrative tax first. Never send money to receive a prize.")
            )
            "Police/Fear" -> Triple(
                "CBI Investigation Cell (Officer Kumar)",
                "+91 011 2436 1200",
                Pair("FRAUD", "Fear Scam! Claims your bank credentials were linked to illegal money laundering. Requests transferring balance to high-security vault. Police never ask for private transfers.")
            )
            else -> Triple(
                "Ganga Prasad (Grocery Vendor)",
                "+91 94412 83038",
                Pair("SAFE", "Safe Contact. This is a registered local contact with no reports or background cyber irregularities flag. Highly secure.")
            )
        }

        if (rLevel.first == "FRAUD" || rLevel.first == "SUSPICIOUS") {
            viewModelScope.launch {
                val report = FraudReport(
                    category = "Call",
                    reporterName = "Simulated Call Monitor",
                    targetValue = number,
                    details = rLevel.second,
                    timestamp = System.currentTimeMillis(),
                    riskScore = if (rLevel.first == "FRAUD") 95 else 65,
                    status = if (rLevel.first == "FRAUD") "Verified Fraud" else "Suspicious"
                )
                dao.insertReport(report)
            }
        }

        _uiState.update { 
            it.copy(
                incomingCallActive = true,
                callerName = name,
                callerNumber = number,
                callPatternType = type,
                callRiskLevel = rLevel.first,
                callAnalysisDetail = rLevel.second
            )
        }

        speakGuidance(
            enText = "Simulating incoming call alert: $name. Risk status: ${rLevel.first}. Warning: ${rLevel.second}",
            teText = "మోసపూరిత కాల్ అలర్ట్ అనుకరణ. కాలర్: $name. ఇది మోసపూరితమైనది అని సైబర్ బృందం గుర్తించింది. దయచేసి మాట్లాడకండి.",
            hiText = "फर्जी कॉल आने की चेतावनी। कॉलर: $name. कृपया सावधान रहें, यह धोखाधड़ी का प्रयास हो सकता है।",
            taText = "போலி அழைப்பு வரும் எச்சரிக்கை உருவகப்படுத்துதல்: $name. தயவுசெய்து எண்களையோ OTPகளையோ பகிர வேண்டாம்."
        )
    }

    fun endCallSimulation() {
        _uiState.update { it.copy(incomingCallActive = false, voiceWarningPlaying = false) }
        tts?.stop()
        speakGuidance("Call closed.", "కాల్ ముగించబడింది.", "कॉल समाप्त की गई।", "அழைப்பு முடிந்தது.")
    }

    fun updateCallInputNumber(number: String) {
        _uiState.update { it.copy(callInputNumber = number) }
    }

    fun detectCallNumber() {
        val number = _uiState.value.callInputNumber
        if (number.isBlank()) return
        logFeatureUsage("Call Detector", "Scanned number: $number")

        _uiState.update { it.copy(callAnalyzing = true) }
        speakGuidance(
            "Analyzing phone number $number for risk...", 
            "ఫోన్ నంబర్ $number రక్షణ కోసం తనిఖీ చేస్తోంది...", 
            "फ़ोन नंबर $number की सुरक्षा जांच की जा रही है...", 
            "தொலைபேசி எண் $number பாதுகாப்பு சோதனை செய்யப்படுகிறது..."
        )

        viewModelScope.launch {
            val prompt = "Analyze this phone number for banking scams, financial spam, OTP phishing, or telecom blacklists: \"$number\""
            val systemPrompt = "You are SafeBank AI Call Protection Analyst. Respond in plain text. First line must start with exactly 'RISK LEVEL: SAFE', 'RISK LEVEL: SUSPICIOUS' or 'RISK LEVEL: FRAUD'. Then on subsequent lines give a clear explanation in 2 simplified, direct sentences in English."
            
            val result = geminiRepository.analyzeText(prompt, systemPrompt, originalInput = number, languageCode = _uiState.value.language.code)
            val cleanedResult = result.replace("*", "").replace("`", "")
            
            val (riskLevel, riskScore) = determineRiskFromResponse(cleanedResult)

            if (riskLevel == "FRAUD" || riskLevel == "SUSPICIOUS") {
                val report = FraudReport(
                    category = "Call",
                    reporterName = "User Scan",
                    targetValue = number,
                    details = cleanedResult,
                    timestamp = System.currentTimeMillis(),
                    riskScore = riskScore,
                    status = if (riskLevel == "FRAUD") "Verified Fraud" else "Suspicious"
                )
                dao.insertReport(report)
            }
            
            val callerName = when (riskLevel) {
                "FRAUD" -> "High Risk Potential Spammer"
                "SUSPICIOUS" -> "Unknown / Suspicious Caller"
                else -> "Unflagged Standard Caller"
            }

            _uiState.update {
                it.copy(
                    incomingCallActive = true,
                    callerName = callerName,
                    callerNumber = number,
                    callPatternType = "Custom Number Search",
                    callRiskLevel = riskLevel,
                    callAnalysisDetail = cleanedResult,
                    callAnalyzing = false
                )
            }

            val alertHeader = when (riskLevel) {
                "FRAUD" -> "Warning! Number $number is identified as fraudulent. Do not pick up this call or share details."
                "SUSPICIOUS" -> "Caution! Number $number is suspicious or unverified. Proceed with extreme care."
                else -> "Number $number is currently unflagged. Standard safe guidelines apply."
            }
            speakTextDirect(alertHeader)
        }
    }

    // Chatbot functionality using Gemini REST API
    fun updateChatQuery(query: String) {
        _uiState.update { it.copy(chatQuery = query) }
    }

    fun sendChatQuery() {
        val query = _uiState.value.chatQuery
        if (query.isBlank()) return
        logFeatureUsage("AI Chatbot", "Query: ${if (query.length > 60) query.take(60) + "..." else query}")

        val userMsg = ChatMessage("user", query)
        val history = _uiState.value.chatHistory + userMsg
        
        _uiState.update { 
            it.copy(
                chatHistory = history,
                chatQuery = "",
                chatLoading = true
            ) 
        }

        speakGuidance("Sending question to AI assistant...", "ప్రశ్న పరిరక్షకుడికి పంపబడుతోంది...", "प्रश्न एआई सहायक को भेजा जा रहा है...", "கேள்வி AI உதவியாளருக்கு அனுப்பப்படுகிறது...")

        viewModelScope.launch {
            val systemPrompt = "You are SafeBank AI Cyber Security Counselor. Answer queries on online payments, digital wallets, secure pins, phishing cards, bad apps, and cyber laws in extremely simple words, tailored for Indian farmers, senior citizens, and housewives. Keep explanations strictly short (max 3 simple sentences). Avoid complex technological jargon. If they write in regional script, you must reply in simple language."
            val result = geminiRepository.analyzeText(query, systemPrompt, languageCode = _uiState.value.language.code)
            val cleanResult = result.replace("*", "").replace("`", "")

            val botMsg = ChatMessage("assistant", cleanResult)
            _uiState.update { 
                it.copy(
                    chatHistory = it.chatHistory + botMsg,
                    chatLoading = false
                ) 
            }

            // Speak response text
            speakTextDirect(cleanResult)
        }
    }

    // User fraud reporting logic (Room DB + Simulated Firebase upload)
    fun updateReportCategory(category: String) {
        _uiState.update { it.copy(reportCategory = category) }
    }

    fun updateReportTarget(target: String) {
        _uiState.update { it.copy(reportTarget = target) }
    }

    fun updateReportDetails(details: String) {
        _uiState.update { it.copy(reportDetails = details) }
    }

    fun updateReporterName(name: String) {
        _uiState.update { it.copy(reporterName = name) }
    }

    fun submitFraudReport() {
        val state = _uiState.value
        if (state.reportTarget.isBlank() || state.reportDetails.isBlank()) return
        logFeatureUsage("Report Fraud", "Filed report on target: ${state.reportTarget}")

        _uiState.update { it.copy(uploadProgress = true, uploadSuccess = false) }
        
        val report = FraudReport(
            category = state.reportCategory,
            reporterName = state.reporterName,
            targetValue = state.reportTarget,
            details = state.reportDetails,
            timestamp = System.currentTimeMillis(),
            riskScore = 85,
            status = "Pending Review"
        )
        
        viewModelScope.launch {
            try {
                dao.insertReport(report)
                val anonKey = try { BuildConfig.SUPABASE_ANON_KEY } catch (e: Exception) { "" }
                if (state.isLoggedIn && anonKey.isNotEmpty() && anonKey != "MY_SUPABASE_ANON_KEY" && anonKey != "placeholder") {
                    val authHeader = getAuthHeader(anonKey)
                    val supabaseReport = SupabaseReport.fromFraudReport(report)
                    SupabaseClient.service.insertReport(anonKey, authHeader, supabaseReport)
                }
                
                _uiState.update { 
                    it.copy(
                        uploadProgress = false,
                        uploadSuccess = true,
                        reportTarget = "",
                        reportDetails = "",
                        reporterName = ""
                    )
                }
                fetchCloudReports()
                speakGuidance(
                    enText = "Fraud report successfully registered on secure central servers.",
                    teText = "మోసపూరిత నివేదిక విజయవంతంగా నమోదు చేయబడింది మరియు నేర పోర్టల్ కు అందించబడింది.",
                    hiText = "धोखाधड़ी की रिपोर्ट सफलतापूर्वक केंद्रीय सर्वर पर सुरक्षित पंजीकृत कर ली गई है।",
                    taText = "உங்கள் புகார் வெற்றிகரமாக சேமிக்கப்பட்டு மத்திய இணைய குற்றப் பக்கத்திற்கு அனுப்பப்பட்டது."
                )
            } catch (e: Exception) {
                _uiState.update { 
                    it.copy(
                        uploadProgress = false,
                        authError = "Failed to submit report: ${e.message}"
                    )
                }
            }
        }
    }

    fun deleteEmergencyContact(contact: String) {
        val state = _uiState.value
        val updatedList = state.emergencyContacts.filter { it != contact }
        
        _uiState.update { it.copy(emergencyContacts = updatedList) }

        // Sync to Supabase if logged in
        if (state.isLoggedIn && userEmail != null) {
            viewModelScope.launch {
                try {
                    val anonKey = BuildConfig.SUPABASE_ANON_KEY
                    val authHeader = getAuthHeader(anonKey)
                    val supabaseContact = SupabaseContact(userEmail!!, listToJson(updatedList))
                    SupabaseClient.service.upsertUserContacts(anonKey, authHeader, supabaseContact)
                } catch (e: Exception) {
                    _uiState.update { it.copy(authError = "Contact Sync Error: ${e.message}") }
                }
            }
        }
        
        speakGuidance("Contact removed.")
    }

    // SOS Emergency Button Trigger
    fun triggerSosAlert() {
        val active = !_uiState.value.sosTriggered
        _uiState.update { it.copy(sosTriggered = active) }
        
        if (active) {
            val state = _uiState.value
            logFeatureUsage("SOS Alert", "Triggered SOS at location: ${state.sosLocation}")
            
            viewModelScope.launch {
                try {
                    val anonKey = BuildConfig.SUPABASE_ANON_KEY
                    val authHeader = getAuthHeader(anonKey)
                    val alert = SupabaseEmergencyAlert(
                        timestamp = System.currentTimeMillis(),
                        userEmail = state.loginEmail,
                        location = state.sosLocation,
                        status = "ACTIVE",
                        contacts = listToJson(state.emergencyContacts)
                    )
                    SupabaseClient.service.triggerEmergencyAlert(anonKey, authHeader, alert)
                    _uiState.update { it.copy(authError = Translations.translate("syncSuccess", state.language)) }
                } catch (e: Exception) {
                    _uiState.update { it.copy(authError = Translations.translate("syncError", state.language) + e.message) }
                }
            }

            speakGuidance(
                enText = "Emergency SOS active! Simulated crisis dispatch. Texting live GPS location coordinates to family contacts.",
                teText = "అవసర సహాయ సంకేతాలు యాక్టివ్. మీ లైవ్ లొకేషన్ మరియు హెచ్చరిక సందేశం మీ కుటుంబ సభ్యులకు పంపబడింది.",
                hiText = "आपातकालीन एसओएस सक्रिय! परिवार को आपकी लाइव जीपीएस लोकेशन भेज दी गई है।",
                taText = "அவசர SOS ஆன். உங்கள் நேரடி இருப்பிட விவரம் குடும்பத்திற்கு அனுப்பப்பட்டது."
            )
        } else {
            speakGuidance("Emergency SOS canceled.", "అత్యवసర సహాయ ప్రసారం నిలిపివేయబడింది.", "एसओएस रद्द कर दिया गया है।", "அவசர SOS ரத்து செய்யப்பட்டது.")
        }
    }

    fun deleteReport(id: Int) {
        viewModelScope.launch {
            dao.deleteReport(id)
            speakGuidance("Report removed from database.", "ఆధారం తొలగించబడింది.", "रिपोर्ट मिटा दी गई है।", "புகார் நீக்கப்பட்டது.")
        }
    }

    // Emergency Contact Management
    fun updateContactName(name: String) {
        _uiState.update { it.copy(contactNameInput = name) }
    }

    fun updateContactPhone(phone: String) {
        _uiState.update { it.copy(contactPhoneInput = phone) }
    }

    fun addEmergencyContact() {
        val state = _uiState.value
        if (state.contactNameInput.isBlank() || state.contactPhoneInput.isBlank()) return

        val newContact = "${state.contactNameInput}: ${state.contactPhoneInput}"
        val updatedList = state.emergencyContacts + newContact
        
        _uiState.update { it.copy(
            emergencyContacts = updatedList,
            contactNameInput = "",
            contactPhoneInput = ""
        ) }

        // Sync to Supabase if logged in
        if (state.isLoggedIn && userEmail != null) {
            viewModelScope.launch {
                try {
                    val anonKey = BuildConfig.SUPABASE_ANON_KEY
                    val authHeader = getAuthHeader(anonKey)
                    val supabaseContact = SupabaseContact(userEmail!!, listToJson(updatedList))
                    SupabaseClient.service.upsertUserContacts(anonKey, authHeader, supabaseContact)
                } catch (e: Exception) {
                    _uiState.update { it.copy(authError = "Contact Sync Error: ${e.message}") }
                }
            }
        }
        
        speakGuidance("Contact added successfully.")
    }


    // Static Prepopulated Safety tips (Features 5 & 9: Offline Safety tutorials) This ensures the app works immediately.
    private fun getPrepopulatedTips(): List<LocalSafetyTip> {
        return listOf(
            LocalSafetyTip(
                id = "otp_safety",
                category = "OTP",
                titleEn = "OTP Safety Rules",
                titleTe = "OTP భద్రతా సూత్రాలు",
                titleHi = "ओटीपी सुरक्षा नियम",
                titleTa = "OTP பாதுகாப்பு விதிகள்",
                contentEn = "1. Financial institutions/banks never call to ask for 6-digit OTP codes or passwords over phone or SMS.\n\n2. Sharing OTP with callers immediately grants cyber fraudsters access to clear out your bank account savings, fixed deposits, or credit balance.\n\n3. If anyone insists on OTP to update KYC, halt pension, or stop penalty fees, terminate the call instantly and go see your branch Manager.",
                contentTe = "1. ఏ బ్యాంకు లేదా అధికారి ఫోన్ చేసి మీ 6 అంకెల OTP కోడ్‌ను చెప్పమని అడగరు.\n\n2. ఎవరితోనైనా OTP పంచుకుంటే, మీ ఖాతాలోని మొత్తం సొమ్ము క్షణాల్లో మోసగాళ్ల చేతుల్లోకి వెళ్ళిపోతుంది.\n\n3. కేవైసీ, పెన్షన్ లేదా ఫైన్లు ఆపాలని ఎవరు అడిగినా కాల్ కట్ చేసి నేరుగా మీ బ్యాంకు బ్రాంచ్ అధికారిని సంప్రదించండి.",
                contentHi = "1. सरकारी या निजी बैंक के अधिकारी कभी भी फोन पर आपसे 6 अंकों का ओटीपी (OTP) या पिन नहीं मांगते।\n\n2. कॉल करने वाले के साथ ओटीपी साझा करने से आपके खाते की जमा राशि या बैंक लोन सीधे खाली हो सकते हैं।\n\n3. यदि कोई केवाईसी, पेंशन बहाली या दंड शुल्क रोकने के लिए ओटीपी मांगता है, तो फोन तुरंत काट दें और अपनी शाखा में जाएं।",
                contentTa = "1. வங்கிகள் அல்லது அதிகாரிகள் தொலைபேசியில் 6 இலக்க OTP குறியீடுகளை ஒருபோதும் கேட்க மாட்டார்கள்.\n\n2. OTPயை பகிர்வது உங்கள் கணக்கு சேமிப்புகளை மோசடி செய்பவர்கள் திருட வழிவகுக்கும்.\n\n3. KYC புதுப்பிக்கவோ, ஓய்வூதியத்தை நிறுத்தவோ யாராவது OTP கேட்டால் அழைப்பை துண்டித்து நேரடியாக வங்கி கிளைக்கு செல்லவும்.",
                voiceScriptEn = "Warning call OTP alert. Banks never ask for OTP or pin over phone. Do not share credentials, report suspicious call.",
                voiceScriptTe = "ఉచితంగా ఓటీపీ ఎవరికీ చెప్పవద్దు. ఏ రంగ బ్యాంకు కూడా ఫోన్ లో ఓటీపీ కోరదు. పిన్ నంబర్లు గోప్యంగా ఉంచండి.",
                voiceScriptHi = "ओटीपी स्कैम से सावधान। बैंक अधिकारी फोन पर ओटीपी नहीं मांगते। अपनी सीक्रेट चाबी साझा ना करें।",
                voiceScriptTa = "எச்சரிக்கை! எக்காரணம் கொண்டும் OTP-யை யாரிடமும் பகிர்ந்து கொள்ள வேண்டாம். வங்கியிலிருந்து போனில் யாரும் கேட்க மாட்டார்கள்."
            ),
            LocalSafetyTip(
                id = "upi_safety",
                category = "UPI",
                titleEn = "UPI Pin Precautions",
                titleTe = "UPI పిన్ జాగ్రత్తలు",
                titleHi = "यूपीआई पिन सावधानियां",
                titleTa = "UPI பின் எச்சரிக்கைகள்",
                contentEn = "1. Your UPI PIN is ONLY needed to pay, send or push funds. Entering your private PIN is NEVER, EVER needed to receive money from a buyer or prize fund.\n\n2. If someone requests you to scan a cashback/refund QR Code or type in your mobile PIN to collect payment, they are actively attempting to drain your card.\n\n3. Register distinct payment apps and verify target UPI name matches your intended recipient before authorizing transactions.",
                contentTe = "1. UPI పిన్ కేవలం డబ్బు పంపడానికి మాత్రమే అవసరం. డబ్బు అందుకోవడానికి ఏ పిన్ నంబరు నొక్కాల్సిన అవసరం అస్సలు లేదు.\n\n2. క్యాష్‌బ్యాక్ లేదా బహుమతులు పంపే క్రమంలో క్యూఆర్ కోడ్ స్కాన్ చేసి పిన్ నొక్కమంటే వారు మీ అకౌంట్ ఖాళీ చేయడానికి మోసం చేస్తున్నారని గ్రహించండి.\n\n3. డబ్బు పంపే ముందు స్వీకర్త అసలు పేరును మొబైల్ స్క్రీన్ పై సరిచూసుకోండి.",
                contentHi = "1. आपका यूपीआई पिन केवल पैसे भेजने या भुगतान करने के लिए होता है। पैसे प्राप्त करने के लिए पिन डालने की कोई ज़रूरत नहीं होती।\n\n2. यदि कोई रिफंड या इनाम प्राप्त करने के लिए क्यूआर कोड स्कैन कराके पिन डलवा रहा है, तो वह धोखा दे रहा है।\n\n3. भुगतान से पहले प्राप्तकर्ता का असली नाम स्क्रीन पर अवश्य जांचें।",
                contentTa = "1. UPI பின் என்பது பணம் அனுப்ப மட்டுமே தேவை. பணம் பெற ஒருபோதும் பின்னை உள்ளிட தேவையில்லை.\n\n2. பணத்தை பரிசாக பெற QR குறியீட்டை ஸ்கேன் செய்யுமாறு யாராவது கூறினால், அது உங்களை ஏமாற்றும் செயலாகும்.\n\n3. யாருக்கு அனுப்புகிறோம் என்பதை திரையில் சரிபார்த்துக் கொள்ளவும்.",
                voiceScriptEn = "UPI security guidelines active. Private PIN is only to send cash, never to retrieve prize claims limit.",
                voiceScriptTe = "డబ్బు పంపడానికే యు పి ఐ పిన్ నొక్కండి, అందుకోవడానికి పిన్ అవసరం లేదు. మోసం నుండి జాగ్రత్త పడండి.",
                voiceScriptHi = "यूपीआई पिन केवल पैसे ट्रांसफर करने के लिए होता है, पैसे प्राप्त करने के लिए नहीं। सुरक्षित रहें।",
                voiceScriptTa = "பணம் அனுப்ப மட்டுமே UPI பின் கட்டாயம், பெறத் தேவையில்லை. QR ஸ்கேன் ஏமாற்றும் காரியம்."
            ),
            LocalSafetyTip(
                id = "kyc_safety",
                category = "KYC",
                titleEn = "KYC Suspension Scam",
                titleTe = "KYC సస్పెన్షన్ మోసాలు",
                titleHi = "केवाईसी ब्लॉक धोखाधड़ी",
                titleTa = "KYC நிறுத்த மோசடி",
                contentEn = "1. Cyber criminals send threat texts alleging 'Your Bank Account is Blocked. Update Aadhaar KYC instantly via this link'. This triggers intense panic on users.\n\n2. Clicking these links prompts counterfeit Netbanking login inputs or installs spyware apps like AnyDesk, sharing continuous screen actions to attackers.\n\n3. Official banks require visit to physical local branches with valid government ID for security re-registration procedures.",
                contentTe = "1. 'మీ అకౌంట్ బ్లాక్ చేయబడింది. వెంటనే ఆధార్ కేవైసీ అప్‌డేట్ చేయండి' అని వచ్చే లింకులను అస్సలు నమ్మకండి.\n\n2. ఇటువంటి లింకులు నొక్కితే నకిలీ నెట్ బ్యాంకింగ్ సైట్లు ఓపెన్ అవుతాయి లేదా AnyDesk యాప్ ద్వారా మీ మొబైల్ స్క్రీన్ మొత్తం మోసగాళ్లకు కనిపిస్తుంది.\n\n3. కేవైసీ అప్‌డేట్ కోసం ఎల్లప్పుడూ నేరుగా లోకల్ బ్యాంకు బ్రాంచ్ కి ఆధార్ కార్డుతో వెళ్లి మాత్రమే చేయించుకోండి.",
                contentHi = "1. धोखाधड़ी करने वाले संदेश भेजते हैं कि 'आपका खाता ब्लॉक हो गया है, तुरंत इस लिंक पर आधार केवाईसी अपडेट करें'।\n\n2. इन लिंक्स पर क्लिक करने से आपकी बैंक आईडी और पासवर्ड चोरी हो सकते हैं या एनीडेस्क ऐप से आपका पूरा फोन हैक हो सकता है।\n\n3. केवाईसी नवीनीकरण हमेशा बैंक शाखा में जाकर सरकारी दस्तावेज़ों के साथ ही करें।",
                contentTa = "1. 'உங்கள் கணக்கு முடக்கப்பட்டுள்ளது, உடனடியாக ஆதார் KYC பக்கத்தை புதுப்பிக்கவும்' என்று வரும் குறுஞ்செய்திகளை நம்பாதீர்.\n\n2. போலியான லிங்க்களை கிளிக் செய்து வங்கி ஐடியையோ AnyDesk போன்ற ஆப்களையோ பதிவிறக்கம் செய்ய வேண்டாம்.\n\n3. KYC-ஐ புதுப்பிக்க எப்போதும் நேரடி வங்கி கிளைக்குச் செல்லவும்.",
                voiceScriptEn = "KYC blocking calls are fake. Never install screen share software tools directed by remote handlers.",
                voiceScriptTe = "కేవైసీ పేరుతో వచ్చే లింకులు నొక్కకండి. మొబైల్ స్కీన్ చూసే ఏనిడెస్క్ వంటి యాప్ డౌన్ లోడ్ చేయవద్దు.",
                voiceScriptHi = "खाता ब्लॉक या केवाईसी अपडेट का डर दिखाकर धोखाधड़ी हो सकती है। शाखा से संपर्क करें।",
                voiceScriptTa = "KYC நிறுத்தம் என்ற பயமுறுத்தலை கண்டு ஏமாறாதீர். AnyDesk போன்ற செயலி பதிவேற்றாதீர்."
            )
        )
    }

    private fun getAuthHeader(anonKey: String): String {
        val token = if (sessionToken != null && !sessionToken!!.startsWith("demo-")) {
            sessionToken!!
        } else {
            anonKey
        }
        return "Bearer $token"
    }

    private fun saveLoginDetail(email: String) {
        viewModelScope.launch {
            try {
                val anonKey = try { BuildConfig.SUPABASE_ANON_KEY } catch (e: Exception) { "" }
                if (anonKey.isNotEmpty() && anonKey != "MY_SUPABASE_ANON_KEY" && anonKey != "placeholder") {
                    val authHeader = getAuthHeader(anonKey)
                    val loginDetail = SupabaseUserLogin(email, System.currentTimeMillis())
                    SupabaseClient.service.insertUserLogin(anonKey, authHeader, loginDetail)
                    android.util.Log.d("SafeBankAuth", "Login detail saved to Supabase for: $email")
                }
            } catch (e: Exception) {
                android.util.Log.e("SafeBankAuth", "Failed to save login detail to Supabase", e)
            }
        }
    }

    fun fetchUserLogins() {
        viewModelScope.launch {
            try {
                val anonKey = try { BuildConfig.SUPABASE_ANON_KEY } catch (e: Exception) { "" }
                if (anonKey.isNotEmpty() && anonKey != "MY_SUPABASE_ANON_KEY" && anonKey != "placeholder") {
                    val authHeader = getAuthHeader(anonKey)
                    val loginsList = SupabaseClient.service.getUserLogins(anonKey, authHeader)
                    _uiState.update { it.copy(userLogins = loginsList) }
                }
            } catch (e: Exception) {
                android.util.Log.e("SafeBankAuth", "Failed to fetch user logins from Supabase", e)
            }
        }
    }

    private fun logFeatureUsage(featureName: String, details: String) {
        val user = userEmail ?: "guest@safebank.ai"
        viewModelScope.launch {
            try {
                val anonKey = try { BuildConfig.SUPABASE_ANON_KEY } catch (e: Exception) { "" }
                if (anonKey.isNotEmpty() && anonKey != "MY_SUPABASE_ANON_KEY" && anonKey != "placeholder") {
                    val authHeader = getAuthHeader(anonKey)
                    val log = SupabaseActivityLog(user, featureName, details, System.currentTimeMillis())
                    SupabaseClient.service.insertActivityLog(anonKey, authHeader, log)
                    android.util.Log.d("SafeBankAuth", "Activity log saved to Supabase: $featureName")
                }
            } catch (e: Exception) {
                android.util.Log.e("SafeBankAuth", "Failed to save activity log", e)
            }
        }
    }

    fun fetchActivityLogs() {
        viewModelScope.launch {
            try {
                val anonKey = try { BuildConfig.SUPABASE_ANON_KEY } catch (e: Exception) { "" }
                if (anonKey.isNotEmpty() && anonKey != "MY_SUPABASE_ANON_KEY" && anonKey != "placeholder") {
                    val authHeader = getAuthHeader(anonKey)
                    val logsList = SupabaseClient.service.getActivityLogs(anonKey, authHeader)
                    _uiState.update { it.copy(activityLogs = logsList) }
                }
            } catch (e: Exception) {
                android.util.Log.e("SafeBankAuth", "Failed to fetch activity logs from Supabase", e)
            }
        }
    }
}
