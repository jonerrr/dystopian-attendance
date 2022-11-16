import { useEffect, useState, useRef, MutableRefObject } from 'react';
import * as faceapi from 'face-api.js';
import {
  Alert,
  Button,
  Center,
  Collapse,
  Container,
  LoadingOverlay,
  Title,
  Overlay,
} from '@mantine/core';

import { AddFace } from '../AddFace/AddFace';

export function WebCamRecognition() {
  const [modelsLoading, setmodelsLoading] = useState(true);
  const [emoji, setEmoji] = useState('');
  const [scanning, setScanning] = useState(false);
  const [emotionLoading, setEmotionLoading] = useState(false);
  const [matchErr, setMatchErr] = useState('');

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const load = async () => {
      await faceapi.nets.tinyFaceDetector.load('/models/');
      await faceapi.nets.faceLandmark68Net.load('/models/');
      await faceapi.nets.faceRecognitionNet.load('/models/');
      await faceapi.nets.faceExpressionNet.load('/models/');

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
      });
      videoRef.current!.srcObject = mediaStream;
      videoRef.current!.play();
      setmodelsLoading(false);
    };

    load();
  }, []);

  const HandleVideo = async () => {
    // setInterval(async () => {
    const detections = await faceapi
      .detectSingleFace(videoRef.current!, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor()
      .withFaceExpressions();
    // const matcher = new faceapi.FaceMatcher(detections);

    // console.log(matcher.toJSON());

    if (!detections) {
      setEmoji('No face detected');
      return;
    }
    setEmoji(
      detections.expressions
        .asSortedArray()
        .reduce((p, c) => (Math.abs(c.probability - 1) < Math.abs(p.probability - 1) ? c : p))
        .expression
    );
    // }, 1000);
  };

  const FindMatch = async () => {
    const face = await faceapi
      .detectSingleFace(videoRef.current!, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!face) {
      return setMatchErr('Could not locate face');
    }

    const labeledDescriptors: faceapi.LabeledFaceDescriptors[] = [];
    Object.keys(localStorage).forEach((k) => {
      if (k !== 'ally-supports-cache') {
        labeledDescriptors.push(
          new faceapi.LabeledFaceDescriptors(k, [
            new Float32Array(Object.values(JSON.parse(localStorage.getItem(k)!))),
          ])
        );
      }
    });

    const matcher = new faceapi.FaceMatcher(labeledDescriptors);
    const bestMatch = matcher.findBestMatch(face?.descriptor);
    console.log(bestMatch);
  };

  return (
    <>
      <Center>
        <Container size="lg" px="xs">
          <Title order={1} align="center">
            {emoji}
          </Title>
          <LoadingOverlay visible={modelsLoading} overlayBlur={2} />
          <div style={{ display: 'flex', justifyContent: 'center', padding: '10px' }}>
            <video ref={videoRef} autoPlay muted controls={false} width={640} height={480} />
            <canvas ref={canvasRef} style={{ position: 'absolute' }} />
          </div>
          {matchErr !== '' ? (
            <Alert title="Error" color="red">
              {matchErr}
            </Alert>
          ) : (
            ''
          )}
          <Button style={{ width: '100%' }} color="orange" size="lg" onClick={FindMatch}>
            Find Matching Face
          </Button>

          <Button
            loading={emotionLoading}
            style={{ width: '100%' }}
            color="green"
            size="lg"
            onClick={() => {
              setEmotionLoading(true);
              HandleVideo();
              setEmotionLoading(false);
            }}
          >
            Check Emotion
          </Button>
          <Button style={{ width: '100%' }} size="lg" onClick={() => setScanning(!scanning)}>
            Start Scan
          </Button>
          <Collapse in={scanning}>
            <AddFace
              video={videoRef as MutableRefObject<HTMLVideoElement>}
              canvas={canvasRef as MutableRefObject<HTMLCanvasElement>}
            />
          </Collapse>
        </Container>
      </Center>
    </>
  );
}
