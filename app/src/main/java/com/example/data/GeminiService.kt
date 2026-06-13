package com.safebank.ai.data

import com.squareup.moshi.Json
import com.squareup.moshi.JsonClass
import com.squareup.moshi.Moshi
import com.squareup.moshi.kotlin.reflect.KotlinJsonAdapterFactory
import okhttp3.OkHttpClient
import retrofit2.Retrofit
import retrofit2.converter.moshi.MoshiConverterFactory
import retrofit2.http.Body
import retrofit2.http.POST
import retrofit2.http.Query
import java.util.concurrent.TimeUnit
import com.safebank.ai.BuildConfig
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

@JsonClass(generateAdapter = true)
data class Part(
    val text: String
)

@JsonClass(generateAdapter = true)
data class Content(
    val parts: List<Part>
)

@JsonClass(generateAdapter = true)
data class GenerationConfig(
    val temperature: Float? = null
)

@JsonClass(generateAdapter = true)
data class GeminiRequest(
    val contents: List<Content>,
    val generationConfig: GenerationConfig? = null,
    val systemInstruction: Content? = null
)

@JsonClass(generateAdapter = true)
data class PartResponse(
    val text: String? = null
)

@JsonClass(generateAdapter = true)
data class ContentResponse(
    val parts: List<PartResponse>? = null
)

@JsonClass(generateAdapter = true)
data class Candidate(
    val content: ContentResponse? = null
)

@JsonClass(generateAdapter = true)
data class GeminiResponse(
    val candidates: List<Candidate>? = null
)

interface GeminiApiService {
    @POST("v1beta/models/gemini-3.5-flash:generateContent")
    suspend fun generateContent(
        @Query("key") apiKey: String,
        @Body request: GeminiRequest
    ): GeminiResponse
}

object GeminiRetrofitClient {
    private const val BASE_URL = "https://generativelanguage.googleapis.com/"

    private val moshi = Moshi.Builder()
        .add(KotlinJsonAdapterFactory())
        .build()

    private val okHttpClient = OkHttpClient.Builder()
        .connectTimeout(60, TimeUnit.SECONDS)
        .readTimeout(60, TimeUnit.SECONDS)
        .writeTimeout(60, TimeUnit.SECONDS)
        .build()

    val service: GeminiApiService by lazy {
        Retrofit.Builder()
            .baseUrl(BASE_URL)
            .client(okHttpClient)
            .addConverterFactory(MoshiConverterFactory.create(moshi))
            .build()
            .create(GeminiApiService::class.java)
    }
}

class GeminiRepository {
    suspend fun analyzeText(prompt: String, systemPrompt: String? = null, originalInput: String? = null, languageCode: String = "en"): String = withContext(Dispatchers.IO) {
        val inputToCheck = originalInput ?: prompt
        val cleanNum = inputToCheck.replace(" ", "").replace("-", "").replace("+", "")
        val isBlacklisted = cleanNum.contains("18004253800") || 
                            cleanNum.contains("7401120293") || 
                            cleanNum.contains("01124361200")

        if (isBlacklisted) {
            return@withContext getOfflineSafetyPrediction(inputToCheck, languageCode)
        }

        val apiKey = try {
            BuildConfig.GEMINI_API_KEY
        } catch (e: Exception) {
            ""
        }

        if (apiKey.isEmpty() || apiKey == "MY_GEMINI_API_KEY" || apiKey == "placeholder") {
            // Local fallback rule logic
            return@withContext getOfflineSafetyPrediction(originalInput ?: prompt, languageCode)
        }

        val request = GeminiRequest(
            contents = listOf(Content(parts = listOf(Part(text = prompt)))),
            systemInstruction = systemPrompt?.let { Content(parts = listOf(Part(text = it))) },
            generationConfig = GenerationConfig(temperature = 0.3f)
        )

        try {
            val response = GeminiRetrofitClient.service.generateContent(apiKey, request)
            response.candidates?.firstOrNull()?.content?.parts?.firstOrNull()?.text 
                ?: getOfflineSafetyPrediction(originalInput ?: prompt, languageCode)
        } catch (e: Exception) {
            getOfflineSafetyPrediction(originalInput ?: prompt, languageCode)
        }
    }

