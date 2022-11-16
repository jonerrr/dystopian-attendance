import { RefObject, useState } from 'react';
import { Button, Container } from '@mantine/core';

interface AttendanceProps {
  videoRef: RefObject<HTMLVideoElement>;
}

export default function Attendance({ videoRef }: AttendanceProps) {
  const [scanning, setScanning] = useState(false);

  let interval: NodeJS.Timer;

  const scan = () => {
    setScanning(true);
    interval = setInterval(async () => {}, 5000);
  };

  return (
    <Container>
      <Button
        onClick={
          scanning
            ? () => {
                clearInterval(interval);
                setScanning(false);
              }
            : scan
        }
        variant="gradient"
        gradient={scanning ? { from: 'red', to: 'orange' } : { from: 'teal', to: 'blue' }}
      >
        {scanning ? 'Stop Scanning' : 'Start Scanning'}
      </Button>
    </Container>
  );
}
