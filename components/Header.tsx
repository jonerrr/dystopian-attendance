'use client';

import Link from 'next/link';
import { Header as MantineHeader, Group, Button, ActionIcon, Box } from '@mantine/core';
import { IconEye } from '@tabler/icons';

export default function Header() {
  return (
    <Box pb={10}>
      <MantineHeader height={60} px="md">
        <Group position="apart" sx={{ height: '100%' }}>
          <ActionIcon component={Link} href="/" color="red">
            <IconEye size={40} />
          </ActionIcon>

          {/* <Group sx={{ height: '100%' }} spacing={0} className={classes.hiddenMobile}>
            <Link href="/students" className={classes.link}>
              Students
            </Link>
          </Group> */}

          <Group>
            <Button variant="default">Log in</Button>
            <Button>Sign up</Button>
          </Group>
        </Group>
      </MantineHeader>
    </Box>
  );
}
