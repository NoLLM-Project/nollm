// 3_Registry/Routing/tools/routing_health_score.js

import { loadRoutingRegistry } from "../loader.js";
import { detectRoutingAnomalies } from "./routing_anomaly_detector.js";
import { generatePlaneLoadBalanceSuggestions } from "./routing_plane_load_balancer.js";
import { generateRoutingRefactorSuggestions } from "./routing_auto_refactor_suggestions.js";
import { generateRoutingCompressionSuggestions } from "./routing_compression_tool.js";
import { generateRoutingExpansionPredictions } from "./routing_expansion_predictor.js";

/**
 * Normalize a value into [0,1] with soft clipping.
 */
function normalize(value, ideal, tolerance) {
  const diff = Math.abs(value - ideal);
  if (diff <= tolerance) return 1;
  return Math.max(0, 1 - diff / (tolerance * 4));
}

/**
 * Main: compute routing health score
 */
export function computeRoutingHealthScore() {
  const { transitions } = loadRoutingRegistry();

  // 1. Complexity score (ideal: moderate number of transitions)
  const transitionCount = transitions.length;
  const complexityScore = normalize(transitionCount, 150, 75);

  // 2. Anomaly score (fewer anomalies = healthier)
  const anomalies = detectRoutingAnomalies();
  const anomalyCount =
    anomalies.degreeAnomalies.length +
    anomalies.boundaryAnomalies.length +
    anomalies.categoryOutliers.length;
  const anomalyScore = normalize(anomalyCount, 0, 5);

  // 3. Plane balance score (fewer suggestions = healthier)
  const planeSuggestions = generatePlaneLoadBalanceSuggestions();
  const planeScore = normalize(planeSuggestions.length, 0, 4);

  // 4. Refactor score (fewer refactor suggestions = healthier)
  const refactorSuggestions = generateRoutingRefactorSuggestions();
  const refactorScore = normalize(refactorSuggestions.length, 0, 6);

  // 5. Compression score (fewer compression opportunities = healthier)
  const compressionSuggestions = generateRoutingCompressionSuggestions();
  const compressionScore = normalize(compressionSuggestions.length, 0, 6);

  // 6. Expansion score (fewer missing nodes = healthier)
  const expansionSuggestions = generateRoutingExpansionPredictions();
  const expansionScore = normalize(expansionSuggestions.length, 0, 6);

  // Weighted composite
  const weights = {
    complexity: 0.15,
    anomalies: 0.25,
    plane: 0.15,
    refactor: 0.15,
    compression: 0.15,
    expansion: 0.15
  };

  const score =
    complexityScore * weights.complexity +
    anomalyScore * weights.anomalies +
    planeScore * weights.plane +
    refactorScore * weights.refactor +
    compressionScore * weights.compression +
    expansionScore * weights.expansion;

  return {
    score: Math.round(score * 100),
    components: {
      complexityScore,
      anomalyScore,
      planeScore,
      refactorScore,
      compressionScore,
      expansionScore
    },
    raw: {
      transitionCount,
      anomalyCount,
      planeSuggestions: planeSuggestions.length,
      refactorSuggestions: refactorSuggestions.length,
      compressionSuggestions: compressionSuggestions.length,
      expansionSuggestions: expansionSuggestions.length
    }
  };
}

/**
 * Pretty-print health score
 */
export function printRoutingHealthScore() {
  const result = computeRoutingHealthScore();

  console.log("\n=== ROUTING HEALTH SCORE ===\n");

  console.log(`Overall Health Score: ${result.score}/100\n`);

  console.log("Component Scores:");
  console.log(` - Complexity: ${Math.round(result.components.complexityScore * 100)}`);
  console.log(` - Anomalies: ${Math.round(result.components.anomalyScore * 100)}`);
  console.log(` - Plane Balance: ${Math.round(result.components.planeScore * 100)}`);
  console.log(` - Refactor Load: ${Math.round(result.components.refactorScore * 100)}`);
  console.log(` - Compression Load: ${Math.round(result.components.compressionScore * 100)}`);
  console.log(` - Expansion Pressure: ${Math.round(result.components.expansionScore * 100)}\n`);

  console.log("Raw Metrics:");
  console.log(` - Transitions: ${result.raw.transitionCount}`);
  console.log(` - Anomalies: ${result.raw.anomalyCount}`);
  console.log(` - Plane Suggestions: ${result.raw.planeSuggestions}`);
  console.log(` - Refactor Suggestions: ${result.raw.refactorSuggestions}`);
  console.log(` - Compression Suggestions: ${result.raw.compressionSuggestions}`);
  console.log(` - Expansion Suggestions: ${result.raw.expansionSuggestions}\n`);

  console.log("=== END ===\n");
}
