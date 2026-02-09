import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface RegionalFlow {
    velocity: number;
    toRegion: bigint;
    fromRegion: bigint;
    volume: number;
    timestamp: Time;
    correlations: Array<[string, number]>;
    intensity: number;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export type Time = bigint;
export interface InstitutionalAlert {
    intensityChange: number;
    type: string;
    alertId: bigint;
    volumeChange: number;
    timestamp: Time;
    regionId: bigint;
}
export interface ConfidenceMetrics {
    improvementRatio: number;
    averageConfidence: number;
    assetSymbol: string;
    accuracyImprovement: number;
    confidenceAccuracyCorrelation: number;
}
export interface RegionalMetric {
    value: number;
    timestamp: Time;
    metricType: string;
    regionId: bigint;
    symbol: string;
}
export interface PerformanceSummary {
    averageAccuracy: number;
    totalPredictions: bigint;
    validatedPredictions: bigint;
    assetSymbol: string;
    averageDeviation: number;
    lowestPerformer: string;
    highestPerformer: string;
    validationTime: number;
}
export interface AlertConfig {
    updated_at: Time;
    criticalAlertDays: Array<bigint>;
    minVolumeThreshold: number;
    highPriorityAlertTypes: Array<string>;
    maxAlertFrequency: bigint;
    minIntensityThreshold: number;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface PredictiveProjection {
    trend: string;
    asset: CryptoAsset;
    targetLevels: Array<TargetLevel>;
    confidenceLevel: number;
    precision: number;
    timeHorizon: bigint;
}
export interface RecoveryAsset {
    rsi: number;
    supports: Array<number>;
    patternType: string;
    volume: number;
    openInterest: number;
    isMomentumBreakout: boolean;
    isInstitutionalEntry: boolean;
    recoveryStrength: number;
    symbol: string;
}
export interface TargetLevel {
    priceLevel: number;
    source: string;
    confidenceScore: number;
    levelType: string;
    timestamp: Time;
}
export interface PriceTicker {
    price: number;
    symbol: string;
}
export interface PredictionOutcome {
    predictedValue: number;
    actualValue: number;
    confidence: number;
    outcome: string;
}
export interface RegionalFlowConfig {
    name: string;
    velocityMultiplier: number;
    countryCodes: Array<string>;
    intensityMultiplier: number;
    regionId: bigint;
    coordinates: [number, number];
}
export interface DayFlowRange {
    startTime: Time;
    endTime: Time;
    flowData: Array<RegionalFlow>;
}
export interface CryptoAsset {
    name: string;
    usdValue: number;
    symbol: string;
}
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface Region {
    flowRatio: number;
    name: string;
    volume: number;
    capitalFlow: number;
    countryCodes: Array<string>;
    timestamp: Time;
    regionId: bigint;
    intensity: number;
    coordinates: [number, number];
}
export interface ModelPerformance {
    performanceScore: number;
    confidenceCorrelation: number;
    validationResults: Array<string>;
    deviation: number;
    predictions: Array<PredictionOutcome>;
    assetSymbol: string;
    modelName: string;
    timestamp: Time;
    validationTime: number;
    accuracy: number;
}
export interface ConfluenceZone {
    indicators: Array<string>;
    timestamp: Time;
    intensity: number;
}
export interface RegionalCryptoAsset {
    marketCap: number;
    name: string;
    liquidity: number;
    regionalVolume: number;
    usdValue: number;
    timestamp: Time;
    regionId: bigint;
    symbol: string;
}
export interface RegionalCorrelation {
    correlationStrength: number;
    timestamp: Time;
    regionId: bigint;
    symbol: string;
}
export interface AssetOutcomes {
    assetSymbol: string;
    predictionOutcomes: Array<PredictionOutcome>;
}
export interface CapitalFlow {
    marketImpact: number;
    flowIntensity: number;
    pnlRatio: number;
    timestamp: Time;
    amount: number;
    fromAsset: CryptoAsset;
    toAsset: CryptoAsset;
}
export interface NormalizedFuturesPosition {
    pnl: number;
    markPrice: number;
    leverage: number;
    positionSide: string;
    liquidationPrice: number;
    entryPrice: number;
    market: BinanceFuturesMarket;
    symbol: string;
    positionAmt: number;
}
export interface UserProfile {
    name: string;
    email?: string;
    preferences?: string;
}
export enum BinanceFuturesMarket {
    usdt_m = "usdt_m",
    coin_m = "coin_m"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addCapitalFlow(symbol: string, from: CryptoAsset, to: CryptoAsset, amount: number, intensity: number, pnlRatio: number, marketImpact: number): Promise<void>;
    addConfluenceZone(symbol: string, indicators: Array<string>, intensity: number): Promise<void>;
    addInstitutionalAlert(alertId: bigint, regionId: bigint, type: string, volumeChange: number, intensityChange: number): Promise<void>;
    addModelPerformance(symbol: string, modelName: string, accuracy: number, deviation: number, validationTime: number, performanceScore: number, confidence: number): Promise<void>;
    addOrUpdateBinanceCredentials(apiKey: string, apiSecret: string): Promise<void>;
    addPredictionOutcome(symbol: string, predictedValue: number, actualValue: number, confidence: number, outcome: string): Promise<void>;
    addPredictiveProjection(symbol: string, asset: CryptoAsset, trend: string, confidence: number, precision: number, horizon: bigint, targetLevels: Array<TargetLevel> | null): Promise<void>;
    addRecoveryAsset(symbol: string, recoveryStrength: number, patternType: string, openInterest: number, volume: number, rsi: number, supports: Array<number>, isMomentumBreakout: boolean, isInstitutionalEntry: boolean): Promise<void>;
    addRegion(regionId: bigint, name: string, coordinates: [number, number]): Promise<void>;
    addSummary(symbol: string, summary: string): Promise<void>;
    addValidationResult(symbol: string, modelName: string, result: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    clearDailyAnalysis(symbol: string): Promise<void>;
    clearOldStats(): Promise<void>;
    clearValidationResults(symbol: string, modelName: string): Promise<void>;
    getAggregatedPredictions(symbol: string): Promise<Array<AssetOutcomes>>;
    getAlertConfig(regionId: bigint): Promise<AlertConfig>;
    getAllFlows(): Promise<Array<CapitalFlow>>;
    getAllModelPerformances(symbol: string): Promise<Array<ModelPerformance>>;
    getCachedPrices(): Promise<Array<PriceTicker>>;
    getCachedSymbols(): Promise<Array<string>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCapitalFlow(symbol: string): Promise<CapitalFlow>;
    getConfidenceMetrics(symbol: string): Promise<ConfidenceMetrics>;
    getConfluenceZone(symbol: string): Promise<ConfluenceZone>;
    getDayFlowRange(regionId: bigint, dayOfYear: bigint): Promise<DayFlowRange>;
    getInstitutionalAlerts(): Promise<Array<InstitutionalAlert>>;
    getInterpretation(symbol: string): Promise<{
        direction: string;
        summary: string;
        intensity: number;
    }>;
    getModelPerformance(symbol: string, modelName: string): Promise<ModelPerformance>;
    getOpenFuturesPositions(): Promise<Array<NormalizedFuturesPosition>>;
    getPerformanceSummary(symbol: string): Promise<PerformanceSummary>;
    getPredictionOutcomes(symbol: string): Promise<Array<PredictionOutcome>>;
    getPredictiveProjection(symbol: string): Promise<PredictiveProjection>;
    getRecoveryAsset(symbol: string): Promise<RecoveryAsset>;
    getRegion(regionId: bigint): Promise<Region>;
    getRegionConfigs(): Promise<Array<[bigint, RegionalFlowConfig]>>;
    getRegionCoordinates(): Promise<Array<[bigint, [number, number]]>>;
    getRegionalCorrelations(): Promise<Array<RegionalCorrelation>>;
    getRegionalCryptoAsset(regionId: bigint, symbol: string): Promise<RegionalCryptoAsset>;
    getRegionalFlowConfig(regionId: bigint): Promise<RegionalFlowConfig>;
    getRegionalMetric(regionId: bigint, metricType: string): Promise<RegionalMetric>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getValidationResults(symbol: string, modelName: string): Promise<Array<string>>;
    getValidationState(symbol: string): Promise<bigint>;
    hasBinanceCredentials(): Promise<boolean>;
    isCallerAdmin(): Promise<boolean>;
    isCriticalAlertDay(regionId: bigint, dayOfYear: bigint): Promise<boolean>;
    printVolumeChanges(): Promise<void>;
    removeBinanceCredentials(): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    testBinanceConnection(): Promise<string>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    updateDirection(symbol: string, direction: string, intensity: number): Promise<void>;
}
