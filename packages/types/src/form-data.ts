// State of the web app's create-card form, and its conversion into the
// backend's card input.

export const CARD_TYPES = ["text", "code", "image", "mcq"] as const;
export type CardType = (typeof CARD_TYPES)[number];

/** Fields every card type has; they survive switching the form's card type. */
type CommonFields = {
  question: string;
  answer: string;
  deck: string;
  tags: string[];
};

export type TextFormData = CommonFields & { type: "text" };

export type CodeFormData = CommonFields & {
  type: "code";
  language: string;
  questionCode: string;
  answerCode: string;
};

export type ImageFormData = CommonFields & {
  type: "image";
  /** Storage ids of uploaded images. */
  questionFile?: string;
  answerFile?: string;
};

export type McqFormData = CommonFields & {
  type: "mcq";
  options: string[];
  correctOptionIndex: number;
};

export type FormDataType =
  | TextFormData
  | CodeFormData
  | ImageFormData
  | McqFormData;

// Matches the language the code editor previews when none is picked.
const DEFAULT_CODE_LANGUAGE = "javascript";
const DEFAULT_MCQ_OPTION_COUNT = 2;

const EMPTY_COMMON_FIELDS: CommonFields = {
  question: "",
  answer: "",
  deck: "",
  tags: [],
};

/**
 * Switches `form` to card type `type`, keeping its common fields and starting
 * the type-specific ones empty. Re-selecting the current type changes nothing.
 */
export function changeCardType(
  form: FormDataType,
  type: CardType
): FormDataType {
  if (form.type === type) {
    return form;
  }
  const common: CommonFields = {
    question: form.question,
    answer: form.answer,
    deck: form.deck,
    tags: form.tags,
  };
  switch (type) {
    case "text":
      return { ...common, type };
    case "code":
      return {
        ...common,
        type,
        language: DEFAULT_CODE_LANGUAGE,
        questionCode: "",
        answerCode: "",
      };
    case "image":
      return { ...common, type };
    case "mcq":
      return {
        ...common,
        type,
        options: new Array(DEFAULT_MCQ_OPTION_COUNT).fill(""),
        correctOptionIndex: 0,
      };
    default:
      throw new Error(`Unknown card type: ${type satisfies never}`);
  }
}

/** A blank form for a new card of type `type`. */
export function emptyCardForm(type: CardType): FormDataType {
  return changeCardType({ ...EMPTY_COMMON_FIELDS, type: "text" }, type);
}

/**
 * Applies `patch` to `form` if the form still has card type `type`. Edits that
 * finish late (e.g. an image upload) are dropped once the user has switched
 * to another type, instead of mixing fields from both.
 */
export function patchCardForm<Form extends FormDataType>(
  form: FormDataType,
  type: Form["type"],
  patch: Partial<Omit<Form, "type">>
): FormDataType {
  return form.type === type ? ({ ...form, ...patch } as FormDataType) : form;
}

/**
 * The card-creation input for a filled-in form: `type` becomes `cardType`, and
 * an MCQ card without an explanation uses its correct option as the answer.
 */
export function toCardInput(form: FormDataType) {
  const { type, ...fields } = form;
  if (form.type === "mcq" && !form.answer) {
    return {
      ...fields,
      cardType: type,
      answer: form.options[form.correctOptionIndex] ?? "",
    };
  }
  return { ...fields, cardType: type };
}
