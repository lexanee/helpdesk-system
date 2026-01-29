import {
  Button,
  Container,
  Paper,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import { notifications } from "@mantine/notifications";

import {
  changePasswordSchema,
  useAuth,
  useChangePassword,
} from "@/hooks/use-auth";

export default function SettingsPage() {
  const { data: user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Container>
        <Text>Loading...</Text>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container>
        <Text>Not authenticated</Text>
      </Container>
    );
  }

  return (
    <Container size="md">
      <Title order={2} mb="xl">
        My Profile
      </Title>

      <Paper withBorder p="md" mb="md">
        <Title order={2} mb="md">
          Personal Information
        </Title>
        <Stack>
          <TextInput
            label="Full Name"
            value={user.fullName || "Not set"}
            disabled
          />
          <TextInput label="Email" value={user.email} disabled />
          <TextInput
            label="Role"
            value={user.role.replace("_", " ")}
            disabled
          />
          <Text size="sm" c="dimmed">
            Note: To update your profile information, please contact an
            administrator.
          </Text>
        </Stack>
      </Paper>

      <Paper withBorder p="md">
        <Title order={2} mb="md">
          Account Information
        </Title>
        <ChangePasswordForm />
      </Paper>
    </Container>
  );
}

function ChangePasswordForm() {
  const changePassword = useChangePassword();
  const form = useForm({
    initialValues: {
      oldPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    validate: zodResolver(changePasswordSchema as any),
  });

  const handleSubmit = async (values: typeof form.values) => {
    try {
      await changePassword.mutateAsync(values);
      notifications.show({
        title: "Success",
        message: "Password updated successfully",
        color: "green",
      });
      form.reset();
    } catch (error) {
      notifications.show({
        title: "Error",
        message: (error as Error).message || "Failed to update password",
        color: "red",
      });
    }
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack>
        <PasswordInput
          label="Current Password"
          required
          {...form.getInputProps("oldPassword")}
        />
        <PasswordInput
          label="New Password"
          required
          {...form.getInputProps("newPassword")}
        />
        <PasswordInput
          label="Confirm New Password"
          required
          {...form.getInputProps("confirmNewPassword")}
        />
        <Button type="submit" loading={changePassword.isPending}>
          Change Password
        </Button>
      </Stack>
    </form>
  );
}
