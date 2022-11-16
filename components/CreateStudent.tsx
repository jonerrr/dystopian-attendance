import { RefObject, useState } from 'react';
import { Button, Popover, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import * as faceApi from 'face-api.js';
import { showNotification } from '@mantine/notifications';

interface CreateStudentProps {
  videoRef: RefObject<HTMLVideoElement>;
}

export default function CreateStudent({ videoRef }: CreateStudentProps) {
  const [creating, setCreating] = useState(false);
  const [scanning, setScanning] = useState(false);

  const form = useForm({
    initialValues: {
      firstName: '',
    },
    validate: {
      firstName: (v) => (v.length < 1 ? 'First name must have at least 1 letter' : null),
    },
  });

  //TODO use API instead
  const submitStudent = async (values: { firstName: string }) => {
    setScanning(true);
    const face = await faceApi
      .detectSingleFace(videoRef.current!, new faceApi.SsdMobilenetv1Options())
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!face) {
      setScanning(false);
      return showNotification({
        title: 'Error',
        message: 'Could not locate face',
        color: 'red',
        autoClose: 7000,
      });
    }
    localStorage.setItem(values.firstName.toLowerCase(), JSON.stringify(face.descriptor));

    setScanning(false);
    form.reset();
    return showNotification({
      title: 'Success',
      message: 'Student successfully added to database',
      color: 'green',
      autoClose: 7000,
    });
  };

  return (
    <Popover trapFocus position="bottom" withArrow shadow="md">
      <Popover.Target>
        <Button
          size="xl"
          onClick={() => setCreating(!creating)}
          variant="gradient"
          gradient={{ from: 'blue', to: 'teal' }}
          disabled={scanning}
        >
          Add Student
        </Button>
      </Popover.Target>

      <Popover.Dropdown>
        <form onSubmit={form.onSubmit((v) => submitStudent(v))}>
          <TextInput
            w="90%"
            withAsterisk
            label="First Name"
            placeholder="John"
            {...form.getInputProps('firstName')}
            rightSection={
              <Button ml={5} loading={scanning} type="submit">
                Scan
              </Button>
            }
          />
        </form>
      </Popover.Dropdown>
    </Popover>
  );
}
