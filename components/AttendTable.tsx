import { Avatar, Badge, Table, Group, Text, ActionIcon, Anchor, ScrollArea } from '@mantine/core';
import { IconPencil, IconTrash } from '@tabler/icons';
import { useRecoilState } from 'recoil';
import dayjs from 'dayjs';
import { userState } from './Attendance';

const roleColors: Record<string, string> = {
  administrator: 'cyan',
  teacher: 'red',
  student: 'green',
};

export default function AttendTable() {
  const [users, setUsers] = useRecoilState(userState);

  // const removeUser = (name: string) => setUsers(users.filter((u) => u.name !== name));

  const rows = users.map((user) => (
    <tr key={user.name}>
      <td>
        <Group spacing="sm">
          <Avatar
            size={30}
            src="https://images.unsplash.com/photo-1624298357597-fd92dfbec01d?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=250&q=80"
            radius={30}
          />

          <div>
            <Text size="sm" weight={500}>
              {user.name}
            </Text>
            <Text size="xs" color="dimmed">
              foo@bar.com
            </Text>
          </div>
        </Group>
      </td>
      <td>
        <Text>{dayjs(user.attendedAt).format('h:m:s')}</Text>
      </td>
      <td>
        <Badge color={roleColors[user.role.toLowerCase()]} variant="light">
          {user.role}
        </Badge>
      </td>
      <td>
        <Anchor<'a'> size="sm" href="#" onClick={(event) => event.preventDefault()}>
          foo@bar.com
        </Anchor>
      </td>
      <td>
        <Group spacing={0} position="right">
          <ActionIcon>
            <IconPencil size={16} stroke={1.5} />
          </ActionIcon>
          <ActionIcon
            color="red"
            onClick={() => {
              setUsers(users.filter((u) => u.name !== user.name));
            }}
          >
            <IconTrash size={16} stroke={1.5} />
          </ActionIcon>
        </Group>
      </td>
    </tr>
  ));

  return (
    <ScrollArea>
      <Table mt={10} verticalSpacing="sm" captionSide="top">
        <caption>Attended Students</caption>
        <thead>
          <tr>
            <th>Name</th>
            <th>Time</th>
            <th>Role</th>
            {/* <th>Email</th> */}
            <th />
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </Table>
    </ScrollArea>
  );
}
