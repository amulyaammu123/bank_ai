package com.safebank.ai.data

import com.squareup.moshi.Json
import com.squareup.moshi.JsonClass
import retrofit2.Response
import retrofit2.http.*

// Request & Response models for Supabase GoTrue Auth
@JsonClass(generateAdapter = true)
data class SupabaseAuthRequest(
    @Json(name = "email") val email: String,
    @Json(name = "password") val password: String
)

@JsonClass(generateAdapter = true)
data class SupabaseUser(
    @Json(name = "id") val id: String,
    @Json(name = "email") val email: String?
)

@JsonClass(generateAdapter = true)
data class SupabaseAuthResponse(
    @Json(name = "access_token") val accessToken: String?,
    @Json(name = "refresh_token") val refreshToken: String?,
    @Json(name = "user") val user: SupabaseUser?
)

@JsonClass(generateAdapter = true)
data class SupabaseRecoverRequest(
    @Json(name = "email") val email: String
)

// DB models for PostgREST
@JsonClass(generateAdapter = true)
data class SupabaseReport(
    @Json(name = "category") val category: String,
    @Json(name = "reporter_name") val reporterName: String,
    @Json(name = "target_value") val targetValue: String,
    @Json(name = "details") val details: String,
    @Json(name = "timestamp") val timestamp: Long,
    @Json(name = "risk_score") val riskScore: Int,
    @Json(name = "status") val status: String
) {
    fun toFraudReport(): FraudReport {
        return FraudReport(
            id = 0,
            category = category,
            reporterName = reporterName,
            targetValue = targetValue,
            details = details,
            timestamp = timestamp,
            riskScore = riskScore,
            status = status
        )
    }

    companion object {
        fun fromFraudReport(report: FraudReport): SupabaseReport {
            return SupabaseReport(
                category = report.category,
                reporterName = report.reporterName,
                targetValue = report.targetValue,
                details = report.details,
                timestamp = report.timestamp,
                riskScore = report.riskScore,
                status = report.status
            )
        }
    }
}

@JsonClass(generateAdapter = true)
data class SupabaseContact(
    @Json(name = "email") val email: String,
    @Json(name = "contacts") val contacts: String // JSON array represented as String
)

@JsonClass(generateAdapter = true)
data class SupabaseEmergencyAlert(
    @Json(name = "timestamp") val timestamp: Long,
    @Json(name = "user_email") val userEmail: String,
    @Json(name = "location") val location: String,
    @Json(name = "status") val status: String,
    @Json(name = "contacts") val contacts: String // JSON array represented as String
)

@JsonClass(generateAdapter = true)
data class SupabaseUserLogin(
    @Json(name = "email") val email: String,
    @Json(name = "login_time") val loginTime: Long
)

@JsonClass(generateAdapter = true)
data class SupabaseActivityLog(
    @Json(name = "email") val email: String,
    @Json(name = "feature") val feature: String,
    @Json(name = "details") val details: String,
    @Json(name = "timestamp") val timestamp: Long
)

interface SupabaseApiService {
    // GoTrue Auth endpoints
    @POST("auth/v1/signup")
    suspend fun signUp(
        @Header("apikey") apiKey: String,
        @Body request: SupabaseAuthRequest
    ): SupabaseAuthResponse

    @POST("auth/v1/token")
    suspend fun signIn(
        @Header("apikey") apiKey: String,
        @Query("grant_type") grantType: String = "password",
        @Body request: SupabaseAuthRequest
    ): SupabaseAuthResponse

    @POST("auth/v1/recover")
    suspend fun recoverPassword(
        @Header("apikey") apiKey: String,
        @Body request: SupabaseRecoverRequest
    ): Response<Unit>

    // PostgREST Database endpoints
    @GET("rest/v1/reports")
    suspend fun getReports(
        @Header("apikey") apiKey: String,
        @Header("Authorization") authHeader: String,
        @Query("select") select: String = "*",
        @Query("order") order: String = "timestamp.desc"
    ): List<SupabaseReport>

    @POST("rest/v1/reports")
    suspend fun insertReport(
        @Header("apikey") apiKey: String,
        @Header("Authorization") authHeader: String,
        @Body report: SupabaseReport
    ): Response<Unit>

    @GET("rest/v1/user_contacts")
    suspend fun getUserContacts(
        @Header("apikey") apiKey: String,
        @Header("Authorization") authHeader: String,
        @Query("email") emailFilter: String, // e.g. "eq.user@example.com"
        @Query("select") select: String = "*"
    ): List<SupabaseContact>

    // Upsert user contacts (POST with Prefer: resolution=merge-duplicates)
    @Headers("Prefer: resolution=merge-duplicates")
    @POST("rest/v1/user_contacts")
    suspend fun upsertUserContacts(
        @Header("apikey") apiKey: String,
        @Header("Authorization") authHeader: String,
        @Body contacts: SupabaseContact
    ): Response<Unit>

    @POST("rest/v1/emergency_alerts")
    suspend fun triggerEmergencyAlert(
        @Header("apikey") apiKey: String,
        @Header("Authorization") authHeader: String,
        @Body alert: SupabaseEmergencyAlert
    ): Response<Unit>

    @POST("rest/v1/user_logins")
    suspend fun insertUserLogin(
        @Header("apikey") apiKey: String,
        @Header("Authorization") authHeader: String,
        @Body login: SupabaseUserLogin
    ): Response<Unit>

    @GET("rest/v1/user_logins")
    suspend fun getUserLogins(
        @Header("apikey") apiKey: String,
        @Header("Authorization") authHeader: String,
        @Query("select") select: String = "*",
        @Query("order") order: String = "login_time.desc"
    ): List<SupabaseUserLogin>

    @POST("rest/v1/user_activity_logs")
    suspend fun insertActivityLog(
        @Header("apikey") apiKey: String,
        @Header("Authorization") authHeader: String,
        @Body log: SupabaseActivityLog
    ): Response<Unit>

    @GET("rest/v1/user_activity_logs")
    suspend fun getActivityLogs(
        @Header("apikey") apiKey: String,
        @Header("Authorization") authHeader: String,
        @Query("select") select: String = "*",
        @Query("order") order: String = "timestamp.desc"
    ): List<SupabaseActivityLog>
}
