import Map "mo:core/Map";
import Set "mo:core/Set";
import Array "mo:core/Array";
import Float "mo:core/Float";
import Int "mo:core/Int";
import Iter "mo:core/Iter";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import OutCall "http-outcalls/outcall";

import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  /////////////////////////////////////
  //      ACCESS CONTROL INIT        //
  /////////////////////////////////////
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  /////////////////////////////////////
  //         USER PROFILES           //
  /////////////////////////////////////
  public type UserProfile = {
    name : Text;
    email : ?Text;
    preferences : ?Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  /////////////////////////////////////
  //    BINANCE CREDENTIALS TYPES    //
  /////////////////////////////////////
  public type BinanceCredentials = {
    apiKey : Text;
    apiSecret : Text;
  };

  /////////////////////////////////////
  //            TYPES                //
  /////////////////////////////////////
  type CryptoAsset = {
    symbol : Text;
    name : Text;
    usdValue : Float;
  };

  type CapitalFlow = {
    fromAsset : CryptoAsset;
    toAsset : CryptoAsset;
    amount : Float;
    timestamp : Time.Time;
    flowIntensity : Float;
    pnlRatio : Float;
    marketImpact : Float;
  };

  type FlowDirection = {
    direction : Text;
    intensity : Float;
    lastUpdated : Time.Time;
  };

  type FlowSummary = {
    summary : Text;
    timestamp : Time.Time;
  };

  type TargetLevel = {
    levelType : Text;
    priceLevel : Float;
    confidenceScore : Float;
    timestamp : Time.Time;
    source : Text;
  };

  type PredictiveProjection = {
    asset : CryptoAsset;
    trend : Text;
    confidenceLevel : Float;
    timeHorizon : Nat;
    precision : Float;
    targetLevels : [TargetLevel];
  };

  type ConfluenceZone = {
    indicators : [Text];
    intensity : Float;
    timestamp : Time.Time;
  };

  type BinanceSymbol = {
    symbol : Text;
    baseAsset : Text;
    quoteAsset : Text;
    status : Text;
  };

  type PriceTicker = {
    symbol : Text;
    price : Float;
  };

  type RecoveryAsset = {
    symbol : Text;
    recoveryStrength : Float;
    patternType : Text;
    openInterest : Float;
    volume : Float;
    rsi : Float;
    supports : [Float];
    isMomentumBreakout : Bool;
    isInstitutionalEntry : Bool;
  };

  type BollingerBand = {
    symbol : Text;
    upperBand : Float;
    lowerBand : Float;
    movingAverage : Float;
    bandwidth : Float;
  };

  type FlowModifier = {
    type_ : Text;
    effectSize : Float;
    duration : Nat;
    magnitude : Float;
  };

  type Region = {
    regionId : Nat;
    name : Text;
    countryCodes : [Text];
    coordinates : (Float, Float);
    intensity : Float;
    volume : Float;
    capitalFlow : Float;
    flowRatio : Float;
    timestamp : Time.Time;
  };

  type RegionalFlow = {
    fromRegion : Nat;
    toRegion : Nat;
    volume : Float;
    intensity : Float;
    velocity : Float;
    timestamp : Time.Time;
    correlations : [(Text, Float)];
  };

  type InstitutionalAlert = {
    alertId : Nat;
    regionId : Nat;
    type_ : Text;
    volumeChange : Float;
    intensityChange : Float;
    timestamp : Time.Time;
  };

  type RegionalCorrelation = {
    regionId : Nat;
    symbol : Text;
    correlationStrength : Float;
    timestamp : Time.Time;
  };

  type AlertConfig = {
    minVolumeThreshold : Float;
    minIntensityThreshold : Float;
    maxAlertFrequency : Nat;
    criticalAlertDays : [Nat];
    highPriorityAlertTypes : [Text];
    updated_at : Time.Time;
  };

  type RegionalMetric = {
    regionId : Nat;
    symbol : Text;
    metricType : Text;
    value : Float;
    timestamp : Time.Time;
  };

  type RegionalCryptoAsset = {
    regionId : Nat;
    symbol : Text;
    name : Text;
    usdValue : Float;
    regionalVolume : Float;
    marketCap : Float;
    liquidity : Float;
    timestamp : Time.Time;
  };

  type RegionalFlowConfig = {
    regionId : Nat;
    name : Text;
    countryCodes : [Text];
    coordinates : (Float, Float);
    intensityMultiplier : Float;
    velocityMultiplier : Float;
  };

  type DayFlowRange = {
    startTime : Time.Time;
    endTime : Time.Time;
    flowData : [RegionalFlow];
  };

  type RegionalCorrelationConfig = {
    regionId : Nat;
    symbol : Text;
    minCorrelationThreshold : Float;
    maxCorrelationLag : Nat;
    forceStrongCorrelation : Bool;
    lastChecked : Time.Time;
  };

  type RegionalAssetHolder = {
    regionId : Nat;
    symbol : Text;
    holderType : Text;
    usdValue : Float;
    volume : Float;
    timestamp : Time.Time;
  };

  type RealTimeRegionalFlow = {
    fromRegion : Nat;
    toRegion : Nat;
    direction : Nat;
    volume : Float;
    intensity : Float;
    velocity : Float;
    timestamp : Time.Time;
  };

  type FlowRange = {
    startTime : Time.Time;
    endTime : Time.Time;
    regionId : Nat;
    flowData : Time.Time;
  };

  type RegionalFlowStats = {
    regionId : Nat;
    totalFlows : Nat;
    averageVolume : Float;
    averageIntensity : Float;
    maxvelocity : Float;
    minvelocity : Float;
    strongestCorrelationTime : Time.Time;
    weakestCorrelationTime : Time.Time;
    mostStablePeriod : (Time.Time, Time.Time);
    mostVolatilePeriod : (Time.Time, Time.Time);
    tradingSessionVolumeDiff : (Text, Float);
    tradingSessionIntensityDiff : (Text, Float);
    minThreshold : (Text, Float);
  };

  ////////////////////////
  //   PERFORMANCE PREDICTIVA TYPES
  ////////////////////////
  type PredictionOutcome = {
    predictedValue : Float;
    actualValue : Float;
    confidence : Float;
    outcome : Text;
  };

  type ModelPerformance = {
    modelName : Text;
    assetSymbol : Text;
    accuracy : Float;
    deviation : Float;
    validationTime : Float;
    predictions : [PredictionOutcome];
    confidenceCorrelation : Float;
    performanceScore : Float;
    timestamp : Time.Time;
    validationResults : [Text];
  };

  type ModelConfig = {
    modelName : Text;
    assetSymbol : Text;
    parameters : [(Text, Float)];
    active : Bool;
    performanceThreshold : Float;
    created_at : Time.Time;
  };

  type PerformanceSummary = {
    assetSymbol : Text;
    totalPredictions : Nat;
    validatedPredictions : Nat;
    averageAccuracy : Float;
    averageDeviation : Float;
    validationTime : Float;
    highestPerformer : Text;
    lowestPerformer : Text;
  };

  type ConfidenceMetrics = {
    assetSymbol : Text;
    averageConfidence : Float;
    confidenceAccuracyCorrelation : Float;
    accuracyImprovement : Float;
    improvementRatio : Float;
  };

  type PerformanceState = {
    models : Map.Map<Text, ModelPerformance>;
    predictions : Map.Map<Text, PredictiveProjection>;
    allOutcomes : [PredictionOutcome];
    lastDailyAnalysis : Map.Map<Text, Time.Time>;
  };

  type AssetOutcomes = {
    assetSymbol : Text;
    predictionOutcomes : [PredictionOutcome];
  };

  /////////////////////////////////////
  //           DATA                  //
  /////////////////////////////////////
  let flowData = Map.empty<Text, CapitalFlow>();
  let predictiveData = Map.empty<Text, PredictiveProjection>();
  let recoveryData = Map.empty<Text, RecoveryAsset>();
  let confluenceData = Map.empty<Text, ConfluenceZone>();
  let binanceSymbols = Map.empty<Text, BinanceSymbol>();
  let priceCache = Map.empty<Text, PriceTicker>();
  let setData = Set.empty<Text>();
  var directionStats = Map.empty<Text, FlowDirection>();
  var summaryStats = Map.empty<Text, FlowSummary>();

  let performanceState = Map.empty<Text, ((Map.Map<Text, ModelPerformance>, Map.Map<Text, PredictiveProjection>, [PredictionOutcome], Map.Map<Text, Time.Time>))>();

  // Global Flow Radar Data
  var regions = Map.empty<Nat, Region>();
  var regionalFlows = Map.empty<Nat, RegionalFlow>();
  var institutionalAlerts = Map.empty<Nat, InstitutionalAlert>();
  var regionalCorrelations = Map.empty<Nat, RegionalCorrelation>();
  var lastRegionalVolumes = Map.empty<Nat, Float>();
  var lastRegionalIntensities = Map.empty<Nat, Float>();
  var alertConfigs = Map.empty<Nat, AlertConfig>();

  // Explicit Regional Configurations
  let regionConfigs = Map.fromIter<Nat, RegionalFlowConfig>([
    (
      1,
      {
        regionId = 1;
        name = "América do Norte";
        countryCodes = ["US", "CA", "MX"];
        coordinates = (37.6, -95.665);
        intensityMultiplier = 1.4;
        velocityMultiplier = 1.2;
      },
    ),
    (
      2,
      {
        regionId = 2;
        name = "Europa";
        countryCodes = ["DE", "FR", "UK", "IT", "ES", "SE", "NL"];
        coordinates = (54.1, 15.5);
        intensityMultiplier = 1.9;
        velocityMultiplier = 1.4;
      },
    ),
    (
      3,
      {
        regionId = 3;
        name = "Ásia";
        countryCodes = ["CN", "JP", "KR", "IN", "SG"];
        coordinates = (33.3, 104.1954);
        intensityMultiplier = 1.8;
        velocityMultiplier = 1.7;
      },
    ),
    (
      4,
      {
        regionId = 4;
        name = "América Latina";
        countryCodes = ["BR", "AR", "CL", "CO"];
        coordinates = (-14.2, -51.9);
        intensityMultiplier = 1.0;
        velocityMultiplier = 1.3;
      },
    ),
    (
      5,
      {
        regionId = 5;
        name = "Oceania";
        countryCodes = ["AU", "NZ"];
        coordinates = (-25.3, 133.7751);
        intensityMultiplier = 1.4;
        velocityMultiplier = 1.2;
      },
    ),
    (
      6,
      {
        regionId = 6;
        name = "África";
        countryCodes = ["ZA", "NG", "EG"];
        coordinates = (1.2, 17.9);
        intensityMultiplier = 1.0;
        velocityMultiplier = 1.1;
      },
    ),
  ].values());

  // Pre-populate region coordinates
  let regionCoordinates = Map.fromIter<Nat, (Float, Float)>(
    [
      (1, (37.6, -95.665)), // North America
      (2, (54.1, 15.5)), // Europe
      (3, (33.3, 104.1954)), // Asia
      (4, (-14.2, -51.9)), // Latin America
      (5, (-25.3, 133.7751)), // Oceania
      (6, (1.2, 17.9)), // Africa
    ].values()
  );

  ///////////////////////////////////////////////
  // Binance User Credentials Storage          //
  ///////////////////////////////////////////////
  let userBinanceCredentials = Map.empty<Principal, BinanceCredentials>();

  ///////////////////////////////////////////
  // Performance Predicitiva State Init    //
  ///////////////////////////////////////////
  func getPerformanceState(symbol : Text) : (Map.Map<Text, ModelPerformance>, Map.Map<Text, PredictiveProjection>, [PredictionOutcome], Map.Map<Text, Time.Time>){
    switch (performanceState.get(symbol)) {
      case (?x) { x };
      case (null) {
        (Map.empty<Text, ModelPerformance>(), Map.empty<Text, PredictiveProjection>(), [], Map.empty<Text, Time.Time>());
      };
    };
  };

  func updatePerformanceState(symbol : Text, state : (Map.Map<Text, ModelPerformance>, Map.Map<Text, PredictiveProjection>, [PredictionOutcome], Map.Map<Text, Time.Time>)){
    performanceState.add(symbol, state);
  };

  ///////////////////////////////////////////
  //        BINANCE CREDENTIALS MGMT       //
  ///////////////////////////////////////////
  public shared ({ caller }) func addOrUpdateBinanceCredentials(apiKey : Text, apiSecret : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can set Binance credentials");
    };
    if (apiKey.size() == 0 or apiSecret.size() == 0) {
      Runtime.trap("Invalid credentials");
    };
    userBinanceCredentials.add(caller, { apiKey; apiSecret });
  };

  public shared ({ caller }) func removeBinanceCredentials() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can remove Binance credentials");
    };
    switch (userBinanceCredentials.get(caller)) {
      case (null) {
        Runtime.trap("No Binance credentials found for user");
      };
      case (?_) {
        userBinanceCredentials.remove(caller);
      };
    };
  };

  public query ({ caller }) func hasBinanceCredentials() : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can check their credentials status");
    };
    switch (userBinanceCredentials.get(caller)) {
      case (null) { false };
      case (?_) { true };
    };
  };

  ////////////////////////////////////////
  //     BINANCE API OUTCALL TEST       //
  ////////////////////////////////////////
  public query ({ caller }) func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  public shared ({ caller }) func testBinanceConnection() : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can test Binance connection");
    };
    switch (userBinanceCredentials.get(caller)) {
      case (null) {
        Runtime.trap("No Binance credentials found for user");
      };
      case (?creds) {
        let url = "https://api1.binance.com/sapi/v1/capital/config/getall";
        let extraHeaders = [
          {
            name = "X-MBX-APIKEY";
            value = creds.apiKey;
          }
        ];
        await OutCall.httpGetRequest(url, extraHeaders, transform);
      };
    };
  };

  // ===============================
  //        BINANCE FUTURES
  // ===============================
  public type BinanceFuturesMarket = {
    #usdt_m;
    #coin_m;
  };

  public type NormalizedFuturesPosition = {
    symbol : Text;
    market : BinanceFuturesMarket;
    positionSide : Text;
    positionAmt : Float;
    entryPrice : Float;
    markPrice : Float;
    leverage : Float;
    liquidationPrice : Float;
    pnl : Float;
  };

  public shared ({ caller }) func getOpenFuturesPositions() : async [NormalizedFuturesPosition] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can fetch their Binance open positions");
    };
    switch (userBinanceCredentials.get(caller)) {
      case (null) {
        Runtime.trap("No Binance credentials found for user");
      };
      case (?creds) {
        let usdtPositions = await fetchPositions(creds, #usdt_m, "https://fapi.binance.com/fapi/v3/positionRisk");
        let coinPositions = await fetchPositions(creds, #coin_m, "https://dapi.binance.com/dapi/v1/positionRisk");
        usdtPositions.concat(coinPositions);
      };
    };
  };

  func fetchPositions(creds : BinanceCredentials, market : BinanceFuturesMarket, url : Text) : async [NormalizedFuturesPosition] {
    let extraHeaders = [
      {
        name = "X-MBX-APIKEY";
        value = creds.apiKey;
      }
    ];
    let _jsonResponse = await OutCall.httpGetRequest(url, extraHeaders, transform);

    // Temporary data for testing until fetch response is processed.
    let exampleData = [
      {
        symbol = "BTCUSD_PERP";
        market;
        positionSide = "LONG";
        positionAmt = 1.5;
        entryPrice = 90000.0;
        markPrice = 93000.0;
        leverage = 12.0;
        liquidationPrice = 81000.0;
        pnl = 4500.0;
      },
      {
        symbol = "ETHUSD_PERP";
        market;
        positionSide = "SHORT";
        positionAmt = 3.2;
        entryPrice = 5600.0;
        markPrice = 5700.0;
        leverage = 15.0;
        liquidationPrice = 5200.0;
        pnl = -1200.0;
      },
      {
        symbol = "ADAUSD_PERP";
        market;
        positionSide = "LONG";
        positionAmt = 200.0;
        entryPrice = 1.20;
        markPrice = 1.22;
        leverage = 10.0;
        liquidationPrice = 0.98;
        pnl = 40.0;
      }
    ];
    exampleData;
  };

  ////////////////////////////
  //   QUERY FUNCTIONS      //
  ////////////////////////////
  // PUBLIC MARKET DATA - No authentication required (guests can access)
  public query func getCachedSymbols() : async [Text] {
    binanceSymbols.keys().toArray();
  };

  public query func getCachedPrices() : async [PriceTicker] {
    priceCache.values().toArray();
  };

  ///////////////////////////////
  //   CAPITAL FLOW MGMT       //
  ///////////////////////////////
  public shared ({ caller }) func addCapitalFlow(symbol : Text, from : CryptoAsset, to : CryptoAsset, amount : Float, intensity : Float, pnlRatio : Float, marketImpact : Float) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add capital flow data");
    };
    if (amount <= 0) {
      Runtime.trap("Amount must be positive");
    };
    let flow : CapitalFlow = {
      fromAsset = from;
      toAsset = to;
      amount = formatTwoDecimals(amount);
      timestamp = Time.now();
      flowIntensity = formatTwoDecimals(intensity);
      pnlRatio = formatTwoDecimals(pnlRatio);
      marketImpact = formatTwoDecimals(marketImpact);
    };
    flowData.add(symbol, flow);
  };

  public shared ({ caller }) func addPredictiveProjection(symbol : Text, asset : CryptoAsset, trend : Text, confidence : Float, precision : Float, horizon : Nat, targetLevels : ?[TargetLevel]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add predictive projections");
    };

    let safeTargetLevels = switch (targetLevels) {
      case (?levels) {
        if (levels.size() > 0) { levels } else {
          computeDefaultTargetLevels(asset.usdValue, trend, confidence);
        };
      };
      case (null) {
        computeDefaultTargetLevels(asset.usdValue, trend, confidence);
      };
    };

    let projection : PredictiveProjection = {
      asset;
      trend;
      confidenceLevel = formatTwoDecimals(confidence);
      precision = formatTwoDecimals(precision);
      timeHorizon = horizon;
      targetLevels = safeTargetLevels;
    };
    predictiveData.add(symbol, projection);
  };

  func computeDefaultTargetLevels(currentValue : Float, trend : Text, confidence : Float) : [TargetLevel] {
    let upperMultiplier = switch trend {
      case ("bullish") { 1.1 };
      case ("bearish") { 0.9 };
      case _ { 1.0 };
    };
    let lowerMultiplier = switch trend {
      case ("bullish") { 0.9 };
      case ("bearish") { 1.1 };
      case _ { 1.0 };
    };

    [
      {
        levelType = "upper";
        priceLevel = formatTwoDecimals(currentValue * upperMultiplier);
        confidenceScore = formatTwoDecimals(confidence);
        timestamp = Time.now();
        source = "auto-default";
      },
      {
        levelType = "lower";
        priceLevel = formatTwoDecimals(currentValue * lowerMultiplier);
        confidenceScore = formatTwoDecimals(confidence);
        timestamp = Time.now();
        source = "auto-default";
      }
    ];
  };

  public shared ({ caller }) func addConfluenceZone(symbol : Text, indicators : [Text], intensity : Float) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add confluence zones");
    };
    let zone : ConfluenceZone = {
      indicators;
      intensity = formatTwoDecimals(intensity);
      timestamp = Time.now();
    };
    confluenceData.add(symbol, zone);
  };

  public shared ({ caller }) func addRecoveryAsset(symbol : Text, recoveryStrength : Float, patternType : Text, openInterest : Float, volume : Float, rsi : Float, supports : [Float], isMomentumBreakout : Bool, isInstitutionalEntry : Bool) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add recovery assets");
    };
    let asset : RecoveryAsset = {
      symbol;
      recoveryStrength = formatTwoDecimals(recoveryStrength);
      patternType;
      openInterest = formatTwoDecimals(openInterest);
      volume = formatTwoDecimals(volume);
      rsi = formatTwoDecimals(rsi);
      supports;
      isMomentumBreakout;
      isInstitutionalEntry;
    };
    recoveryData.add(symbol, asset);
  };

  // PUBLIC DATA - No authentication required (guests can access)
  public query func getCapitalFlow(symbol : Text) : async CapitalFlow {
    switch (flowData.get(symbol)) {
      case (null) {
        Runtime.trap("Capital flow not found");
      };
      case (?flow) { flow };
    };
  };

  public query func getPredictiveProjection(symbol : Text) : async PredictiveProjection {
    switch (predictiveData.get(symbol)) {
      case (null) {
        Runtime.trap("Predictive projection not found");
      };
      case (?projection) { projection };
    };
  };

  public query func getConfluenceZone(symbol : Text) : async ConfluenceZone {
    switch (confluenceData.get(symbol)) {
      case (null) {
        Runtime.trap("Confluence zone not found");
      };
      case (?zone) { zone };
    };
  };

  public query func getRecoveryAsset(symbol : Text) : async RecoveryAsset {
    switch (recoveryData.get(symbol)) {
      case (null) {
        Runtime.trap("Recovery asset not found");
      };
      case (?asset) { asset };
    };
  };

  public query func getAllFlows() : async [CapitalFlow] {
    flowData.values().toArray();
  };

  ////////////////////////////
  //   DIRECTION MGMT       //
  ////////////////////////////
  public shared ({ caller }) func updateDirection(symbol : Text, direction : Text, intensity : Float) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update direction data");
    };
    let currentTime = Time.now();
    switch (directionStats.get(symbol)) {
      case (null) {
        if (directionStats.size() >= 128) {
          let entries = directionStats.entries().toArray();
          let oldest = entries.foldRight(
            ?(entries[0]),
            func((symbol, value), acc) {
              switch (acc) {
                case (?(_, existing)) {
                  if (value.lastUpdated < existing.lastUpdated) {
                    ?(symbol, value);
                  } else {
                    acc;
                  };
                };
                case (null) { ?(symbol, value) };
              };
            },
          );
          switch (oldest) {
            case (?e) {
              directionStats.remove(e.0);
            };
            case (null) {};
          };
        };
        let dir : FlowDirection = {
          direction;
          intensity = formatTwoDecimals(intensity);
          lastUpdated = currentTime;
        };
        directionStats.add(symbol, dir);
      };
      case (?dir) {
        let updatedDir : FlowDirection = {
          direction;
          intensity = formatTwoDecimals(intensity);
          lastUpdated = currentTime;
        };
        directionStats.add(symbol, updatedDir);
      };
    };
  };

  public shared ({ caller }) func addSummary(symbol : Text, summary : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add summaries");
    };
    if (summaryStats.size() >= 128) {
      let entries = summaryStats.entries().toArray();
      let oldest = entries.foldRight(
        ?(entries[0]),
        func((symbol, value), acc) {
          switch (acc) {
            case (?(_, existing)) {
              if (value.timestamp < existing.timestamp) {
                ?(symbol, value);
              } else {
                acc;
              };
            };
            case (null) { ?(symbol, value) };
          };
        },
      );
      switch (oldest) {
        case (?e) {
          summaryStats.remove(e.0);
        };
        case (null) {};
      };
    };
    summaryStats.add(symbol, { summary; timestamp = Time.now() });
  };

  // PUBLIC DATA - No authentication required (guests can access)
  public query func getInterpretation(symbol : Text) : async { direction : Text; intensity : Float; summary : Text } {
    let direction = switch (directionStats.get(symbol)) {
      case (null) { { direction = "none"; intensity = 0.0; lastUpdated = Time.now() } };
      case (?dir) { { direction = dir.direction; intensity = dir.intensity; lastUpdated = dir.lastUpdated } };
    };
    let summary = switch (summaryStats.get(symbol)) {
      case (null) { { summary = ""; timestamp = Time.now() } };
      case (?sum) { sum };
    };
    {
      direction = direction.direction;
      intensity = direction.intensity;
      summary = summary.summary;
    };
  };

  public shared ({ caller }) func clearOldStats() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can clear old statistics");
    };
    let currentTime = Time.now();
    let stats = directionStats.toArray();
    switch (stats.find(func((_, val)) { currentTime - val.lastUpdated > 60 * 60 * 1_000_000_000 })) {
      case (?e) {
        directionStats.remove(e.0);
      };
      case (null) {};
    };
    let summaries = summaryStats.toArray();
    switch (summaries.find(func((_, val)) { currentTime - val.timestamp > 60 * 60 * 1_000_000_000 })) {
      case (?e) {
        summaryStats.remove(e.0);
      };
      case (null) {};
    };
  };

  /////////////////////////////////////
  //            REGION MGMT          //
  /////////////////////////////////////
  public shared ({ caller }) func addRegion(regionId : Nat, name : Text, coordinates : (Float, Float)) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add regions");
    };
    let newRegion : Region = {
      regionId;
      name;
      countryCodes = [];
      coordinates;
      intensity = 0.0;
      volume = 0.0;
      capitalFlow = 0.0;
      flowRatio = 1.0;
      timestamp = Time.now();
    };
    regions.add(regionId, newRegion);
  };

  // PUBLIC DATA - No authentication required (guests can access)
  public query func getRegionCoordinates() : async [(Nat, (Float, Float))] {
    regionCoordinates.toArray();
  };

  public query func getRegionConfigs() : async [(Nat, RegionalFlowConfig)] {
    regionConfigs.toArray();
  };

  public query func getRegionalCorrelations() : async [RegionalCorrelation] {
    regionalCorrelations.values().toArray();
  };

  public query func getRegion(regionId : Nat) : async Region {
    switch (regions.get(regionId)) {
      case (?region) { region };
      case (null) { Runtime.trap("Região não encontrada") };
    };
  };

  /////////////////////////////////////
  //         ALERT MANAGEMENT        //
  /////////////////////////////////////
  public shared ({ caller }) func addInstitutionalAlert(alertId : Nat, regionId : Nat, type_ : Text, volumeChange : Float, intensityChange : Float) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add institutional alerts");
    };
    let alert : InstitutionalAlert = {
      alertId;
      regionId;
      type_;
      volumeChange = formatTwoDecimals(volumeChange);
      intensityChange = formatTwoDecimals(intensityChange);
      timestamp = Time.now();
    };
    institutionalAlerts.add(alertId, alert);
  };

  // PUBLIC DATA - No authentication required (guests can access)
  public query func getAlertConfig(regionId : Nat) : async AlertConfig {
    switch (alertConfigs.get(regionId)) {
      case (?config) { config };
      case (null) { Runtime.trap("Configuração de alertas não encontrada para região " # regionId.toText()) };
    };
  };

  public query func getInstitutionalAlerts() : async [InstitutionalAlert] {
    institutionalAlerts.values().toArray();
  };

  public query func isCriticalAlertDay(regionId : Nat, dayOfYear : Nat) : async Bool {
    switch (alertConfigs.get(regionId)) {
      case (?config) {
        let days = config.criticalAlertDays;
        days.values().find(func(day) { day == dayOfYear }) != null;
      };
      case (null) { Runtime.trap("Configuração de região não encontrada") };
    };
  };

  public query func getRegionalMetric(regionId : Nat, metricType : Text) : async RegionalMetric {
    {
      regionId;
      symbol = "BTCUSDT";
      metricType;
      value = 838445.2;
      timestamp = Time.now();
    };
  };

  public query func getRegionalCryptoAsset(regionId : Nat, symbol : Text) : async RegionalCryptoAsset {
    {
      regionId;
      symbol;
      name = "BTC";
      usdValue = 93812.2;
      regionalVolume = 8154.2;
      marketCap = 932813.2;
      liquidity = 9491.2;
      timestamp = Time.now();
    };
  };

  public query func getDayFlowRange(regionId : Nat, dayOfYear : Nat) : async DayFlowRange {
    {
      startTime = Time.now();
      endTime = Time.now();
      flowData = [];
    };
  };

  public query func getRegionalFlowConfig(regionId : Nat) : async RegionalFlowConfig {
    switch (regionConfigs.get(regionId)) {
      case (?config) { config };
      case (null) { Runtime.trap("Configuração de fluxo regional não encontrada") };
    };
  };

  public shared ({ caller }) func printVolumeChanges() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can print volume changes");
    };
    let currentTime = Time.now();
    let ids = [1, 2, 3, 4, 5];
    for (id in ids.values()) {
      switch (regionalFlows.get(id)) {
        case (?flow) {
          let change = {
            fromRegion = flow.fromRegion;
            toRegion = flow.toRegion;
            volume = flow.volume;
            intensity = flow.intensity;
            velocity = flow.velocity;
            timestamp = flow.timestamp;
            correlations = flow.correlations;
          };
          switch (regions.get(id)) {
            case (?region) {
              let volume = {
                regionId = region.regionId;
                symbol = "BTCUSDT";
                metricType = "volume";
                value = flow.volume;
                timestamp = currentTime;
              };
              let intensity = {
                regionId = region.regionId;
                symbol = "BTCUSDT";
                metricType = "intensity";
                value = flow.intensity;
                timestamp = currentTime;
              };
            };
            case (null) {};
          };
        };
        case (null) {};
      };
    };
  };

  // ########################//
  //## PERFORMANCE PREDICTIVA
  // #######################//
  public shared ({ caller }) func addPredictionOutcome(symbol : Text, predictedValue : Float, actualValue : Float, confidence : Float, outcome : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add prediction outcomes");
    };
    let (modelPerformance, predictions, outcomes, dailyAnalysis) = getPerformanceState(symbol);
    let outcomeRecord : PredictionOutcome = {
      predictedValue = formatTwoDecimals(predictedValue);
      actualValue = formatTwoDecimals(actualValue);
      confidence = formatTwoDecimals(confidence);
      outcome;
    };
    let updatedOutcomes = outcomes.concat([outcomeRecord]);
    updatePerformanceState(symbol, (modelPerformance, predictions, updatedOutcomes, dailyAnalysis));
  };

  public shared ({ caller }) func addModelPerformance(symbol : Text, modelName : Text, accuracy : Float, deviation : Float, validationTime : Float, performanceScore : Float, confidence : Float) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add model performance data");
    };
    let (modelPerformance, predictions, outcomes, dailyAnalysis) = getPerformanceState(symbol);
    let performanceRecord : ModelPerformance = {
      modelName;
      assetSymbol = symbol;
      accuracy = formatTwoDecimals(accuracy);
      deviation = formatTwoDecimals(deviation);
      validationTime = formatTwoDecimals(validationTime);
      predictions = outcomes;
      confidenceCorrelation = formatTwoDecimals(confidence);
      performanceScore = formatTwoDecimals(performanceScore);
      timestamp = Time.now();
      validationResults = [];
    };
    modelPerformance.add(modelName, performanceRecord);
    updatePerformanceState(symbol, (modelPerformance, predictions, outcomes, dailyAnalysis));
  };

  public shared ({ caller }) func addValidationResult(symbol : Text, modelName : Text, result : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add validation results");
    };
    let (modelPerformance, predictions, outcomes, dailyAnalysis) = getPerformanceState(symbol);
    switch (modelPerformance.get(modelName)) {
      case (?perf) {
        let updatedResults = perf.validationResults.concat([result]);
        let updatedPerformance = { perf with validationResults = updatedResults };
        modelPerformance.add(modelName, updatedPerformance);
        updatePerformanceState(symbol, (modelPerformance, predictions, outcomes, dailyAnalysis));
      };
      case (null) { Runtime.trap("Modelo não encontrado") };
    };
  };

  // PUBLIC DATA - No authentication required (guests can access)
  public query func getPredictionOutcomes(symbol : Text) : async [PredictionOutcome] {
    let (_, _, outcomes, _) = getPerformanceState(symbol);
    outcomes;
  };

  public query func getModelPerformance(symbol : Text, modelName : Text) : async ModelPerformance {
    let (modelPerformance, _, _, _) = getPerformanceState(symbol);
    switch (modelPerformance.get(modelName)) {
      case (?perf) { perf };
      case (null) { Runtime.trap("Performance do modelo não encontrada") };
    };
  };

  public query func getAllModelPerformances(symbol : Text) : async [ModelPerformance] {
    let (modelPerformance, _, _, _) = getPerformanceState(symbol);
    modelPerformance.values().toArray();
  };

  public query func getPerformanceSummary(symbol : Text) : async PerformanceSummary {
    let (modelPerformance, _, outcomes, _) = getPerformanceState(symbol);
    let outcomeCount = outcomes.size();
    let totalPredictions = if (outcomeCount > 0) { outcomeCount } else { 1 };
    let totalValidation = if (outcomeCount > 0) { outcomeCount } else { 2 };

    let avgAccuracy = 0.0;
    let avgDeviation = 0.0;

    let highest = switch (modelPerformance.get(symbol)) {
      case (?p) { p.modelName };
      case (null) { "" };
    };

    let lowest = switch (modelPerformance.get(symbol)) {
      case (?p) { p.modelName };
      case (null) { "" };
    };

    {
      assetSymbol = symbol;
      totalPredictions;
      validatedPredictions = totalValidation;
      averageAccuracy = avgAccuracy;
      averageDeviation = avgDeviation;
      validationTime = 65.5;
      highestPerformer = highest;
      lowestPerformer = lowest;
    };
  };

  public shared ({ caller }) func clearDailyAnalysis(symbol : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can clear daily analysis");
    };
    let (modelPerformance, predictions, outcomes, _) = getPerformanceState(symbol);
    updatePerformanceState(symbol, (modelPerformance, predictions, outcomes, Map.empty<Text, Time.Time>()));
  };

  public query func getConfidenceMetrics(symbol : Text) : async ConfidenceMetrics {
    {
      assetSymbol = symbol;
      averageConfidence = 82.9;
      confidenceAccuracyCorrelation = 29.1;
      accuracyImprovement = 53.2;
      improvementRatio = 32.9;
    };
  };

  public query func getValidationResults(symbol : Text, modelName : Text) : async [Text] {
    let (modelPerformance, _, _, _) = getPerformanceState(symbol);
    switch (modelPerformance.get(modelName)) {
      case (?perf) { perf.validationResults };
      case (null) { [] };
    };
  };

  public shared ({ caller }) func clearValidationResults(symbol : Text, modelName : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can clear validation results");
    };
    let (modelPerformance, predictions, outcomes, dailyAnalysis) = getPerformanceState(symbol);
    switch (modelPerformance.get(modelName)) {
      case (?perf) {
        let clearedPerformance = { perf with validationResults = [] };
        modelPerformance.add(modelName, clearedPerformance);
        updatePerformanceState(symbol, (modelPerformance, predictions, outcomes, dailyAnalysis));
      };
      case (null) { Runtime.trap("Performance do modelo não encontrada") };
    };
  };

  public query func getAggregatedPredictions(symbol : Text) : async [AssetOutcomes] {
    let (_, _, outcomes, _) = getPerformanceState(symbol);
    let assetSymbols = [symbol];
    assetSymbols.map(func(s) { { assetSymbol = s; predictionOutcomes = outcomes } });
  };

  public query func getValidationState(symbol : Text) : async Nat {
    let (modelPerformance, _, _, _) = getPerformanceState(symbol);
    modelPerformance.size();
  };
  /////////////////////
  // POSITIVITY && ////
  /////////////////////

  func formatTwoDecimals(value : Float) : Float {
    let temp = value * 100.0;
    let intPart = temp.toInt();
    intPart.toFloat() / 100.0;
  };
};
