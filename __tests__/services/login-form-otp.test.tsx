import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginForm } from "@/app/(auth)/login/_components/login-form";
import { useAuth } from "@/hooks/use-auth";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
  useSearchParams: () => ({ get: vi.fn(() => null) }),
}));

vi.mock("@/hooks/use-auth", () => ({
  useAuth: vi.fn(),
}));

const mockedUseAuth = vi.mocked(useAuth);

let requestOtpMock: ReturnType<typeof vi.fn>;
let loginWithOtpMock: ReturnType<typeof vi.fn>;

function mockAuth(overrides: Partial<Record<"requestOtp" | "loginWithOtp", unknown>> = {}) {
  const defaults = {
    isAuthenticated: false,
    isLoading: false,
    user: null,
    login: vi.fn(),
    loginWithOtp: loginWithOtpMock,
    requestOtp: requestOtpMock,
    logout: vi.fn(),
    updateUser: vi.fn(),
  };
  if (overrides.requestOtp) requestOtpMock = overrides.requestOtp as typeof requestOtpMock;
  if (overrides.loginWithOtp) loginWithOtpMock = overrides.loginWithOtp as typeof loginWithOtpMock;
  mockedUseAuth.mockReturnValue({ ...defaults, requestOtp: requestOtpMock, loginWithOtp: loginWithOtpMock });
}

beforeEach(() => {
  vi.clearAllMocks();
  pushMock.mockReset();
  requestOtpMock = vi.fn().mockResolvedValue({ success: true });
  loginWithOtpMock = vi.fn().mockResolvedValue({ success: true });
  mockAuth();
});

describe("LoginForm OTP tab", () => {
  it("renders both password and one-time-code tabs", () => {
    render(<LoginForm />);
    expect(screen.getByRole("tab", { name: /password/i })).toBeTruthy();
    expect(screen.getByRole("tab", { name: /one-time code/i })).toBeTruthy();
  });

  it("sends a code via requestOtp and shows the code step", async () => {
    const user = userEvent.setup();

    render(<LoginForm />);

    await user.click(screen.getByRole("tab", { name: /one-time code/i }));

    const emailInput = screen.getByLabelText(/email/i);
    await user.type(emailInput, "admin@bgycc.com");

    await user.click(screen.getByRole("button", { name: /send code/i }));

    await waitFor(() => {
      expect(requestOtpMock).toHaveBeenCalledWith("admin@bgycc.com");
    });

    expect(screen.getByLabelText(/6-digit code/i)).toBeTruthy();
  });

  it("calls loginWithOtp and redirects on a valid code", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.click(screen.getByRole("tab", { name: /one-time code/i }));

    const emailInput = screen.getByLabelText(/email/i);
    await user.type(emailInput, "admin@bgycc.com");

    await user.click(screen.getByRole("button", { name: /send code/i }));
    await waitFor(() => {
      expect(screen.getByLabelText(/6-digit code/i)).toBeTruthy();
    });

    await user.type(screen.getByLabelText(/6-digit code/i), "123456");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    await waitFor(() => {
      expect(loginWithOtpMock).toHaveBeenCalledWith("admin@bgycc.com", "123456");
    });
    expect(pushMock).toHaveBeenCalledWith("/dashboard");
  });

  it("shows an error when the backend rejects the code", async () => {
    loginWithOtpMock = vi.fn().mockResolvedValue({ success: false, error: "Invalid or expired code" });
    mockAuth();

    const user = userEvent.setup();
    render(<LoginForm />);

    await user.click(screen.getByRole("tab", { name: /one-time code/i }));

    const emailInput = screen.getByLabelText(/email/i);
    await user.type(emailInput, "admin@bgycc.com");

    await user.click(screen.getByRole("button", { name: /send code/i }));
    await waitFor(() => {
      expect(screen.getByLabelText(/6-digit code/i)).toBeTruthy();
    });

    await user.type(screen.getByLabelText(/6-digit code/i), "000000");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(await screen.findByText(/invalid or expired code/i)).toBeTruthy();
    expect(pushMock).not.toHaveBeenCalled();
  });

  it("shows an error when requestOtp fails for an unknown email", async () => {
    requestOtpMock = vi.fn().mockResolvedValue({ success: false, error: "User email does not exist" });
    mockAuth();

    const user = userEvent.setup();
    render(<LoginForm />);

    await user.click(screen.getByRole("tab", { name: /one-time code/i }));
    await user.type(screen.getByLabelText(/email/i), "unknown@bgycc.com");
    await user.click(screen.getByRole("button", { name: /send code/i }));

    expect(await screen.findByText(/user email does not exist/i)).toBeTruthy();
  });
});