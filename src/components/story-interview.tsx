"use client";

import { useState } from "react";
import type {
  FollowUpAnswerStatus,
  StoryFollowUpAnswer,
  StoryFollowUpQuestion,
  StoryQuestionId,
} from "@/lib/story-assistance";

type StoryInterviewProps = {
  questions: StoryFollowUpQuestion[];
  isReviewing: boolean;
  onReview: (answers: StoryFollowUpAnswer[]) => void;
};

const statusLabels: Record<FollowUpAnswerStatus, string> = {
  answered: "ตอบแล้ว",
  unknown: "ไม่ทราบ",
  skipped: "ข้ามก่อน",
};

export function StoryInterview({ questions, isReviewing, onReview }: StoryInterviewProps) {
  const [answers, setAnswers] = useState<StoryFollowUpAnswer[]>([]);
  const [activeQuestionId, setActiveQuestionId] = useState<StoryQuestionId | null>(questions[0]?.id ?? null);
  const [draft, setDraft] = useState("");
  const [validationMessage, setValidationMessage] = useState("");
  const currentQuestion = questions.find((question) => question.id === activeQuestionId) ?? null;
  const completedCount = questions.filter((question) => answers.some((answer) => answer.questionId === question.id)).length;
  const isRoundComplete = questions.length > 0 && completedCount === questions.length;
  const progress = questions.length > 0 ? Math.round((completedCount / questions.length) * 100) : 100;

  function openQuestion(questionId: StoryQuestionId) {
    const existingAnswer = answers.find((answer) => answer.questionId === questionId);
    setActiveQuestionId(questionId);
    setDraft(existingAnswer?.status === "answered" ? existingAnswer.answer : "");
    setValidationMessage("");
  }

  function saveAnswer(status: FollowUpAnswerStatus) {
    if (!currentQuestion) return;

    const normalizedAnswer = draft.trim();
    if (status === "answered" && normalizedAnswer.length < 2) {
      setValidationMessage("กรุณาตอบสั้น ๆ อย่างน้อย 2 ตัวอักษร หรือเลือก “ไม่ทราบ” หรือ “ข้ามก่อน”");
      return;
    }

    const nextAnswers = [
      ...answers.filter((answer) => answer.questionId !== currentQuestion.id),
      {
        questionId: currentQuestion.id,
        status,
        answer: status === "answered" ? normalizedAnswer : "",
      },
    ];
    const nextQuestion = questions.find((question) => !nextAnswers.some((answer) => answer.questionId === question.id));

    setAnswers(nextAnswers);
    setActiveQuestionId(nextQuestion?.id ?? null);
    setDraft("");
    setValidationMessage("");
  }

  if (questions.length === 0) return null;

  return (
    <section className="mt-6 border-t-4 border-saffron bg-[#fffaf0] p-5 sm:p-6" aria-labelledby="story-interview-title">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold tracking-[0.12em] text-coral">สัมภาษณ์ข้อมูลที่ยังขาด</p>
          <h3 id="story-interview-title" className="mt-1 text-xl font-bold text-ink">ระบบขอถามเพิ่มทีละข้อ</h3>
        </div>
        <span className="bg-white px-3 py-1 text-xs font-bold text-river">{completedCount} / {questions.length} ข้อ</span>
      </div>

      <div
        className="mt-4 h-2 overflow-hidden bg-white"
        role="progressbar"
        aria-label="ความคืบหน้าการตอบคำถามเพิ่มเติม"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
      >
        <div className="h-full bg-river transition-[width]" style={{ width: `${progress}%` }} />
      </div>
      <p className="mt-3 text-xs leading-5 text-ink-soft">
        คำถามมาจากรายการที่ผู้เชี่ยวชาญกำหนดไว้ล่วงหน้า ส่วน AI ช่วยสรุปคำตอบเท่านั้น ตอบเท่าที่ทราบและไม่ต้องใส่เลขบัตร รหัสผ่าน เลขบัญชี ที่อยู่เต็ม หรือข้อมูลติดต่อส่วนตัว
      </p>

      {currentQuestion ? (
        <div className="mt-5 border border-line bg-white p-5">
          <p className="text-xs font-bold text-river">คำถามที่ {questions.findIndex((question) => question.id === currentQuestion.id) + 1}</p>
          <label htmlFor={`follow-up-${currentQuestion.id}`} className="mt-2 block text-base font-bold leading-7 text-ink">
            {currentQuestion.question}
          </label>
          <p className="mt-2 text-xs leading-5 text-ink-soft">เหตุผลที่ถาม: {currentQuestion.purpose}</p>
          <textarea
            id={`follow-up-${currentQuestion.id}`}
            value={draft}
            onChange={(event) => setDraft(event.target.value.slice(0, 400))}
            maxLength={400}
            placeholder="ตอบตามที่ทราบ หรือเลือกตัวเลือกด้านล่าง"
            className="mt-4 min-h-32 w-full resize-y border border-line bg-[#fbfcfa] p-4 text-base leading-7 text-ink placeholder:text-[#8ba0a5] focus:border-river focus:outline-none"
            autoFocus
          />
          <div className="mt-2 flex justify-between text-xs text-ink-soft">
            <span>{draft.length} / 400 ตัวอักษร</span>
            {validationMessage && <span className="font-semibold text-coral" role="alert">{validationMessage}</span>}
          </div>
          <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-4">
              <button type="button" onClick={() => saveAnswer("unknown")} className="min-h-11 text-sm font-bold text-ink-soft underline underline-offset-4">
                ไม่ทราบ
              </button>
              <button type="button" onClick={() => saveAnswer("skipped")} className="min-h-11 text-sm font-bold text-ink-soft underline underline-offset-4">
                ข้ามก่อน
              </button>
            </div>
            <button type="button" onClick={() => saveAnswer("answered")} className="min-h-12 bg-river px-6 py-3 font-bold text-white hover:bg-ink">
              บันทึกและไปข้อต่อไป →
            </button>
          </div>
        </div>
      ) : isRoundComplete ? (
        <div className="mt-5 border border-line bg-white p-5">
          <h4 className="text-base font-bold text-ink">ตรวจคำตอบรอบนี้ก่อนให้ระบบตรวจความครบถ้วน</h4>
          <ul className="mt-4 space-y-3">
            {questions.map((question) => {
              const answer = answers.find((item) => item.questionId === question.id);
              if (!answer) return null;

              return (
                <li key={question.id} className="grid gap-2 border-b border-line pb-3 sm:grid-cols-[1fr_auto] sm:items-start">
                  <div>
                    <p className="text-sm font-bold text-ink">{question.label}</p>
                    <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-ink-soft">
                      {answer.status === "answered" ? answer.answer : statusLabels[answer.status]}
                    </p>
                  </div>
                  <button type="button" onClick={() => openQuestion(question.id)} className="text-left text-xs font-bold text-river underline underline-offset-4 sm:text-right">
                    แก้ไข
                  </button>
                </li>
              );
            })}
          </ul>
          <button
            type="button"
            onClick={() => onReview(answers)}
            disabled={isReviewing}
            className="mt-5 min-h-12 w-full bg-ink px-6 py-3 font-bold text-white hover:bg-river disabled:cursor-not-allowed disabled:bg-[#b8c3c5]"
          >
            {isReviewing ? "กำลังตรวจและเรียบเรียง…" : "ยืนยันคำตอบและตรวจอีกครั้ง →"}
          </button>
        </div>
      ) : null}
    </section>
  );
}
