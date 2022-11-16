import * as faceApi from 'face-api.js';
import { Button, Container, createStyles, SimpleGrid, Skeleton, Title } from '@mantine/core';
import { useRef, useEffect, useState } from 'react';
import { ThemeContext } from '@emotion/react';
import Attendance from './Attendance';

const useStyles = createStyles((theme) => ({
  wrapper: {
    minHeight: 600,
    boxSizing: 'border-box',
    backgroundImage: `linear-gradient(-60deg, ${theme.colors.dark[4]} 0%, ${theme.colors.dark[6]} 100%)`,
    borderRadius: theme.radius.md,
    padding: theme.spacing.xl,
    margin: theme.spacing.md,
  },

  video: {
    width: 1000,
    height: '100%',
  },

  title: {
    fontFamily: `Greycliff CF, ${theme.fontFamily}`,
    lineHeight: 1,
  },

  description: {
    color: theme.colors[theme.primaryColor][0],
    maxWidth: 300,

    [`@media (max-width: ${theme.breakpoints.sm}px)`]: {
      maxWidth: '100%',
    },
  },

  input: {
    backgroundColor: theme.white,
    borderColor: theme.colors.gray[4],
    color: theme.black,

    '&::placeholder': {
      color: theme.colors.gray[5],
    },
  },
}));

export function WebCam() {
  const { classes } = useStyles();

  const [modelsLoading, setModelsLoading] = useState(true);

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const load = async () => {
      await faceApi.nets.tinyFaceDetector.load('/models/');
      await faceApi.nets.faceLandmark68Net.load('/models/');
      await faceApi.nets.faceRecognitionNet.load('/models/');
      await faceApi.nets.faceExpressionNet.load('/models/');

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
      });
      videoRef.current!.srcObject = mediaStream;
      videoRef.current!.play();
      setModelsLoading(false);
    };

    load();
  }, []);

  return (
    <div className={classes.wrapper}>
      <SimpleGrid cols={2} spacing={50} breakpoints={[{ maxWidth: 'sm', cols: 1 }]}>
        <Skeleton visible={modelsLoading}>
          <video ref={videoRef} autoPlay muted controls={false} className={classes.video} />
        </Skeleton>
        <div>
          <Title>Status</Title>
          <Attendance videoRef={videoRef} />
        </div>
      </SimpleGrid>
    </div>
  );
}
