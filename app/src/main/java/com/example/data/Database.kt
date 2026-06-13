package com.safebank.ai.data

import android.content.Context
import androidx.room.*
import kotlinx.coroutines.flow.Flow

@Entity(tableName = "fraud_reports")
data class FraudReport(
    @PrimaryKey(autoGenerate = true) val id: Int = 0,
    val category: String, // "SMS", "Call", "UPI ID", "Phishing Link", "OTP Scam"
    val reporterName: String,
    val targetValue: String, // The reported item (e.g. "+91 98765 43210" or "pay-scam@upi")
    val details: String,
    val timestamp: Long = System.currentTimeMillis(),
    val riskScore: Int = 0, // 0 - 100
    val status: String = "Pending Review" // "Pending Review", "Verified Fraud", "Safe"
)

@Entity(tableName = "safety_tips")
data class LocalSafetyTip(
    @PrimaryKey val id: String,
    val category: String, // "OTP", "UPI", "ATM", "QR", "KYC", "LOAN"
    val titleEn: String,
    val titleTe: String,
    val titleHi: String,
    val titleTa: String,
    val contentEn: String,
    val contentTe: String,
    val contentHi: String,
    val contentTa: String,
    val voiceScriptEn: String,
    val voiceScriptTe: String,
    val voiceScriptHi: String,
    val voiceScriptTa: String
)

@Dao
interface FraudDao {
    @Query("SELECT * FROM fraud_reports ORDER BY timestamp DESC")
    fun getAllReports(): Flow<List<FraudReport>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertReport(report: FraudReport)

    @Query("DELETE FROM fraud_reports WHERE id = :id")
    suspend fun deleteReport(id: Int)

    // Tips Access
    @Query("SELECT * FROM safety_tips")
    fun getAllTips(): Flow<List<LocalSafetyTip>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertTips(tips: List<LocalSafetyTip>)

    @Query("SELECT COUNT(*) FROM safety_tips")
    suspend fun getTipsCount(): Int
}

@Database(entities = [FraudReport::class, LocalSafetyTip::class], version = 1, exportSchema = false)
abstract class AppDatabase : RoomDatabase() {
    abstract fun fraudDao(): FraudDao

    companion object {
        @Volatile
        private var INSTANCE: AppDatabase? = null

        fun getDatabase(context: Context): AppDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    AppDatabase::class.java,
                    "safebank_db"
                ).build()
                INSTANCE = instance
                instance
            }
        }
    }
}
