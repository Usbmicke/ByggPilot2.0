
/**
 * @file Centralized configuration for model IDs and other AI-related constants.
 * This aligns with the Tiered Model Architecture defined in the technical specification.
 */

// These are the correct, latest, production-ready model IDs as of June 2024.
export const MODELS = {
  /**
   * The default, cost-effective model for general-purpose tasks.
   * Correct ID for the latest Gemini 1.5 Flash model.
   * Use Case: Standard chat, simple Q&A, intent classification.
   */
  DEFAULT_TIER: 'gemini-2.5-flash',

  /**
   * The powerful, escalation model for complex tasks.
   * Correct ID for the latest Gemini 1.5 Pro model.
   * Use Case: Code generation, complex reasoning, heavy tool use.
   */
  HEAVY_TIER: 'gemini-2.5-pro',

  /**
   * An experimental model for future development and testing.
   * This is a fictional example and should be replaced with a real model ID when available.
   */
  EXPERIMENTAL_TIER: 'gemini-2.5-flash',
};
