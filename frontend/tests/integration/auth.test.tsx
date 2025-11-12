import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { Login } from '../../src/pages/Login';
import { Signup } from '../../src/pages/Signup';
import * as authService from '../../src/services/auth.service';

// Mock auth service
vi.mock('../../src/services/auth.service');

describe('Authentication Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Login Flow', () => {
    it('should render login form', () => {
      render(
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      );

      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('should show validation errors for empty fields', async () => {
      const user = userEvent.setup();
      render(
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      );

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);

      // Should show validation errors
      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      });
    });

    it('should call signInWithEmailAndPassword on valid form submission', async () => {
      const user = userEvent.setup();
      const mockSignIn = vi.fn().mockResolvedValue({});
      vi.mocked(authService.signInWithEmailAndPassword).mockImplementation(mockSignIn);

      render(
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      );

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123');
      });
    });
  });

  describe('Signup Flow', () => {
    it('should render signup form', () => {
      render(
        <BrowserRouter>
          <Signup />
        </BrowserRouter>
      );

      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
    });

    it('should validate password confirmation match', async () => {
      const user = userEvent.setup();
      render(
        <BrowserRouter>
          <Signup />
        </BrowserRouter>
      );

      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole('button', { name: /sign up/i });

      await user.type(passwordInput, 'password123');
      await user.type(confirmPasswordInput, 'different');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
      });
    });

    it('should call createUserWithEmailAndPassword on valid form submission', async () => {
      const user = userEvent.setup();
      const mockSignUp = vi.fn().mockResolvedValue({});
      vi.mocked(authService.createUserWithEmailAndPassword).mockImplementation(mockSignUp);

      render(
        <BrowserRouter>
          <Signup />
        </BrowserRouter>
      );

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole('button', { name: /sign up/i });

      await user.type(emailInput, 'newuser@example.com');
      await user.type(passwordInput, 'password123');
      await user.type(confirmPasswordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockSignUp).toHaveBeenCalledWith('newuser@example.com', 'password123');
      });
    });
  });
});

