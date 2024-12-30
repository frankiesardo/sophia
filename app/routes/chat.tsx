import { useChat } from "ai/react";
import { useState, useRef, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Card, CardContent } from "~/components/ui/card";
import { startVoiceTyping, stopVoiceTyping } from "~/utils/voiceTyping";
import { useParams } from "react-router";
import ReactMarkdown from "react-markdown";

export default function Chat() {
  const { bookId } = useParams();
  const { messages, input, handleInputChange, handleSubmit, setInput } =
    useChat({ api: "/api/" + bookId });
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        stopVoiceTyping(recognitionRef.current);
      }
    };
  }, []);

  const handleVoiceTyping = () => {
    if (isRecording) {
      stopVoiceTyping(recognitionRef.current);
      setIsRecording(false);
    } else {
      recognitionRef.current = startVoiceTyping(setInput, setIsRecording);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardContent className="p-4">
        <div className="space-y-4">
          {messages.map((m) => (
            <div key={m.id} className="flex items-start gap-2">
              <span className="font-bold">
                {m.role === "user" ? "You:" : "AI:"}
              </span>
              <div className="prose dark:prose-invert">
                <ReactMarkdown>{m.content}</ReactMarkdown>
              </div>
            </div>
          ))}
        </div>
        <form onSubmit={handleSubmit} className="mt-4 flex items-center gap-2">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Type your message..."
            className="flex-grow"
          />
          <Button type="submit">Send</Button>
          <Button type="button" onClick={handleVoiceTyping}>
            {isRecording ? "Stop" : "Voice"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
