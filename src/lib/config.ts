/**
 * @file Centralized configuration for model IDs and other AI-related constants.
 * This aligns with the Tiered Model Architecture defined in the technical specification.
 */

// As of November 2025, these are the stable, production-ready model IDs.
export const MODELS = {
  /**
   * The default, cost-effective model for general-purpose tasks.
   * Use Case: Standard chat, simple Q&A, intent classification.
   * Expected to handle >95% of traffic.
   */
  DEFAULT_TIER: 'gemini-2.5-flash-111525',

  /**
   * The powerful, escalation model for complex tasks.
   * Use Case: Code generation, complex reasoning, heavy tool use.
   * To be used only when a task is explicitly identified as 'heavy'.
   */
  HEAVY_TIER: 'gemini-2.5-pro-111525',

  /**
   * The next-generation, experimental model.
   * Use Case: FOR R&D AND EVALUATION ONLY. NOT FOR PRODUCTION USE.
   */
  EXPERIMENTAL_TIER: 'gemini-3.0-preview'
};
