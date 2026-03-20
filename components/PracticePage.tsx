"use client";

import Player from "@/components/Player";
import Recorder from "@/components/Recorder";
import CelebrationBanner from "@/components/practice/CelebrationBanner";
import LearningStatsCard from "@/components/practice/LearningStatsCard";
import PronunciationFeedbackPanel from "@/components/practice/PronunciationFeedbackPanel";
import SaveMessageBanner from "@/components/practice/SaveMessageBanner";
import SentenceEditorSection from "@/components/practice/SentenceEditorSection";
import TextFeedbackPanel from "@/components/practice/TextFeedbackPanel";
import usePracticePage from "@/components/practice/usePracticePage";
import Button, { BUTTON_SIZES, BUTTON_VARIANTS } from "@/components/ui/Button";

export default function PracticePage() {
  const {
    aiFeedback,
    applySuggestion,
    analyzeSelectedText,
    difficultyLevel,
    feedbackError,
    generateExampleSentence,
    handleRecordedAudio,
    handleTextChange,
    isAnalyzing,
    isGeneratingSentence,
    isSaveDisabled,
    isSaving,
    isTextAnalyzing,
    learningStats,
    saveMessage,
    saveToHistory,
    selectedText,
    selectionRange,
    sentenceGenerationError,
    showNinetyCelebration,
    spokenText,
    setDifficultyLevel,
    text,
    textFeedback,
    textFeedbackError,
    textareaRef,
    updateSelectionState,
  } = usePracticePage();

  return (
    <main className="flex min-h-full flex-col gap-6 wrap-break-word p-4 sm:p-6">
      <h1 className="text-2xl font-bold sm:text-3xl">Practice</h1>

      <LearningStatsCard learningStats={learningStats} />

      {showNinetyCelebration && <CelebrationBanner />}

      <SentenceEditorSection
        difficultyLevel={difficultyLevel}
        isGeneratingSentence={isGeneratingSentence}
        sentenceGenerationError={sentenceGenerationError}
        text={text}
        selectedText={selectedText}
        selectionRange={selectionRange}
        isTextAnalyzing={isTextAnalyzing}
        textareaRef={textareaRef}
        onDifficultyChange={setDifficultyLevel}
        onGenerateSentence={() => void generateExampleSentence()}
        onTextChange={handleTextChange}
        onTextSelect={updateSelectionState}
        onAnalyzeText={() => void analyzeSelectedText()}
      />

      <div className="grid w-full max-w-2xl grid-cols-1 gap-3 sm:flex sm:flex-wrap">
        <Player text={text} selectedText={selectedText} />
        <Recorder onRecorded={handleRecordedAudio} disabled={isAnalyzing} />
        <Button
          onClick={saveToHistory}
          variant={BUTTON_VARIANTS.primary}
          size={BUTTON_SIZES.lg}
          fullWidth
          className="sm:w-auto"
          disabled={isSaveDisabled}
        >
          {isSaving ? "Saving..." : "Save to History"}
        </Button>
      </div>

      {saveMessage && <SaveMessageBanner saveMessage={saveMessage} />}

      <TextFeedbackPanel
        isTextAnalyzing={isTextAnalyzing}
        textFeedback={textFeedback}
        textFeedbackError={textFeedbackError}
        onApplySuggestion={applySuggestion}
      />

      {spokenText && (
        <p className="ui-text-muted">
          <strong>You said:</strong> {spokenText}
        </p>
      )}

      <PronunciationFeedbackPanel
        isAnalyzing={isAnalyzing}
        aiFeedback={aiFeedback}
        feedbackError={feedbackError}
      />
    </main>
  );
}
