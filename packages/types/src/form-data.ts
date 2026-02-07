export type BaseFormData = {
  question: string;
  answer: string;
  deck: string;
  tags: string[];
};

export type FormDataType = BaseFormData &
  (
    | { type: "text" }
    | {
        type: "code";
        language: string;
        questionCode?: string;
        answerCode?: string;
      }
    | { type: "image"; questionFile?: string; answerFile?: string }
    | {
        type: "mcq";
        options: string[];
        correctOptionIndex: number;
      }
  );

export type TextFormData = BaseFormData & {
  type: "text";
};

export type CodeFormData = BaseFormData & {
  type: "code";
  language: string;
  questionCode?: string;
  answerCode?: string;
};

export type ImageFormData = BaseFormData & {
  type: "image";
  questionFile?: string;
  answerFile?: string;
};

export type McqFormData = BaseFormData & {
  type: "mcq";
  options: string[];
  correctOptionIndex: number;
};

export type FormData =
  | TextFormData
  | CodeFormData
  | ImageFormData
  | McqFormData;

export function isTextFormData(data: FormData): data is TextFormData {
  return data.type === "text";
}

export function isCodeFormData(data: FormData): data is CodeFormData {
  return data.type === "code";
}

export function isImageFormData(data: FormData): data is ImageFormData {
  return data.type === "image";
}

export function isMcqFormData(data: FormData): data is McqFormData {
  return data.type === "mcq";
}
