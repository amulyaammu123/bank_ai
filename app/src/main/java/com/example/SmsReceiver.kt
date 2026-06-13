package com.safebank.ai

import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build
import android.provider.Telephony
import android.telephony.SmsMessage
import androidx.core.app.NotificationCompat
import com.safebank.ai.data.GeminiRepository
import com.safebank.ai.data.AppDatabase
import com.safebank.ai.data.FraudReport
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.async
import kotlinx.coroutines.launch

class SmsReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == Telephony.Sms.Intents.SMS_RECEIVED_ACTION) {
            val messages = Telephony.Sms.Intents.getMessagesFromIntent(intent)
            for (message in messages) {
                val body = message.messageBody ?: continue
                val sender = message.displayOriginatingAddress ?: "Unknown"
                
                val pendingResult = goAsync()
                CoroutineScope(Dispatchers.IO).launch {
                    try {
                        val repository = GeminiRepository()
                        
                        // 1. Analyze the Sender's Phone Number or ID
                        val senderSystemPrompt = """
                            You are SafeBank AI Call/SMS Protection Analyst. Analyze this phone number or sender ID.
                            Respond in plain text. First line must start with exactly 'RISK LEVEL: SAFE', 'RISK LEVEL: SUSPICIOUS' or 'RISK LEVEL: FRAUD'.
                            Then on subsequent lines give a clear explanation in 2 simplified, direct sentences in English.
                        """.trimIndent()
                        val senderPrompt = "Analyze this phone number or sender ID for banking scams, financial spam, OTP phishing, or blacklists: \"$sender\""
                        
                        val senderResultJob = async {
                            repository.analyzeText(
                                prompt = senderPrompt,
                                systemPrompt = senderSystemPrompt,
                                originalInput = sender,
                                languageCode = "en"
                            )
                        }

                        // 2. Analyze the Message Content Body
                        val bodySystemPrompt = """
                            You are SafeBank AI Cyber Security Bot. Analyze the message text for financial fraud.
                            STRICT RULE: You MUST respond ONLY in English.
                            First line: RISK LEVEL: [Status] (Percentage%)
                            Next lines: A clear explanation in 2 simple sentences in English.
                            Do not use markdown like asterisks or backticks.
                        """.trimIndent()
                        val bodyPrompt = "Analyze this message for financial fraud: \"$body\"."
                        
                        val bodyResultJob = async {
                            repository.analyzeText(
                                prompt = bodyPrompt,
                                systemPrompt = bodySystemPrompt,
                                originalInput = body,
                                languageCode = "en"
                            )
                        }

                        val rawSenderResult = senderResultJob.await()
                        val rawBodyResult = bodyResultJob.await()

                        val cleanedSenderResult = rawSenderResult.replace("*", "").replace("`", "")
                        val cleanedBodyResult = rawBodyResult.replace("*", "").replace("`", "")

                        val senderRisk = determineRisk(cleanedSenderResult)
                        val bodyRisk = determineRisk(cleanedBodyResult)

                        val overallRisk = when {
                            senderRisk == "FRAUD" || bodyRisk == "FRAUD" -> "FRAUD"
                            senderRisk == "SUSPICIOUS" || bodyRisk == "SUSPICIOUS" -> "SUSPICIOUS"
                            else -> "SAFE"
                        }

                        if (overallRisk == "FRAUD" || overallRisk == "SUSPICIOUS") {
                            val database = AppDatabase.getDatabase(context)
                            val dao = database.fraudDao()
                            val report = FraudReport(
                                category = "SMS",
                                reporterName = "System SMS Monitor",
                                targetValue = sender,
                                details = body,
                                timestamp = System.currentTimeMillis(),
                                riskScore = if (overallRisk == "FRAUD") 95 else 65,
                                status = if (overallRisk == "FRAUD") "Verified Fraud" else "Suspicious"
                            )
                            dao.insertReport(report)
                        }
                        
                        showNotification(context, sender, body, overallRisk, senderRisk, bodyRisk, cleanedSenderResult, cleanedBodyResult)
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

    private fun showNotification(
        context: Context, 
        sender: String, 
        body: String, 
        overallRisk: String, 
        senderRisk: String, 
        bodyRisk: String, 
        senderAnalysis: String, 
        bodyAnalysis: String
    ) {
        val channelId = "safebank_sms_channel"
        val channelName = "SafeBank SMS Monitor"
        val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                channelId,
                channelName,
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Monitors incoming SMS for fraud threats"
            }
            notificationManager.createNotificationChannel(channel)
        }

        val title = when (overallRisk) {
            "FRAUD" -> "🚨 Dangerous SMS Alert!"
            "SUSPICIOUS" -> "⚠️ Suspicious SMS Alert!"
            else -> "🛡️ Safe Message Received"
        }

        val cleanSenderText = senderAnalysis.substringAfter("RISK LEVEL:").trim()
        val cleanBodyText = bodyAnalysis.substringAfter("RISK LEVEL:").trim()

        val displayContent = """
            From: $sender
            Overall Threat Status: $overallRisk
            
            [Number Assessment - $senderRisk]
            $cleanSenderText
            
            [Message Assessment - $bodyRisk]
            $cleanBodyText
        """.trimIndent()

        val notification = NotificationCompat.Builder(context, channelId)
            .setSmallIcon(android.R.drawable.ic_dialog_alert)
            .setContentTitle(title)
            .setContentText("Sender: $sender (Threat: $overallRisk)")
            .setStyle(NotificationCompat.BigTextStyle().bigText(displayContent))
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setAutoCancel(true)
            .build()

        notificationManager.notify(System.currentTimeMillis().toInt(), notification)
    }
}
