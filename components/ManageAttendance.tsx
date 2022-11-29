import * as faceApi from 'face-api.js';
import {
  createStyles,
  Paper,
  SimpleGrid,
  Skeleton,
  LoadingOverlay,
  Center,
  Title,
} from '@mantine/core';
import { useRef, useEffect, useState } from 'react';
import Attendance from './Attendance';
import CreateStudent from './CreateStudent';
import AttendTable from './AttendTable';

const useStyles = createStyles((theme) => ({
  wrapper: {
    minHeight: 500,
    boxSizing: 'border-box',
    backgroundImage: `linear-gradient(-60deg, ${theme.colors.violet[9]} 0%, ${theme.colors.red[9]} 100%)`,
    borderRadius: theme.radius.md,
    padding: theme.spacing.xl,
    margin: theme.spacing.md,
  },

  column: {
    boxSizing: 'border-box',
    minHeight: 500,
    borderRadius: theme.radius.md,
    position: 'relative',
  },
}));

export default function ManageAttendance() {
  const { classes } = useStyles();

  const [loading, setLoading] = useState(true);

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const load = async () => {
      await Promise.all([
        await faceApi.nets.ssdMobilenetv1.load('/models/'),
        await faceApi.nets.faceLandmark68Net.load('/models/'),
        await faceApi.nets.faceRecognitionNet.load('/models/'),
        await faceApi.nets.faceExpressionNet.load('/models/'),
        (async () => {
          const mediaStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'user' },
          });
          videoRef.current!.srcObject = mediaStream;
          videoRef.current!.play();
        })(),
      ]);

      setLoading(false);
    };

    load();
  }, []);

  return (
    <>
      <Center>
        <Title>Attendance</Title>
      </Center>
      <div className={classes.wrapper}>
        <SimpleGrid cols={2} spacing={50} breakpoints={[{ maxWidth: 'sm', cols: 1 }]}>
          <Skeleton visible={loading}>
            <video ref={videoRef} autoPlay muted controls={false} className={classes.column} />
          </Skeleton>
          <Paper shadow="md" p="md" className={classes.column}>
            <LoadingOverlay visible={loading} overlayBlur={2} />
            <SimpleGrid cols={2}>
              <Attendance videoRef={videoRef} />
              <CreateStudent videoRef={videoRef} />
            </SimpleGrid>
            <AttendTable />
          </Paper>
        </SimpleGrid>
      </div>
    </>
  );
}
