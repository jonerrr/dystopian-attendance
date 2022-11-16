import { RefObject, useState } from 'react';
import { Button, Container, Paper } from '@mantine/core';
import * as faceApi from 'face-api.js';
import { showNotification } from '@mantine/notifications';

interface AttendanceProps {
  videoRef: RefObject<HTMLVideoElement>;
}

export default function Attendance({ videoRef }: AttendanceProps) {
  const [scanning, setScanning] = useState(false);
  const [interval, addInterval] = useState<NodeJS.Timer | null>(null);

  //   let interval: NodeJS.Timer;

  const scan = () => {
    setScanning(true);

    const descriptors: faceApi.LabeledFaceDescriptors[] = [];

    //TODO replace with API
    Object.keys(localStorage).forEach((k) => {
      // dev build cache thing
      if (k !== 'ally-supports-cache') {
        descriptors.push(
          new faceApi.LabeledFaceDescriptors(k, [
            new Float32Array(Object.values(JSON.parse(localStorage.getItem(k)!))),
          ])
        );
      }
    });
    const matcher = new faceApi.FaceMatcher(descriptors);

    showNotification({
      title: 'Scanning started',
      message: `${descriptors.length} students loaded`,
      autoClose: 7000,
    });

    addInterval(
      setInterval(async () => {
        const faces = await faceApi
          .detectAllFaces(videoRef.current!, new faceApi.SsdMobilenetv1Options())
          .withFaceLandmarks()
          .withFaceDescriptors();

        faces.forEach((f) => {
          const matches = matcher.findBestMatch(f.descriptor);
          console.log(matches);
          showNotification({
            title: 'Match detected',
            message: `${matches.label} located`,
            autoClose: 7000,
          });
        });
      }, 5000)
    );
  };

  return (
    <Button
      size="xl"
      onClick={
        scanning
          ? () => {
              clearInterval(interval!);
              setScanning(false);
            }
          : scan
      }
      variant="gradient"
      gradient={scanning ? { from: 'red', to: 'orange' } : { from: 'teal', to: 'blue' }}
    >
      {scanning ? 'Stop Scanning' : 'Start Scanning'}
    </Button>
  );
}
