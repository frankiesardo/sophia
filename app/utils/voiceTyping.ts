export const startVoiceTyping = (
  setInput: (value: string) => void,
  setIsRecording: (value: boolean) => void
) => {
  if ("webkitSpeechRecognition" in window) {
    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0])
        .map((result) => result.transcript)
        .join("");

      setInput(transcript);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.start();
    setIsRecording(true);

    return recognition;
  } else {
    console.error("Speech recognition not supported");
    return null;
  }
};

export const stopVoiceTyping = (recognition: any) => {
  if (recognition) {
    recognition.stop();
  }
};
