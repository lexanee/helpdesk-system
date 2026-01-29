import {
  Anchor,
  Button,
  Container,
  Paper,
  PasswordInput,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { Link, useNavigate } from "@tanstack/react-router";

import { useRegister } from "../../hooks/use-auth";

export default function RegisterPage() {
  const navigate = useNavigate();
  const registerMutation = useRegister();

  const form = useForm({
    initialValues: {
      email: "",
      fullName: "",
      password: "",
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "Invalid email"),
      password: (value) =>
        value.length < 6 ? "Password must be at least 6 characters" : null,
    },
  });

  const onSubmit = (values: typeof form.values) => {
    registerMutation.mutate(values, {
      onSuccess: () => {
        navigate({ to: "/" });
      },
    });
  };

  return (
    <Container size={420} my={40}>
      <Title ta="center" className="font-bold">
        Create an account
      </Title>
      <Text c="dimmed" size="sm" ta="center" mt={5}>
        Already have an account?{" "}
        <Anchor size="sm" component={Link} to="/login">
          Sign in
        </Anchor>
      </Text>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <form onSubmit={form.onSubmit(onSubmit)}>
          <TextInput
            label="Email"
            placeholder="you@mantine.dev"
            required
            {...form.getInputProps("email")}
          />
          <TextInput
            label="Full Name"
            placeholder="John Doe"
            mt="md"
            {...form.getInputProps("fullName")}
          />
          <PasswordInput
            label="Password"
            placeholder="Your password"
            required
            mt="md"
            {...form.getInputProps("password")}
          />

          {registerMutation.isError && (
            <Text c="red" size="sm" mt="sm">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {(registerMutation.error as any)?.response?.data?.error ||
                registerMutation.error?.message ||
                "Registration failed"}
            </Text>
          )}

          <Button
            fullWidth
            mt="xl"
            type="submit"
            loading={registerMutation.isPending}
          >
            Sign up
          </Button>
        </form>
      </Paper>
    </Container>
  );
}
