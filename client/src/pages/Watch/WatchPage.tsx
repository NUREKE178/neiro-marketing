import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import type { FaceLandmarker } from "@mediapipe/tasks-vision";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { EmptyState } from "../../components/EmptyState";
import { Spinner } from "../../components/Spinner";
import { useLanguage } from "../../i18n/LanguageContext";
import { api } from "../../lib/api";
import type { Creative, ReactionSample, Test } from "../../lib/api";
import styles from "./WatchPage.module.css";

type Step = "loading" | "consent" | "requesting" | "denied" | "running" | "done" | "load-error";

const CREATIVE_DURATION_MS = 8000;
const SAMPLE_INTERVAL_MS = 400;

interface BlendshapeCategory {
  categoryName: string;
  score: number;
}

function avgScore(categories: BlendshapeCategory[], names: string[]): number | null {
  const scores = names
    .map((n) => categories.find((c) => c.categoryName === n)?.score)
    .filter((s): s is number => s !== undefined);
  if (scores.length === 0) return null;
  return scores.reduce((a, b) => a + b, 0) / scores.length;
}

export function WatchPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useLanguage();
  const [step, setStep] = useState<Step>("loading");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [test, setTest] = useState<Test | null>(null);
  const [creatives, setCreatives] = useState<Creative[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const landmarkerRef = useRef<FaceLandmarker | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const samplesRef = useRef<ReactionSample[]>([]);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!id) return;
    api.tests
      .get(id)
      .then((r) => {
        setTest(r.test);
        setCreatives(r.creatives);
        if (r.creatives.length >= 2) {
          setStep("consent");
        } else {
          setErrorMsg(t("watch.needTwoCreatives"));
          setStep("load-error");
        }
      })
      .catch((err) => {
        setErrorMsg(err instanceof Error ? err.message : String(err));
        setStep("load-error");
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(
    () => () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      streamRef.current?.getTracks().forEach((tr) => tr.stop());
    },
    [],
  );

  async function start() {
    if (!id) return;
    setStep("requesting");
    setErrorMsg(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 480, height: 360 } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      const { FaceLandmarker, FilesetResolver } = await import("@mediapipe/tasks-vision");
      const filesetResolver = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.21/wasm",
      );
      landmarkerRef.current = await FaceLandmarker.createFromOptions(filesetResolver, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
          delegate: "GPU",
        },
        outputFaceBlendshapes: true,
        runningMode: "VIDEO",
        numFaces: 1,
      });

      const { session } = await api.tests.startSession(id);
      sessionIdRef.current = session.id;
      setCurrentIndex(0);
      setStep("running");
      runCreativeLoop(0);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : String(err));
      setStep("denied");
    }
  }

  function runCreativeLoop(index: number) {
    samplesRef.current = [];
    const startedAt = performance.now();
    let lastSample = 0;

    function tick() {
      const elapsed = performance.now() - startedAt;
      setProgress(Math.min(1, elapsed / CREATIVE_DURATION_MS));

      if (videoRef.current && landmarkerRef.current && elapsed - lastSample >= SAMPLE_INTERVAL_MS) {
        lastSample = elapsed;
        try {
          const result = landmarkerRef.current.detectForVideo(videoRef.current, performance.now());
          const categories = result.faceBlendshapes?.[0]?.categories as BlendshapeCategory[] | undefined;
          if (categories) {
            const blink = avgScore(categories, ["eyeBlinkLeft", "eyeBlinkRight"]);
            samplesRef.current.push({
              tMs: Math.round(elapsed),
              smile: avgScore(categories, ["mouthSmileLeft", "mouthSmileRight"]),
              browFurrow: avgScore(categories, ["browDownLeft", "browDownRight"]),
              surprise: avgScore(categories, ["browInnerUp", "jawOpen"]),
              attention: blink === null ? null : Math.max(0, 1 - blink),
            });
          }
        } catch {
          // a single frame's detection failing shouldn't kill the whole session
        }
      }

      if (elapsed < CREATIVE_DURATION_MS) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        void finishCreative(index);
      }
    }
    rafRef.current = requestAnimationFrame(tick);
  }

  async function finishCreative(index: number) {
    const creative = creatives[index];
    const sessionId = sessionIdRef.current;
    if (id && sessionId && creative) {
      try {
        await api.tests.sendReactions(id, sessionId, creative.id, samplesRef.current);
      } catch {
        // best-effort — a dropped batch shouldn't block the viewer from finishing
      }
    }

    const next = index + 1;
    if (next < creatives.length) {
      setCurrentIndex(next);
      setProgress(0);
      runCreativeLoop(next);
    } else {
      if (id && sessionId) await api.tests.completeSession(id, sessionId).catch(() => {});
      streamRef.current?.getTracks().forEach((tr) => tr.stop());
      setStep("done");
    }
  }

  return (
    <div className={styles.page}>
      <video ref={videoRef} autoPlay playsInline muted className={step === "running" ? styles.selfPreview : styles.selfPreviewHidden} />

      <div className={styles.center}>
        {step === "loading" && <Spinner />}

        {step === "load-error" && (
          <EmptyState tone="danger" title={t("watch.errorTitle")} description={errorMsg ?? undefined} />
        )}

        {step === "consent" && test && (
          <Card padding="lg" className={styles.card}>
            <h1 className={styles.title}>{test.title}</h1>
            <p className={styles.desc}>{t("watch.consentDesc")}</p>
            <ul className={styles.consentList}>
              <li>{t("watch.consentPoint1")}</li>
              <li>{t("watch.consentPoint2")}</li>
              <li>{t("watch.consentPoint3")}</li>
            </ul>
            <Button variant="primary" size="lg" onClick={start}>
              {t("watch.startBtn")}
            </Button>
          </Card>
        )}

        {step === "requesting" && (
          <Card padding="lg" className={styles.card}>
            <Spinner label={t("watch.requesting")} />
          </Card>
        )}

        {step === "denied" && (
          <EmptyState tone="danger" title={t("watch.deniedTitle")} description={errorMsg ?? undefined}>
            <Button variant="primary" onClick={start}>
              {t("watch.retryBtn")}
            </Button>
          </EmptyState>
        )}

        {step === "running" && creatives[currentIndex] && (
          <div className={styles.runningWrap}>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: `${progress * 100}%` }} />
            </div>
            <span className={styles.counter}>
              {currentIndex + 1} / {creatives.length}
            </span>
            <img src={creatives[currentIndex].image_url} alt={creatives[currentIndex].label} className={styles.creativeImage} />
            {creatives[currentIndex].caption && <p className={styles.creativeCaption}>{creatives[currentIndex].caption}</p>}
          </div>
        )}

        {step === "done" && (
          <Card padding="lg" tint="lime" className={styles.card}>
            <h1 className={styles.title}>{t("watch.doneTitle")}</h1>
            <p>{t("watch.doneDesc")}</p>
          </Card>
        )}
      </div>
    </div>
  );
}
