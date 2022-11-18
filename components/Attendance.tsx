import { RefObject, useState } from 'react';
import { atom, selector, useRecoilState } from 'recoil';
import { Button } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import * as faceApi from 'face-api.js';

interface AttendanceProps {
  videoRef: RefObject<HTMLVideoElement>;
}

interface UserData {
  name: string;
  attendedAt: Date;
  role: string;
}

const scanningState = atom({
  key: 'attendanceScanningState',
  default: false,
});
export const attendanceSelector = selector({
  key: 'attendanceScanningSelector',
  get: ({ get }) => get(scanningState),
});

export const userState = atom<UserData[]>({
  key: 'userState',
  default: [],
});
export const userSelector = selector({
  key: 'userSelector',
  get: ({ get }) => get(userState),
});

export default function Attendance({ videoRef }: AttendanceProps) {
  const [scanning, setScanning] = useRecoilState(scanningState);
  const [interval, addInterval] = useState<NodeJS.Timer | null>(null);
  const [users, setUsers] = useRecoilState(userState);

  const scan = () => {
    setScanning(true);
    let descriptors: faceApi.LabeledFaceDescriptors[] = [];

    //TODO replace with API

    // eslint-disable-next-line no-restricted-syntax
    for (const label of Object.keys(localStorage)) {
      if (label !== 'ally-supports-cache' && !users.some((u) => u.name === label)) {
        descriptors.push(
          new faceApi.LabeledFaceDescriptors(label, [
            new Float32Array(Object.values(JSON.parse(localStorage.getItem(label)!))),
          ])
        );
      }
    }

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

        const matcher = new faceApi.FaceMatcher(descriptors);

        faces.forEach((f) => {
          const match = matcher.findBestMatch(f.descriptor);
          if (match.label === 'unknown') return;
          setUsers([...users, { name: match.label, attendedAt: new Date(), role: 'student' }]);
          descriptors = descriptors.filter((d) => d.label !== match.label);

          showNotification({
            title: 'Match detected',
            message: `${match.label} attended`,
            autoClose: 7000,
          });
        });
      }, 2100)
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
      gradient={scanning ? { from: 'red', to: 'orange' } : { from: 'blue', to: 'pink' }}
    >
      {scanning ? 'Stop Scanning' : 'Start Scanning'}
    </Button>
  );
}
