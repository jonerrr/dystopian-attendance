import { useState, MutableRefObject } from 'react';
import * as faceapi from 'face-api.js';
import { Alert, Button, Container, TextInput } from '@mantine/core';

interface AddFaceProps {
  video: MutableRefObject<HTMLVideoElement>;
  canvas: MutableRefObject<HTMLCanvasElement>;
}

interface FaceStorage {
  descriptors: number[];
  name: string;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function AddFace({ video, canvas }: AddFaceProps) {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [name, setName] = useState('');

  const SaveFace = async () => {
    canvas.current.innerHTML = faceapi.createCanvasFromMedia(video.current);
    faceapi.matchDimensions(canvas.current, { width: 640, height: 480 });

    const face = await faceapi
      .detectSingleFace(video.current, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();
    if (!face) {
      // setLoading(false);
      return setErr('Could not find face');
    }

    // const faceMatcher = new faceapi.FaceMatcher(face);
    localStorage.setItem(name, JSON.stringify(face.descriptor));

    const resizedDetections = faceapi.resizeResults(face, { width: 640, height: 480 });
    if (!resizedDetections) return setErr('Error resizing face detections');
    canvas && canvas.current && canvas.current.getContext('2d')!.clearRect(0, 0, 640, 480);
    canvas && canvas.current && faceapi.draw.drawDetections(canvas.current, resizedDetections);
    canvas && canvas.current && faceapi.draw.drawFaceLandmarks(canvas.current, resizedDetections);

    setErr(null);

    await sleep(5000);
    canvas.current.getContext('2d')!.clearRect(0, 0, 640, 480);
  };

  return (
    <>
      <Container size="lg" px="xs">
        {err ? (
          <Alert title="Error" color="red">
            {err}
          </Alert>
        ) : (
          <Alert title="Waiting for face" color="cyan">
            Please stare at the camera and click button when ready.
          </Alert>
        )}

        <TextInput
          label="Name"
          value={name}
          onChange={(event) => setName(event.currentTarget.value)}
          rightSection={
            <Button
              variant="light"
              loading={loading}
              style={{ display: 'block' }}
              disabled={name === ''}
              onClick={() => {
                setLoading(true);
                SaveFace();
                setLoading(false);
              }}
            >
              {loading ? 'Scanning' : 'Scan Face'}
            </Button>
          }
        />
      </Container>
    </>
  );
}
