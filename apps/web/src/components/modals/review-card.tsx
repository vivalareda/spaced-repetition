import { useState } from "react";
import SyntaxHighlighter from "react-syntax-highlighter";
import { atomOneLight } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";

type ReviewCardProps = {
  question: string;
  answer: string;
  code_block: string;
  language: string;
};

export function ReviewCard({
  question,
  answer,
  code_block,
  language,
}: ReviewCardProps) {
  const [showAnswer, setShowAnswer] = useState(false);

  const getCorrectAnswerText = () => {
    const parts = answer.split(/(\*\*.*?\*\*)/g);

    return parts.map((part) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={part}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <>
      <Card
        aria-labelledby="q-title"
        className="mx-auto w-full max-w-[min(880px,92vw)] shadow-lg"
        role="group"
      >
        <CardHeader className="space-y-2">
          <p className="font-medium text-muted-foreground text-sm">
            Question 1 of 10
          </p>
          <h2 className="font-semibold text-3xl leading-tight" id="q-title">
            {question}
          </h2>
        </CardHeader>

        <CardContent className="grid grid-cols-1 gap-[clamp(12px,2vw,20px)] pt-4 text-left sm:grid-cols-2">
          <div className="relative col-span-1 sm:col-span-2">
            <SyntaxHighlighter
              customStyle={{
                width: "100%",
                margin: 0,
                borderRadius: "0.5rem",
                backgroundColor: "transparent",
                padding: "1rem",
              }}
              language={language}
              PreTag="div"
              showLineNumbers={false}
              style={atomOneLight}
              wrapLines={false}
            >
              {code_block}
            </SyntaxHighlighter>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center pt-4">
          {showAnswer ? (
            <div className="fade-in slide-in-from-bottom-10 w-full max-w-2xl animate-in rounded-lg border-2 border-primary/20 bg-white/50 p-6 text-center duration-700">
              <p className="text-lg leading-relaxed">
                {getCorrectAnswerText()}
              </p>
            </div>
          ) : (
            <Button
              className="w-full max-w-md"
              onClick={() => setShowAnswer(true)}
            >
              Show Answer
            </Button>
          )}
        </CardFooter>
      </Card>
      {showAnswer && (
        <div className="flex w-full justify-center gap-12 p-4 pt-8">
          <Button className="fade-in slide-in-from-bottom-10 col-span-1 w-34 animate-in bg-green-300 duration-500">
            Easy
          </Button>
          <Button className="fade-in slide-in-from-bottom-10 col-span-1 w-34 animate-in bg-orange-300 duration-500">
            Medium
          </Button>
          <Button className="fade-in slide-in-from-bottom-10 col-span-1 w-34 animate-in bg-red-400 duration-500">
            Hard
          </Button>
        </div>
      )}
    </>
  );
}
