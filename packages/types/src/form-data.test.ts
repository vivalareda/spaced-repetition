import { describe, expect, it } from "vitest";
import {
  CARD_TYPES,
  changeCardType,
  emptyCardForm,
  type ImageFormData,
  type McqFormData,
  patchCardForm,
  toCardInput,
} from "./form-data";

describe("changeCardType", () => {
  it.each(CARD_TYPES)(
    "keeps the common fields when switching to %s",
    (type) => {
      const form = {
        ...emptyCardForm("code"),
        question: "Q",
        answer: "A",
        deck: "Deck",
        tags: ["tag"],
      };
      expect(changeCardType(form, type)).toMatchObject({
        type,
        question: "Q",
        answer: "A",
        deck: "Deck",
        tags: ["tag"],
      });
    }
  );

  it("drops the previous type's fields", () => {
    const code = { ...emptyCardForm("code"), questionCode: "x = 1" };
    expect(changeCardType(code, "text")).not.toHaveProperty("questionCode");
  });

  it("leaves the form unchanged when re-selecting its type", () => {
    const mcq = { ...emptyCardForm("mcq"), options: ["a", "b", "c"] };
    expect(changeCardType(mcq, "mcq")).toBe(mcq);
  });
});

describe("patchCardForm", () => {
  it("merges the patch into the current form", () => {
    const form = { ...emptyCardForm("image"), question: "typed meanwhile" };
    expect(
      patchCardForm<ImageFormData>(form, "image", { questionFile: "file-id" })
    ).toEqual({ ...form, questionFile: "file-id" });
  });

  it("drops a patch meant for a type the form no longer has", () => {
    const form = emptyCardForm("text");
    expect(
      patchCardForm<ImageFormData>(form, "image", { questionFile: "file-id" })
    ).toBe(form);
  });
});

describe("toCardInput", () => {
  it("turns the form type into cardType", () => {
    const input = toCardInput({ ...emptyCardForm("text"), question: "Q" });
    expect(input).toEqual({
      cardType: "text",
      question: "Q",
      answer: "",
      deck: "",
      tags: [],
    });
  });

  it("uses the correct option as the answer of an MCQ without explanation", () => {
    const mcq: McqFormData = {
      ...(emptyCardForm("mcq") as McqFormData),
      options: ["a", "b"],
      correctOptionIndex: 1,
    };
    expect(toCardInput(mcq).answer).toBe("b");
    expect(toCardInput({ ...mcq, answer: "because" }).answer).toBe("because");
  });
});