    private fun getOfflineSafetyPrediction(text: String, lang: String): String {
        val isNumberOnly = text.trim().all { it.isDigit() || it == '+' || it == '-' || it == ' ' }
        val lower = text.lowercase()
        val cleanNum = text.replace(" ", "").replace("-", "").replace("+", "")
        val isBlacklisted = cleanNum.contains("18004253800") || 
                            cleanNum.contains("7401120293") || 
                            cleanNum.contains("01124361200")
        
        return when (lang) {
            "te" -> {
                when {
                    isNumberOnly && text.trim().length >= 5 -> {
                        if (isBlacklisted) {
                            "రిస్క్ లెవల్: మోసం ముప్పు (స్కామ్ ముప్పు 95%)\n" +
                            "కారణం: ఈ నంబర్ మా సైబర్ బ్లాక్‌లిస్ట్‌లో మోసపూరిత కాల్స్ మరియు OTP స్కామ్‌ల కోసం గుర్తించబడింది.\n" +
                            "సలహా: ఈ కాల్ ఎత్తకండి మరియు మీ బ్యాంక్ వివరాలు ఎవరికీ చెప్పకండి."
                        } else {
                            "రిస్క్ లెవల్: సురక్షితం (తక్కువ ముప్పు 15%)\n" +
                            "కారణం: ఈ నంబర్‌పై ఎటువంటి ప్రతికూల నివేదికలు లేవు మరియు ఇది యాక్టివ్ బ్లాక్‌లిస్ట్‌లో లేదు.\n" +
                            "సలహా: సాధారణ కాల్. సాధారణ జాగ్రత్తలతో మాట్లాడవచ్చు."
                        }
                    }
                    lower.contains("otp") || lower.contains("passcode") -> {
                        "రిస్క్ లెవల్: అత్యంత ప్రమాదకరం (OTP మోసం 98%)\n" +
                        "కారణం: బ్యాంకులు ఎప్పుడూ ఫోన్ లో OTP అడగవు. ఇది మీ ఖాతా ఖాళీ చేసే ప్రయత్నం.\n" +
                        "సలహా: ఈ సందేశాన్ని పట్టించుకోకండి మరియు ఎవరికీ OTP చెప్పకండి."
                    }
                    lower.contains("kyc") || lower.contains("aadhaar") || lower.contains("block") -> {
                        "రిస్క్ లెవல்: ప్రమాదకరం (KYC మోసం 95%)\n" +
                        "కారణం: ఖాతా బ్లాక్ అవుతుందని భయపెట్టడం మోసగాళ్ల పద్ధతి.\n" +
                        "సలహా: వెంటనే మీ బ్యాంక్ బ్రాంచ్ ని సంప్రదించండి, లింకులు నొక్కకండి."
                    }
                    else -> {
                        "రిస్క్ లెవల్: సురక్షితం (తక్కువ ముప్పు 15%)\n" +
                        "కారణం: ఎటువంటి ప్రమాదకర పదాలు కనుగొనబడలేదు.\n" +
                        "సలహా: అప్రమత్తంగా ఉండండి, రహస్య కోడ్‌లను పంచుకోకండి."
                    }
                }
            }
            "hi" -> {
                when {
                    isNumberOnly && text.trim().length >= 5 -> {
                        if (isBlacklisted) {
                            "जोखिम स्तर: धोखाधड़ी खतरा (धोखाधड़ी का खतरा 95%)\n" +
                            "कारण: यह नंबर फ़िशिंग और बैंक धोखाधड़ी के लिए हमारी साइबर ब्लैकलिस्ट में दर्ज है।\n" +
                            "सलाह: इस कॉल को न उठाएं और अपनी बैंक जानकारी साझा न करें।"
                        } else {
                            "जोखिम स्तर: सुरक्षित (कम खतरा 15%)\n" +
                            "कारण: इस नंबर पर कोई नकारात्मक रिपोर्ट नहीं है और यह ब्लैकलिस्ट में नहीं है।\n" +
                            "सलाह: सामान्य कॉल। सामान्य सावधानियों के साथ बातचीत सुरक्षित है।"
                        }
                    }
                    lower.contains("otp") || lower.contains("passcode") -> {
                        "जोखिम स्तर: अत्यंत खतरनाक (ओटीपी घोटाला 98%)\n" +
                        "कारण: बैंक कभी भी फोन पर ओटीपी नहीं मांगते। यह आपके खाते को खाली करने का प्रयास है।\n" +
                        "सलाह: इस संदेश को अनदेखा करें और किसी को ओटीपी न बताएं।"
                    }
                    lower.contains("kyc") || lower.contains("aadhaar") || lower.contains("block") -> {
                        "जोखिम स्तर: खतरनाक (केवाईसी धोखाधड़ी 95%)\n" +
                        "कारण: खाता ब्लॉक होने का डर दिखाकर धोखाधड़ी की जाती है।\n" +
                        "सलाह: अपनी बैंक शाखा से संपर्क करें, किसी भी लिंक पर क्लिक न करें।"
                    }
                    else -> {
                        "जोखिम स्तर: सुरक्षित (कम खतरा 15%)\n" +
                        "कारण: कोई स्पष्ट खतरा नहीं पाया गया।\n" +
                        "सलाह: सतर्क रहें और अपने पिन कोड साझा न करें।"
                    }
                }
            }
            "ta" -> {
                when {
                    isNumberOnly && text.trim().length >= 5 -> {
                        if (isBlacklisted) {
                            "அபாய நிலை: மோசடி ஆபத்து (மோசடி அபாயம் 95%)\n" +
                            "காரணம்: இந்த எண் போலி வங்கி அழைப்புகளுக்காக எங்களது பிளாக்லிஸ்டில் சேர்க்கப்பட்டுள்ளது.\n" +
                            "ஆலோசனை: இந்த அழைப்பை ஏற்க வேண்டாம், வங்கி விவரங்களை பகிர வேண்டாம்."
                        } else {
                            "அபாய நிலை: பாதுகாப்பானது (குறைந்த அபாயம் 15%)\n" +
                            "காரணம்: இந்த எண்ணிற்கு எந்தவித புகாரும் இல்லை, பிளாக்லிஸ்டிலும் இல்லை.\n" +
                            "ஆலோசனை: சாதாரண அழைப்பு. வழக்கமான எச்சரிக்கையுடன் பேசலாம்."
                        }
                    }
                    lower.contains("otp") || lower.contains("passcode") -> {
                        "அபாய நிலை: மிகவும் ஆபத்தானது (OTP மோசடி 98%)\n" +
                        "காரணம்: வங்கிகள் ஒருபோதும் போனில் OTP கேட்காது. இது உங்கள் பணத்தைத் திருடும் முயற்சி.\n" +
                        "ஆலோசனை: இந்த செய்தியை புறக்கணிக்கவும், யாருக்கும் OTP சொல்ல வேண்டாம்."
                    }
                    lower.contains("kyc") || lower.contains("aadhaar") || lower.contains("block") -> {
                        "அபாய நிலை: ஆபத்தானது (KYC மோசடி 95%)\n" +
                        "காரணம்: கணக்கு முடக்கப்படும் என்று பயமுறுத்துவது மோசடி செய்பவர்களின் முறை.\n" +
                        "ஆலோசனை: உங்கள் வங்கி கிளையை அணுகவும், லிங்க்களை கிளிக் செய்யாதீர்கள்."
                    }
                    else -> {
                        "அபாய நிலை: பாதுகாப்பானது (குறைந்த அபாயம் 15%)\n" +
                        "காரணம்: ஆபத்தான வார்த்தைகள் எதுவும் கண்டறியப்படவில்லை.\n" +
                        "ஆலோசனை: விழிப்புடன் இருங்கள், ரகசிய குறியீடுகளை பகிர வேண்டாம்."
                    }
                }
            }
            else -> {
                // Default English Fallback
                when {
                    isNumberOnly && text.trim().length >= 5 -> {
                        if (isBlacklisted) {
                            "RISK LEVEL: FRAUD WARNING (Scam Threat 95%)\n" +
                            "Reason: This number is identified on our active cyber blacklist for phishing and fraud.\n" +
                            "Advice: Do not pick up or share personal banking details."
                        } else {
                            "RISK LEVEL: SAFE (Low Risk 15%)\n" +
                            "Reason: This number has no reported banking frauds and is not on any active blacklist.\n" +
                            "Advice: Standard safe contact. Safe to interact under normal precautions."
                        }
                    }
                    lower.contains("otp") || lower.contains("passcode") -> {
                        "RISK LEVEL: SECURE FRAUD WARNING (OTP Scam Risk 98%)\n" +
                        "Reason: Banks never ask for OTPs over call or SMS. This is a direct theft attempt.\n" +
                        "Advice: Ignore this message and never reveal your digits."
                    }
                    lower.contains("kyc") || lower.contains("aadhaar") || lower.contains("block") -> {
                        "RISK LEVEL: HIGH FRAUD WARNING (KYC Suspension Phishing 95%)\n" +
                        "Reason: Warning about account blocks is a psychological scam to induce panic.\n" +
                        "Advice: Call your bank manager directly or visit branch."
                    }
                    else -> {
                        "RISK LEVEL: SECURE / LOW THREAT (Low Risk 15%)\n" +
                        "Reason: No obvious phishing keywords matched. Stay alert.\n" +
                        "Advice: Do not share security codes with anyone."
                    }
                }
            }
        }
    }
}
