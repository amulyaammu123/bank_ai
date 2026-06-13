package com.safebank.ai

import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build
import android.telephony.TelephonyManager
import androidx.core.app.NotificationCompat
import com.safebank.ai.data.GeminiRepository
import com.safebank.ai.data.AppDatabase
import com.safebank.ai.data.FraudReport
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

class CallReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == TelephonyManager.ACTION_PHONE_STATE_CHANGED) {
            val state = intent.getStringExtra(TelephonyManager.EXTRA_STATE)
            if (state == TelephonyManager.EXTRA_STATE_RINGING) {
                val incomingNumber = intent.getStringExtra(TelephonyManager.EXTRA_INCOMING_NUMBER) ?: return
                if (incomingNumber.isBlank()) return

                val pendingResult = goAsync()
                CoroutineScope(Dispatchers.IO).launch {
                    try {
                        val repository = GeminiRepository()
                        val systemPrompt = """
                            You are SafeBank AI Call Protection Analyst. Analyze this phone number.
                            Respond in plain text. First line must start with exactly 'RISK LEVEL: SAFE', 'RISK LEVEL: SUSPICIOUS' or 'RISK LEVEL: FRAUD'.
                            Then on subsequent lines give a clear explanation in 2 simplified, direct sentences in English.
                        """.trimIndent()
                        val prompt = "Analyze this phone number for banking scams, financial spam, OTP phishing, or telecom blacklists: \"$incomingNumber\""

                        val result = repository.analyzeText(
                            prompt = prompt,
                            systemPrompt = systemPrompt,
                            originalInput = incomingNumber,
                            languageCode = "en"
                        )

                        val cleanedResult = result.replace("*", "").replace("`", "")
                        val riskLevel = determineRisk(cleanedResult)

                        if (riskLevel == "FRAUD" || riskLevel == "SUSPICIOUS") {
                            val database = AppDatabase.getDatabase(context)
                            val dao = database.fraudDao()
                            val report = FraudReport(
                                category = "Call",
                                reporterName = "System Call Monitor",
                                targetValue = incomingNumber,
                                details = cleanedResult,
                                timestamp = System.currentTimeMillis(),
                                riskScore = if (riskLevel == "FRAUD") 95 else 65,
                                status = if (riskLevel == "FRAUD") "Verified Fraud" else "Suspicious"
                            )
                            dao.insertReport(report)
                        }

                        showCallNotification(context, incomingNumber, riskLevel, cleanedResult)
                    } catch (e: Exception) {
                        e.printStackTrace()
                    } finally {
                        pendingResult.finish()
                    }
                }
            }
        }
    }

    private fun determineRisk(response: String): String {
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
            return "SAFE"
        }

        if (score != null) {
            return when {
                score >= 75 -> "FRAUD"
                score >= 35 -> "SUSPICIOUS"
                else -> "SAFE"
            }
        }

        return when {
            targetLine.contains("fraud") || targetLine.contains("scam") || targetLine.contains("severe") || targetLine.contains("critical") -> {
                "FRAUD"
            }
            targetLine.contains("suspicious") || targetLine.contains("medium") || targetLine.contains("detected") || targetLine.contains("warning") -> {
                "SUSPICIOUS"
            }
            else -> {
                "SAFE"
            }
        }
    }

    private fun extractPercent(text: String): Int? {
        val regex = "(\\d+)\\s*%".toRegex()
        val match = regex.find(text)
        return match?.groupValues?.get(1)?.toIntOrNull()
    }

    private fun showCallNotification(context: Context, number: String, riskLevel: String, analysisResult: String) {
        val channelId = "safebank_call_channel"
        val channelName = "SafeBank Call Monitor"
        val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                channelId,
                channelName,
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Monitors incoming calls for spam/phishing threats"
            }
            notificationManager.createNotificationChannel(channel)
        }

        val title = when (riskLevel) {
            "FRAUD" -> "🚨 Dangerous Call Warning!"
            "SUSPICIOUS" -> "⚠️ Suspicious Call Alert!"
            else -> "🛡️ Safe Call Detected"
        }

        val cleanText = analysisResult.substringAfter("RISK LEVEL:").trim()
        val displayContent = """
            Incoming Call: $number
            Threat Level: $riskLevel
            
            $cleanText
        """.trimIndent()

        val notification = NotificationCompat.Builder(context, channelId)
            .setSmallIcon(android.R.drawable.ic_dialog_alert)
            .setContentTitle(title)
            .setContentText("Caller: $number ($riskLevel)")
            .setStyle(NotificationCompat.BigTextStyle().bigText(displayContent))
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setAutoCancel(true)
            .build()

        notificationManager.notify(System.currentTimeMillis().toInt() + 2, notification)
    }
}
