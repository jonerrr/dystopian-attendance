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
}

const scanningState = atom({
  key: 'attendanceScanningState',
  default: false,
});
export const attendanceSelector = selector({
  key: 'attendanceScanningSelector',
  get: ({ get }) => get(scanningState),
});

const userState = atom<UserData[]>({
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

    showNotification({
      title: 'Scanning started',
      message: `${descriptors.length} students loaded`,
      autoClose: 7000,
    });

    addInterval(
      setInterval(async () => {
        console.log(users);
        console.log(descriptors);
        const faces = await faceApi
          .detectAllFaces(videoRef.current!, new faceApi.SsdMobilenetv1Options())
          .withFaceLandmarks()
          .withFaceDescriptors();

        const matcher = new faceApi.FaceMatcher(descriptors);

        faces.forEach((f) => {
          const match = matcher.findBestMatch(f.descriptor);

          setUsers([...users, { name: match.label, attendedAt: new Date() }]);
          descriptors = descriptors.filter((d) => d.label !== match.label);

          showNotification({
            title: 'Match detected',
            message: `${match.label} attended`,
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
      gradient={scanning ? { from: 'red', to: 'orange' } : { from: 'blue', to: 'pink' }}
    >
      {scanning ? 'Stop Scanning' : 'Start Scanning'}
    </Button>
  );
}
