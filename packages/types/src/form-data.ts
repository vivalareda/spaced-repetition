export type BaseFormData = {
  question: string;
  answer: string;
  deck: string;
  tags: string[];
};

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

export type FormDataType =
  | TextFormData
  | CodeFormData
  | ImageFormData
  | McqFormData;

export function isTextFormData(data: FormDataType): data is TextFormData {
  return data.type === "text";
}

export function isCodeFormData(data: FormDataType): data is CodeFormData {
  return data.type === "code";
}

export function isImageFormData(data: FormDataType): data is ImageFormData {
  return data.type === "image";
}

export function isMcqFormData(data: FormDataType): data is McqFormData {
  return data.type === "mcq";
}
