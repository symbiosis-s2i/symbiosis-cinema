import {
  Audio,
  Series,
  Video,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import transcript from "../public/transcript.json";

export const MyComposition = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const currentTime = frame / fps;

  const activeWord = transcript.words?.find(
    (w: { word: string; start: number; end: number }) =>
      currentTime >= w.start && currentTime <= w.end
  );

  return (
    <>
      {/* Global voiceover */}
      <Audio src={require("../public/voiceover.mp3")} />

      {/* Background: UI Walkthrough Series */}
      <Series>
        <Series.Sequence durationInFrames={150}>
          <Video
            src={require("../public/ui_1_hook.mp4")}
            muted
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              backgroundColor: "#000",
            }}
          />
        </Series.Sequence>
        <Series.Sequence durationInFrames={210}>
          <Video
            src={require("../public/ui_2_reveal.mp4")}
            muted
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              backgroundColor: "#000",
            }}
          />
        </Series.Sequence>
        <Series.Sequence durationInFrames={480}>
          <Video
            src={require("../public/ui_3_core.mp4")}
            muted
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              backgroundColor: "#000",
            }}
          />
        </Series.Sequence>
        <Series.Sequence durationInFrames={210}>
          <Video
            src={require("../public/ui_4_cta.mp4")}
            muted
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              backgroundColor: "#000",
            }}
          />
        </Series.Sequence>
      </Series>

      {/* PIP Layer: Founder in bottom-right circle */}
      <div
        style={{
          position: "absolute",
          bottom: "60px",
          right: "60px",
          width: "350px",
          height: "350px",
          borderRadius: "50%",
          overflow: "hidden",
          border: "6px solid white",
          boxShadow: "0 10px 40px rgba(0, 0, 0, 0.8)",
        }}
      >
        <Video
          src={require("../public/landscape_founder_synced.mp4")}
          muted
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </div>

      {/* Phonk captions – bottom-center, clear of PIP */}
      {activeWord && (
        <div
          style={{
            position: "absolute",
            bottom: "80px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "60%",
            textAlign: "center",
            pointerEvents: "none",
          }}
        >
          <span
            style={{
              fontSize: 140,
              fontWeight: 900,
              textTransform: "uppercase",
              color: "#ffffff",
              lineHeight: 1,
              textShadow:
                "4px 4px 0px #000, -4px -4px 0px #000, 4px -4px 0px #000, -4px 4px 0px #000, 0px 6px 20px rgba(0,0,0,0.9)",
              WebkitTextStroke: "3px #000000",
              letterSpacing: "0.02em",
              padding: "0 40px",
            }}
          >
            {activeWord.word}
          </span>
        </div>
      )}
    </>
  );
};
