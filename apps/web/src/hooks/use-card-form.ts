import type { FormDataType, QUESTION_TYPES } from "@shared/types";
import { type ChangeEvent, useMemo, useReducer } from "react";

type FormAction =
  | { type: "CHANGE_TYPE"; payload: "text" | "code" | "image" }
  | { type: "UPDATE_FIELD"; payload: { field: string; value: string } }
  | { type: "SET_DECK"; payload: string }
  | {
      type: "SET_FILE";
      payload: { field: "questionFile" | "answerFile"; value: string };
    }
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
        ...(state.type === "code" && {
          questionCode: "",
          answerCode: "",
          language: "",
        }),
        ...(state.type === "image" && { questionFile: "", answerFile: "" }),
      };
    case "SET_FILE":
      return {
        ...state,
        [action.payload.field]: action.payload.value,
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
    }),
    []
  );

  return {
    formData,
    dispatch,
    handlers,
  };
}
