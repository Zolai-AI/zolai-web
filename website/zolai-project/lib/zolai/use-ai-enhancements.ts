/**
 * Hook for AI Enhancements in Tutor & Chat
 * Integrates reusable enhancement utilities
 */

import { useState, useCallback } from "react";
import {
  generateErrorFeedback,
  scoreConfidence,
  generateAlternatives,
  addCulturalContext,
  generatePronunciationGuide,
  updateLearningProgress,
  recommendNextLevel,
  detectCodeSwitching,
  explainIdiom,
  processFeedback,
  evaluateResponseQuality,
  type ConversationMemory,
  type ResponseEnhancement,
} from "@/lib/zolai/ai-enhancements";

export function useAIEnhancements() {
  const [memory, setMemory] = useState<ConversationMemory | null>(null);
  const [successRate, setSuccessRate] = useState(0.5);

  const enhanceResponse = useCallback(
    (
      response: string,
      options: {
        errorType?: "grammar" | "vocabulary" | "pronunciation" | "dialect";
        correctForm?: string;
        source?: "bible" | "dictionary" | "wiki" | "corpus" | "ai";
        context?: "formal" | "casual" | "poetic";
        showAlternatives?: boolean;
        showCulturalContext?: boolean;
        showPronunciation?: boolean;
      } = {}
    ): ResponseEnhancement => {
      const enhanced: ResponseEnhancement = { original: response };

      // Error correction
      if (options.errorType && options.correctForm) {
        enhanced.withCorrection = generateErrorFeedback(
          response,
          options.correctForm,
          options.errorType
        );
      }

      // Confidence scoring
      const hasSource = !!options.source;
      const isFromCorpus = options.source === "corpus" || options.source === "bible";
      enhanced.confidence = scoreConfidence(response, hasSource, isFromCorpus);

      // Source attribution
      if (options.source) {
        enhanced.source = options.source;
      }

      // Alternatives
      if (options.showAlternatives) {
        enhanced.alternatives = generateAlternatives(
          response,
          options.context || "casual"
        );
      }

      // Cultural context
      if (options.showCulturalContext) {
        enhanced.culturalContext = addCulturalContext(
          response,
          "Cultural significance explanation"
        );
      }

      // Pronunciation
      if (options.showPronunciation) {
        enhanced.pronunciation = generatePronunciationGuide(
          response,
          "[IPA]",
          "Pronunciation tips"
        );
      }

      return enhanced;
    },
    []
  );

  const trackProgress = useCallback(
    (topic: string, success: boolean) => {
      if (!memory) return;
      const updated = updateLearningProgress(memory, topic, success);
      setMemory(updated);

      // Update success rate
      const newRate =
        (successRate * 10 + (success ? 1 : 0)) / 11;
      setSuccessRate(newRate);
    },
    [memory, successRate]
  );

  const getNextLevel = useCallback(
    (currentLevel: "A1" | "A2" | "B1" | "B2" | "C1" | "C2") => {
      return recommendNextLevel(currentLevel, successRate);
    },
    [successRate]
  );

  const checkCodeSwitching = useCallback((text: string) => {
    return detectCodeSwitching(text);
  }, []);

  const explainWord = useCallback((word: string) => {
    return explainIdiom(word);
  }, []);

  const handleFeedback = useCallback(
    (
      originalResponse: string,
      userCorrection: string,
      feedbackType: "helpful" | "incorrect"
    ) => {
      const result = processFeedback(
        originalResponse,
        userCorrection,
        feedbackType
      );
      if (memory && result.learned) {
        trackProgress(result.pattern, feedbackType === "helpful");
      }
      return result;
    },
    [memory, trackProgress]
  );

  const evaluateQuality = useCallback((response: string) => {
    return evaluateResponseQuality(response);
  }, []);

  return {
    enhanceResponse,
    trackProgress,
    getNextLevel,
    checkCodeSwitching,
    explainWord,
    handleFeedback,
    evaluateQuality,
    memory,
    successRate,
  };
}
