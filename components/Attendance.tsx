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

  // eslint-disable-next-line consistent-return
  const scan = () => {
    setScanning(true);
    // let descriptors: faceApi.LabeledFaceDescriptors[] = [];
    const matchers: faceApi.FaceMatcher[] = [];

    //TODO replace with API

    // eslint-disable-next-line no-restricted-syntax
    for (const label of Object.keys(localStorage)) {
      if (label !== 'ally-supports-cache' && !users.some((u) => u.name === label)) {
        matchers.push(
          new faceApi.FaceMatcher(
            new faceApi.LabeledFaceDescriptors(label, [
              new Float32Array(Object.values(JSON.parse(localStorage.getItem(label)!))),
            ]),
            0.6
          )
        );
      }
    }

    showNotification({
      title: 'Scanning started',
      message: `${matchers.length} students loaded`,
      autoClose: 7000,
    });

    addInterval(
      // eslint-disable-next-line consistent-return
      setInterval(async () => {
        if (!videoRef.current) {
          return showNotification({
            title: 'Error',
            message: 'Failed to fetch video',
            color: 'red',
            autoClose: 7000,
          });
        }
        if (!matchers.length) {
          return showNotification({
            title: 'Error',
            message: 'No more students left to scan',
            color: 'red',
            autoClose: 7000,
          });
        }

        const faces = await faceApi
          .detectAllFaces(videoRef.current!)
          .withFaceLandmarks()
          .withFaceDescriptors();

        // const matcher = new faceApi.FaceMatcher(descriptors, 0.6);

        faces.forEach((f) => {
          // const match = matcher.findBestMatch(f.descriptor);
          // matchers.forEach((m) => {

          // matchers = matchers.filter((d) => d !== match.label);
          // });

          // eslint-disable-next-line no-plusplus
          for (let i = 0; i < matchers.length; i++) {
            const match = matchers[i].findBestMatch(f.descriptor);
            if (match.label === 'unknown') return;
            setUsers([...users, { name: match.label, attendedAt: new Date(), role: 'student' }]);
            matchers.splice(i);
            showNotification({
              title: 'Match detected',
              message: `${match.label} attended`,
              autoClose: 7000,
            });
          }
        });
      }, 2000)
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
