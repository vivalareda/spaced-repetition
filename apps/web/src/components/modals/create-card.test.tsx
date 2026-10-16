import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { getFunctionName } from "convex/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CreateCardModal } from "@/components/modals/create-card";
import { useModalStore } from "@/hooks/use-modal-store";

const mutations: Record<string, ReturnType<typeof vi.fn>> = {};

vi.mock("convex/react", () => ({
  useMutation: (ref: Parameters<typeof getFunctionName>[0]) =>
    mutations[getFunctionName(ref)],
}));
vi.mock("@tanstack/react-router", () => ({ useNavigate: () => vi.fn() }));
vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock("@/hooks/use-user-data", () => ({
  useUserSynced: () => true,
  useUserQuery: () => [],
}));

/** A promise plus the functions that settle it, to finish an upload on cue. */
function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((res) => {
    resolve = res;
  });
  return { promise, resolve };
}

const createCard = vi.fn();
let uploadResponse: ReturnType<typeof deferred<Response>>;

beforeEach(() => {
  createCard.mockReset().mockResolvedValue(undefined);
  mutations["cards:createCard"] = createCard;
  mutations["cards:generateUploadUrl"] = vi
    .fn()
    .mockResolvedValue("https://upload.test");
  uploadResponse = deferred<Response>();
  vi.stubGlobal(
    "fetch",
    vi.fn(() => uploadResponse.promise)
  );
  useModalStore
    .getState()
    .onOpen("create-card", { questionType: "image", onSubmit: vi.fn() });
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  useModalStore.getState().onClose();
});

function pickImageAndUpload() {
  fireEvent.click(screen.getByText("modals.createCard.addQuestionFile"));
  const file = new File(["png"], "cat.png", { type: "image/png" });
  fireEvent.change(document.getElementById("file") as HTMLInputElement, {
    target: { files: [file] },
  });
  fireEvent.click(screen.getByText("modals.fileUpload.upload"));
}

describe("create-card image upload", () => {
  it("keeps the upload dialog open until the upload lands, then saves its id with the card", async () => {
    render(<CreateCardModal />);
    fireEvent.change(screen.getByLabelText("modals.createCard.questionLabel"), {
      target: { value: "What is this?" },
    });
    pickImageAndUpload();

    await screen.findByText("modals.fileUpload.uploading");
    // Escape is ignored while uploading, so the result can't be lost.
    fireEvent.keyDown(document.activeElement ?? document.body, {
      key: "Escape",
    });
    expect(screen.getByText("modals.fileUpload.title")).toBeTruthy();

    uploadResponse.resolve(Response.json({ storageId: "storage-1" }));
    await screen.findByText("modals.createCard.editQuestionFile");
    expect(screen.queryByText("modals.fileUpload.title")).toBeNull();

    fireEvent.click(screen.getByText("modals.createCard.create"));
    await vi.waitFor(() => expect(createCard).toHaveBeenCalled());
    expect(createCard.mock.calls[0][0]).toMatchObject({
      cardType: "image",
      question: "What is this?",
      questionFile: "storage-1",
    });
  });

  it("shows a failed upload and keeps the dialog open to retry", async () => {
    render(<CreateCardModal />);
    pickImageAndUpload();
    uploadResponse.resolve(new Response("nope", { status: 500 }));

    await screen.findByText("modals.createCard.uploadFailed");
    expect(screen.getByText("modals.fileUpload.title")).toBeTruthy();
    expect(screen.getByText("modals.createCard.addQuestionFile")).toBeTruthy();
  });
});
