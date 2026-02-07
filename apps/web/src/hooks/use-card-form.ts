import type { FormDataType, QUESTION_TYPES } from "@shared/types";
import { type ChangeEvent, useMemo, useReducer } from "react";

const DEFAULT_MCQ_OPTIONS = ["", ""];
const DEFAULT_CORRECT_OPTION_INDEX = 0;

type FormAction =
  | { type: "CHANGE_TYPE"; payload: "text" | "code" | "image" | "mcq" }
  | { type: "UPDATE_FIELD"; payload: { field: string; value: string } }
  | { type: "SET_DECK"; payload: string }
  | {
      type: "SET_FILE";
      payload: { field: "questionFile" | "answerFile"; value: string };
    }
  | { type: "SET_OPTIONS"; payload: string[] }
  | { type: "SET_CORRECT_OPTION"; payload: number }
  | { type: "RESET" };

const formReducer = (state: FormDataType, action: FormAction): FormDataType => {
  switch (action.type) {
    case "CHANGE_TYPE":
      switch (action.payload) {
        case "code":
          return {
            type: "code",
            questionCode: "",
            answerCode: "",
            language: "",
            deck: state.deck,
            tags: state.tags,
            question: state.question,
            answer: state.answer,
          };
        case "image":
          return {
            type: "image",
            questionFile: "",
            answerFile: "",
            answer: state.answer,
            deck: state.deck,
            tags: state.tags,
            question: state.question,
          };
        case "text":
          return {
            type: "text",
            question: state.question,
            answer: state.answer,
            deck: state.deck,
            tags: state.tags,
          };
        case "mcq":
          return {
            type: "mcq",
            question: state.question,
            answer: state.answer,
            deck: state.deck,
            tags: state.tags,
            options: DEFAULT_MCQ_OPTIONS,
            correctOptionIndex: DEFAULT_CORRECT_OPTION_INDEX,
          };
        default:
          throw new Error(`Invalid type, ${action satisfies never}`);
      }
    case "UPDATE_FIELD":
      return {
        ...state,
        [action.payload.field]: action.payload.value,
      };
    case "SET_DECK":
      return {
        ...state,
        deck: action.payload,
      };
    case "RESET":
      return {
        type: "text",
        question: "",
        answer: "",
        deck: "",
        tags: [],
      };
    case "SET_FILE":
      return {
        ...state,
        [action.payload.field]: action.payload.value,
      };
    case "SET_OPTIONS":
      if (state.type !== "mcq") {
        return state;
      }
      return {
        ...state,
        options: action.payload,
      };
    case "SET_CORRECT_OPTION":
      if (state.type !== "mcq") {
        return state;
      }
      return {
        ...state,
        correctOptionIndex: action.payload,
      };
    default:
      throw new Error(`Invalid action type, ${action satisfies never}`);
  }
};

export function useCardForm() {
  const [formData, dispatch] = useReducer(formReducer, {
    type: "text",
    question: "",
    answer: "",
    deck: "",
    tags: [],
  });

  const handlers = useMemo(
    () => ({
      questionTypeChange: (newType: (typeof QUESTION_TYPES)[number]) =>
        dispatch({ type: "CHANGE_TYPE", payload: newType }),
      fieldChange: (
        event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      ) =>
        dispatch({
          type: "UPDATE_FIELD",
          payload: { field: event.target.id, value: event.target.value },
        }),
      deckSelect: (deck: string) =>
        dispatch({ type: "SET_DECK", payload: deck }),
      languageChange: (language: string) =>
        dispatch({
          type: "UPDATE_FIELD",
          payload: { field: "language", value: language },
        }),
      questionCodeChange: (code: string) =>
        dispatch({
          type: "UPDATE_FIELD",
          payload: { field: "questionCode", value: code },
        }),
      answerCodeChange: (code: string) =>
        dispatch({
          type: "UPDATE_FIELD",
          payload: { field: "answerCode", value: code },
        }),
      fileUploadSave: (storageId: string, uploadFor: "question" | "answer") =>
        dispatch({
          type: "SET_FILE",
          payload: {
            field: uploadFor === "question" ? "questionFile" : "answerFile",
            value: storageId,
          },
        }),
      optionsChange: (options: string[]) =>
        dispatch({ type: "SET_OPTIONS", payload: options }),
      correctOptionChange: (index: number) =>
        dispatch({ type: "SET_CORRECT_OPTION", payload: index }),
    }),
    []
  );

  return {
    formData,
    dispatch,
    handlers,
  };
}
